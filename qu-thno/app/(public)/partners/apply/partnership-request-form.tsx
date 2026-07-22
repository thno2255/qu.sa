"use client"

import { useActionState } from "react"
import { CheckCircle2 } from "lucide-react"
import { requestPublicPartnershipAction } from "@/core/partnerships/actions"
import type { PartnershipResult } from "@/core/partnerships/actions"

const inputClass = "w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
const labelClass = "block text-sm font-medium text-gray-800 mb-1"

export function PartnershipRequestForm() {
  const [result, formAction, pending] = useActionState<PartnershipResult | null, FormData>(
    requestPublicPartnershipAction,
    null,
  )

  if (result && "success" in result && result.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-4 text-lg font-bold text-emerald-900">تم استلام طلب الشراكة بنجاح</h2>
        <p className="mt-2 text-sm text-emerald-700">
          سيراجع فريق المسؤولية المجتمعية طلبكم وسيتم التواصل معكم على البريد الإلكتروني المُرسل قريباً.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      {result && "error" in result && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">بيانات الجهة</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="partnerNameAr" className={labelClass}>اسم الجهة بالعربية <span className="text-red-600">*</span></label>
            <input id="partnerNameAr" name="partnerNameAr" type="text" required className={inputClass} dir="rtl" />
          </div>
          <div>
            <label htmlFor="partnerNameEn" className={labelClass}>اسم الجهة بالإنجليزية</label>
            <input id="partnerNameEn" name="partnerNameEn" type="text" className={inputClass} dir="ltr" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="partnerType" className={labelClass}>نوع الجهة</label>
            <select id="partnerType" name="partnerType" className={inputClass}>
              <option value="government">حكومية</option>
              <option value="private">خاصة</option>
              <option value="ngo">غير ربحية</option>
              <option value="academic">أكاديمية</option>
              <option value="international">دولية</option>
            </select>
          </div>
          <div>
            <label htmlFor="partnerSector" className={labelClass}>القطاع</label>
            <input id="partnerSector" name="partnerSector" type="text" className={inputClass} placeholder="مثال: التعليم، الصحة..." />
          </div>
        </div>
        <div>
          <label htmlFor="partnerWebsite" className={labelClass}>الموقع الإلكتروني</label>
          <input id="partnerWebsite" name="partnerWebsite" type="url" className={inputClass} dir="ltr" placeholder="https://" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">بيانات المسؤول عن التواصل</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="contactName" className={labelClass}>الاسم</label>
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
        <legend className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">تفاصيل الشراكة المقترحة</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="titleAr" className={labelClass}>عنوان الشراكة <span className="text-red-600">*</span></label>
            <input id="titleAr" name="titleAr" type="text" required className={inputClass} dir="rtl" />
          </div>
          <div>
            <label htmlFor="type" className={labelClass}>نوع الشراكة</label>
            <select id="type" name="type" className={inputClass}>
              <option value="مذكرة تفاهم">مذكرة تفاهم</option>
              <option value="اتفاقية تعاون">اتفاقية تعاون</option>
              <option value="رعاية">رعاية</option>
              <option value="عقد">عقد</option>
            </select>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#1a3d26" }}
      >
        {pending ? "جارٍ الإرسال..." : "إرسال طلب الشراكة"}
      </button>
    </form>
  )
}
