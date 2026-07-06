import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { getWorkflowInstance } from "@/core/workflow/engine"
import { WorkflowStatusBadge } from "@/shared/components/workflow/workflow-status-badge"
import { WorkflowTimeline } from "@/shared/components/workflow/workflow-timeline"
import { ApprovalCard } from "@/shared/components/workflow/approval-card"
import Link from "next/link"

export const metadata: Metadata = { title: "تفاصيل سير العمل | Workflow Detail" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkflowDetailPage({ params }: Props) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const instance = await getWorkflowInstance(id)
  if (!instance) notFound()

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""

  const defName = instance.definition.name
  const title = isRTL ? (defName.ar ?? defName.ar) : (defName.en ?? defName.ar)

  // Get the active pending task for this user
  const myActiveTask = instance.approvalTasks.find(
    (t) =>
      (t.status === "PENDING" || t.status === "IN_REVIEW") &&
      (t.assigneeId === userType || t.assigneeId === userId),
  )

  // All pending tasks (for display, even if not mine)
  const pendingTasks = instance.approvalTasks.filter(
    (t) => t.status === "PENDING" || t.status === "IN_REVIEW",
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label={t("مسار التنقل", "Breadcrumb")}>
        <Link href="/workflows" className="hover:text-foreground transition-colors">
          {t("سير العمل", "Workflows")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {instance.entityType} · {instance.entityId.slice(0, 8)}…
            </p>
          </div>
          <WorkflowStatusBadge status={instance.status} isRTL={isRTL} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 text-sm">
          <MetaRow
            label={t("بدأ في", "Started")}
            value={new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(instance.startedAt)}
          />
          {instance.completedAt && (
            <MetaRow
              label={t("اكتمل في", "Completed")}
              value={new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(instance.completedAt)}
            />
          )}
          {instance.dueAt && (
            <MetaRow
              label={t("الموعد النهائي", "Due Date")}
              value={new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(instance.dueAt)}
            />
          )}
          <MetaRow
            label={t("المرحلة الحالية", "Current Stage")}
            value={instance.currentStage ?? "—"}
          />
        </div>
      </div>

      {/* Workflow progress bar */}
      <WorkflowProgress instance={instance} isRTL={isRTL} />

      {/* My approval task (interactive) */}
      {myActiveTask && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("مهمتي", "My Task")}
          </h2>
          <ApprovalCard task={myActiveTask} canAct={true} isRTL={isRTL} />
        </section>
      )}

      {/* All pending tasks (read-only for others) */}
      {pendingTasks.length > 0 && !myActiveTask && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("المهام المعلقة", "Pending Tasks")}
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <ApprovalCard key={task.id} task={task} canAct={false} isRTL={isRTL} />
            ))}
          </div>
        </section>
      )}

      {/* History timeline */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("سجل الأحداث", "Event History")}
        </h2>
        <WorkflowTimeline history={instance.history} isRTL={isRTL} />
      </section>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  )
}

function WorkflowProgress({
  instance,
  isRTL,
}: {
  instance: Awaited<ReturnType<typeof getWorkflowInstance>>
  isRTL: boolean
}) {
  if (!instance) return null
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const steps = instance.definition.config.steps.filter((s) => !s.isTerminal)
  const currentIdx = steps.findIndex((s) => s.key === instance.currentStage)
  const totalSteps = steps.length

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("تقدم سير العمل", "Workflow Progress")}
      </h2>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = instance.status === "COMPLETED" || idx < currentIdx
          const isCurrent = idx === currentIdx && instance.status === "RUNNING"
          const isSkipped = instance.status === "REJECTED" && idx > currentIdx

          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Step number / check */}
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 ${
                  isDone
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : isSkipped
                        ? "bg-red-100 border-red-300 text-red-500"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isCurrent ? "text-foreground" : isDone ? "text-green-700" : "text-muted-foreground"
                  }`}
                >
                  {isRTL ? step.nameAr : (step.nameEn ?? step.nameAr)}
                </p>
                {step.sla && (
                  <p className="text-xs text-muted-foreground">
                    {t("المهلة:", "SLA:")} {step.sla.durationHours}h
                  </p>
                )}
              </div>

              {isCurrent && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t("جارٍ", "Current")}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
