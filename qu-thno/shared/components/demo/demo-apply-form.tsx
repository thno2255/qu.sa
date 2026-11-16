"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import { submitDemoRequestAction } from "@/core/demo/actions"
import { DEMO_FORM_FIELDS, type DemoField } from "@/core/demo/form-fields"
import { BRAND_PRIMARY_DARK } from "@/shared/lib/brand"

const inputClass =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
const labelClass = "block text-sm font-medium text-gray-800 mb-1"

export function DemoApplyForm({
  serviceSlug,
  serviceLabelAr,
  nationalId,
}: {
  serviceSlug: string
  serviceLabelAr: string
  nationalId: string
}) {
  const fields = DEMO_FORM_FIELDS[serviceSlug] ?? []
  const [values, setValues] = useState<Record<string, string>>({})
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function setValue(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  function toggleMulti(name: string, v: string) {
    setMultiValues((prev) => {
      const current = prev[name] ?? []
      const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
      return { ...prev, [name]: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const payload: Record<string, unknown> = { ...values, ...multiValues }
    await submitDemoRequestAction({ nationalId, serviceSlug, serviceLabelAr, payload })
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <h2 className="mt-4 text-lg font-bold text-gray-900">تم استلام طلبك بنجاح</h2>
        <p className="mt-2 text-sm text-gray-500">
          هذا طلب تجريبي ضمن العرض التوضيحي — سيظهر في لوحة المسؤول للمراجعة.
        </p>
        <Link href="/demo" className="mt-6 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
          العودة للصفحة الرئيسية
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
        مسجّل الدخول برقم الهوية: <span dir="ltr" className="font-semibold text-gray-700">{nationalId}</span>
      </div>

      {fields.map((field) => (
        <DemoFieldInput
          key={field.name}
          field={field}
          value={values[field.name] ?? ""}
          multiValue={multiValues[field.name] ?? []}
          onChange={(v) => setValue(field.name, v)}
          onToggleMulti={(v) => toggleMulti(field.name, v)}
        />
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="ease-apple flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        style={{ backgroundColor: BRAND_PRIMARY_DARK }}
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        إرسال الطلب
      </button>
    </form>
  )
}

function DemoFieldInput({
  field,
  value,
  multiValue,
  onChange,
  onToggleMulti,
}: {
  field: DemoField
  value: string
  multiValue: string[]
  onChange: (v: string) => void
  onToggleMulti: (v: string) => void
}) {
  if (field.type === "textarea") {
    return (
      <div>
        <label className={labelClass}>{field.label}{field.required && " *"}</label>
        <textarea
          rows={4}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div>
        <label className={labelClass}>{field.label}{field.required && " *"}</label>
        <select required={field.required} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">اختر...</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === "multiselect") {
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const active = multiValue.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggleMulti(o.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "border-transparent text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={active ? { backgroundColor: BRAND_PRIMARY_DARK } : undefined}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className={labelClass}>{field.label}{field.required && " *"}</label>
      <input
        type={field.type}
        required={field.required}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={field.type === "url" || field.type === "email" || field.type === "tel" ? "ltr" : undefined}
        className={inputClass}
      />
    </div>
  )
}
