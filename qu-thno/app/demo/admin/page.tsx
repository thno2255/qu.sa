import { redirect } from "next/navigation"
import { Inbox } from "lucide-react"
import { isDemoAdminAuthed, getDemoRequests, demoAdminLogoutAction } from "@/core/demo/actions"
import { DemoRequestRow } from "@/shared/components/demo/demo-request-row"

export default async function DemoAdminPage() {
  if (!(await isDemoAdminAuthed())) {
    redirect("/demo/admin/login")
  }

  const requests = await getDemoRequests()
  const pending = requests.filter((r) => r.status === "pending")
  const decided = requests.filter((r) => r.status !== "pending")

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-bold text-gray-900">لوحة مسؤول العرض التجريبي</h1>
            <p className="text-xs text-gray-500">مراجعة واعتماد الطلبات التجريبية — خطوة واحدة فقط</p>
          </div>
          <form action={demoAdminLogoutAction}>
            <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-700">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "قيد المراجعة", value: pending.length, color: "#d97706" },
            { label: "مقبولة", value: requests.filter((r) => r.status === "approved").length, color: "#059669" },
            { label: "مرفوضة", value: requests.filter((r) => r.status === "rejected").length, color: "#dc2626" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
            <Inbox className="mx-auto size-8 text-gray-300" />
            <p className="mt-2 text-sm">لا توجد طلبات تجريبية بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-gray-700">قيد المراجعة ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map((r) => (
                    <DemoRequestRow
                      key={r.id}
                      id={r.id}
                      serviceLabelAr={r.serviceLabelAr}
                      nationalId={r.nationalId}
                      status={r.status}
                      payload={r.payload as Record<string, unknown>}
                      createdAt={r.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </section>
            )}

            {decided.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-gray-700">تم البت فيها ({decided.length})</h2>
                <div className="space-y-3">
                  {decided.map((r) => (
                    <DemoRequestRow
                      key={r.id}
                      id={r.id}
                      serviceLabelAr={r.serviceLabelAr}
                      nationalId={r.nationalId}
                      status={r.status}
                      payload={r.payload as Record<string, unknown>}
                      createdAt={r.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
