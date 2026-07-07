"use client"

import { useActionState, useState } from "react"
import { submitCommunityNeedsSurveyAction, NEEDS_CATEGORY_LABEL, PRIORITY_LABEL } from "@/core/surveys/actions"

type ActionResult = { success: true } | { error: string }

export function CommunityNeedsSurveyForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const [submitted, setSubmitted] = useState(false)
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const res = await submitCommunityNeedsSurveyAction(prev, fd)
      if ("success" in res) setSubmitted(true)
      return res
    },
    null
  )

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card shadow-sm">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-bold text-foreground">شكراً على مشاركتك!</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
          تم تسجيل إجابتك بنجاح. ستُسهم مشاركتك في توجيه برامج المسؤولية المجتمعية لجامعة القصيم.
        </p>
        <button onClick={() => setSubmitted(false)}
          className="mt-6 rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          تقديم استجابة أخرى
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {state && "error" in state && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* معلومات المشارك */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-foreground">معلوماتك (اختيارية)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">الاسم</label>
            <input name="respondentName" placeholder="اسمك الكريم" dir="rtl"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">الجهة / المؤسسة</label>
            <input name="respondentOrg" placeholder="جهتك أو مؤسستك" dir="rtl"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">نوع المستجيب</label>
          <div className="flex flex-wrap gap-3">
            {[
              { v: "individual", l: "فرد" },
              { v: "company",    l: "شركة / مؤسسة خاصة" },
              { v: "government", l: "جهة حكومية" },
              { v: "ngo",        l: "منظمة غير ربحية" },
            ].map(opt => (
              <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="respondentType" value={opt.v} className="accent-primary" />
                <span className="text-sm">{opt.l}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* الاحتياج */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-sm">
        <h2 className="font-semibold text-foreground">تفاصيل الاحتياج المجتمعي</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            مجال الاحتياج <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(NEEDS_CATEGORY_LABEL).map(([k, v]) => (
              <label key={k}
                className="flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="needsCategory" value={k} required className="accent-primary" />
                <span className="text-sm font-medium">{v}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            وصف الاحتياج بالتفصيل <span className="text-red-500">*</span>
          </label>
          <textarea name="needDescription" required rows={4} dir="rtl"
            placeholder="اشرح الاحتياج الذي تلاحظه في مجتمعك أو بيئة عملك..."
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            مستوى الأولوية <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priority" value={k} required
                  className="accent-primary" />
                <span className={`text-sm font-medium ${k === "high" ? "text-red-600" : k === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
                  {v}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">اقتراح حل (اختياري)</label>
          <textarea name="suggestedSolution" rows={3} dir="rtl"
            placeholder="هل لديك اقتراح لحل هذا الاحتياج؟"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="willingToPartner" value="true"
            className="mt-0.5 size-4 rounded accent-primary" />
          <span className="text-sm text-muted-foreground leading-relaxed">
            أود المشاركة كشريك أو متعاون مع جامعة القصيم في معالجة هذا الاحتياج
          </span>
        </label>
      </div>

      <button type="submit" disabled={isPending}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {isPending ? "جاري الإرسال..." : "إرسال الاستبيان"}
      </button>
    </form>
  )
}
