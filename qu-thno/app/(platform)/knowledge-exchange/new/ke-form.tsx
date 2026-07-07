"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { requestKnowledgeExchangeAction } from "@/core/knowledge-exchange/actions"
import { KE_CATEGORY_LABEL } from "@/core/knowledge-exchange/constants"
import { useEffect } from "react"

type ActionResult = { success: true; id?: string } | { error: string }

export function KnowledgeExchangeForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    requestKnowledgeExchangeAction, null
  )

  useEffect(() => {
    if (state && "success" in state && state.id) {
      router.push(`/knowledge-exchange/${state.id}`)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {state && "error" in state && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* معلومات الشركة */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-foreground text-base">معلومات الشركة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              اسم الشركة / المؤسسة <span className="text-red-500">*</span>
            </label>
            <input name="companyName" required placeholder="شركة ..." dir="rtl"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">اسم المسؤول</label>
            <input name="contactName" placeholder="اسم المتواصل" dir="rtl"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">البريد الإلكتروني</label>
            <input name="contactEmail" type="email" placeholder="email@company.com" dir="ltr"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">رقم الجوال</label>
            <input name="contactPhone" type="tel" placeholder="05xxxxxxxx" dir="ltr"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      {/* تفاصيل الطلب */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-foreground text-base">تفاصيل طلب التبادل المعرفي</h2>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            موضوع التبادل المعرفي <span className="text-red-500">*</span>
          </label>
          <input name="topicAr" required placeholder="موضوع الاستفادة من الخبرة الأكاديمية..." dir="rtl"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            تخصص المعرفة المطلوبة <span className="text-red-500">*</span>
          </label>
          <select name="category" required
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">اختر التخصص...</option>
            {Object.entries(KE_CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            وصف تفصيلي للاحتياج <span className="text-red-500">*</span>
          </label>
          <textarea name="descriptionAr" required rows={5} dir="rtl"
            placeholder="اشرح الاحتياج المعرفي وما تتوقع الاستفادة منه من الجامعة..."
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          إلغاء
        </button>
        <button type="submit" disabled={isPending}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
          {isPending ? "جاري الإرسال..." : "تقديم الطلب"}
        </button>
      </div>
    </form>
  )
}
