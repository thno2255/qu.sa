import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Users, PlusCircle } from "lucide-react"
import { getPublicEvents } from "@/core/public/actions"

const GREEN_DARK = "#1a3d26"
const GREEN_MID = "#245c3a"

export const metadata = { title: "الفعاليات" }

export default async function PublicEventsPage() {
  const events = await getPublicEvents()

  return (
    <div dir="rtl" className="min-h-screen text-gray-900" style={{ background: "#f0fdf4" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="size-4 rotate-180" />
            العودة للرئيسية
          </Link>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN_DARK }}
          >
            <PlusCircle className="size-4" />
            تقديم طلب فعالية
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 px-4 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_MID} 100%)` }}
      >
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-3xl font-black sm:text-4xl">الفعاليات</h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto">
            تصفّح فعاليات المسؤولية المجتمعية القادمة، أو تقدّم بطلب لإقامة فعالية جديدة
            بالتعاون مع جامعة القصيم — الجهات الخارجية مرحّب بها دون الحاجة لتسجيل الدخول.
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 py-16 text-center">
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
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-white text-center" style={{ backgroundColor: GREEN_DARK }}>
                    <span className="text-xl font-black leading-none">{d.getDate()}</span>
                    <span className="text-[11px] leading-none mt-0.5 opacity-80">
                      {d.toLocaleDateString("ar-SA", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900">{ev.titleAr}</h3>
                    {ev.descriptionAr && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.descriptionAr}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {ev.locationAr && (
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" />{ev.locationAr}</span>
                      )}
                      {spotsLeft !== null && (
                        <span className="flex items-center gap-1" style={{ color: spotsLeft > 0 ? GREEN_DARK : "#b91c1c" }}>
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
    </div>
  )
}
