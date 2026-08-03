import type { Metadata } from "next"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { ProjectVisitForm } from "./project-visit-form"

export const metadata: Metadata = { title: "طلب زيارة ميدانية جديد" }

export default async function NewProjectVisitPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const allowedRoles = ["STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
  if (!allowedRoles.includes(session.user.userType ?? "")) redirect("/consultations?tab=visits")

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلب زيارة ميدانية جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اتبع الخطوات لإرسال طلبك — يجب إرفاق ملف واحد على الأقل من ملفات المشروع
        </p>
      </div>

      <ProjectVisitForm />
    </div>
  )
}
