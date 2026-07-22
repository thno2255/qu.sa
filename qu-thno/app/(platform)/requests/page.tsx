import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getAllRequests } from "@/core/requests/actions"
import { RequestsClient } from "./requests-client"

export const metadata: Metadata = { title: "الطلبات الواردة | Incoming Requests" }

const STAFF_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

export default async function RequestsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (!STAFF_ROLES.includes(session.user.userType ?? "")) redirect("/dashboard")

  const requests = await getAllRequests()

  return <RequestsClient requests={requests} isRTL={isRTL} />
}
