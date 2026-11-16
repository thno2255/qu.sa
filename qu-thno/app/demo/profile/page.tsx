import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, FileText } from "lucide-react"
import { DemoHeader } from "@/shared/components/layout/demo-header"
import { DemoFooter } from "@/shared/components/layout/demo-footer"
import { DEMO_USER_COOKIE } from "@/core/demo/constants"
import { getDemoRequestsByNationalId } from "@/core/demo/actions"
import { BRAND_PRIMARY_DARK, GRAD_WHITE_TO_SOFT } from "@/shared/lib/brand"

export default async function DemoProfilePage() {
  const store = await cookies()
  const nationalId = store.get(DEMO_USER_COOKIE)?.value
  if (!nationalId) redirect("/demo/nafath")

  const requests = await getDemoRequestsByNationalId(nationalId)

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <DemoHeader />
      <section className="py-12" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full" style={{ backgroundColor: "#eaf5ee" }}>
              <User className="size-8" style={{ color: BRAND_PRIMARY_DARK }} />
            </div>
            <h1 className="mt-4 text-lg font-bold text-gray-900">الملف الشخصي (محاكاة توضيحية)</h1>
            <p className="mt-1 text-sm text-gray-500">
              رقم الهوية: <span dir="ltr" className="font-semibold text-gray-700">{nationalId}</span>
            </p>

            <div className="mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
              هذا ملف شخصي توضيحي ضمن العرض التجريبي فقط — لا يحمل أي بيانات حقيقية
              عن صاحب رقم الهوية، ولا علاقة له بحسابات المنصة الفعلية.
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
              <FileText className="size-4" />
              <span>{requests.length} طلب مُقدَّم برقم هويتك</span>
            </div>

            <Link
              href="/demo/my-requests"
              className="mt-5 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              عرض طلباتي
            </Link>
          </div>
        </div>
      </section>
      <DemoFooter />
    </div>
  )
}
