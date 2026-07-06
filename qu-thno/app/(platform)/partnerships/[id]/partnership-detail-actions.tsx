"use client"

import { useTransition } from "react"
import { submitPartnershipForApprovalAction, deletePartnershipAction } from "@/core/partnerships/actions"

interface Props {
  partnershipId: string
  status: string
  canSubmit: boolean
  canDelete: boolean
  isRTL: boolean
}

export function PartnershipDetailActions({ partnershipId, status, canSubmit, canDelete, isRTL }: Props) {
  const [isPending, startTransition] = useTransition()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  function handleSubmit() {
    if (!confirm(t("إرسال هذه الشراكة للموافقة؟", "Submit this partnership for approval?"))) return
    startTransition(async () => {
      const res = await submitPartnershipForApprovalAction(partnershipId)
      if ("error" in res) alert(res.error)
    })
  }

  function handleDelete() {
    if (!confirm(t("حذف هذه الشراكة نهائياً؟", "Permanently delete this partnership?"))) return
    startTransition(async () => {
      const res = await deletePartnershipAction(partnershipId)
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
