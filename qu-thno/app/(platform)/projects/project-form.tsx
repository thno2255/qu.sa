"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProjectAction, updateProjectAction } from "@/core/projects/actions"
import type { ProjectResult } from "@/core/projects/actions"

const SDG_COLORS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a",
}

interface Props {
  isRTL: boolean
  defaultValues?: {
    id: string
    titleAr: string
    titleEn?: string | null
    descriptionAr?: string | null
    startDate?: Date | null
    endDate?: Date | null
    budget?: number | null
    riskLevel?: string | null
    sdgGoals?: number[]
    initiativeId?: string | null
  }
}

function toDateInput(d?: Date | null): string {
  if (!d) return ""
  return d.toISOString().split("T")[0] ?? ""
}

export function ProjectForm({ isRTL, defaultValues }: Props) {
  const isEdit = !!defaultValues?.id
  const action = isEdit ? updateProjectAction : createProjectAction

  const [result, formAction, pending] = useActionState<ProjectResult | null, FormData>(
    action as (s: ProjectResult | null, f: FormData) => Promise<ProjectResult>,
    null,
  )

  const router = useRouter()

  useEffect(() => {
    if (result && "success" in result && result.success) {
      router.push(`/projects/${result.id}`)
    }
  }, [result, router])

  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const inputClass = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
  const labelClass = "block text-sm font-medium text-foreground mb-1"
  const selectedSdgs = defaultValues?.sdgGoals ?? []

  return (
    <form action={formAction} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      {isEdit && <input type="hidden" name="id" value={defaultValues!.id} />}

      {result && "error" in result && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {result.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="titleAr" className={labelClass}>
            {t("العنوان بالعربية", "Arabic Title")} <span className="text-destructive">*</span>
          </label>
          <input id="titleAr" name="titleAr" type="text" required defaultValue={defaultValues?.titleAr ?? ""} className={inputClass} dir="rtl" />
        </div>
        <div>
          <label htmlFor="titleEn" className={labelClass}>{t("العنوان بالإنجليزية", "English Title")}</label>
          <input id="titleEn" name="titleEn" type="text" defaultValue={defaultValues?.titleEn ?? ""} className={inputClass} dir="ltr" />
        </div>
      </div>

      <div>
        <label htmlFor="descriptionAr" className={labelClass}>{t("الوصف", "Description")}</label>
        <textarea id="descriptionAr" name="descriptionAr" rows={4} defaultValue={defaultValues?.descriptionAr ?? ""} className={`${inputClass} resize-none`} dir="rtl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClass}>{t("تاريخ البداية", "Start Date")}</label>
          <input id="startDate" name="startDate" type="date" defaultValue={toDateInput(defaultValues?.startDate)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>{t("تاريخ الانتهاء", "End Date")}</label>
          <input id="endDate" name="endDate" type="date" defaultValue={toDateInput(defaultValues?.endDate)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className={labelClass}>{t("الميزانية (ريال)", "Budget (SAR)")}</label>
          <input id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={defaultValues?.budget ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="riskLevel" className={labelClass}>{t("مستوى المخاطرة", "Risk Level")}</label>
          <select id="riskLevel" name="riskLevel" defaultValue={defaultValues?.riskLevel ?? ""} className={inputClass}>
            <option value="">{t("اختر المستوى", "Select level")}</option>
            <option value="low">{t("منخفض", "Low")}</option>
            <option value="medium">{t("متوسط", "Medium")}</option>
            <option value="high">{t("عالٍ", "High")}</option>
          </select>
        </div>
      </div>

      <div>
        <p className={labelClass}>{t("أهداف التنمية المستدامة (SDGs)", "SDG Goals")}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="relative flex cursor-pointer items-center gap-1.5 rounded-lg border p-2 text-xs transition-all has-[:checked]:ring-2 has-[:checked]:ring-primary/50">
              <input type="checkbox" name="sdgGoals" value={n} defaultChecked={selectedSdgs.includes(n)} className="sr-only" />
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: SDG_COLORS[n] }}>{n}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={() => router.back()} className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
          {t("إلغاء", "Cancel")}
        </button>
        <button type="submit" disabled={pending} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {pending ? t("جارٍ الحفظ...", "Saving...") : isEdit ? t("حفظ التعديلات", "Save Changes") : t("إنشاء المشروع", "Create Project")}
        </button>
      </div>
    </form>
  )
}
