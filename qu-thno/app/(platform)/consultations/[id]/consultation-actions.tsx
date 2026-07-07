"use client"

import { useState, useTransition, useActionState } from "react"
import { acceptConsultationAction, rejectConsultationAction, completeConsultationAction, submitConsultationRatingAction } from "@/core/consultations/actions"
import { CheckCircle2, XCircle, CalendarCheck, Loader2, ExternalLink, Star } from "lucide-react"

type RatingResult = { success: true; id?: string } | { error: string }

interface Props {
  consultationId: string
  status: string
  bookingUrl:      string | null
  isFacultyOwner:  boolean
  isParticipant:   boolean
  existingRating?: { stars: number; commentAr?: string | null } | null
  raterType:       "requester" | "faculty" | null
}

// ── مكون التقييم بالنجوم ─────────────────────────────────────────────────

function StarRating({ name, initial = 0 }: { name: string; initial?: number }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(initial)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setSelected(n)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} نجوم`}
        >
          <Star
            className={`size-8 ${(hovered || selected) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            strokeWidth={1.5}
          />
        </button>
      ))}
      <input type="hidden" name={name} value={selected} />
    </div>
  )
}

// ── نموذج التقييم ────────────────────────────────────────────────────────

function RatingForm({
  consultationId,
  raterType,
  existing,
}: {
  consultationId: string
  raterType: "requester" | "faculty"
  existing?: { stars: number; commentAr?: string | null } | null
}) {
  const [done, setDone] = useState(false)
  const [state, formAction, isPending] = useActionState<RatingResult | null, FormData>(
    async (prev, fd) => {
      const res = await submitConsultationRatingAction(prev, fd)
      if ("success" in res) setDone(true)
      return res
    },
    null
  )

  if (done || (existing && !done)) {
    const stars = existing?.stars ?? 5
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Star className="size-4 text-amber-400 fill-amber-400" />
          {existing ? "تقييمك" : "شكراً على تقييمك!"}
        </h3>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(n => (
            <Star key={n}
              className={`size-6 ${stars >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
              strokeWidth={1.5} />
          ))}
          <span className="text-sm text-muted-foreground ms-2 mt-0.5">{stars}/5</span>
        </div>
        {existing?.commentAr && (
          <p className="text-sm text-muted-foreground leading-relaxed">{existing.commentAr}</p>
        )}
      </div>
    )
  }

  const label = raterType === "requester"
    ? "قيّم تجربتك مع عضو هيئة التدريس"
    : "قيّم التزام المستفيد"

  return (
    <form action={formAction} className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Star className="size-4 text-amber-400" />
        {label}
      </h3>

      <input type="hidden" name="consultationId" value={consultationId} />

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{state.error}</p>
      )}

      <StarRating name="stars" />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">تعليق (اختياري)</label>
        <textarea name="commentAr" rows={3} dir="rtl"
          placeholder="شارك تجربتك بكلمات..."
          className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <button type="submit" disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Star className="size-4" />}
        إرسال التقييم
      </button>
    </form>
  )
}

// ── المكون الرئيسي ────────────────────────────────────────────────────────

export function ConsultationActions({
  consultationId, status, bookingUrl,
  isFacultyOwner, isParticipant, existingRating, raterType,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [note, setNote]              = useState("")
  const [error, setError]            = useState<string | null>(null)

  const handle = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn()
      if ("error" in res) setError(res.error)
    })
  }

  return (
    <div className="space-y-4">
      {/* حجز الموعد */}
      {status === "ACCEPTED" && bookingUrl && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="size-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">احجز موعدك الآن</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            وافق الدكتور على طلبك. انقر الزر أدناه لفتح Microsoft Bookings وتحديد الوقت المناسب.
          </p>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <CalendarCheck className="size-4" />
            فتح Microsoft Bookings
            <ExternalLink className="size-3.5 opacity-70" />
          </a>
        </div>
      )}

      {/* قبول / رفض */}
      {status === "PENDING" && isFacultyOwner && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground">الرد على الطلب</h3>
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">ملاحظة (اختياري)</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="أضف ملاحظة للطالب عند القبول أو الرفض..."
              className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-3">
            <button disabled={isPending}
              onClick={() => handle(() => acceptConsultationAction(consultationId, note || undefined))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              قبول وإرسال رابط الحجز
            </button>
            <button disabled={isPending}
              onClick={() => handle(() => rejectConsultationAction(consultationId, note || undefined))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              الاعتذار عن القبول
            </button>
          </div>
        </div>
      )}

      {/* تأكيد الاكتمال */}
      {status === "SCHEDULED" && isParticipant && (
        <button disabled={isPending}
          onClick={() => handle(() => completeConsultationAction(consultationId))}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          تأكيد اكتمال الاستشارة
        </button>
      )}

      {/* التقييم بعد الاكتمال */}
      {status === "COMPLETED" && isParticipant && raterType && (
        <RatingForm
          consultationId={consultationId}
          raterType={raterType}
          existing={existingRating}
        />
      )}
    </div>
  )
}
