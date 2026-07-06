"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { StatusResult } from "@/core/cms/actions"
import type { CMSEvent } from "@prisma/client"

interface Props {
  locale: "ar" | "en"
  event?: CMSEvent
  createAction: (prev: StatusResult | null, form: FormData) => Promise<StatusResult>
  updateAction?: (prev: StatusResult | null, form: FormData) => Promise<StatusResult>
}

function toDateInput(d: Date | null | undefined): string {
  if (!d) return ""
  return d.toISOString().split("T")[0] ?? ""
}

export function EventForm({ locale, event, createAction, updateAction }: Props) {
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const router = useRouter()
  const isEdit = !!event
  const action = isEdit && updateAction ? updateAction : createAction

  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/cms/events/${state.id}`)
    }
  }, [state, router])

  const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
  const labelClass = "block text-sm font-medium text-foreground mb-1.5"

  return (
    <form action={formAction} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {isEdit && <input type="hidden" name="id" value={event.id} />}

      {state?.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="titleAr">
            {t("اسم الفعالية بالعربية", "Event Name (Arabic)")} <span className="text-destructive">*</span>
          </label>
          <input
            id="titleAr"
            name="titleAr"
            required
            defaultValue={event?.titleAr ?? ""}
            placeholder={t("اسم الفعالية", "Event name")}
            className={inputClass}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="titleEn">
            {t("الاسم بالإنجليزية", "Event Name (English)")}
          </label>
          <input
            id="titleEn"
            name="titleEn"
            defaultValue={event?.titleEn ?? ""}
            placeholder="Event name in English"
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="descriptionAr">
            {t("الوصف بالعربية", "Description (Arabic)")}
          </label>
          <textarea
            id="descriptionAr"
            name="descriptionAr"
            rows={5}
            defaultValue={event?.descriptionAr ?? ""}
            placeholder={t("وصف تفصيلي للفعالية", "Detailed event description")}
            className={`${inputClass} resize-none`}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="descriptionEn">
            {t("الوصف بالإنجليزية", "Description (English)")}
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            rows={5}
            defaultValue={event?.descriptionEn ?? ""}
            placeholder="Event description in English"
            className={`${inputClass} resize-none`}
            dir="ltr"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="startDate">
            {t("تاريخ البداية", "Start Date")} <span className="text-destructive">*</span>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={toDateInput(event?.startDate)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endDate">
            {t("تاريخ النهاية", "End Date")}
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInput(event?.endDate)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="locationAr">
            {t("الموقع بالعربية", "Location (Arabic)")}
          </label>
          <input
            id="locationAr"
            name="locationAr"
            defaultValue={event?.locationAr ?? ""}
            placeholder={t("مثال: قاعة المؤتمرات الرئيسية", "e.g. Main Conference Hall")}
            className={inputClass}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="locationEn">
            {t("الموقع بالإنجليزية", "Location (English)")}
          </label>
          <input
            id="locationEn"
            name="locationEn"
            defaultValue={event?.locationEn ?? ""}
            placeholder="e.g. Main Conference Hall"
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className={labelClass} htmlFor="capacity">
          {t("الطاقة الاستيعابية", "Capacity")}
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={event?.capacity ?? ""}
          placeholder={t("عدد المقاعد المتاحة (اختياري)", "Number of seats (optional)")}
          className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Status */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className={labelClass}>{t("حالة النشر", "Publication Status")}</p>
        <div className="flex flex-wrap gap-4">
          {[
            { value: "draft", ar: "مسودة", en: "Draft" },
            { value: "published", ar: "منشور", en: "Published" },
            { value: "cancelled", ar: "ملغاة", en: "Cancelled" },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opt.value}
                defaultChecked={(event?.status ?? "draft") === opt.value}
                className="accent-primary"
              />
              <span className="text-sm">{isRTL ? opt.ar : opt.en}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          {t("إلغاء", "Cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? t("جاري الحفظ...", "Saving...")
            : isEdit
            ? t("حفظ التعديلات", "Save Changes")
            : t("إنشاء الفعالية", "Create Event")}
        </button>
      </div>
    </form>
  )
}
