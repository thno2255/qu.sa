import Link from "next/link"
import { Rocket, FolderKanban, Handshake, ArrowLeft, CheckCircle2 } from "lucide-react"

const GREEN_DARK  = "#1a3d26"
const GREEN_MID   = "#245c3a"
const GREEN_LIGHT = "#2d7a4f"

const PROGRAMS = [
  {
    icon: Rocket,
    title: "المبادرات المجتمعية",
    subtitle: "Community Initiatives",
    gradient: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
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
    gradient: "from-blue-500 to-indigo-600",
    soft: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    description:
      "مشاريع هيكلية متكاملة تمتد لفترات أطول وتضم فرقاً متعددة التخصصات مع إدارة الميزانيات والمراحل والمهام.",
    features: [
      "إدارة المراحل والمهام",
      "تتبع الميزانية والإنفاق",
      "إدارة فريق العمل",
      "تقارير تقدم الأعمال",
    ],
  },
  {
    icon: Handshake,
    title: "الشراكات المجتمعية",
    subtitle: "Community Partnerships",
    gradient: "from-violet-500 to-purple-600",
    soft: "bg-violet-50",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
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

export default function ProgramsPage() {
  return (
    <div dir="rtl" className="min-h-screen text-gray-900" style={{ background: "#f0fdf4" }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="size-4 rotate-180" />
            العودة للرئيسية
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
              style={{ backgroundColor: GREEN_DARK }}
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 px-4 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_MID} 60%, ${GREEN_LIGHT} 100%)` }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -start-24 size-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-16 -end-16 size-72 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />

        {/* Dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur-sm">
            <Rocket className="size-3.5" />
            برامج المسؤولية المجتمعية — جامعة القصيم
          </span>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl leading-tight drop-shadow-sm">
            استكشف برامجنا
            <span className="block text-emerald-300">المجتمعية</span>
          </h1>
          <p className="mt-5 text-base text-white/75 leading-relaxed max-w-lg mx-auto">
            منصة تجمع بين المبادرات والمشاريع والشراكات في مكان واحد
            لبناء أثر مجتمعي حقيقي ومستدام.
          </p>

          {/* Stat pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              { label: "مبادرة نشطة", value: "٤٠+" },
              { label: "مشروع مجتمعي", value: "٢٠+" },
              { label: "شريك مجتمعي", value: "٣٠+" },
              { label: "هدف تنموي مستدام", value: "١٧" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm text-center"
              >
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/65">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 start-0 w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f0fdf4" />
        </svg>
      </section>

      {/* ── Programs Grid ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">ثلاثة برامج لخدمة مجتمعك</h2>
          <p className="mt-2 text-sm text-gray-500">كلٌّ منها مصمَّم لتحقيق أثر حقيقي ومستدام</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {PROGRAMS.map((prog, i) => (
            <div
              key={prog.title}
              className="group relative rounded-3xl border border-white bg-white shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Decorative corner gradient */}
              <div
                className={`absolute top-0 end-0 size-32 rounded-bl-full opacity-10 bg-gradient-to-bl ${prog.gradient}`}
              />

              {/* Top accent line */}
              <div className={`h-1 w-full bg-gradient-to-l ${prog.gradient}`} />

              <div className="p-7">
                {/* Icon + title */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${prog.iconBg} shadow-sm`}>
                    <prog.icon className={`size-7 ${prog.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{prog.title}</h3>
                    <p className="text-xs text-gray-400">{prog.subtitle}</p>
                  </div>
                  <span className="me-auto ms-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 font-medium shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{prog.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {prog.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${prog.iconColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white bg-gradient-to-l ${prog.gradient} shadow-sm transition-all hover:shadow-md hover:opacity-95`}
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
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_MID} 100%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -start-20 top-1/2 -translate-y-1/2 size-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />

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
              style={{ color: GREEN_DARK }}
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

    </div>
  )
}
