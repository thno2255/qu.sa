import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { InitiativeForm } from "../initiative-form"

export const metadata: Metadata = { title: "مبادرة جديدة | New Initiative" }

export default async function NewInitiativePage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const canCreate = ["SYSTEM_ADMIN","COMMUNITY_MANAGER","COMMUNITY_EMPLOYEE","DEPARTMENT_HEAD","FACULTY_MEMBER"].includes(session?.user?.userType ?? "")
  if (!canCreate) redirect("/initiatives")

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr="مبادرة جديدة"
        titleEn="New Initiative"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المبادرات", labelEn: "Initiatives", href: "/initiatives" },
          { labelAr: "جديدة", labelEn: "New" },
        ]}
      />
      <InitiativeForm isRTL={isRTL} />
    </div>
  )
}
