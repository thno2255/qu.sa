"use client"

import { useActionState, useState, useEffect } from "react"
import { logVolunteerHoursAction } from "@/core/volunteering/actions"
import type { StatusResult } from "@/core/volunteering/actions"
import { useRouter } from "next/navigation"

interface Props {
  isRTL: boolean
}

export function LogHoursForm({ isRTL }: Props) {
  const [result, formAction, pending] = useActionState<StatusResult | null, FormData>(
    logVolunteerHoursAction as (s: StatusResult | null, f: FormData) => Promise<StatusResult>,
    null,
  )
  const router = useRouter()

  // today must be computed client-side only — new Date() during SSR causes hydration mismatch
  const [today, setToday] = useState("")
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0] ?? "")
  }, [])

  useEffect(() => {
    if (result && "success" in result && result.success) {
      router.push("/volunteering/my-applications")
    }
  }, [result, router])

  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const inputClass = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
  const labelClass = "block text-sm font-medium text-foreground mb-1"

  return (
    <form action={formAction} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
      {result && "error" in result && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{result.error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hours" className={labelClass}>{t("عدد الساعات", "Number of Hours")} <span className="text-destructive">*</span></label>
          <input id="hours" name="hours" type="number" required min="0.5" step="0.5" className={inputClass} placeholder="0.5" />
        </div>
        <div>
          <label htmlFor="date" className={labelClass}>{t("تاريخ التطوع", "Date")} <span className="text-destructive">*</span></label>
          <input id="date" name="date" type="date" required defaultValue={today} max={today} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="descriptionAr" className={labelClass}>{t("وصف النشاط التطوعي", "Activity Description")}</label>
        <textarea id="descriptionAr" name="descriptionAr" rows={3} className={`${inputClass} resize-none`} dir="rtl" placeholder={t("ماذا فعلت خلال هذه الجلسة التطوعية؟", "What did you do during this volunteer session?")} />
      </div>

      <div>
        <label htmlFor="opportunityId" className={labelClass}>{t("رقم الفرصة (اختياري)", "Opportunity ID (optional)")}</label>
        <input id="opportunityId" name="opportunityId" type="text" className={inputClass} placeholder={t("اتركه فارغاً إن لم ينتمِ لفرصة معينة", "Leave empty if not linked to a specific opportunity")} dir="ltr" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={() => router.back()} className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
          {t("إلغاء", "Cancel")}
        </button>
        <button type="submit" disabled={pending} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {pending ? t("جارٍ التسجيل...", "Logging...") : t("تسجيل الساعات", "Log Hours")}
        </button>
      </div>
    </form>
  )
}
