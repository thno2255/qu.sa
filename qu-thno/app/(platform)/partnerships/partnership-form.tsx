"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPartnershipAction, updatePartnershipAction } from "@/core/partnerships/actions"
import type { PartnershipResult } from "@/core/partnerships/actions"

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
    type: string
    startDate?: Date | null
    endDate?: Date | null
    renewalDate?: Date | null
    partnershipValue?: number | null
    sdgGoals?: number[]
    partner?: { nameAr: string; nameEn?: string | null; type: string; sector?: string | null }
  }
}

function toDateInput(d?: Date | null): string {
  if (!d) return ""
  return d.toISOString().split("T")[0] ?? ""
}

export function PartnershipForm({ isRTL, defaultValues }: Props) {
  const isEdit = !!defaultValues?.id
  const action = isEdit ? updatePartnershipAction : createPartnershipAction

  const [result, formAction, pending] = useActionState<PartnershipResult | null, FormData>(
    action as (s: PartnershipResult | null, f: FormData) => Promise<PartnershipResult>,
    null,
  )

  const router = useRouter()

  useEffect(() => {
    if (result && "success" in result && result.success) {
      router.push(`/partnerships/${result.id}`)
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

      {/* Partnership titles */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground border-b pb-2 w-full">{t("معلومات الشراكة", "Partnership Details")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="titleAr" className={labelClass}>{t("عنوان الشراكة بالعربية", "Arabic Title")} <span className="text-destructive">*</span></label>
            <input id="titleAr" name="titleAr" type="text" required defaultValue={defaultValues?.titleAr ?? ""} className={inputClass} dir="rtl" />
          </div>
          <div>
            <label htmlFor="titleEn" className={labelClass}>{t("عنوان الشراكة بالإنجليزية", "English Title")}</label>
            <input id="titleEn" name="titleEn" type="text" defaultValue={defaultValues?.titleEn ?? ""} className={inputClass} dir="ltr" />
          </div>
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>{t("نوع الشراكة", "Partnership Type")}</label>
          <select id="type" name="type" defaultValue={defaultValues?.type ?? "مذكرة تفاهم"} className={inputClass}>
            <option value="مذكرة تفاهم">{t("مذكرة تفاهم", "MOU")}</option>
            <option value="اتفاقية تعاون">{t("اتفاقية تعاون", "Cooperation Agreement")}</option>
            <option value="رعاية">{t("رعاية", "Sponsorship")}</option>
            <option value="عقد">{t("عقد", "Contract")}</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="startDate" className={labelClass}>{t("تاريخ البداية", "Start Date")}</label>
            <input id="startDate" name="startDate" type="date" defaultValue={toDateInput(defaultValues?.startDate)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="endDate" className={labelClass}>{t("تاريخ الانتهاء", "End Date")}</label>
            <input id="endDate" name="endDate" type="date" defaultValue={toDateInput(defaultValues?.endDate)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="renewalDate" className={labelClass}>{t("تاريخ التجديد", "Renewal Date")}</label>
            <input id="renewalDate" name="renewalDate" type="date" defaultValue={toDateInput(defaultValues?.renewalDate)} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="partnershipValue" className={labelClass}>{t("قيمة الشراكة (ريال)", "Partnership Value (SAR)")}</label>
          <input id="partnershipValue" name="partnershipValue" type="number" min={0} step="0.01" defaultValue={defaultValues?.partnershipValue ?? ""} className={inputClass} />
        </div>
      </fieldset>

      {/* Partner info (only on create) */}
      {!isEdit && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-foreground border-b pb-2 w-full">{t("بيانات الجهة الشريكة", "Partner Information")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="partnerNameAr" className={labelClass}>{t("اسم الجهة بالعربية", "Partner Name (Arabic)")} <span className="text-destructive">*</span></label>
              <input id="partnerNameAr" name="partnerNameAr" type="text" required className={inputClass} dir="rtl" />
            </div>
            <div>
              <label htmlFor="partnerNameEn" className={labelClass}>{t("اسم الجهة بالإنجليزية", "Partner Name (English)")}</label>
              <input id="partnerNameEn" name="partnerNameEn" type="text" className={inputClass} dir="ltr" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="partnerType" className={labelClass}>{t("نوع الجهة", "Partner Type")}</label>
              <select id="partnerType" name="partnerType" className={inputClass}>
                <option value="government">{t("حكومية", "Government")}</option>
                <option value="private">{t("خاصة", "Private")}</option>
                <option value="ngo">{t("غير ربحية", "NGO")}</option>
                <option value="academic">{t("أكاديمية", "Academic")}</option>
                <option value="international">{t("دولية", "International")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="partnerSector" className={labelClass}>{t("القطاع", "Sector")}</label>
              <input id="partnerSector" name="partnerSector" type="text" className={inputClass} placeholder={t("مثال: التعليم، الصحة...", "e.g. Education, Health...")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="partnerEmail" className={labelClass}>{t("البريد الإلكتروني", "Email")}</label>
              <input id="partnerEmail" name="partnerEmail" type="email" className={inputClass} dir="ltr" />
            </div>
            <div>
              <label htmlFor="partnerWebsite" className={labelClass}>{t("الموقع الإلكتروني", "Website")}</label>
              <input id="partnerWebsite" name="partnerWebsite" type="url" className={inputClass} dir="ltr" placeholder="https://" />
            </div>
          </div>
        </fieldset>
      )}

      {/* SDG Goals */}
      <div>
        <p className={labelClass}>{t("أهداف التنمية المستدامة", "SDG Goals")}</p>
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
          {pending ? t("جارٍ الحفظ...", "Saving...") : isEdit ? t("حفظ التعديلات", "Save Changes") : t("إنشاء الشراكة", "Create Partnership")}
        </button>
      </div>
    </form>
  )
}
