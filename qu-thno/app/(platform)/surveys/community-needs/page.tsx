import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { ClipboardList, BarChart2, Users, Handshake } from "lucide-react"
import { getCommunityNeedsStats, NEEDS_CATEGORY_LABEL, PRIORITY_LABEL } from "@/core/surveys/actions"
import { CommunityNeedsSurveyForm } from "./survey-form"

export const metadata = { title: "استبيان الاحتياج المجتمعي" }

const ADMIN_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

async function StatsPanel({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const stats = await getCommunityNeedsStats()

  if (stats.total === 0) return null

  const topCategory = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <BarChart2 className="size-5 text-primary" />
        نتائج الاستبيان
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "إجمالي المشاركين", value: stats.total,        icon: Users },
          { label: "أعلى أولوية",      value: stats.byPriority?.high ?? 0, icon: ClipboardList },
          { label: "مستعدون للشراكة",  value: stats.willingCount, icon: Handshake },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-muted/40 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">التوزيع حسب المجال</p>
        <div className="space-y-2">
          {Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-36 shrink-0">
                  {NEEDS_CATEGORY_LABEL[cat] ?? cat}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-end">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default async function CommunityNeedsSurveyPage() {
  const [locale, session] = await Promise.all([getLocale(), auth()])
  const isRTL    = locale === "ar"
  const isAdmin  = ADMIN_ROLES.includes(session?.user?.userType ?? "")

  return (
    <div className="mx-auto max-w-3xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
            <ClipboardList className="size-5" />
          </div>
          <h1 className="text-2xl font-bold">استبيان الاحتياج المجتمعي</h1>
        </div>
        <p className="text-white/80 text-sm leading-relaxed max-w-xl">
          شاركنا رأيك واحتياجاتك المجتمعية لتساعد جامعة القصيم في توجيه برامجها وخدماتها
          نحو ما يخدم المجتمع فعلاً. مشاركتك تُحدث فرقاً حقيقياً.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {["دقيقتان فقط", "لا يشترط التسجيل", "بيانات سرية"].map(t => (
            <span key={t} className="rounded-full bg-white/20 px-3 py-1">{t}</span>
          ))}
        </div>
      </div>

      {/* نتائج للإدارة */}
      {isAdmin && (
        <Suspense fallback={null}>
          <StatsPanel locale={locale} />
        </Suspense>
      )}

      {/* الاستبيان */}
      <CommunityNeedsSurveyForm locale={locale} />
    </div>
  )
}
