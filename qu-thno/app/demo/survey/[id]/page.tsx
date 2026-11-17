import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DemoHeader } from "@/shared/components/layout/demo-header"
import { DemoFooter } from "@/shared/components/layout/demo-footer"
import { DemoSurveyForm } from "@/shared/components/demo/demo-survey-form"
import { DEMO_USER_COOKIE } from "@/core/demo/constants"
import { getDemoRequestById } from "@/core/demo/actions"
import { BRAND_PRIMARY_DARK, GRAD_WHITE_TO_SOFT } from "@/shared/lib/brand"

export default async function DemoSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = await cookies()
  const nationalId = store.get(DEMO_USER_COOKIE)?.value
  if (!nationalId) redirect("/demo/nafath")

  const request = await getDemoRequestById(id)

  if (!request || request.nationalId !== nationalId) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <DemoHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-gray-600">هذا الطلب غير موجود أو لا يخصّك.</p>
          <Link href="/demo/my-requests" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
            العودة لطلباتي ←
          </Link>
        </div>
      </div>
    )
  }

  if (request.status !== "completed") {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <DemoHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-gray-600">يمكن تقييم الخدمة بعد اكتمالها فقط.</p>
          <Link href="/demo/my-requests" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
            العودة لطلباتي ←
          </Link>
        </div>
      </div>
    )
  }

  if (request.surveyResponse) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <DemoHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-gray-600">سبق أن أرسلت تقييمك لهذه الخدمة. شكرًا لك.</p>
          <Link href="/demo/my-requests" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
            العودة لطلباتي ←
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <DemoHeader />
      <section className="py-12" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">استبانة قياس رضا المستفيدين</h1>
            <p className="mt-1 text-sm text-gray-500">
              عزيزي المستفيد، شكرًا لمشاركتك. تستغرق الاستبانة أقل من دقيقة، ونستخدم نتائجها لتحسين خدمة
              &quot;{request.serviceLabelAr}&quot; وخدماتنا القادمة. لا نطلب اسمك، وتُعرض النتائج مجمّعة.
            </p>
          </div>
          <DemoSurveyForm requestId={request.id} />
        </div>
      </section>
      <DemoFooter />
    </div>
  )
}
