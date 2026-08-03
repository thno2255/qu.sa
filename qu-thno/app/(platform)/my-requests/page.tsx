import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getMyRequests } from "@/core/requests/actions"
import { RequestsClient } from "../requests/requests-client"

export const metadata: Metadata = { title: "طلباتي | My Requests" }

export default async function MyRequestsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  if (!session?.user) redirect("/login")

  const requests = await getMyRequests()

  return (
    <RequestsClient
      requests={requests}
      isRTL={isRTL}
      titleAr="طلباتي"
      titleEn="My Requests"
      descAr="جميع طلباتك المقدَّمة على المنصة — استشارات، زيارات ميدانية، وتبادل معرفي"
      descEn="All your submitted requests on the platform — consultations, field visits, and knowledge exchange"
    />
  )
}
