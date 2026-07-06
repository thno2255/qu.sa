import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { getAnalyticsSummary } from "@/core/analytics/actions"
import { BarChart } from "@/shared/components/charts/bar-chart"
import { DonutChart } from "@/shared/components/charts/donut-chart"
import { LineChart } from "@/shared/components/charts/line-chart"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"

export const metadata = { title: "التحليلات" }

async function AnalyticsDashboard({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const data = await getAnalyticsSummary()

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("لوحة التحليلات التنفيذية", "Executive Analytics Dashboard")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("رؤية شاملة ومرئية لأداء منصة المسؤولية المجتمعية", "Comprehensive visual overview of community responsibility platform performance")}
        </p>
      </div>

      {/* Totals bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: t("المبادرات", "Initiatives"), value: data.totals.initiatives, color: "#8b5cf6" },
          { label: t("المشاريع", "Projects"), value: data.totals.projects, color: "#3b82f6" },
          { label: t("الشراكات", "Partnerships"), value: data.totals.partnerships, color: "#10b981" },
          { label: t("المتطوعون", "Volunteers"), value: data.totals.volunteers, color: "#f59e0b" },
          { label: t("المستفيدون", "Beneficiaries"), value: new Intl.NumberFormat(locale).format(data.totals.totalBeneficiaries), color: "#ef4444" },
          { label: t("ساعات التطوع", "Vol. Hours"), value: new Intl.NumberFormat(locale).format(data.totals.totalVolunteerHours), color: "#06b6d4" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Initiatives + Projects by status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">
            {t("المبادرات حسب الحالة", "Initiatives by Status")}
          </h2>
          {data.initiativesByStatus.length > 0 ? (
            <BarChart data={data.initiativesByStatus} isRTL={isRTL} height={180} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("لا توجد بيانات", "No data yet")}</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">
            {t("المشاريع حسب الحالة", "Projects by Status")}
          </h2>
          {data.projectsByStatus.length > 0 ? (
            <BarChart data={data.projectsByStatus} isRTL={isRTL} height={180} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("لا توجد بيانات", "No data yet")}</p>
          )}
        </div>
      </div>

      {/* Row 2: Volunteer Hours trend */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">
          {t("ساعات التطوع — آخر 6 أشهر", "Volunteer Hours — Last 6 Months")}
        </h2>
        {data.volunteerHoursByMonth.some(d => d.value > 0) ? (
          <LineChart data={data.volunteerHoursByMonth} color="#10b981" height={140} />
        ) : (
          <div className="flex h-[140px] items-center justify-center">
            <p className="text-sm text-muted-foreground">{t("لا توجد ساعات تطوع مسجّلة بعد", "No volunteer hours logged yet")}</p>
          </div>
        )}
      </div>

      {/* Row 3: SDG + Budget */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">
            {t("توزيع أهداف التنمية المستدامة", "SDG Distribution")}
          </h2>
          {data.sdgDistribution.length > 0 ? (
            <DonutChart segments={data.sdgDistribution} isRTL={isRTL} size={140} thickness={30} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("لا توجد بيانات", "No data yet")}</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">
            {t("توزيع الميزانية حسب الحالة", "Budget Allocation by Status")}
          </h2>
          {data.budgetAllocation.length > 0 ? (
            <DonutChart segments={data.budgetAllocation} isRTL={isRTL} size={140} thickness={30} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("لا توجد بيانات", "No data yet")}</p>
          )}
        </div>
      </div>

      {/* Row 4: Partnerships */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">
          {t("الشراكات حسب الحالة", "Partnerships by Status")}
        </h2>
        {data.partnershipsByType.length > 0 ? (
          <BarChart data={data.partnershipsByType} isRTL={isRTL} height={160} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">{t("لا توجد بيانات", "No data yet")}</p>
        )}
      </div>
    </div>
  )
}

export default async function AnalyticsPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-48 rounded-xl bg-muted" /><div className="h-72 rounded-xl bg-muted" /></div>}>
      <AnalyticsDashboard locale={locale} />
    </Suspense>
  )
}
