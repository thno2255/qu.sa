import Link from "next/link"
import {
  GraduationCap, FlaskConical, Briefcase, Users,
  ArrowLeft, Star, CheckCircle2,
} from "lucide-react"

const GREEN_DARK  = "#1a3d26"
const GREEN_MID   = "#245c3a"
const GREEN_LIGHT = "#2d7a4f"

const CONSULTATION_TYPES = [
  {
    icon: GraduationCap,
    title: "الاستشارة الأكاديمية",
    subtitle: "Academic Consultation",
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    description:
      "احصل على إرشاد أكاديمي متخصص من أعضاء هيئة التدريس في مجالات الدراسة والبحث العلمي والتخطيط لمسيرتك الأكاديمية.",
    examples: ["اختيار التخصص الدراسي", "التخطيط للدراسات العليا", "مراجعة الخطة الدراسية", "الإرشاد البحثي"],
    who: "الطلاب وأعضاء هيئة التدريس والموظفون",
  },
  {
    icon: FlaskConical,
    title: "الاستشارة البحثية",
    subtitle: "Research Consultation",
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    description:
      "دعم بحثي متخصص في تصميم الدراسات واختيار المناهج وتحليل البيانات ونشر الأبحاث العلمية من متخصصين ذوي خبرة.",
    examples: ["تصميم منهجية البحث", "تحليل البيانات والإحصاء", "مراجعة الأوراق البحثية", "استراتيجيات النشر"],
    who: "الباحثون وطلاب الدراسات العليا والجهات الخارجية",
  },
  {
    icon: Briefcase,
    title: "الاستشارة المهنية",
    subtitle: "Career Consultation",
    gradient: "from-violet-500 to-purple-600",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
    description:
      "توجيه مهني متخصص لمساعدتك في بناء مسيرتك الوظيفية وتطوير مهاراتك والاستعداد لسوق العمل من متخصصين ذوي خبرة واسعة.",
    examples: ["بناء السيرة الذاتية", "التحضير للمقابلات الوظيفية", "التخطيط المهني طويل المدى", "ريادة الأعمال"],
    who: "الطلاب والخريجون والجهات الخارجية",
  },
  {
    icon: Users,
    title: "استشارة المسؤولية المجتمعية",
    subtitle: "Community Responsibility",
    gradient: "from-rose-500 to-pink-600",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    description:
      "استشارات متخصصة في مجال المسؤولية المجتمعية والاستدامة للمؤسسات الراغبة في تطوير برامجها وتحقيق أثر مجتمعي مستدام.",
    examples: ["تصميم برامج المسؤولية", "الاستدامة وأهداف التنمية", "تقييم الأثر المجتمعي", "استراتيجيات الشراكة"],
    who: "المؤسسات والشركات والجمعيات الخيرية",
  },
]

const STEPS = [
  { n: "١", title: "سجّل دخولك",  desc: "أنشئ حساباً أو سجّل دخولك للمنصة" },
  { n: "٢", title: "اختر المتخصص", desc: "تصفّح قائمة أعضاء هيئة التدريس" },
  { n: "٣", title: "أرسل طلبك",   desc: "حدد نوع الاستشارة واشرح احتياجك" },
  { n: "٤", title: "احجز موعدك",  desc: "تلقّ تأكيداً وحدد الموعد برقمياً" },
]

export default function ConsultationInfoPage() {
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
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 end-10 size-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 -start-10 size-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute top-1/2 start-1/3 -translate-y-1/2 size-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur-sm">
            <GraduationCap className="size-3.5" />
            خدمة الاستشارات الأكاديمية والمجتمعية
          </span>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl leading-tight drop-shadow-sm">
            استشاراتنا
            <span className="block text-emerald-300">في خدمتك</span>
          </h1>
          <p className="mt-5 text-base text-white/75 leading-relaxed max-w-lg mx-auto">
            يُتيح لك فريقنا من أعضاء هيئة التدريس الحصول على استشارات مخصصة
            تُعينك على اتخاذ قراراتك الأكاديمية والمهنية والمجتمعية.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2.5 rounded-2xl border-2 border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
          >
            <Star className="size-4 fill-yellow-300 text-yellow-300" />
            اطلب استشارتك الآن
          </Link>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 start-0 w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,20 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f0fdf4" />
        </svg>
      </section>

      {/* ── Types Grid ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">أنواع الاستشارات المتاحة</h2>
          <p className="mt-2 text-sm text-gray-500">اختر نوع الاستشارة الذي يناسب احتياجك</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {CONSULTATION_TYPES.map((ct, i) => (
            <div
              key={ct.title}
              className="group relative rounded-3xl border border-white bg-white shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Decorative corner */}
              <div
                className={`absolute top-0 end-0 size-28 rounded-bl-full opacity-10 bg-gradient-to-bl ${ct.gradient}`}
              />

              {/* Top accent */}
              <div className={`h-1 w-full bg-gradient-to-l ${ct.gradient}`} />

              <div className="p-7">
                {/* Icon + title row */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${ct.iconBg} shadow-sm`}>
                    <ct.icon className={`size-7 ${ct.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{ct.title}</h3>
                    <p className="text-xs text-gray-400">{ct.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-400 font-medium shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">{ct.description}</p>

                {/* Example tags */}
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">أمثلة</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ct.examples.map((ex) => (
                      <span
                        key={ex}
                        className={`rounded-full border ${ct.border} bg-white px-3 py-1 text-xs ${ct.iconColor} font-medium`}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Who */}
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5 mb-6">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <span className="font-semibold">المستفيدون:</span> {ct.who}
                  </p>
                </div>

                <Link
                  href="/login"
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white bg-gradient-to-l ${ct.gradient} shadow-sm hover:shadow-md hover:opacity-95 transition-all`}
                >
                  اطلب استشارتك
                  <ArrowLeft className="size-4 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative overflow-hidden px-4 py-16">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_MID} 100%)` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -end-16 top-1/2 -translate-y-1/2 size-72 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-12 text-center text-white">
            <h2 className="text-2xl font-bold">كيف تحصل على استشارتك؟</h2>
            <p className="mt-2 text-white/65 text-sm">أربع خطوات بسيطة للحصول على استشارة متخصصة</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm mb-4 shadow-inner">
                  <span className="text-2xl font-black text-white">{step.n}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Connecting line */}
          <div className="hidden sm:block absolute top-[calc(50%-1rem)] start-[12%] end-[12%] h-px bg-white/15" />

          <div className="mt-12 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:bg-gray-50"
              style={{ color: GREEN_DARK }}
            >
              <CheckCircle2 className="size-4" />
              ابدأ الآن — سجّل دخولك
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
