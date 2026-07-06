"use client"

import { useTransition } from "react"
import { applyToOpportunityAction } from "@/core/volunteering/actions"

interface Props {
  opportunityId: string
  alreadyApplied: boolean
  isFull: boolean
  isRTL: boolean
}

export function ApplyButton({ opportunityId, alreadyApplied, isFull, isRTL }: Props) {
  const [isPending, startTransition] = useTransition()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  if (alreadyApplied) {
    return (
      <span className="rounded-xl bg-green-50 border border-green-200 px-5 py-2.5 text-sm font-medium text-green-700">
        ✓ {t("تم التقديم", "Applied")}
      </span>
    )
  }

  if (isFull) {
    return (
      <span className="rounded-xl bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground">
        {t("المقاعد ممتلئة", "No Spots Available")}
      </span>
    )
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await applyToOpportunityAction(opportunityId)
          if ("error" in res) alert(res.error)
        })
      }
      disabled={isPending}
      className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
    >
      {isPending ? t("جارٍ التقديم...", "Applying...") : t("التقديم على الفرصة", "Apply Now")}
    </button>
  )
}
