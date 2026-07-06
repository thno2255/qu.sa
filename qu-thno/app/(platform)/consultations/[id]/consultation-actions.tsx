"use client"

import { useState, useTransition } from "react"
import { acceptConsultationAction, rejectConsultationAction, completeConsultationAction } from "@/core/consultations/actions"
import { CheckCircle2, XCircle, CalendarCheck, Loader2, ExternalLink } from "lucide-react"

interface Props {
  consultationId: string
  status: string
  bookingUrl: string | null
  isFacultyOwner: boolean
  isParticipant: boolean
}

export function ConsultationActions({ consultationId, status, bookingUrl, isFacultyOwner, isParticipant }: Props) {
  const [isPending, startTransition] = useTransition()
  const [note, setNote] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn()
      if ("error" in res) setError(res.error)
    })
  }

  if (status === "ACCEPTED" && bookingUrl) {
    return (
      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="size-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">احجز موعدك الآن</h3>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          وافق الدكتور على طلبك. انقر الزر أدناه لفتح Microsoft Bookings وتحديد الوقت المناسب.
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <CalendarCheck className="size-4" />
          فتح Microsoft Bookings
          <ExternalLink className="size-3.5 opacity-70" />
        </a>
      </div>
    )
  }

  if (status === "PENDING" && isFacultyOwner) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-foreground">الرد على الطلب</h3>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            ملاحظة (اختياري)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="أضف ملاحظة للطالب عند القبول أو الرفض..."
            className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3">
          <button
            disabled={isPending}
            onClick={() => handle(() => acceptConsultationAction(consultationId, note || undefined))}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            قبول وإرسال رابط الحجز
          </button>
          <button
            disabled={isPending}
            onClick={() => handle(() => rejectConsultationAction(consultationId, note || undefined))}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            الاعتذار عن القبول
          </button>
        </div>
      </div>
    )
  }

  if (status === "SCHEDULED" && isParticipant) {
    return (
      <button
        disabled={isPending}
        onClick={() => handle(() => completeConsultationAction(consultationId))}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        تأكيد اكتمال الاستشارة
      </button>
    )
  }

  return null
}
