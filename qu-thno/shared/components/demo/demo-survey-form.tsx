"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import { submitDemoSurveyAction } from "@/core/demo/actions"
import { SURVEY_LIKERT, SURVEY_QUESTIONS } from "@/core/demo/survey-fields"
import { BRAND_PRIMARY_DARK } from "@/shared/lib/brand"

export function DemoSurveyForm({ requestId }: { requestId: string }) {
  const [ratings, setRatings] = useState<Record<string, string>>({})
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await submitDemoSurveyAction(requestId, { ...ratings, comment })
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <h2 className="mt-4 text-lg font-bold text-gray-900">شكرًا لتقييمك</h2>
        <p className="mt-2 text-sm text-gray-500">ساعدنا تقييمك في تحسين الخدمة المقدَّمة.</p>
        <Link href="/demo/my-requests" className="mt-6 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
          العودة إلى طلباتي
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      {SURVEY_QUESTIONS.map((q) => (
        <div key={q.name}>
          <p className="mb-2.5 text-sm font-semibold text-gray-800">{q.label}</p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_LIKERT.map((opt) => {
              const active = ratings[q.name] === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRatings((prev) => ({ ...prev, [q.name]: opt.value }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={active ? { backgroundColor: BRAND_PRIMARY_DARK } : undefined}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-800">اقتراحك لتحسين الخدمة (اختياري)</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="ease-apple flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        style={{ backgroundColor: BRAND_PRIMARY_DARK }}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        إرسال التقييم
      </button>
    </form>
  )
}
