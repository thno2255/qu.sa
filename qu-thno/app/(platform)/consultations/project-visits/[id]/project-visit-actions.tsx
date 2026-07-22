"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  acceptProjectVisitAction, rejectProjectVisitAction,
  scheduleProjectVisitAction, completeProjectVisitAction,
  reassignProjectVisitAction,
} from "@/core/project-visits/actions"
import { CheckCircle2, XCircle, CalendarCheck, Loader2, Repeat } from "lucide-react"

interface FacultyOption {
  id: string
  nameAr: string | null
  name: string | null
  jobTitle: string | null
}

interface Props {
  visitId: string
  status: string
  isFacultyOwner: boolean
  isParticipant: boolean
  isStaff: boolean
  facultyOptions: FacultyOption[]
}

export function ProjectVisitActions({ visitId, status, isFacultyOwner, isParticipant, isStaff, facultyOptions }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [note, setNote] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [newFacultyId, setNewFacultyId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handle = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn()
      if ("error" in res) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</p>
      )}

      {/* Accept / Reject */}
      {status === "PENDING" && isFacultyOwner && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground">الرد على الطلب</h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">ملاحظة (اختياري)</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="أضف ملاحظة لمقدم الطلب عند القبول أو الرفض..."
              className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-3">
            <button disabled={isPending}
              onClick={() => handle(() => acceptProjectVisitAction(visitId, note || undefined))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              قبول الطلب
            </button>
            <button disabled={isPending}
              onClick={() => handle(() => rejectProjectVisitAction(visitId, note || undefined))}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
              الاعتذار عن القبول
            </button>
          </div>
        </div>
      )}

      {/* Schedule visit date */}
      {status === "ACCEPTED" && isFacultyOwner && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground">تحديد موعد الزيارة</h3>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button disabled={isPending || !scheduledAt}
            onClick={() => handle(() => scheduleProjectVisitAction(visitId, scheduledAt))}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
            تحديد الموعد
          </button>
        </div>
      )}

      {/* Complete */}
      {status === "SCHEDULED" && isParticipant && (
        <button disabled={isPending}
          onClick={() => handle(() => completeProjectVisitAction(visitId))}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          تأكيد اكتمال الزيارة
        </button>
      )}

      {/* Reassign — staff only, escalated requests */}
      {status === "ESCALATED" && isStaff && (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-5 space-y-4">
          <h3 className="font-semibold text-orange-900">إعادة توجيه الطلب</h3>
          <p className="text-sm text-orange-700">
            تجاوز هذا الطلب مهلة الرد المحددة. اختر عضواً آخر لإعادة توجيه الطلب إليه.
          </p>
          <select
            value={newFacultyId}
            onChange={e => setNewFacultyId(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">اختر عضواً...</option>
            {facultyOptions.map(f => (
              <option key={f.id} value={f.id}>
                {f.nameAr ?? f.name}{f.jobTitle ? ` — ${f.jobTitle}` : ""}
              </option>
            ))}
          </select>
          <button disabled={isPending || !newFacultyId}
            onClick={() => handle(() => reassignProjectVisitAction(visitId, newFacultyId))}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 transition-colors">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Repeat className="size-4" />}
            إعادة التوجيه
          </button>
        </div>
      )}
    </div>
  )
}
