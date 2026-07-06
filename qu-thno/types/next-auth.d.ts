import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: string
      nameAr?: string
      organizationId?: string
    } & DefaultSession["user"]
  }

  interface User {
    userType?: string
    nameAr?: string
    organizationId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    userType?: string
    nameAr?: string
    organizationId?: string
  }
}
