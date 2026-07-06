import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { PartnershipForm } from "../../partnership-form"

export const metadata: Metadata = { title: "تعديل الشراكة | Edit Partnership" }

export default async function EditPartnershipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const partnership = await db.partnership.findUnique({
    where: { id },
    include: { partner: true },
  })
  if (!partnership) notFound()

  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session?.user?.userType ?? "")
  if (!isAdmin) redirect(`/partnerships/${id}`)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="تعديل الشراكة"
        titleEn="Edit Partnership"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "الشراكات", labelEn: "Partnerships", href: "/partnerships" },
          { labelAr: partnership.titleAr, labelEn: partnership.titleEn ?? partnership.titleAr, href: `/partnerships/${id}` },
          { labelAr: "تعديل", labelEn: "Edit" },
        ]}
      />
      <PartnershipForm
        isRTL={isRTL}
        defaultValues={{
          id: partnership.id,
          titleAr: partnership.titleAr,
          titleEn: partnership.titleEn,
          type: partnership.type,
          startDate: partnership.startDate,
          endDate: partnership.endDate,
          renewalDate: partnership.renewalDate,
          partnershipValue: partnership.partnershipValue ? Number(partnership.partnershipValue) : null,
          sdgGoals: partnership.sdgGoals,
          partner: {
            nameAr: partnership.partner.nameAr,
            nameEn: partnership.partner.nameEn,
            type: partnership.partner.type,
            sector: partnership.partner.sector,
          },
        }}
      />
    </div>
  )
}
