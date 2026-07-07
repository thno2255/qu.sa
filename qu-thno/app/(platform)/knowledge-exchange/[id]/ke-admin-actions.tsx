"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateKEStatusAction } from "@/core/knowledge-exchange/actions"
import { KE_STATUS_LABEL } from "@/core/knowledge-exchange/constants"

const STATUSES = ["PENDING","REVIEWING","ACCEPTED","SCHEDULED","COMPLETED","CANCELLED"]

export function KEAdminActions({ request }: { request: { id: string; status: string; adminNotes?: string | null } }) {
  const router  = useRouter()
  const [status, setStatus]   = useState(request.status)
  const [notes,  setNotes]    = useState(request.adminNotes ?? "")
  const [saving, setSaving]   = useState(false)
  const [msg,    setMsg]      = useState("")

  async function save() {
    setSaving(true)
    const res = await updateKEStatusAction(request.id, status, { adminNotes: notes || undefined })
    setSaving(false)
    if ("error" in res) setMsg(res.error)
    else { setMsg("تم الحفظ بنجاح"); router.refresh() }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <h2 className="font-semibold text-foreground">إجراءات الإدارة</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">تحديث الحالة</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            {STATUSES.map(s => (
              <option key={s} value={s}>{KE_STATUS_LABEL[s] ?? s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">ملاحظات الإدارة</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} dir="rtl"
          placeholder="أي ملاحظات إضافية..."
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>

      {msg && (
        <p className={`text-sm ${msg.includes("نجاح") ? "text-emerald-600" : "text-red-600"}`}>{msg}</p>
      )}

      <button onClick={save} disabled={saving}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  )
}
