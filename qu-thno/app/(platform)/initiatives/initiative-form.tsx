"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createInitiativeAction, updateInitiativeAction } from "@/core/initiatives/actions"
import type { InitiativeResult } from "@/core/initiatives/actions"

const SDG_LABELS: Record<number, string> = {
  1: "القضاء على الفقر", 2: "القضاء على الجوع", 3: "الصحة الجيدة",
  4: "التعليم الجيد", 5: "المساواة بين الجنسين", 6: "المياه النظيفة",
  7: "طاقة نظيفة", 8: "العمل اللائق", 9: "الصناعة والابتكار",
  10: "الحد من عدم المساواة", 11: "مدن مستدامة", 12: "استهلاك مسؤول",
  13: "العمل المناخي", 14: "الحياة تحت الماء", 15: "الحياة على اليابسة",
  16: "السلام والعدل", 17: "شراكات لتحقيق الأهداف",
}

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
    targetBeneficiaries?: number | null
    budgetAllocated?: number | null
    vision2030Pillar?: string | null
    sdgGoals?: number[]
    tags?: string[]
  }
}

function toDateInput(d?: Date | null): string {
  if (!d) return ""
  return d.toISOString().split("T")[0] ?? ""
}

export function InitiativeForm({ isRTL, defaultValues }: Props) {
  const isEdit = !!defaultValues?.id
  const action = isEdit ? updateInitiativeAction : createInitiativeAction

  const [result, formAction, pending] = useActionState<InitiativeResult | null, FormData>(
    action as (s: InitiativeResult | null, f: FormData) => Promise<InitiativeResult>,
    null,
  )

  const router = useRouter()

  useEffect(() => {
    if (result && "success" in result && result.success) {
      router.push(`/initiatives/${result.id}`)
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

      {/* Titles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="titleAr" className={labelClass}>
            {t("العنوان بالعربية", "Arabic Title")} <span className="text-destructive">*</span>
          </label>
          <input
            id="titleAr"
            name="titleAr"
            type="text"
            required
            defaultValue={defaultValues?.titleAr ?? ""}
            placeholder={t("عنوان المبادرة", "Initiative title in Arabic")}
            className={inputClass}
            dir="rtl"
          />
        </div>
        <div>
          <label htmlFor="titleEn" className={labelClass}>
            {t("العنوان بالإنجليزية", "English Title")}
          </label>
          <input
            id="titleEn"
            name="titleEn"
            type="text"
            defaultValue={defaultValues?.titleEn ?? ""}
            placeholder="Initiative title in English"
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="descriptionAr" className={labelClass}>
          {t("الوصف", "Description")}
        </label>
        <textarea
          id="descriptionAr"
          name="descriptionAr"
          rows={4}
          defaultValue={defaultValues?.descriptionAr ?? ""}
          placeholder={t("وصف تفصيلي للمبادرة وأهدافها...", "Detailed description of the initiative and its objectives...")}
          className={`${inputClass} resize-none`}
          dir="rtl"
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClass}>{t("تاريخ البداية", "Start Date")}</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInput(defaultValues?.startDate)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endDate" className={labelClass}>{t("تاريخ الانتهاء", "End Date")}</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInput(defaultValues?.endDate)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="targetBeneficiaries" className={labelClass}>{t("عدد المستفيدين المستهدف", "Target Beneficiaries")}</label>
          <input
            id="targetBeneficiaries"
            name="targetBeneficiaries"
            type="number"
            min={0}
            defaultValue={defaultValues?.targetBeneficiaries ?? ""}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="budgetAllocated" className={labelClass}>{t("الميزانية المخصصة (ريال)", "Budget (SAR)")}</label>
          <input
            id="budgetAllocated"
            name="budgetAllocated"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.budgetAllocated ?? ""}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
      </div>

      {/* Vision 2030 Pillar */}
      <div>
        <label htmlFor="vision2030Pillar" className={labelClass}>{t("محور رؤية 2030", "Vision 2030 Pillar")}</label>
        <select id="vision2030Pillar" name="vision2030Pillar" defaultValue={defaultValues?.vision2030Pillar ?? ""} className={inputClass}>
          <option value="">{t("اختر المحور", "Select pillar")}</option>
          <option value="مجتمع حيوي">مجتمع حيوي — Vibrant Society</option>
          <option value="اقتصاد مزدهر">اقتصاد مزدهر — Thriving Economy</option>
          <option value="وطن طموح">وطن طموح — Ambitious Nation</option>
        </select>
      </div>

      {/* SDG Goals */}
      <div>
        <p className={labelClass}>{t("أهداف التنمية المستدامة (SDGs)", "Sustainable Development Goals (SDGs)")}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => {
            const checked = selectedSdgs.includes(n)
            return (
              <label
                key={n}
                className="relative flex cursor-pointer items-center gap-1.5 rounded-lg border p-2 text-xs transition-all has-[:checked]:border-transparent has-[:checked]:ring-2 has-[:checked]:ring-primary/50"
                style={{ backgroundColor: checked ? `${SDG_COLORS[n]}18` : undefined }}
              >
                <input
                  type="checkbox"
                  name="sdgGoals"
                  value={n}
                  defaultChecked={checked}
                  className="sr-only"
                />
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: SDG_COLORS[n] }}
                >
                  {n}
                </span>
                <span className="truncate text-[10px] leading-tight text-muted-foreground">{SDG_LABELS[n]}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className={labelClass}>
          {t("الوسوم (مفصولة بفاصلة)", "Tags (comma-separated)")}
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={defaultValues?.tags?.join(", ") ?? ""}
          placeholder={t("مثال: تعليم، صحة، بيئة", "e.g. education, health, environment")}
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          {t("إلغاء", "Cancel")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending
            ? t("جارٍ الحفظ...", "Saving...")
            : isEdit
              ? t("حفظ التعديلات", "Save Changes")
              : t("إنشاء المبادرة", "Create Initiative")}
        </button>
      </div>
    </form>
  )
}
