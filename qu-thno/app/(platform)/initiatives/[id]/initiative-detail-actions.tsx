"use client"

import { useTransition } from "react"
import { submitInitiativeForApprovalAction, deleteInitiativeAction } from "@/core/initiatives/actions"

interface Props {
  initiativeId: string
  status: string
  canSubmit: boolean
  canDelete: boolean
  isRTL: boolean
}

export function InitiativeDetailActions({ initiativeId, status, canSubmit, canDelete, isRTL }: Props) {
  const [isPending, startTransition] = useTransition()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  function handleSubmit() {
    if (!confirm(t("هل تريد إرسال هذه المبادرة للموافقة؟", "Submit this initiative for approval?"))) return
    startTransition(async () => {
      const res = await submitInitiativeForApprovalAction(initiativeId)
      if ("error" in res) alert(res.error)
    })
  }

  function handleDelete() {
    if (!confirm(t("هل أنت متأكد من حذف هذه المبادرة؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure you want to delete this initiative? This cannot be undone."))) return
    startTransition(async () => {
      const res = await deleteInitiativeAction(initiativeId)
      if (res && "error" in res) alert(res.error)
    })
  }

  if (!canSubmit && !canDelete) return null

  return (
    <>
      {canSubmit && status === "draft" && (
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? t("جارٍ الإرسال...", "Submitting...") : t("إرسال للموافقة", "Submit for Approval")}
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50 transition-colors"
        >
          {t("حذف", "Delete")}
        </button>
      )}
    </>
  )
}
