"use client"

import { useActionState, useState } from "react"
import { submitDecisionAction } from "@/core/workflow/actions"
import { WorkflowStatusBadge } from "./workflow-status-badge"
import { getSLAStatus, getSLALabel } from "@/core/workflow/types"
import type { ApprovalTaskView } from "@/core/workflow/types"
import type { WorkflowActionResult } from "@/core/workflow/types"

interface ApprovalCardProps {
  task: ApprovalTaskView
  canAct: boolean  // true if the current user is the assignee
  isRTL: boolean
}

const DECISIONS = [
  {
    key: "APPROVE",
    labelAr: "موافقة",
    labelEn: "Approve",
    className: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    key: "REJECT",
    labelAr: "رفض",
    labelEn: "Reject",
    className: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    key: "RETURN",
    labelAr: "إعادة للمراجعة",
    labelEn: "Return",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
] as const

export function ApprovalCard({ task, canAct, isRTL }: ApprovalCardProps) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [result, formAction, pending] = useActionState<WorkflowActionResult | null, FormData>(
    submitDecisionAction,
    null,
  )
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const slaStatus = getSLAStatus(task.dueAt)

  const isPending = task.status === "PENDING" || task.status === "IN_REVIEW"

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 border-b bg-muted/30">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("خطوة الموافقة", "Approval Step")}
          </p>
          <p className="font-semibold text-foreground">
            {isRTL ? task.stepNameAr : (task.stepNameEn ?? task.stepNameAr)}
          </p>
        </div>
        <WorkflowStatusBadge status={task.status} isRTL={isRTL} />
      </div>

      {/* SLA indicator */}
      {task.dueAt && slaStatus !== "none" && (
        <div
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${
            slaStatus === "breached"
              ? "bg-red-50 text-red-700"
              : slaStatus === "warning"
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
          }`}
        >
          <ClockIcon />
          <span>{getSLALabel(slaStatus, isRTL)}</span>
          {task.dueAt && (
            <span className="ms-1 text-muted-foreground">
              ({t("الموعد النهائي", "Due")}:{" "}
              {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(task.dueAt)})
            </span>
          )}
          {task.isEscalated && (
            <span className="ms-auto rounded-full bg-red-100 px-2 py-0.5 text-red-700">
              {t("تصعيد", "Escalated")}
            </span>
          )}
        </div>
      )}

      {/* Decided state */}
      {!isPending && task.decision && (
        <div className="p-4 space-y-2">
          {task.comment && (
            <blockquote className="border-s-2 border-muted-foreground/30 ps-3 text-sm text-muted-foreground italic">
              {task.comment}
            </blockquote>
          )}
          {task.decidedAt && (
            <p className="text-xs text-muted-foreground">
              {t("تاريخ القرار:", "Decided at:")} {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(task.decidedAt)}
            </p>
          )}
        </div>
      )}

      {/* Action form — shown only when task is pending and current user can act */}
      {canAct && isPending && (
        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="decision" value={selectedDecision ?? ""} />

          {result && "error" in result && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {result.error}
            </div>
          )}

          {result && "success" in result && (
            <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              {t("تم إرسال القرار بنجاح", "Decision submitted successfully")}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t("تعليق (اختياري)", "Comment (optional)")}
            </label>
            <textarea
              name="comment"
              rows={3}
              placeholder={t("أضف تعليقاً أو ملاحظة...", "Add a comment or note...")}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {DECISIONS.map((d) => (
              <button
                key={d.key}
                type="submit"
                disabled={pending}
                onClick={() => setSelectedDecision(d.key)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${d.className}`}
              >
                {pending && selectedDecision === d.key && <Spinner />}
                {isRTL ? d.labelAr : d.labelEn}
              </button>
            ))}
          </div>
        </form>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="size-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="size-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
