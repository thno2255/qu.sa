import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/core/database/client"
import { verifyPassword } from "@/core/auth/utils"
import type { NextAuthConfig } from "next-auth"

const LOCKOUT_THRESHOLD = 5
const LOCKOUT_DURATION_MINUTES = 30

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userType = (user as { userType?: string }).userType ?? "VISITOR"
        token.organizationId = (user as { organizationId?: string }).organizationId
        token.nameAr = (user as { nameAr?: string }).nameAr
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.userType = token.userType as string
        session.user.organizationId = token.organizationId as string | undefined
        session.user.nameAr = token.nameAr as string | undefined
      }
      return session
    },
    // NOTE: `authorized` is intentionally omitted — route protection is handled
    // by proxy.ts using the auth(handler) wrapper pattern (NextAuth v5 Pattern 2).
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            nameAr: true,
            image: true,
            userType: true,
            status: true,
            organizationId: true,
            passwordHash: true,
            loginAttempts: true,
            lockedUntil: true,
          },
        })

        if (!user || !user.passwordHash) return null

        const now = new Date()

        // Active lock — reject immediately
        if (user.lockedUntil && user.lockedUntil > now) {
          throw new Error("ACCOUNT_LOCKED")
        }

        // Expired lock — reset counter so they start fresh
        let currentAttempts = user.loginAttempts
        if (user.lockedUntil && user.lockedUntil <= now) {
          await db.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null },
          })
          currentAttempts = 0
        }

        const valid = await verifyPassword(password, user.passwordHash)

        if (!valid) {
          const attempts = currentAttempts + 1
          const lockedUntil =
            attempts >= LOCKOUT_THRESHOLD
              ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
              : null

          await db.user.update({
            where: { id: user.id },
            data: { loginAttempts: attempts, lockedUntil },
          })

          if (attempts >= LOCKOUT_THRESHOLD) {
            throw new Error("ACCOUNT_LOCKED")
          }
          return null
        }

        if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
          throw new Error("ACCOUNT_INACTIVE")
        }

        await db.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: now },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          nameAr: user.nameAr ?? undefined,
          image: user.image ?? undefined,
          userType: user.userType,
          organizationId: user.organizationId ?? undefined,
        }
      },
    }),
  ],
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
