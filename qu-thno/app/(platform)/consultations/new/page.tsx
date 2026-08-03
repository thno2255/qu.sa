import type { Metadata } from "next"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { ConsultationForm } from "./consultation-form"

export const metadata: Metadata = { title: "طلب استشارة جديدة" }

export default async function NewConsultationPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const allowedRoles = ["STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
  if (!allowedRoles.includes(session.user.userType ?? "")) redirect("/consultations")

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">طلب استشارة جديدة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اتبع الخطوات لإرسال طلبك — سيراجعه فريق المسؤولية المجتمعية ويعيّن لك عضو هيئة تدريس مناسب
        </p>
      </div>

      <ConsultationForm />
    </div>
  )
}
