import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { LogHoursForm } from "./log-hours-form"

export const metadata: Metadata = { title: "تسجيل ساعات التطوع | Log Volunteer Hours" }

export default async function LogHoursPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  const canLog = ["STUDENT", "VOLUNTEER", "FACULTY_MEMBER", "EXTERNAL_ENTITY", "SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType ?? "")
  if (!canLog) redirect("/volunteering")

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader
        titleAr="تسجيل ساعات التطوع"
        titleEn="Log Volunteer Hours"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "التطوع", labelEn: "Volunteering", href: "/volunteering" },
          { labelAr: "تسجيل الساعات", labelEn: "Log Hours" },
        ]}
      />
      <LogHoursForm isRTL={isRTL} />
    </div>
  )
}
