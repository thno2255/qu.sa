import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { InitiativeForm } from "../../initiative-form"

export const metadata: Metadata = { title: "تعديل المبادرة | Edit Initiative" }

export default async function EditInitiativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const initiative = await db.initiative.findUnique({ where: { id } })
  if (!initiative) notFound()

  const userType = session?.user?.userType ?? ""
  const isOwner = initiative.ownerId === session?.user?.id
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)
  const canEdit = (isOwner && initiative.status === "draft") || isAdmin
  if (!canEdit) redirect(`/initiatives/${id}`)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="تعديل المبادرة"
        titleEn="Edit Initiative"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المبادرات", labelEn: "Initiatives", href: "/initiatives" },
          { labelAr: initiative.titleAr, labelEn: initiative.titleEn ?? initiative.titleAr, href: `/initiatives/${id}` },
          { labelAr: "تعديل", labelEn: "Edit" },
        ]}
      />
      <InitiativeForm
        isRTL={isRTL}
        defaultValues={{
          id: initiative.id,
          titleAr: initiative.titleAr,
          titleEn: initiative.titleEn,
          descriptionAr: initiative.descriptionAr,
          startDate: initiative.startDate,
          endDate: initiative.endDate,
          targetBeneficiaries: initiative.targetBeneficiaries,
          budgetAllocated: initiative.budgetAllocated ? Number(initiative.budgetAllocated) : null,
          vision2030Pillar: initiative.vision2030Pillar,
          sdgGoals: initiative.sdgGoals,
          tags: initiative.tags,
        }}
      />
    </div>
  )
}
