import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound, redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ProjectForm } from "../../project-form"

export const metadata: Metadata = { title: "تعديل المشروع | Edit Project" }

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  const isManager = project.managerId === session?.user?.id
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session?.user?.userType ?? "")
  const canEdit = (isManager && project.status === "draft") || isAdmin
  if (!canEdit) redirect(`/projects/${id}`)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="تعديل المشروع"
        titleEn="Edit Project"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المشاريع", labelEn: "Projects", href: "/projects" },
          { labelAr: project.titleAr, labelEn: project.titleEn ?? project.titleAr, href: `/projects/${id}` },
          { labelAr: "تعديل", labelEn: "Edit" },
        ]}
      />
      <ProjectForm
        isRTL={isRTL}
        defaultValues={{
          id: project.id,
          titleAr: project.titleAr,
          titleEn: project.titleEn,
          descriptionAr: project.descriptionAr,
          startDate: project.startDate,
          endDate: project.endDate,
          budget: project.budget ? Number(project.budget) : null,
          riskLevel: project.riskLevel,
          sdgGoals: project.sdgGoals,
          initiativeId: project.initiativeId,
        }}
      />
    </div>
  )
}
