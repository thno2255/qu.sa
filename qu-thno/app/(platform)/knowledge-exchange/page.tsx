import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import Link from "next/link"
import { BookOpen, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getKnowledgeExchangeRequests, getKEStats, KE_CATEGORY_LABEL, KE_STATUS_LABEL } from "@/core/knowledge-exchange/actions"
import { TableSkeleton } from "@/shared/components/ui/skeleton"

export const metadata = { title: "تبادل المعرفة مع الشركات" }

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  ACCEPTED:  "bg-emerald-100 text-emerald-700",
  SCHEDULED: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
}

async function KnowledgeExchangeList({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const [requests, stats] = await Promise.all([
    getKnowledgeExchangeRequests(),
    getKEStats(),
  ])

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            تبادل المعرفة مع الشركات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            منصة لتبادل الخبرات والمعرفة بين الجامعة والقطاع الخاص
          </p>
        </div>
        <Link
          href="/knowledge-exchange/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          طلب تبادل معرفي
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats.total, icon: BookOpen, color: "text-primary bg-primary/10" },
          { label: "قيد المراجعة",   value: stats.pending,   icon: Clock,        color: "text-amber-600 bg-amber-50" },
          { label: "مكتملة",         value: stats.completed, icon: CheckCircle,  color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${s.color}`}>
              <s.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
              <BookOpen className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground">لا توجد طلبات تبادل معرفي بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">كن أول من يطلب تبادل معرفي مع الجامعة</p>
            <Link href="/knowledge-exchange/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> طلب تبادل معرفي
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الشركة / الموضوع</th>
                <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">التخصص</th>
                <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">العضو المعيّن</th>
                <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">الحالة</th>
                <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">التاريخ</th>
                <th className="px-4 py-3.5 text-center font-medium text-muted-foreground">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">{r.companyName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.topicAr}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {KE_CATEGORY_LABEL[r.category] ?? r.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {r.assignedFaculty
                      ? (r.assignedFaculty.nameAr ?? r.assignedFaculty.name)
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[r.status] ?? "bg-muted text-muted-foreground"}`}>
                      {KE_STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {r.createdAt.toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link href={`/knowledge-exchange/${r.id}`}
                      className="text-xs text-primary hover:underline font-medium">
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default async function KnowledgeExchangePage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<TableSkeleton />}>
      <KnowledgeExchangeList locale={locale} />
    </Suspense>
  )
}
