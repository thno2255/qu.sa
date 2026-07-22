import Link from "next/link"
import { ArrowLeft, Building2, Heart, Users, Building, Handshake, PlusCircle } from "lucide-react"
import { getAllActivePartners } from "@/core/public/actions"

const GREEN_DARK = "#1a3d26"
const GREEN_MID = "#245c3a"

export const metadata = { title: "الشركاء" }

function PartnerIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === "healthcare") return <Heart className="size-5 text-rose-500" />
  if (t === "ngo") return <Users className="size-5 text-blue-500" />
  if (t === "government") return <Building2 className="size-5" style={{ color: GREEN_DARK }} />
  return <Building className="size-5 text-gray-500" />
}

export default async function PublicPartnersPage() {
  const partners = await getAllActivePartners()

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
            href="/partners/apply"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
            style={{ backgroundColor: GREEN_DARK }}
          >
            <PlusCircle className="size-4" />
            تقديم طلب شراكة
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 px-4 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_MID} 100%)` }}
      >
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur-sm">
            <Handshake className="size-3.5" />
            شركاء النجاح
          </span>
          <h1 className="text-3xl font-black sm:text-4xl">الشركاء</h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto">
            نفخر بشراكاتنا مع الجهات الحكومية والخاصة وغير الربحية. إن كانت جهتكم مهتمة
            ببناء شراكة مع جامعة القصيم، يمكنكم تقديم طلب مباشرة دون الحاجة لتسجيل الدخول.
          </p>
        </div>
      </section>

      {/* Partners grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        {partners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 py-16 text-center">
            <Handshake className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">لا يوجد شركاء معلنون حالياً</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {partners.map((p) => (
              <div key={p.id} className="group flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-[#1a3d26]/30 transition-all">
                <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#f0f7f2" }}>
                  <PartnerIcon type={p.type} />
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{p.nameAr}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
