import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { getImpactKPIs, getSDGCoverage, getModuleImpactSummaries } from "@/core/impact/actions"
import { Users, Clock, Rocket, Globe, Wallet, Handshake, type LucideIcon } from "lucide-react"

const SDG_COLORS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d",
  5: "#ff3a21", 6: "#26bde2", 7: "#fcc30b", 8: "#a21942",
  9: "#fd6925", 10: "#dd1367", 11: "#fd9d24", 12: "#bf8b2e",
  13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b", 16: "#00689d",
  17: "#19486a",
}

export const metadata = { title: "قياس الأثر المجتمعي" }

async function ImpactContent({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const [kpis, sdgCoverage, modules] = await Promise.all([
    getImpactKPIs(),
    getSDGCoverage(),
    getModuleImpactSummaries(),
  ])

  const kpiCards: { label: string; value: string | number; Icon: LucideIcon; color: string }[] = [
    { label: t("المستفيدون", "Beneficiaries"), value: new Intl.NumberFormat(locale).format(kpis.totalBeneficiaries), Icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: t("ساعات التطوع", "Volunteer Hours"), value: new Intl.NumberFormat(locale).format(kpis.totalVolunteerHours), Icon: Clock, color: "bg-green-500/10 text-green-600" },
    { label: t("البرامج النشطة", "Active Programs"), value: kpis.activePrograms, Icon: Rocket, color: "bg-purple-500/10 text-purple-600" },
    { label: t("أهداف التنمية المُغطاة", "SDGs Covered"), value: `${kpis.sdgCoverage} / 17`, Icon: Globe, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("الميزانية المخصصة", "Budget Allocated"), value: `${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(kpis.budgetAllocated)} ${t("ر.س", "SAR")}`, Icon: Wallet, color: "bg-amber-500/10 text-amber-600" },
    { label: t("الشراكات النشطة", "Active Partnerships"), value: kpis.partnershipsActive, Icon: Handshake, color: "bg-rose-500/10 text-rose-600" },
  ]

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("قياس الأثر المجتمعي", "Community Impact Measurement")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("مؤشرات الأداء الرئيسية وأثر البرامج على المجتمع والأهداف الأممية", "Key performance indicators and community program impact on SDGs")}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${kpi.color}`}>
              <kpi.Icon className="size-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* SDG Coverage */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">
            {t("تغطية أهداف التنمية المستدامة", "Sustainable Development Goals Coverage")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(`مُغطاة ${kpis.sdgCoverage} من 17 هدفاً أممياً`, `${kpis.sdgCoverage} of 17 UN SDGs covered`)}
          </p>
        </div>
        <div className="p-5">
          {/* SDG bubble grid */}
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 17 }, (_, i) => i + 1).map(goal => {
              const covered = sdgCoverage.find(s => s.goal === goal)
              const color = SDG_COLORS[goal] ?? "#6b7280"
              return (
                <div
                  key={goal}
                  title={isRTL ? (covered?.labelAr ?? `هدف ${goal}`) : (covered?.labelEn ?? `Goal ${goal}`)}
                  className="group relative flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all hover:scale-110"
                  style={{
                    background: covered ? color : "transparent",
                    border: `2px solid ${color}`,
                    width: 52,
                    minHeight: 52,
                    opacity: covered ? 1 : 0.3,
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: covered ? "white" : color }}
                  >
                    {goal}
                  </span>
                  {covered && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: "white" }}
                    >
                      {covered.count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* SDG Bar */}
          <div className="mt-6 space-y-2">
            {sdgCoverage.slice(0, 8).map(sdg => {
              const maxCount = sdgCoverage[0]?.count ?? 1
              const pct = (sdg.count / maxCount) * 100
              return (
                <div key={sdg.goal} className="flex items-center gap-3">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                    style={{ background: SDG_COLORS[sdg.goal] }}
                  >
                    {sdg.goal}
                  </span>
                  <p className="w-28 shrink-0 text-xs text-muted-foreground truncate">
                    {isRTL ? sdg.labelAr : sdg.labelEn}
                  </p>
                  <div className="flex-1 rounded-full bg-muted h-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: SDG_COLORS[sdg.goal] }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-6 text-end">{sdg.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Module Impact Summary */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">
            {t("ملخص الأثر حسب البرنامج", "Impact Summary by Program")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">
                  {t("البرنامج", "Module")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("الكلي", "Total")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("نشط", "Active")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("مكتمل", "Completed")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("المستفيدون", "Beneficiaries")}
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map(m => (
                <tr key={m.module} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">
                    {isRTL ? m.moduleAr : m.module}
                  </td>
                  <td className="px-4 py-4 text-center text-muted-foreground">{m.total}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {m.active}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {m.completed}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-foreground">
                    {m.beneficiaries > 0
                      ? new Intl.NumberFormat(locale).format(m.beneficiaries)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default async function ImpactPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-24 rounded-xl bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div>}>
      <ImpactContent locale={locale} />
    </Suspense>
  )
}
