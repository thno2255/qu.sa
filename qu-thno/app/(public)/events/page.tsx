import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, PlusCircle } from "lucide-react"
import { getPublicEvents } from "@/core/public/actions"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { PublicFooter } from "@/shared/components/layout/public-footer"
import { PrototypeBanner } from "@/shared/components/layout/prototype-banner"
import { BRAND_PRIMARY_DARK, GRAD_HERO } from "@/shared/lib/brand"

export const metadata = { title: "الفعاليات" }

export default async function PublicEventsPage() {
  const session = await auth()
  const isAuth = !!session?.user
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const events = await getPublicEvents()

  const fmtDate = (d: Date) => new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d))
  const fmtTime = (d: Date) => new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" }).format(new Date(d))

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner isRTL={isRTL} />
      <PublicHeader isRTL={isRTL} isAuth={isAuth} userName={session?.user?.nameAr ?? session?.user?.name ?? undefined} />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 px-4 text-center text-white" style={{ background: GRAD_HERO }}>
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-3xl font-black sm:text-4xl">الفعاليات</h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto">
            تصفّح فعاليات الشراكة المجتمعية القادمة، أو تقدّم بطلب لإقامة فعالية جديدة
            بالتعاون مع جامعة القصيم.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold shadow transition-opacity hover:opacity-90"
            style={{ color: BRAND_PRIMARY_DARK }}
          >
            <PlusCircle className="size-4" />
            تقديم طلب فعالية
          </Link>
        </div>
      </section>

      {/* Events list */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <Calendar className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">لا توجد فعاليات معلنة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {events.map((ev) => {
              const d = new Date(ev.startDate)
              const spotsLeft = ev.capacity ? ev.capacity - ev.registrations : null
              return (
                <div key={ev.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-white text-center" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
                    <span className="text-xl font-black leading-none">{d.getDate()}</span>
                    <span className="text-[11px] leading-none mt-0.5 opacity-80">
                      {d.toLocaleDateString("ar-SA", { month: "short", year: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900">{ev.titleAr}</h3>
                    {ev.descriptionAr && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.descriptionAr}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="size-3.5" />{fmtDate(ev.startDate)} — {fmtTime(ev.startDate)}</span>
                      {ev.locationAr && (
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" />{ev.locationAr}</span>
                      )}
                      {spotsLeft !== null && (
                        <span className="flex items-center gap-1" style={{ color: spotsLeft > 0 ? BRAND_PRIMARY_DARK : "#b91c1c" }}>
                          <Users className="size-3.5" />
                          {spotsLeft > 0 ? `${spotsLeft} مقعد متاح` : "اكتملت المقاعد"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <PublicFooter isRTL={isRTL} />
    </div>
  )
}
