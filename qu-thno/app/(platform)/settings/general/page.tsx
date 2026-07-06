import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"

export const metadata = { title: "الإعدادات العامة" }

async function GeneralSettings({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (session.user.userType !== "SYSTEM_ADMIN") redirect("/dashboard")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const [userCount, initiativeCount, projectCount, partnershipCount] = await Promise.all([
    db.user.count(),
    db.initiative.count(),
    db.project.count(),
    db.partnership.count(),
  ])

  const systemInfo = [
    { label: t("إصدار المنصة", "Platform Version"), value: "1.0.0-beta" },
    { label: t("قاعدة البيانات", "Database"), value: "PostgreSQL 16" },
    { label: t("إطار العمل", "Framework"), value: "Next.js 16" },
    { label: t("المصادقة", "Authentication"), value: "NextAuth v5" },
    { label: t("نظام التدفق", "Workflow Engine"), value: t("مدمج — 3 قوالب", "Built-in — 3 templates") },
    { label: t("المساعد الذكي", "AI Assistant"), value: "Claude (Anthropic)" },
  ]

  const dbStats = [
    { label: t("المستخدمون", "Users"), value: userCount },
    { label: t("المبادرات", "Initiatives"), value: initiativeCount },
    { label: t("المشاريع", "Projects"), value: projectCount },
    { label: t("الشراكات", "Partnerships"), value: partnershipCount },
  ]

  return (
    <div className="space-y-8 max-w-4xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("الإعدادات العامة", "General Settings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("معلومات النظام والإعدادات العامة للمنصة", "System information and general platform configuration")}
        </p>
      </div>

      {/* Platform Identity */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">{t("هوية المنصة", "Platform Identity")}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl font-bold shadow-md">
              م
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">منصة المسؤولية المجتمعية</p>
              <p className="text-sm text-muted-foreground">Community Responsibility Platform</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("جامعة القصيم", "Qassim University")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">{t("معلومات النظام", "System Information")}</h2>
        </div>
        <div className="divide-y">
          {systemInfo.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Database Statistics */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">{t("إحصائيات قاعدة البيانات", "Database Statistics")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
          {dbStats.map((s, i) => (
            <div key={i} className="bg-card px-5 py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Progress */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold text-foreground">{t("حالة المراحل", "Phase Status")}</h2>
        </div>
        <div className="divide-y">
          {[
            { phase: 0, name: t("الأساس", "Foundation"), status: "complete" },
            { phase: 1, name: t("إدارة الهويات", "IAM"), status: "complete" },
            { phase: 2, name: t("محرك سير العمل والإشعارات", "Workflow Engine + Notifications"), status: "complete" },
            { phase: 3, name: t("الوحدات الأساسية", "Core Modules"), status: "complete" },
            { phase: 4, name: t("المساعد الذكي والبحث", "AI Assistant + Smart Search"), status: "complete" },
            { phase: 5, name: t("قياس الأثر والتقارير", "Impact Measurement + Reporting"), status: "complete" },
            { phase: 6, name: t("المحفظة المجتمعية والغيمفيكيشن", "Community Portfolio + Gamification"), status: "complete" },
            { phase: 7, name: t("نظام إدارة المحتوى", "CMS + Public Portal"), status: "complete" },
            { phase: 8, name: t("التحليلات ولوحة القيادة", "Analytics + Executive Dashboard"), status: "complete" },
            { phase: 9, name: t("الجوال والـ PWA وإمكانية الوصول", "Mobile + PWA + Accessibility"), status: "complete" },
          ].map(p => (
            <div key={p.phase} className="flex items-center gap-4 px-5 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {p.phase}
              </span>
              <p className="flex-1 text-sm text-foreground">{p.name}</p>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                {t("مكتمل ✓", "Complete ✓")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function GeneralSettingsPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 rounded-xl bg-muted" /></div>}>
      <GeneralSettings locale={locale} />
    </Suspense>
  )
}
