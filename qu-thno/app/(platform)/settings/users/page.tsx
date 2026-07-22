import { TableSkeleton } from "@/shared/components/ui/skeleton"
import { Suspense } from "react"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"
import { UsersClient } from "./users-client"

export const metadata = { title: "إدارة المستخدمين" }

async function UserManagement() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType as string)) {
    redirect("/dashboard")
  }

  const [users, total, pending, active, suspended] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        userType: true,
        status: true,
        jobTitle: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    db.user.count(),
    db.user.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: { in: ["SUSPENDED", "DEACTIVATED"] } } }),
  ])

  return (
    <UsersClient
      users={users}
      total={total}
      active={active}
      pending={pending}
      suspended={suspended}
      currentUserId={session.user.id ?? ""}
      isSystemAdmin={session.user.userType === "SYSTEM_ADMIN"}
    />
  )
}

export default async function UsersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <UserManagement />
    </Suspense>
  )
}
