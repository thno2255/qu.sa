"use client"

import { useState, useTransition } from "react"
import { Check, X, Clock, FlagTriangleRight } from "lucide-react"
import { updateDemoRequestStatusAction } from "@/core/demo/actions"

const STATUS_LABEL: Record<string, { ar: string; className: string }> = {
  pending: { ar: "قيد المراجعة", className: "bg-amber-50 text-amber-700" },
  approved: { ar: "مقبول", className: "bg-emerald-50 text-emerald-700" },
  rejected: { ar: "مرفوض", className: "bg-red-50 text-red-700" },
  completed: { ar: "مكتملة — بانتظار تقييم المستفيد", className: "bg-blue-50 text-blue-700" },
}

export function DemoRequestRow({
  id,
  serviceLabelAr,
  nationalId,
  status,
  payload,
  createdAt,
}: {
  id: string
  serviceLabelAr: string
  nationalId: string
  status: string
  payload: Record<string, unknown>
  createdAt: string
}) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  function setStatus(next: "approved" | "rejected" | "completed") {
    startTransition(async () => {
      await updateDemoRequestStatusAction(id, next)
      setCurrentStatus(next)
    })
  }

  const titleFromPayload =
    (payload.titleAr as string) ||
    (payload.partnerNameAr as string) ||
    (payload.entityName as string) ||
    serviceLabelAr

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{serviceLabelAr}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABEL[currentStatus]?.className ?? ""}`}>
              {STATUS_LABEL[currentStatus]?.ar ?? currentStatus}
            </span>
          </div>
          <h3 className="mt-1.5 font-bold text-gray-900">{titleFromPayload}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            رقم الهوية: <span dir="ltr" className="font-medium">{nationalId}</span>
            {" · "}
            <Clock className="inline size-3 -mt-0.5" /> {new Date(createdAt).toLocaleString("ar-SA")}
          </p>
        </div>

        {currentStatus === "pending" && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setStatus("approved")}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Check className="size-3.5" /> قبول
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setStatus("rejected")}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              <X className="size-3.5" /> رفض
            </button>
          </div>
        )}

        {currentStatus === "approved" && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setStatus("completed")}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FlagTriangleRight className="size-3.5" /> إنهاء الخدمة
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        {expanded ? "إخفاء التفاصيل ▲" : "عرض كل التفاصيل ▼"}
      </button>

      {expanded && (
        <div className="mt-2 grid gap-1.5 rounded-xl bg-gray-50 p-3 text-xs sm:grid-cols-2">
          {Object.entries(payload).map(([key, value]) => (
            <div key={key} className="flex gap-1">
              <span className="font-medium text-gray-500">{key}:</span>
              <span className="text-gray-700 break-words">{Array.isArray(value) ? value.join("، ") : String(value ?? "—")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
