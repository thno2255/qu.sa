import { ShieldCheck } from "lucide-react"
import { demoAdminLoginAction } from "@/core/demo/actions"
import { BRAND_PRIMARY_DARK, GRAD_HERO } from "@/shared/lib/brand"

export default async function DemoAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center px-4" style={{ background: GRAD_HERO }}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#eaf5ee" }}>
            <ShieldCheck className="size-7" style={{ color: BRAND_PRIMARY_DARK }} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-gray-900">لوحة مسؤول العرض التجريبي</h1>
          <p className="mt-1 text-sm text-gray-500">دخول منفصل تمامًا عن حسابات المنصة الحقيقية</p>
        </div>

        <form action={demoAdminLoginAction} className="space-y-4">
          <div>
            <label htmlFor="passcode" className="mb-1 block text-sm font-medium text-gray-800">
              كلمة المرور
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              required
              dir="ltr"
              className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">كلمة المرور غير صحيحة</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_PRIMARY_DARK }}
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  )
}
