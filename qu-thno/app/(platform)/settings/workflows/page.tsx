import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import type { WorkflowConfig } from "@/core/workflow/types"
import { WorkflowStatusBadge } from "@/shared/components/workflow/workflow-status-badge"

export const metadata: Metadata = { title: "مصمم سير العمل | Workflow Designer" }

export default async function WorkflowDesignerPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  // Only admins and managers can access
  const userType = session?.user?.userType ?? "VISITOR"
  const canAccess = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4" aria-hidden>🔒</span>
        <h1 className="text-xl font-bold text-foreground">{t("غير مصرح بالوصول", "Access Denied")}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {t("هذه الصفحة متاحة فقط لمدير النظام ومدير المسؤولية المجتمعية", "This page is only available to System Admin and Community Manager")}
        </p>
      </div>
    )
  }

  const definitions = await db.workflowDefinition.findMany({
    include: { _count: { select: { instances: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("مصمم سير العمل", "Workflow Designer")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "إدارة قوالب سير العمل وتكوين مراحل الموافقة",
              "Manage workflow templates and configure approval stages",
            )}
          </p>
        </div>
      </div>

      {/* Templates grid */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("القوالب المُعرَّفة", "Defined Templates")}
        </h2>

        {definitions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-12 text-center">
            <span className="text-4xl mb-3" aria-hidden>📋</span>
            <p className="font-medium text-foreground">
              {t("لا توجد قوالب بعد", "No templates yet")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("شغّل `npx prisma db seed` لتهيئة القوالب الافتراضية", "Run `npx prisma db seed` to initialize default templates")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {definitions.map((def) => {
              const name = def.name as Record<string, string>
              const desc = def.description as Record<string, string> | null
              const config = def.config as unknown as WorkflowConfig
              const nonTerminalSteps = config.steps.filter((s) => !s.isTerminal)

              return (
                <div key={def.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">
                      {isRTL ? (name.ar ?? name.ar) : (name.en ?? name.ar)}
                    </h3>
                    <WorkflowStatusBadge status={def.status === "active" ? "RUNNING" : "ON_HOLD"} isRTL={isRTL} />
                  </div>

                  {desc && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {isRTL ? (desc.ar ?? "") : (desc.en ?? desc.ar ?? "")}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    {/* Steps preview */}
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {nonTerminalSteps.map((step, idx) => (
                        <div key={step.key} className="flex items-center gap-1.5 shrink-0">
                          {idx > 0 && (
                            <svg className="size-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                            </svg>
                          )}
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground truncate max-w-[80px]" title={isRTL ? step.nameAr : (step.nameEn ?? step.nameAr)}>
                            {isRTL ? step.nameAr : (step.nameEn ?? step.nameAr)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{nonTerminalSteps.length} {t("مراحل", "stages")}</span>
                      <span>{def._count.instances} {t("تشغيل", "runs")}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground font-mono">
                      v{def.version} · {def.moduleId}
                    </span>
                    {def.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                        {t("افتراضي", "Default")}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* SLA Reference */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("مرجع قواعد SLA", "SLA Rules Reference")}
        </h2>
        <div className="rounded-xl border bg-card p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="pb-2 text-start text-xs font-semibold text-muted-foreground">{t("القالب", "Template")}</th>
                <th className="pb-2 text-start text-xs font-semibold text-muted-foreground">{t("المرحلة", "Stage")}</th>
                <th className="pb-2 text-start text-xs font-semibold text-muted-foreground">{t("المهلة (ساعات)", "SLA (hours)")}</th>
                <th className="pb-2 text-start text-xs font-semibold text-muted-foreground">{t("التصعيد إلى", "Escalate to")}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {definitions.flatMap((def) => {
                const name = def.name as Record<string, string>
                const config = def.config as unknown as WorkflowConfig
                return config.steps
                  .filter((s) => s.sla)
                  .map((step) => (
                    <tr key={`${def.id}-${step.key}`}>
                      <td className="py-2.5 font-medium text-foreground">
                        {isRTL ? (name.ar ?? name.ar) : (name.en ?? name.ar)}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {isRTL ? step.nameAr : (step.nameEn ?? step.nameAr)}
                      </td>
                      <td className="py-2.5">
                        <span className="font-mono">{step.sla!.durationHours}h</span>
                        <span className="ms-2 text-xs text-amber-600">
                          ⚠ {step.sla!.warningHours}h
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground font-mono text-xs">
                        {step.sla!.escalateTo}
                      </td>
                    </tr>
                  ))
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
