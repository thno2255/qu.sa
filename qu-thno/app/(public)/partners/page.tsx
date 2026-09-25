import Link from "next/link"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { Building2, Heart, Users, Building, Handshake, PlusCircle } from "lucide-react"
import { getAllActivePartners } from "@/core/public/actions"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { PublicFooter } from "@/shared/components/layout/public-footer"
import { PrototypeBanner } from "@/shared/components/layout/prototype-banner"
import { BRAND_PRIMARY_DARK, GRAD_HERO } from "@/shared/lib/brand"

export const metadata = { title: "الشركاء" }

function PartnerIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === "healthcare") return <Heart className="size-5 text-rose-500" />
  if (t === "ngo") return <Users className="size-5 text-blue-500" />
  if (t === "government") return <Building2 className="size-5" style={{ color: BRAND_PRIMARY_DARK }} />
  return <Building className="size-5 text-gray-500" />
}

export default async function PublicPartnersPage() {
  const session = await auth()
  const isAuth = !!session?.user
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const partners = await getAllActivePartners()

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner isRTL={isRTL} />
      <PublicHeader isRTL={isRTL} isAuth={isAuth} userName={session?.user?.nameAr ?? session?.user?.name ?? undefined} />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 px-4 text-center text-white" style={{ background: GRAD_HERO }}>
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
            <Handshake className="size-3.5" />
            شركاء النجاح
          </span>
          <h1 className="text-3xl font-black sm:text-4xl">الشركاء</h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto">
            نفخر بشراكاتنا مع الجهات الحكومية والخاصة وغير الربحية. إن كانت جهتكم مهتمة
            ببناء شراكة مع جامعة القصيم، سجّلوا دخولكم كجهة خارجية لتقديم طلب شراكة.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold shadow transition-opacity hover:opacity-90"
            style={{ color: BRAND_PRIMARY_DARK }}
          >
            <PlusCircle className="size-4" />
            تقديم طلب شراكة
          </Link>
        </div>
      </section>

      {/* Partners grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        {partners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <Handshake className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">لا يوجد شركاء معلنون حالياً</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {partners.map((p) => (
              <div key={p.id} className="group flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#eaf3fa" }}>
                  <PartnerIcon type={p.type} />
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{p.nameAr}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <PublicFooter isRTL={isRTL} />
    </div>
  )
}
