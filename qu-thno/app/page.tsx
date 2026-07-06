import Link from "next/link"
import { auth } from "@/core/auth/auth"
import {
  getPublicStats,
  getFeaturedInitiatives,
  getFeaturedProjects,
  getLatestNews,
  getUpcomingEvents,
  getActivePartners,
  getSDGCoverage,
} from "@/core/public/actions"
import {
  Users, Rocket, Calendar, Handshake, Heart, Sparkles,
  FolderKanban, BarChart3, FileText, Bot, MapPin, Phone,
  Mail, Globe, Building2, Newspaper, Inbox, Building,
} from "lucide-react"

// ── constants ────────────────────────────────────────────────────────────────
const GREEN_DARK = "#1a3d26"
const GREEN_MID  = "#245c3a"
const GREEN_LIGHT = "#2d7a4f"

const SDG_GOALS = [
  { id: 1,  nameAr: "القضاء على الفقر",        color: "#E5243B" },
  { id: 2,  nameAr: "القضاء على الجوع",         color: "#DDA63A" },
  { id: 3,  nameAr: "الصحة الجيدة",             color: "#4C9F38" },
  { id: 4,  nameAr: "التعليم الجيد",             color: "#C5192D" },
  { id: 5,  nameAr: "المساواة بين الجنسين",      color: "#FF3A21" },
  { id: 6,  nameAr: "المياه النظيفة",            color: "#26BDE2" },
  { id: 7,  nameAr: "طاقة نظيفة",               color: "#FCC30B" },
  { id: 8,  nameAr: "العمل اللائق",              color: "#A21942" },
  { id: 9,  nameAr: "الصناعة والابتكار",         color: "#FD6925" },
  { id: 10, nameAr: "الحد من التفاوتات",          color: "#DD1367" },
  { id: 11, nameAr: "مدن مستدامة",              color: "#FD9D24" },
  { id: 12, nameAr: "الإنتاج المسؤول",           color: "#BF8B2E" },
  { id: 13, nameAr: "المناخ",                   color: "#3F7E44" },
  { id: 14, nameAr: "الحياة تحت الماء",          color: "#0A97D9" },
  { id: 15, nameAr: "الحياة في البر",            color: "#56C02B" },
  { id: 16, nameAr: "السلام والعدل",             color: "#00689D" },
  { id: 17, nameAr: "عقد الشراكات",             color: "#19486A" },
]

const STATUS_LABEL: Record<string, string> = {
  draft: "مسودة", pending: "قيد المراجعة", active: "نشطة",
  approved: "معتمدة", completed: "مكتملة", rejected: "مرفوضة",
}
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700", approved: "bg-blue-50 text-blue-700",
  completed: "bg-purple-50 text-purple-700", rejected: "bg-red-50 text-red-700",
}

function fmt(d: Date | null | undefined) {
  if (!d) return ""
  return new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d))
}

