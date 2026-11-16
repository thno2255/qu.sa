import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Inbox, Star } from "lucide-react"
import { DemoHeader } from "@/shared/components/layout/demo-header"
import { DemoFooter } from "@/shared/components/layout/demo-footer"
import { DEMO_USER_COOKIE } from "@/core/demo/constants"
import { getDemoRequestsByNationalId } from "@/core/demo/actions"
import { BRAND_PRIMARY_DARK, GRAD_WHITE_TO_SOFT } from "@/shared/lib/brand"

const STATUS_LABEL: Record<string, { ar: string; className: string }> = {
  pending: { ar: "قيد المراجعة", className: "bg-amber-50 text-amber-700" },
  approved: { ar: "مقبول", className: "bg-emerald-50 text-emerald-700" },
  rejected: { ar: "مرفوض", className: "bg-red-50 text-red-700" },
  completed: { ar: "مكتملة", className: "bg-blue-50 text-blue-700" },
}

export default async function DemoMyRequestsPage() {
  const store = await cookies()
  const nationalId = store.get(DEMO_USER_COOKIE)?.value
  if (!nationalId) redirect("/demo/nafath")

  const requests = await getDemoRequestsByNationalId(nationalId)

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <DemoHeader />
      <section className="py-12" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">طلباتي</h1>
            <p className="mt-1 text-sm text-gray-500">
              الطلبات التجريبية المُقدَّمة برقم الهوية <span dir="ltr" className="font-semibold">{nationalId}</span>
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
              <Inbox className="mx-auto size-8 text-gray-300" />
              <p className="mt-2 text-sm">لم تُقدِّم أي طلب بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const title = (r.payload as Record<string, unknown>)?.titleAr as string | undefined
                return (
                  <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{r.serviceLabelAr}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABEL[r.status]?.className ?? ""}`}>
                        {STATUS_LABEL[r.status]?.ar ?? r.status}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold text-gray-900">{title || r.serviceLabelAr}</h3>
                    <p className="mt-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("ar-SA")}</p>

                    {r.status === "completed" && !r.surveyResponse && (
                      <Link
                        href={`/demo/survey/${r.id}`}
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white"
                        style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                      >
                        <Star className="size-3.5" />
                        قيّم الخدمة
                      </Link>
                    )}
                    {r.status === "completed" && r.surveyResponse && (
                      <p className="mt-3 text-center text-xs font-medium text-emerald-600">✓ تم إرسال تقييمك لهذه الخدمة</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <DemoFooter />
    </div>
  )
}
