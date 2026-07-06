"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { StatusResult } from "@/core/cms/actions"
import type { NewsArticle } from "@prisma/client"

interface Props {
  locale: "ar" | "en"
  article?: NewsArticle
  createAction: (prev: StatusResult | null, form: FormData) => Promise<StatusResult>
  updateAction?: (prev: StatusResult | null, form: FormData) => Promise<StatusResult>
}

export function NewsForm({ locale, article, createAction, updateAction }: Props) {
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const router = useRouter()
  const isEdit = !!article
  const action = isEdit && updateAction ? updateAction : createAction

  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/cms/news/${state.id}`)
    }
  }, [state, router])

  const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
  const labelClass = "block text-sm font-medium text-foreground mb-1.5"

  return (
    <form action={formAction} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {isEdit && <input type="hidden" name="id" value={article.id} />}

      {state?.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="titleAr">
            {t("العنوان بالعربية", "Title (Arabic)")} <span className="text-destructive">*</span>
          </label>
          <input
            id="titleAr"
            name="titleAr"
            required
            defaultValue={article?.titleAr ?? ""}
            placeholder={t("عنوان المقال بالعربية", "Article title in Arabic")}
            className={inputClass}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="titleEn">
            {t("العنوان بالإنجليزية", "Title (English)")}
          </label>
          <input
            id="titleEn"
            name="titleEn"
            defaultValue={article?.titleEn ?? ""}
            placeholder="Article title in English"
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelClass} htmlFor="excerptAr">
          {t("الملخص", "Excerpt")}
        </label>
        <input
          id="excerptAr"
          name="excerptAr"
          defaultValue={article?.excerptAr ?? ""}
          placeholder={t("ملخص قصير للمقال", "Short summary")}
          className={inputClass}
        />
      </div>

      {/* Content */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contentAr">
            {t("المحتوى بالعربية", "Content (Arabic)")}
          </label>
          <textarea
            id="contentAr"
            name="contentAr"
            rows={10}
            defaultValue={article?.contentAr ?? ""}
            placeholder={t("محتوى المقال التفصيلي بالعربية", "Full article content in Arabic")}
            className={`${inputClass} resize-none`}
            dir="rtl"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contentEn">
            {t("المحتوى بالإنجليزية", "Content (English)")}
          </label>
          <textarea
            id="contentEn"
            name="contentEn"
            rows={10}
            defaultValue={article?.contentEn ?? ""}
            placeholder="Full article content in English"
            className={`${inputClass} resize-none`}
            dir="ltr"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass} htmlFor="tags">
          {t("الوسوم (مفصولة بفاصلة)", "Tags (comma-separated)")}
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={article?.tags.join(", ") ?? ""}
          placeholder={t("مثال: مبادرات، تعليم، تطوع", "e.g. initiatives, education, volunteering")}
          className={inputClass}
        />
      </div>

      {/* Status */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className={labelClass}>{t("حالة النشر", "Publication Status")}</p>
        <div className="flex flex-wrap gap-4">
          {[
            { value: "draft", ar: "مسودة", en: "Draft" },
            { value: "published", ar: "منشور", en: "Published" },
            { value: "archived", ar: "مؤرشف", en: "Archived" },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opt.value}
                defaultChecked={(article?.status ?? "draft") === opt.value}
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
            : t("نشر المقال", "Publish Article")}
        </button>
      </div>
    </form>
  )
}