// ── QU Logo SVG ──────────────────────────────────────────────────────────────
function QULogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="12" fill="white" />
      {/* Simplified QU emblem — circular mark */}
      <circle cx="60" cy="55" r="28" stroke={GREEN_DARK} strokeWidth="5" fill="none" />
      <circle cx="60" cy="55" r="18" fill={GREEN_DARK} />
      <path d="M60 27 L60 12" stroke={GREEN_DARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M60 98 L60 83" stroke={GREEN_DARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M88 55 L103 55" stroke={GREEN_DARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M17 55 L32 55" stroke={GREEN_DARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M79.5 35.5 L90 25" stroke={GREEN_DARK} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 85 L40.5 74.5" stroke={GREEN_DARK} strokeWidth="3" strokeLinecap="round" />
      <text x="60" y="61" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">QU</text>
      <text x="60" y="108" textAnchor="middle" fill={GREEN_DARK} fontSize="10" fontWeight="600" fontFamily="Arial">جامعة القصيم</text>
    </svg>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const session = await auth()
  const isAuth = !!session?.user

  const [stats, initiatives, projects, news, events, partners, sdgCoverage] = await Promise.all([
    getPublicStats(),
    getFeaturedInitiatives(),
    getFeaturedProjects(),
    getLatestNews(),
    getUpcomingEvents(),
    getActivePartners(),
    getSDGCoverage(),
  ])

  const maxSdg = Math.max(1, ...Object.values(sdgCoverage))

  const NAV_LINKS = [
    { label: "الرئيسية",    href: "/" },
    { label: "البرامج",     href: "/programs" },
    { label: "الفعاليات",   href: "#events" },
    { label: "الاستشارات",  href: "/consultation-info" },
    { label: "الشراكات",    href: "#partners" },
    { label: "اتصل بنا",   href: "#contact" },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <QULogo size={44} />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold" style={{ color: GREEN_DARK }}>جامعة القصيم</p>
              <p className="text-xs text-gray-500">Qassim University</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-gray-700 hover:text-[#1a3d26] transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 start-0 h-0.5 w-0 bg-[#1a3d26] transition-all group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            {isAuth ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GREEN_DARK }}
              >
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24"
        style={{ backgroundColor: GREEN_DARK }}
      >
        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-32 -start-20 size-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -end-10 size-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/80">منصة المسؤولية المجتمعية — جامعة القصيم</span>
          </div>

          <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            المسؤولية المجتمعية
          </h1>

          <p className="mb-8 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
            نحو مجتمع أكثر وعياً وتفاعلاً من خلال برامج وخدمات متنوعة تُعزز
            المسؤولية المجتمعية وتنمي الشراكات الاستراتيجية
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/programs"
              className="rounded-xl bg-white px-7 py-3 text-base font-semibold transition-all hover:shadow-lg hover:bg-gray-50"
              style={{ color: GREEN_DARK }}
            >
              استكشف البرامج
            </Link>
            <Link
              href="/consultation-info"
              className="rounded-xl border-2 border-white/40 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              الاستشارات
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { Icon: Users,     value: stats.users,         label: "مستفيد" },
              { Icon: Rocket,    value: stats.initiatives,   label: "برنامج" },
              { Icon: Calendar,  value: stats.opportunities, label: "فعالية" },
              { Icon: Handshake, value: stats.partners,      label: "شريك" },
            ].map((s) => (
              <div key={s.label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 py-5 px-4 hover:bg-white/15 transition-colors">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
                  <s.Icon className="size-6 text-emerald-300" />
                </div>
                <span className="text-2xl font-black text-white tabular-nums">
                  {s.value.toLocaleString("ar-SA")}+
                </span>
                <span className="text-sm text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ ABOUT ══════════════════════════ */}
      <section className="py-20 bg-white" id="about">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Text */}
            <div>
              <span
                className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                من نحن
              </span>
              <h2 className="mt-3 text-3xl font-black text-gray-900 leading-tight">
                منصة رائدة في خدمة
                <span className="block" style={{ color: GREEN_DARK }}>المجتمع والوطن</span>
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                منصة رائدة تهدف إلى بناء مجتمع رقمي واعٍ ومسؤول من خلال التعليم
                والتدريب والمشاركة الفعّالة في المناسبات الوطنية والعالمية.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                تربط الجامعة بالمجتمع المحيط من خلال مبادرات مجتمعية متنوعة، وشراكات
                استراتيجية مع الجهات الحكومية والخاصة، وبرامج تطوعية تُسهم في تحقيق
                أهداف التنمية المستدامة ومستهدفات رؤية 2030.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  استكشف البرامج
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-colors hover:text-white"
                  style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                  onMouseOver={undefined}
                >
                  سجّل جهتك
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Users,    value: stats.users.toLocaleString("ar-SA") + "+",         label: "مستخدم نشط",    color: "#e8f5e9", iconColor: "#2d7a4f" },
                { Icon: Rocket,   value: stats.initiatives.toLocaleString("ar-SA") + "+",   label: "مبادرة مجتمعية", color: "#e8f5ef", iconColor: "#1a3d26" },
                { Icon: Heart,    value: stats.volunteerHours.toLocaleString("ar-SA") + "+", label: "ساعة تطوع",     color: "#fce4ec", iconColor: "#e11d48" },
                { Icon: Sparkles, value: stats.beneficiaries.toLocaleString("ar-SA") + "+", label: "مستفيد مباشر",  color: "#fff8e1", iconColor: "#d97706" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex flex-col items-center gap-2 rounded-2xl p-5 text-center"
                  style={{ backgroundColor: c.color }}
                >
                  <c.Icon className="size-7" style={{ color: c.iconColor }} />
                  <span className="text-2xl font-black tabular-nums" style={{ color: GREEN_DARK }}>{c.value}</span>
                  <span className="text-sm text-gray-600">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PROGRAMS / INITIATIVES ══════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: "#f7faf8" }} id="programs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader tag="البرامج والمبادرات" title="أبرز مبادراتنا المجتمعية" sub="مبادرات فاعلة تُجسّد التزام جامعة القصيم بخدمة المجتمع وتحقيق التنمية المستدامة" greenDark={GREEN_DARK} />
          {initiatives.length === 0 ? (
            <EmptyPlaceholder />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((init) => (
                <div key={init.id} className="group flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className="h-1.5 w-full" style={{ backgroundColor: GREEN_MID }} />
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 flex-1 text-sm">{init.titleAr}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[init.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[init.status] ?? init.status}
                      </span>
                    </div>
                    {init.descriptionAr && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{init.descriptionAr}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
                      {init.targetBeneficiaries != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="size-3" />{init.targetBeneficiaries.toLocaleString("ar-SA")} مستفيد
                        </span>
                      )}
                      {init.sdgGoals.length > 0 && (
                        <div className="flex gap-1">
                          {init.sdgGoals.slice(0, 3).map((g) => {
                            const sdg = SDG_GOALS.find((s) => s.id === g)
                            return (
                              <span key={g} title={sdg?.nameAr} className="flex size-5 items-center justify-center rounded-full text-white text-[9px] font-bold" style={{ backgroundColor: sdg?.color ?? "#888" }}>
                                {g}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t px-5 py-3">
                    <Link href="/login" className="text-xs font-semibold transition-colors" style={{ color: GREEN_DARK }}>
                      عرض التفاصيل ←
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-colors hover:text-white" style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}>
              عرض جميع البرامج
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PROJECTS ══════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader tag="المشاريع المجتمعية" title="أبرز المشاريع الجارية" sub="مشاريع تُترجم الرؤى إلى واقع ملموس يخدم أبناء المنطقة" greenDark={GREEN_DARK} />
          {projects.length === 0 ? <EmptyPlaceholder /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: "#2d7a4f" }} />
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1">{p.titleAr}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>
                    {p.descriptionAr && <p className="text-xs text-gray-500 line-clamp-2">{p.descriptionAr}</p>}
                    {p.startDate && <p className="text-xs text-gray-400 mt-auto pt-2 border-t">بدأ في: {fmt(p.startDate)}</p>}
                  </div>
                  <div className="border-t px-5 py-3">
                    <Link href="/login" className="text-xs font-semibold" style={{ color: GREEN_DARK }}>عرض التفاصيل ←</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════ EVENTS + NEWS ══════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: "#f7faf8" }} id="events">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-2">

            {/* Events */}
            <div>
              <SectionHeader tag="الفعاليات" title="الفعاليات القادمة" sub="لا تفوّت أبرز فعاليات المسؤولية المجتمعية" greenDark={GREEN_DARK} compact />
              {events.length === 0 ? <EmptyPlaceholder small /> : (
                <div className="space-y-3">
                  {events.map((ev) => {
                    const d = new Date(ev.startDate)
                    const spotsLeft = ev.capacity ? ev.capacity - ev.registrations : null
                    return (
                      <div key={ev.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-white text-center" style={{ backgroundColor: GREEN_DARK }}>
                          <span className="text-lg font-black leading-none">{d.getDate()}</span>
                          <span className="text-[10px] leading-none mt-0.5 opacity-80">
                            {d.toLocaleDateString("ar-SA", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{ev.titleAr}</h4>
                          {ev.locationAr && <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin className="size-3 shrink-0" />{ev.locationAr}</p>}
                          {spotsLeft !== null && (
                            <p className="text-xs mt-1 font-medium" style={{ color: spotsLeft > 0 ? GREEN_DARK : "#b91c1c" }}>
                              {spotsLeft > 0 ? `${spotsLeft} مقعد متاح` : "اكتملت المقاعد"}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-4">
                <Link href="/login" className="text-sm font-semibold" style={{ color: GREEN_DARK }}>عرض جميع الفعاليات ←</Link>
              </div>
            </div>

            {/* News */}
            <div>
              <SectionHeader tag="الأخبار" title="أحدث الأخبار" sub="تابع آخر إنجازات ومستجدات المنصة" greenDark={GREEN_DARK} compact />
              {news.length === 0 ? <EmptyPlaceholder small /> : (
                <div className="space-y-3">
                  {news.map((a) => (
                    <div key={a.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#f0f7f2" }}>
                        <Newspaper className="size-6" style={{ color: GREEN_DARK }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{a.titleAr}</h4>
                        {a.excerptAr && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.excerptAr}</p>}
                        <p className="text-xs text-gray-400 mt-1">{fmt(a.publishedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/login" className="text-sm font-semibold" style={{ color: GREEN_DARK }}>عرض جميع الأخبار ←</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PARTNERS ══════════════════════════ */}
      <section className="py-20 bg-white" id="partners">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader tag="الشراكات" title="شركاء النجاح" sub="نفخر بشراكاتنا مع الجهات الحكومية والخاصة في تحقيق أهداف التنمية المستدامة" greenDark={GREEN_DARK} />
          {partners.length === 0 ? <EmptyPlaceholder /> : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((p) => (
                <div key={p.id} className="group flex min-w-[130px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-[#1a3d26]/30 transition-all">
                  <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#f0f7f2" }}>
                    {p.type === "GOVERNMENT" ? <Building2 className="size-5" style={{ color: GREEN_DARK }} /> : p.type === "HEALTHCARE" ? <Heart className="size-5 text-rose-500" /> : p.type === "NGO" ? <Users className="size-5 text-blue-500" /> : <Building className="size-5 text-gray-500" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{p.nameAr}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════ SDG ══════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: GREEN_DARK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader tag="أهداف التنمية المستدامة" title="تغطيتنا لأهداف الـ SDGs" sub="مبادراتنا تشمل أهداف التنمية المستدامة الأممية الـ 17" greenDark={GREEN_DARK} dark />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
            {SDG_GOALS.map((sdg) => {
              const count = sdgCoverage[sdg.id] ?? 0
              const pct = Math.round((count / maxSdg) * 100)
              return (
                <div key={sdg.id} className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 border transition-opacity ${count > 0 ? "opacity-100" : "opacity-35"}`}
                  style={{ borderColor: sdg.color + "50", backgroundColor: sdg.color + "20" }}>
                  <div className="flex size-9 items-center justify-center rounded-lg text-white font-black text-sm shadow" style={{ backgroundColor: sdg.color }}>
                    {sdg.id}
                  </div>
                  <p className="text-center text-[9px] text-white/75 leading-tight">{sdg.nameAr}</p>
                  {count > 0 && (
                    <div className="w-full">
                      <div className="h-1 w-full rounded-full bg-white/20">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: sdg.color }} />
                      </div>
                      <p className="mt-0.5 text-center text-[9px] text-white/50">{count}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ WHY ══════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader tag="مزايا المنصة" title="لماذا تستخدم المنصة؟" sub="منظومة متكاملة لإدارة المسؤولية المجتمعية باحترافية" greenDark={GREEN_DARK} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Rocket,      title: "إدارة المبادرات",    desc: "أنشئ وتابع المبادرات بخطوات سهلة مع نظام سير عمل متكامل للاعتماد" },
              { Icon: FolderKanban,title: "إدارة المشاريع",     desc: "خطط لمشاريعك وتابع مراحلها وفرق العمل والميزانيات بكفاءة" },
              { Icon: Heart,       title: "إدارة التطوع",       desc: "اكتشف فرص التطوع وتقدّم لها وتابع ساعاتك وشهاداتك بسهولة" },
              { Icon: BarChart3,   title: "قياس الأثر",         desc: "قِس الأثر الحقيقي لبرامجك عبر مؤشرات متوافقة مع أهداف SDG" },
              { Icon: FileText,    title: "التقارير التنفيذية", desc: "أنشئ تقارير احترافية قابلة للطباعة والمشاركة في لحظات" },
              { Icon: Bot,         title: "الذكاء الاصطناعي",  desc: "استعن بمساعد AI متخصص لتحليل البيانات وتقديم التوصيات" },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#f0f7f2" }}>
                  <f.Icon className="size-5" style={{ color: GREEN_DARK }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      {!isAuth && (
        <section className="py-16" style={{ backgroundColor: GREEN_DARK }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-black text-white mb-2">انضم إلى منظومة المسؤولية المجتمعية</h2>
            <p className="text-white/70 mb-6 text-sm">سواء كنت فرداً أو جهةً خارجية — المنصة توفر كل الأدوات للمشاركة الفاعلة</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="rounded-xl bg-white px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90" style={{ color: GREEN_DARK }}>
                تسجيل الدخول
              </Link>
              <Link href="/register" className="rounded-xl border-2 border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                إنشاء حساب
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="bg-gray-900 text-gray-400" id="contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl font-black text-lg text-white" style={{ backgroundColor: GREEN_DARK }}>QU</div>
                <div>
                  <p className="font-bold text-white text-sm">منصة المسؤولية المجتمعية</p>
                  <p className="text-xs text-gray-500">جامعة القصيم</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                منصة رقمية متكاملة تُمكّن جامعة القصيم من إدارة برامجها المجتمعية
                وشراكاتها الاستراتيجية لتحقيق مستهدفات رؤية 2030.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "البرامج والمبادرات", href: "/login" },
                  { label: "الفعاليات", href: "/login" },
                  { label: "الاستشارات", href: "/login" },
                  { label: "الشراكات", href: "/login" },
                  { label: "إنشاء حساب", href: "/register" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">تواصل معنا</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2"><MapPin className="size-4 shrink-0 mt-0.5" /><span>المملكة العربية السعودية — بريدة، منطقة القصيم</span></li>
                <li className="flex items-center gap-2"><Phone className="size-4 shrink-0" /><span dir="ltr">+966 16 381 5888</span></li>
                <li className="flex items-center gap-2"><Mail className="size-4 shrink-0" /><span>community@qu.edu.sa</span></li>
                <li className="flex items-center gap-2"><Globe className="size-4 shrink-0" />
                  <a href="https://www.qu.edu.sa" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">www.qu.edu.sa</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} جامعة القصيم — جميع الحقوق محفوظة</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-gray-400 transition-colors">سياسة الخصوصية</Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">شروط الاستخدام</Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">إمكانية الوصول</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub, greenDark, dark = false, compact = false }: {
  tag: string; title: string; sub: string; greenDark: string; dark?: boolean; compact?: boolean
}) {
  return (
    <div className={`${compact ? "mb-6" : "mb-10"} text-center`}>
      <span className={`inline-block rounded-full px-4 py-1 text-xs font-semibold mb-3 ${dark ? "bg-white/15 text-emerald-200" : "text-white"}`}
        style={dark ? {} : { backgroundColor: greenDark + "15", color: greenDark }}>
        {tag}
      </span>
      <h2 className={`font-black ${compact ? "text-xl" : "text-2xl sm:text-3xl"} ${dark ? "text-white" : "text-gray-900"}`}>{title}</h2>
      <p className={`mt-2 text-sm max-w-xl mx-auto leading-relaxed ${dark ? "text-white/65" : "text-gray-500"}`}>{sub}</p>
    </div>
  )
}

function EmptyPlaceholder({ small = false }: { small?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 ${small ? "py-8" : "py-12"}`}>
      <Inbox className="size-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">لا توجد بيانات حالياً</p>
    </div>
  )
}
