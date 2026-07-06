import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { OpportunityForm } from "../opportunity-form"

export const metadata: Metadata = { title: "فرصة تطوع جديدة | New Opportunity" }

export default async function NewOpportunityPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const canCreate = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session?.user?.userType ?? "")
  if (!canCreate) redirect("/volunteering")

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="فرصة تطوع جديدة"
        titleEn="New Volunteer Opportunity"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "التطوع", labelEn: "Volunteering", href: "/volunteering" },
          { labelAr: "جديدة", labelEn: "New" },
        ]}
      />
      <OpportunityForm isRTL={isRTL} />
    </div>
  )
}
