"use client"

import { useActionState } from "react"
import { CheckCircle2 } from "lucide-react"
import { requestPublicEventAction } from "@/core/cms/actions"
import type { StatusResult } from "@/core/cms/actions"

const inputClass = "w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
const labelClass = "block text-sm font-medium text-gray-800 mb-1"

export function EventRequestForm() {
  const [result, formAction, pending] = useActionState<StatusResult | null, FormData>(
    requestPublicEventAction,
    null,
  )

  if (result?.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-4 text-lg font-bold text-emerald-900">تم استلام طلبكم بنجاح</h2>
        <p className="mt-2 text-sm text-emerald-700">
          سيراجع فريق المسؤولية المجتمعية طلبكم وسيتم التواصل معكم على البريد الإلكتروني المُرسل قريباً.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      {result && !result.success && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">بيانات الجهة الخارجية</legend>
        <div>
          <label htmlFor="orgName" className={labelClass}>اسم الجهة <span className="text-red-600">*</span></label>
          <input id="orgName" name="orgName" type="text" required className={inputClass} dir="rtl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="contactName" className={labelClass}>اسم المسؤول</label>
            <input id="contactName" name="contactName" type="text" className={inputClass} dir="rtl" />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>البريد الإلكتروني <span className="text-red-600">*</span></label>
            <input id="contactEmail" name="contactEmail" type="email" required className={inputClass} dir="ltr" />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>رقم الجوال</label>
            <input id="contactPhone" name="contactPhone" type="tel" className={inputClass} dir="ltr" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">تفاصيل الفعالية المقترحة</legend>
        <div>
          <label htmlFor="titleAr" className={labelClass}>عنوان الفعالية <span className="text-red-600">*</span></label>
          <input id="titleAr" name="titleAr" type="text" required className={inputClass} dir="rtl" />
        </div>
        <div>
          <label htmlFor="descriptionAr" className={labelClass}>وصف الفعالية</label>
          <textarea id="descriptionAr" name="descriptionAr" rows={4} className={inputClass} dir="rtl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className={labelClass}>التاريخ المقترح <span className="text-red-600">*</span></label>
            <input id="startDate" name="startDate" type="date" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="capacity" className={labelClass}>عدد المقاعد المتوقع</label>
            <input id="capacity" name="capacity" type="number" min={1} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="locationAr" className={labelClass}>الموقع المقترح</label>
          <input id="locationAr" name="locationAr" type="text" className={inputClass} dir="rtl" />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#1a3d26" }}
      >
        {pending ? "جارٍ الإرسال..." : "إرسال طلب الفعالية"}
      </button>
    </form>
  )
}
