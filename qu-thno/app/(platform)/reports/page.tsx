import { Suspense } from "react"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { getImpactKPIs, getModuleImpactSummaries } from "@/core/impact/actions"
import { auth } from "@/core/auth/auth"
import { Globe, Rocket, FolderKanban, Handshake, Heart, BarChart3, Printer, type LucideIcon } from "lucide-react"

export const metadata = { title: "التقارير" }

async function ReportHub({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const session = await auth()
  const [kpis, modules] = await Promise.all([getImpactKPIs(), getModuleImpactSummaries()])

  const printDate = new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })

  const reports: { id: string; titleAr: string; titleEn: string; descAr: string; descEn: string; Icon: LucideIcon; href: string; available: boolean }[] = [
    { id: "impact", titleAr: "تقرير الأثر المجتمعي", titleEn: "Community Impact Report", descAr: "مؤشرات الأداء الشاملة وتغطية أهداف التنمية المستدامة", descEn: "Comprehensive KPIs and SDG coverage metrics", Icon: Globe, href: "/impact", available: true },
    { id: "initiatives", titleAr: "تقرير المبادرات المجتمعية", titleEn: "Initiatives Report", descAr: "حالة المبادرات وتوزيعها حسب الأهداف والتقدم", descEn: "Initiative status, distribution by SDGs and progress", Icon: Rocket, href: "/initiatives", available: true },
    { id: "projects", titleAr: "تقرير المشاريع المجتمعية", titleEn: "Projects Report", descAr: "تقدم المشاريع ومراحلها وفرق العمل", descEn: "Project milestones, team, and progress status", Icon: FolderKanban, href: "/projects", available: true },
    { id: "partnerships", titleAr: "تقرير الشراكات", titleEn: "Partnerships Report", descAr: "الشركاء النشطون وتفاصيل الشراكات وقيمتها", descEn: "Active partners, partnership details and value", Icon: Handshake, href: "/partnerships", available: true },
    { id: "volunteering", titleAr: "تقرير التطوع", titleEn: "Volunteering Report", descAr: "ساعات التطوع والمتطوعون والفرص المتاحة", descEn: "Volunteer hours, volunteers, and opportunities", Icon: Heart, href: "/volunteering", available: true },
    { id: "analytics", titleAr: "تقرير التحليلات التنفيذي", titleEn: "Executive Analytics Report", descAr: "مخططات بيانية تنفيذية وتحليلات مقارنة", descEn: "Executive charts and comparative analytics", Icon: BarChart3, href: "/analytics", available: true },
  ]

  return (
    <div className="space-y-8 print:space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("مركز التقارير", "Reports Hub")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("تقارير شاملة عن جميع برامج المسؤولية المجتمعية", "Comprehensive reports across all community responsibility programs")}
          </p>
        </div>
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors print:hidden"
        >
          <Printer className="size-4" />
          {t("طباعة", "Print")}
        </button>
      </div>

      {/* Quick Stats — printable summary */}
      <div className="rounded-xl border bg-card shadow-sm print:border-0 print:shadow-none">
        <div className="border-b p-5 print:border-b-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              {t("ملخص تنفيذي", "Executive Summary")}
            </h2>
            <span className="text-xs text-muted-foreground">{printDate}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("منصة المسؤولية المجتمعية — جامعة القصيم", "Community Responsibility Platform — Qassim University")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: t("المستفيدون", "Beneficiaries"), value: new Intl.NumberFormat(locale).format(kpis.totalBeneficiaries) },
            { label: t("ساعات التطوع", "Vol. Hours"), value: new Intl.NumberFormat(locale).format(kpis.totalVolunteerHours) },
            { label: t("البرامج النشطة", "Active Programs"), value: kpis.activePrograms },
            { label: t("أهداف التنمية", "SDGs"), value: `${kpis.sdgCoverage}/17` },
            { label: t("الشراكات", "Partnerships"), value: kpis.partnershipsActive },
            {
              label: t("الميزانية", "Budget"),
              value: new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(kpis.budgetAllocated) + " " + t("ر.س", "SAR"),
            },
          ].map((item, i) => (
            <div key={i} className="bg-card px-4 py-5 text-center">
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module Breakdown Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">
            {t("ملخص البرامج", "Programs Breakdown")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">{t("البرنامج", "Program")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الإجمالي", "Total")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("نشط", "Active")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("مكتمل", "Completed")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("المستفيدون", "Beneficiaries")}</th>
              </tr>
            </thead>
            <tbody>
              {modules.map(m => (
                <tr key={m.module} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">{isRTL ? m.moduleAr : m.module}</td>
                  <td className="px-4 py-4 text-center text-muted-foreground">{m.total}</td>
                  <td className="px-4 py-4 text-center text-green-600 font-medium">{m.active}</td>
                  <td className="px-4 py-4 text-center text-blue-600 font-medium">{m.completed}</td>
                  <td className="px-4 py-4 text-center font-medium">
                    {m.beneficiaries > 0 ? new Intl.NumberFormat(locale).format(m.beneficiaries) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div>
        <h2 className="font-semibold text-foreground mb-4">
          {t("التقارير المتاحة", "Available Reports")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
          {reports.map(r => (
            <Link
              key={r.id}
              href={r.href}
              className="group flex gap-4 rounded-xl border bg-card p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.Icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {isRTL ? r.titleAr : r.titleEn}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {isRTL ? r.descAr : r.descEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function ReportsPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-48 rounded-xl bg-muted" /></div>}>
      <ReportHub locale={locale} />
    </Suspense>
  )
}
