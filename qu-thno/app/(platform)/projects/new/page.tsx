import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ProjectForm } from "../project-form"

export const metadata: Metadata = { title: "مشروع جديد | New Project" }

export default async function NewProjectPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const canCreate = ["SYSTEM_ADMIN","COMMUNITY_MANAGER","COMMUNITY_EMPLOYEE","DEPARTMENT_HEAD","FACULTY_MEMBER"].includes(session?.user?.userType ?? "")
  if (!canCreate) redirect("/projects")

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="مشروع جديد"
        titleEn="New Project"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المشاريع", labelEn: "Projects", href: "/projects" },
          { labelAr: "جديد", labelEn: "New" },
        ]}
      />
      <ProjectForm isRTL={isRTL} />
    </div>
  )
}
