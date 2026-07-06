"use client"

import { useTransition } from "react"
import { submitProjectForApprovalAction, deleteProjectAction, completeMilestoneAction } from "@/core/projects/actions"

interface DetailActionsProps {
  projectId: string
  status: string
  canSubmit: boolean
  canDelete: boolean
  isRTL: boolean
}

export function ProjectDetailActions({ projectId, status, canSubmit, canDelete, isRTL }: DetailActionsProps) {
  const [isPending, startTransition] = useTransition()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  function handleSubmit() {
    if (!confirm(t("إرسال هذا المشروع للموافقة؟", "Submit this project for approval?"))) return
    startTransition(async () => {
      const res = await submitProjectForApprovalAction(projectId)
      if ("error" in res) alert(res.error)
    })
  }

  function handleDelete() {
    if (!confirm(t("حذف هذا المشروع نهائياً؟", "Permanently delete this project?"))) return
    startTransition(async () => {
      const res = await deleteProjectAction(projectId)
      if (res && "error" in res) alert(res.error)
    })
  }

  if (!canSubmit && !canDelete) return null

  return (
    <>
      {canSubmit && status === "draft" && (
        <button onClick={handleSubmit} disabled={isPending} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {isPending ? t("جارٍ الإرسال...", "Submitting...") : t("إرسال للموافقة", "Submit for Approval")}
        </button>
      )}
      {canDelete && (
        <button onClick={handleDelete} disabled={isPending} className="rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50 transition-colors">
          {t("حذف", "Delete")}
        </button>
      )}
    </>
  )
}

interface MilestoneButtonProps {
  milestoneId: string
  projectId: string
  isRTL: boolean
}

export function CompleteMilestoneButton({ milestoneId, projectId, isRTL }: MilestoneButtonProps) {
  const [isPending, startTransition] = useTransition()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <button
      onClick={() => startTransition(async () => { await completeMilestoneAction(milestoneId, projectId) })}
      disabled={isPending}
      className="rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 disabled:opacity-50 transition-colors"
    >
      {isPending ? "..." : t("إتمام", "Complete")}
    </button>
  )
}
