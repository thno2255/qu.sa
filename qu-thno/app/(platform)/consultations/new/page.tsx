import type { Metadata } from "next"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getFacultyList } from "@/core/consultations/actions"
import { ConsultationForm } from "./consultation-form"

export const metadata: Metadata = { title: "طلب استشارة جديدة" }

interface Props {
  searchParams: Promise<{ faculty?: string }>
}

export default async function NewConsultationPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const allowedRoles = ["STUDENT", "COMMUNITY_EMPLOYEE", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
  if (!allowedRoles.includes(session.user.userType ?? "")) redirect("/consultations")

  const { faculty: preselectedId } = await searchParams
  const facultyList = await getFacultyList()

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلب استشارة جديدة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اتبع الخطوات لإرسال طلبك — سيصل إشعار للدكتور فور إرسال الطلب
        </p>
      </div>

      <ConsultationForm
        facultyList={facultyList}
        preselectedId={preselectedId}
      />
    </div>
  )
}
