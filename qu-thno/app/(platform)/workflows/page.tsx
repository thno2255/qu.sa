import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { getMyPendingTasks, getWorkflowInstances, checkAndEscalateOverdueTasks } from "@/core/workflow/engine"
import { WorkflowStatusBadge } from "@/shared/components/workflow/workflow-status-badge"
import { getSLAStatus } from "@/core/workflow/types"
import type { WorkflowConfig } from "@/core/workflow/types"
import Link from "next/link"
import { CheckCircle2, ClipboardList } from "lucide-react"

export const metadata: Metadata = {
  title: "سير العمل | Workflows",
}

export default async function WorkflowsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""

  // Check and escalate any overdue tasks (runs on page load — no cron needed)
  await checkAndEscalateOverdueTasks()

  const [myTasks, allInstances] = await Promise.all([
    getMyPendingTasks(userType, userId),
    getWorkflowInstances({ limit: 30 }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("سير العمل", "Workflows")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "تتبع طلبات الموافقة ومهام سير العمل",
            "Track approval requests and workflow tasks",
          )}
        </p>
      </div>

      {/* My Pending Tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("مهامي المعلقة", "My Pending Tasks")}
          </h2>
          {myTasks.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {myTasks.length}
            </span>
          )}
        </div>

        {myTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <CheckCircle2 className="size-8 mx-auto mb-2 text-green-500" />
            <p className="mt-2 font-medium text-foreground">
              {t("لا توجد مهام معلقة", "No pending tasks")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("ستظهر طلبات الموافقة المطلوبة منك هنا", "Approval requests assigned to you will appear here")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              const defName = task.instance.definition.name as Record<string, string>
              const slaStatus = getSLAStatus(task.dueAt)

              return (
                <Link
                  key={task.id}
                  href={`/workflows/${task.instanceId}`}
                  className="block rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {isRTL ? (defName.ar ?? defName.ar) : (defName.en ?? defName.ar)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? task.stepNameAr : (task.stepNameEn ?? task.stepNameAr)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {task.instance.entityType} / {task.instance.entityId.slice(0, 8)}…
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <WorkflowStatusBadge status={task.status} isRTL={isRTL} />
                      {slaStatus !== "none" && (
                        <span
                          className={`text-xs font-medium ${
                            slaStatus === "breached"
                              ? "text-red-600"
                              : slaStatus === "warning"
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {slaStatus === "breached"
                            ? t("انتهت المهلة", "SLA Breached")
                            : slaStatus === "warning"
                              ? t("المهلة تقترب", "SLA Warning")
                              : t("ضمن المهلة", "Within SLA")}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.dueAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("الموعد النهائي:", "Due:")} {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(task.dueAt)}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* All workflow instances */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("جميع سير الأعمال", "All Workflows")}
        </h2>

        {allInstances.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <ClipboardList className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="mt-2 font-medium text-foreground">
              {t("لا توجد سير أعمال بعد", "No workflows yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                    {t("سير العمل", "Workflow")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                    {t("الكيان", "Entity")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                    {t("المرحلة الحالية", "Current Stage")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                    {t("الحالة", "Status")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                    {t("البداية", "Started")}
                  </th>
                  <th className="sr-only">{t("إجراء", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allInstances.map((inst) => {
                  const defName = inst.definition.name as Record<string, string>
                  const config = inst.definition.config as unknown as WorkflowConfig
                  const currentStepDef = config.steps.find((s) => s.key === inst.currentStage)

                  return (
                    <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {isRTL ? (defName.ar ?? defName.ar) : (defName.en ?? defName.ar)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        <span className="rounded bg-muted px-1.5 py-0.5">{inst.entityType}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {currentStepDef
                          ? (isRTL ? currentStepDef.nameAr : (currentStepDef.nameEn ?? currentStepDef.nameAr))
                          : inst.currentStage}
                      </td>
                      <td className="px-4 py-3">
                        <WorkflowStatusBadge status={inst.status} isRTL={isRTL} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" }).format(inst.startedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/workflows/${inst.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t("عرض", "View")}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
