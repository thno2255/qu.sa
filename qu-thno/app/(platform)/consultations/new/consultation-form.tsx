"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { requestConsultationAction } from "@/core/consultations/actions"
import {
  ChevronRight, MessageSquare, CheckCircle2, Loader2, BookOpen,
} from "lucide-react"

const CATEGORIES = [
  { value: "academic",  label: "أكاديمية",             desc: "مساعدة في المقررات والأداء الدراسي",          color: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "research",  label: "بحثية",                desc: "توجيه بحثي ومشاريع التخرج والنشر العلمي",     color: "border-purple-200 bg-purple-50 text-purple-700" },
  { value: "career",    label: "مهنية وتطوير ذاتي",    desc: "التخطيط المهني وفرص العمل والتطوير",           color: "border-teal-200 bg-teal-50 text-teal-700" },
  { value: "community", label: "مسؤولية مجتمعية",      desc: "استشارات مبادرات وخدمة المجتمع",               color: "border-green-200 bg-green-50 text-green-700" },
  { value: "other",     label: "أخرى",                 desc: "أي استشارة أخرى خارج التصنيفات السابقة",       color: "border-gray-200 bg-gray-50 text-gray-700" },
]

export function ConsultationForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedCategory, setSelectedCategory] = useState("")

  const [state, formAction, isPending] = useActionState(requestConsultationAction, null)

  if (state && "success" in state && state.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          سيراجع فريق المسؤولية المجتمعية طلبك ويعيّن لك عضو هيئة تدريس مناسب قريباً. سيصلك إشعار فور التعيين.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/consultations/${state.id}`)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            عرض الطلب
          </button>
          <button
            onClick={() => router.push("/consultations")}
            className="rounded-xl border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            الرجوع للاستشارات
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl" dir="rtl">
      {/* Progress steps */}
      <div className="mb-8 flex items-center gap-2">
        {[
          { n: 1, label: "نوع الاستشارة" },
          { n: 2, label: "تفاصيل الطلب" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.n ? <CheckCircle2 className="size-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium truncate ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < 1 && <div className={`h-px flex-1 transition-colors ${step > s.n ? "bg-green-400" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Category ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">نوع الاستشارة</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              سيراجع فريق المسؤولية المجتمعية طلبك ويعيّن عضو هيئة التدريس المناسب لك
            </p>
          </div>

          <div className="grid gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-4 rounded-xl border-2 p-4 text-start transition-all ${
                  selectedCategory === cat.value
                    ? `border-current ${cat.color} shadow-sm`
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  selectedCategory === cat.value ? "bg-current/10" : "bg-muted"
                }`}>
                  {selectedCategory === cat.value
                    ? <CheckCircle2 className="size-5" />
                    : <BookOpen className="size-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={!selectedCategory}
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي — تفاصيل الطلب
          </button>
        </div>
      )}

      {/* ── Step 2: Details form ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">تفاصيل الطلب</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              اشرح ما تحتاج المساعدة فيه — سيتم تعيين عضو هيئة التدريس المناسب من قبل فريق المسؤولية المجتمعية
            </p>
          </div>

          {/* Summary card */}
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              </p>
              <p className="text-xs text-muted-foreground">سيُعيَّن عضو هيئة التدريس بعد المراجعة</p>
            </div>
          </div>

          {state && "error" in state && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="category" value={selectedCategory} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                موضوع الاستشارة <span className="text-red-500">*</span>
              </label>
              <input
                name="titleAr"
                required
                maxLength={120}
                placeholder="مثال: مساعدة في مشروع التخرج — نظام إدارة المكتبات"
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                وصف تفصيلي <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descriptionAr"
                required
                rows={5}
                placeholder="اشرح ما تحتاج المساعدة فيه بالتفصيل: الموضوع، المشكلة، ما الذي جربته..."
                className="w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                الأوقات المفضلة <span className="text-muted-foreground text-xs">(اختياري)</span>
              </label>
              <input
                name="preferredNote"
                placeholder="مثال: السبت أو الاثنين بعد الساعة 10 صباحاً"
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ChevronRight className="size-4" />
                رجوع
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> جاري الإرسال...</>
                ) : (
                  <><MessageSquare className="size-4" /> إرسال طلب الاستشارة</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
