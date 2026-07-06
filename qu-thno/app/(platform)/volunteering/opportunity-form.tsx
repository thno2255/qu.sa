"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createOpportunityAction } from "@/core/volunteering/actions"
import type { VolResult } from "@/core/volunteering/actions"

interface Props {
  isRTL: boolean
}

export function OpportunityForm({ isRTL }: Props) {
  const [result, formAction, pending] = useActionState<VolResult | null, FormData>(
    createOpportunityAction as (s: VolResult | null, f: FormData) => Promise<VolResult>,
    null,
  )
  const router = useRouter()

  useEffect(() => {
    if (result && "success" in result && result.success) {
      router.push(`/volunteering/opportunities/${result.id}`)
    }
  }, [result, router])

  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const inputClass = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
  const labelClass = "block text-sm font-medium text-foreground mb-1"

  return (
    <form action={formAction} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      {result && "error" in result && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{result.error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="titleAr" className={labelClass}>{t("عنوان الفرصة بالعربية", "Arabic Title")} <span className="text-destructive">*</span></label>
          <input id="titleAr" name="titleAr" type="text" required className={inputClass} dir="rtl" />
        </div>
        <div>
          <label htmlFor="titleEn" className={labelClass}>{t("عنوان الفرصة بالإنجليزية", "English Title")}</label>
          <input id="titleEn" name="titleEn" type="text" className={inputClass} dir="ltr" />
        </div>
      </div>

      <div>
        <label htmlFor="descriptionAr" className={labelClass}>{t("الوصف", "Description")}</label>
        <textarea id="descriptionAr" name="descriptionAr" rows={4} className={`${inputClass} resize-none`} dir="rtl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClass}>{t("تاريخ البداية", "Start Date")}</label>
          <input id="startDate" name="startDate" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>{t("تاريخ الانتهاء", "End Date")}</label>
          <input id="endDate" name="endDate" type="date" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hoursRequired" className={labelClass}>{t("عدد الساعات المطلوبة", "Hours Required")}</label>
          <input id="hoursRequired" name="hoursRequired" type="number" min={0} step="0.5" className={inputClass} />
        </div>
        <div>
          <label htmlFor="spotsTotal" className={labelClass}>{t("عدد المقاعد", "Total Spots")}</label>
          <input id="spotsTotal" name="spotsTotal" type="number" min={1} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="skills" className={labelClass}>{t("المهارات المطلوبة (مفصولة بفاصلة)", "Required Skills (comma-separated)")}</label>
        <input id="skills" name="skills" type="text" className={inputClass} placeholder={t("مثال: تصوير، تنسيق، تواصل", "e.g. photography, coordination, communication")} />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={() => router.back()} className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
          {t("إلغاء", "Cancel")}
        </button>
        <button type="submit" disabled={pending} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {pending ? t("جارٍ الحفظ...", "Saving...") : t("إنشاء الفرصة", "Create Opportunity")}
        </button>
      </div>
    </form>
  )
}
