import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { PartnershipForm } from "../partnership-form"

export const metadata: Metadata = { title: "شراكة جديدة | New Partnership" }

export default async function NewPartnershipPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const canCreate = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session?.user?.userType ?? "")
  if (!canCreate) redirect("/partnerships")

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="شراكة جديدة"
        titleEn="New Partnership"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "الشراكات", labelEn: "Partnerships", href: "/partnerships" },
          { labelAr: "جديدة", labelEn: "New" },
        ]}
      />
      <PartnershipForm isRTL={isRTL} />
    </div>
  )
}
