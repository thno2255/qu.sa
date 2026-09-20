import Link from "next/link"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { Rocket, FolderKanban, Handshake, CheckCircle2, ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { PublicFooter } from "@/shared/components/layout/public-footer"
import { PrototypeBanner } from "@/shared/components/layout/prototype-banner"
import { getPublicStats } from "@/core/public/actions"
import { BRAND_PRIMARY_DARK, BRAND_PRIMARY, GRAD_HERO, GRAD_CTA } from "@/shared/lib/brand"

export const metadata = { title: "البرامج" }

const PROGRAMS = [
  {
    icon: Rocket,
    title: "المبادرات المجتمعية",
    subtitle: "Community Initiatives",
    gradient: "from-blue-600 to-cyan-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    description:
      "مبادرات مجتمعية مدروسة تنطلق من داخل الجامعة لخدمة المجتمع المحلي وتعزيز قيم المسؤولية الاجتماعية. تمر بدورة اعتماد متكاملة.",
    features: [
      "تقديم مقترحات المبادرات بسهولة",
      "متابعة مراحل الاعتماد أولاً بأول",
      "ربط المبادرات بأهداف التنمية المستدامة",
      "قياس الأثر والمستفيدين",
    ],
  },
  {
    icon: FolderKanban,
    title: "المشاريع المجتمعية",
    subtitle: "Community Projects",
    gradient: "from-cyan-600 to-teal-600",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-700",
    description:
      "مشاريع هيكلية متكاملة تمتد لفترات أطول وتضم فرقاً متعددة التخصصات مع إدارة المراحل والمهام.",
    features: [
      "إدارة المراحل والمهام",
      "متابعة تقدّم الأعمال أولاً بأول",
      "إدارة فريق العمل",
      "تقارير تقدم الأعمال",
    ],
  },
  {
    icon: Handshake,
    title: "شركاء النجاح",
    subtitle: "Success Partners",
    gradient: "from-teal-600 to-blue-700",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    description:
      "بناء جسور التعاون مع المؤسسات الحكومية والقطاع الخاص والمنظمات غير الربحية مع توثيق الاتفاقيات ومتابعة التنفيذ.",
    features: [
      "دليل شامل بالجهات الشريكة",
      "إدارة اتفاقيات الشراكة",
      "متابعة بنود التعاون",
      "تقييم نتائج الشراكة",
    ],
  },
]

export default async function ProgramsPage() {
  const session = await auth()
  const isAuth = !!session?.user
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const stats = await getPublicStats()
  const nf = (n: number) => n.toLocaleString(isRTL ? "ar-SA" : "en-US")

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner isRTL={isRTL} />
      <PublicHeader isRTL={isRTL} isAuth={isAuth} />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-14 px-4 text-center text-white"
        style={{ background: GRAD_HERO }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
            <Rocket className="size-3.5" />
            برامج المسؤولية المجتمعية — جامعة القصيم
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl leading-tight">
            استكشف برامجنا المجتمعية
          </h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto">
            منصة تجمع بين المبادرات والمشاريع والشراكات في مكان واحد لبناء أثر مجتمعي حقيقي ومستدام.
          </p>

          {/* Real stat pills — live counts, no fabricated growth figures */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { label: "مبادرة", value: nf(stats.initiatives) },
              { label: "مشروع مجتمعي", value: nf(stats.projects) },
              { label: "شريك مجتمعي", value: nf(stats.partners) },
              { label: "هدف تنموي مستدام", value: "17" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm text-center">
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/65">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs Grid ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">ثلاثة برامج لخدمة مجتمعك</h2>
          <p className="mt-2 text-sm text-gray-500">كلٌّ منها مصمَّم لتحقيق أثر حقيقي ومستدام</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((prog, i) => (
            <div
              key={prog.title}
              className="group relative flex flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`h-1 w-full bg-gradient-to-l ${prog.gradient}`} />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${prog.iconBg}`}>
                    <prog.icon className={`size-6 ${prog.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900">{prog.title}</h3>
                    <p className="text-xs text-gray-400">{prog.subtitle}</p>
                  </div>
                  <span className="me-auto ms-2 shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 font-medium">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{prog.description}</p>

                <ul className="mb-6 space-y-2">
                  {prog.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${prog.iconColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className="mt-auto flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: BRAND_PRIMARY }}
                >
                  انضم الآن وشارك
                  <ArrowLeft className="size-4 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative overflow-hidden px-4 py-16">
        <div className="absolute inset-0" style={{ background: GRAD_CTA }} />
        <div className="relative z-10 mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl font-bold">هل أنت جهة خارجية؟</h2>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">
            يمكن للمؤسسات والشركات والجمعيات التسجيل كجهة شريكة للاستفادة
            من برامج الشراكات وبناء تعاون مثمر مع جامعة القصيم.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-7 py-3 text-sm font-semibold shadow transition-all hover:shadow-lg hover:bg-gray-50"
              style={{ color: BRAND_PRIMARY_DARK }}
            >
              إنشاء حساب
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border-2 border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter isRTL={isRTL} />
    </div>
  )
}
