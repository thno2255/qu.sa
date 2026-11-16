"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react"
import { getDemoService } from "@/core/demo/services"
import { DEMO_USER_COOKIE } from "@/core/demo/constants"
import { BRAND_PRIMARY_DARK, GRAD_HERO } from "@/shared/lib/brand"

function NafathMockContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceSlug = searchParams.get("service") ?? ""
  const service = getDemoService(serviceSlug)

  const [nationalId, setNationalId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = /^\d{10}$/.test(nationalId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) {
      setError("رقم الهوية/الإقامة يجب أن يتكوّن من 10 أرقام")
      return
    }
    setError(null)
    setLoading(true)
    // Simulated verification delay — no real identity check happens here.
    setTimeout(() => {
      // Remembers the typed ID for the header's avatar menu across demo
      // pages — not a real session, just enough to simulate "being signed
      // in" for the rest of the walkthrough.
      document.cookie = `${DEMO_USER_COOKIE}=${encodeURIComponent(nationalId)}; path=/demo; max-age=${60 * 60 * 24}; samesite=lax`
      // No specific service was requested (a generic "تسجيل الدخول" link,
      // not one tied to a particular form) — land back on the demo home
      // rather than guessing which form the visitor wanted.
      const destination = service
        ? `/demo/apply/${service.slug}?nationalId=${encodeURIComponent(nationalId)}`
        : "/demo"
      router.push(destination)
    }, 900)
  }

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: GRAD_HERO }}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl bg-white p-7 shadow-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#eaf5ee" }}>
              <ShieldCheck className="size-7" style={{ color: BRAND_PRIMARY_DARK }} />
            </div>
            <h1 className="mt-4 text-lg font-bold text-gray-900">محاكاة تسجيل الدخول الموحّد</h1>
            <p className="mt-1 text-sm text-gray-500">
              {service ? (
                <>لبدء طلب: <span className="font-semibold text-gray-700">{service.titleAr}</span></>
              ) : (
                "لتصفّح المنصة والاستفادة من خدماتها"
              )}
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            هذه شاشة محاكاة توضيحية فقط — لا تتصل بمنصة نفاذ الحكومية الفعلية ولا تتحقق من هويتك حقيقةً.
            أدخل أي رقم من 10 أرقام للمتابعة.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nationalId" className="mb-1 block text-sm font-medium text-gray-800">
                رقم الهوية الوطنية / الإقامة
              </label>
              <input
                id="nationalId"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={10}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                placeholder="1xxxxxxxxx"
                className="w-full rounded-xl border bg-white px-3 py-2.5 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ease-apple flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <Link href="/demo" className="mt-5 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            <ArrowRight className="size-3.5" />
            العودة لاختيار خدمة أخرى
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function NafathMockPage() {
  return (
    <Suspense fallback={null}>
      <NafathMockContent />
    </Suspense>
  )
}
