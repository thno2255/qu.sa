import Link from "next/link"
import { auth } from "@/core/auth/auth"
import { getLocale } from "next-intl/server"
import { QULogo } from "@/shared/components/ui/qu-logo"
import {
  getPublicStats,
  getFeaturedInitiatives,
  getFeaturedProjects,
  getLatestNews,
  getUpcomingEvents,
  getActivePartners,
} from "@/core/public/actions"
import {
  Users, Rocket, Calendar, Handshake, Heart, Sparkles,
  FolderKanban, FileText, GraduationCap, MapPin, Phone,
  Mail, Globe, Building2, Newspaper, Inbox, Building,
} from "lucide-react"

// ── constants ────────────────────────────────────────────────────────────────
const GREEN_DARK = "#1a3d26"
const GREEN_MID  = "#245c3a"
const GREEN_LIGHT = "#2d7a4f"

// Section background gradients — each section's start color matches the previous
// section's end color, so scrolling reads as one continuous white↔mint wave
// instead of flat, visually-identical white blocks stacked on each other.
const STOP_WHITE = "#ffffff"
const STOP_SOFT  = "#f0f8f3"
const STOP_MINT  = "#e2f1e7"

const GRAD_HERO         = `linear-gradient(160deg, ${GREEN_DARK} 0%, ${GREEN_MID} 100%)`
const GRAD_WHITE_TO_SOFT = `linear-gradient(180deg, ${STOP_WHITE} 0%, ${STOP_SOFT} 100%)`
const GRAD_SOFT_TO_MINT  = `linear-gradient(180deg, ${STOP_SOFT} 0%, ${STOP_MINT} 100%)`
const GRAD_MINT_TO_WHITE = `linear-gradient(180deg, ${STOP_MINT} 0%, ${STOP_WHITE} 100%)`
const GRAD_CTA          = `linear-gradient(150deg, ${GREEN_MID} 0%, ${GREEN_DARK} 100%)`
const GRAD_FOOTER       = "linear-gradient(180deg, #111827 0%, #030712 100%)"

const SDG_GOALS = [
  { id: 1,  nameAr: "القضاء على الفقر",        nameEn: "No Poverty",            color: "#E5243B" },
  { id: 2,  nameAr: "القضاء على الجوع",         nameEn: "Zero Hunger",           color: "#DDA63A" },
  { id: 3,  nameAr: "الصحة الجيدة",             nameEn: "Good Health",           color: "#4C9F38" },
  { id: 4,  nameAr: "التعليم الجيد",             nameEn: "Quality Education",     color: "#C5192D" },
  { id: 5,  nameAr: "المساواة بين الجنسين",      nameEn: "Gender Equality",       color: "#FF3A21" },
  { id: 6,  nameAr: "المياه النظيفة",            nameEn: "Clean Water",           color: "#26BDE2" },
  { id: 7,  nameAr: "طاقة نظيفة",               nameEn: "Clean Energy",          color: "#FCC30B" },
  { id: 8,  nameAr: "العمل اللائق",              nameEn: "Decent Work",           color: "#A21942" },
  { id: 9,  nameAr: "الصناعة والابتكار",         nameEn: "Industry & Innovation", color: "#FD6925" },
  { id: 10, nameAr: "الحد من التفاوتات",          nameEn: "Reduced Inequalities",  color: "#DD1367" },
  { id: 11, nameAr: "مدن مستدامة",              nameEn: "Sustainable Cities",    color: "#FD9D24" },
  { id: 12, nameAr: "الإنتاج المسؤول",           nameEn: "Responsible Consumption", color: "#BF8B2E" },
  { id: 13, nameAr: "المناخ",                   nameEn: "Climate Action",        color: "#3F7E44" },
  { id: 14, nameAr: "الحياة تحت الماء",          nameEn: "Life Below Water",      color: "#0A97D9" },
  { id: 15, nameAr: "الحياة في البر",            nameEn: "Life on Land",          color: "#56C02B" },
  { id: 16, nameAr: "السلام والعدل",             nameEn: "Peace & Justice",       color: "#00689D" },
  { id: 17, nameAr: "عقد الشراكات",             nameEn: "Partnerships",          color: "#19486A" },
]

const STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  draft: { ar: "مسودة", en: "Draft" },
  pending: { ar: "قيد المراجعة", en: "Pending" },
  active: { ar: "نشطة", en: "Active" },
  approved: { ar: "معتمدة", en: "Approved" },
  completed: { ar: "مكتملة", en: "Completed" },
  rejected: { ar: "مرفوضة", en: "Rejected" },
}
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700", approved: "bg-blue-50 text-blue-700",
  completed: "bg-purple-50 text-purple-700", rejected: "bg-red-50 text-red-700",
}

// ── page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const session = await auth()
  const isAuth = !!session?.user
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const bi = (ar: string, en: string | null) => (isRTL ? ar : (en ?? ar))

  const fmt = (d: Date | null | undefined) => {
    if (!d) return ""
    return new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d))
  }

  const [stats, initiatives, projects, news, events, partners] = await Promise.all([
    getPublicStats(),
    getFeaturedInitiatives(),
    getFeaturedProjects(),
    getLatestNews(),
    getUpcomingEvents(),
    getActivePartners(),
  ])

  const NAV_LINKS = [
    { label: t("الرئيسية", "Home"),        href: "/" },
    { label: t("البرامج", "Programs"),     href: "/programs" },
    { label: t("الفعاليات", "Events"),     href: "/events" },
    { label: t("الاستشارات", "Consultations"), href: "/consultation-info" },
    { label: t("الشراكات", "Partnerships"), href: "/partners" },
    { label: t("اتصل بنا", "Contact Us"),  href: "#contact" },
  ]

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white text-gray-900">

      {/* ══════════════════════════ PROTOTYPE NOTICE ══════════════════════════ */}
      <div className="w-full py-2 px-4 text-center text-xs sm:text-sm font-medium text-amber-900 bg-amber-100 border-b border-amber-200">
        {t(
          "⚠️ هذا نموذج أوّلي للعرض والمناقشة — لأغراض العرض التقديمي فقط",
          "⚠️ This is an initial prototype for demonstration and discussion — for presentation purposes only",
        )}
      </div>

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <QULogo height={72} />
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

          {/* Auth buttons + language toggle */}
          <div className="flex items-center gap-2">
            <Link
              href={isRTL ? "/en" : "/ar"}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label={t("التبديل إلى الإنجليزية", "Switch to Arabic")}
              title={t("English", "العربية")}
            >
              <Globe className="size-5" />
            </Link>
            {isAuth ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {t("لوحة التحكم", "Dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
                  {t("تسجيل الدخول", "Sign In")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  {t("إنشاء حساب", "Create Account")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24"
        style={{ background: GRAD_HERO }}
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
            <span className="text-sm text-white/80">
              {t("منصة الشراكة المجتمعية — جامعة القصيم", "Community Partnership Platform — Qassim University")}
            </span>
          </div>

          <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            {t("الشراكة المجتمعية", "Community Partnership")}
          </h1>

          <p className="mb-8 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
            {t(
              "نحو مجتمع أكثر وعياً وتفاعلاً من خلال برامج وخدمات متنوعة تُعزز الشراكة المجتمعية وتنمي الشراكات الاستراتيجية",
              "Toward a more aware and engaged community through diverse programs and services that strengthen community partnership and grow strategic partnerships",
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/programs"
              className="rounded-xl bg-white px-7 py-3 text-base font-semibold transition-all hover:shadow-lg hover:bg-gray-50"
              style={{ color: GREEN_DARK }}
            >
              {t("استكشف البرامج", "Explore Programs")}
            </Link>
            <Link
              href="/consultation-info"
              className="rounded-xl border-2 border-white/40 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              {t("الاستشارات", "Consultations")}
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { Icon: Users,     value: stats.users,         label: t("مستفيد", "Beneficiaries") },
              { Icon: Rocket,    value: stats.initiatives,   label: t("برنامج", "Programs") },
              { Icon: Calendar,  value: stats.events, label: t("فعالية", "Events") },
              { Icon: Handshake, value: stats.partners,      label: t("شريك", "Partners") },
            ].map((s) => (
              <div key={s.label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 py-5 px-4 hover:bg-white/15 transition-colors">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/15">
                  <s.Icon className="size-6 text-emerald-300" />
                </div>
                <span className="text-2xl font-black text-white tabular-nums">
                  {s.value.toLocaleString(isRTL ? "ar-SA" : "en-US")}+
                </span>
                <span className="text-sm text-white/70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ ABOUT ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_WHITE_TO_SOFT }} id="about">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Text */}
            <div>
              <span
                className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {t("من نحن", "About Us")}
              </span>
              <h2 className="mt-3 text-3xl font-black text-gray-900 leading-tight">
                {t("منصة رائدة في خدمة", "A Leading Platform Serving")}
                <span className="block" style={{ color: GREEN_DARK }}>{t("المجتمع والوطن", "Community & Nation")}</span>
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t(
                  "منصة رائدة تهدف إلى بناء مجتمع رقمي واعٍ ومسؤول من خلال التعليم والتدريب والمشاركة الفعّالة في المناسبات الوطنية والعالمية.",
                  "A leading platform that aims to build an aware, responsible digital community through education, training, and active participation in national and global events.",
                )}
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {t(
                  "تربط الجامعة بالمجتمع المحيط من خلال مبادرات مجتمعية متنوعة، وشراكات استراتيجية مع الجهات الحكومية والخاصة، تُسهم في تحقيق أهداف التنمية المستدامة ومستهدفات رؤية 2030.",
                  "Connects the university with the surrounding community through diverse community initiatives and strategic partnerships with government and private entities, contributing to achieving the Sustainable Development Goals and Saudi Vision 2030 targets.",
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  {t("استكشف البرامج", "Explore Programs")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-colors hover:text-white"
                  style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                >
                  {t("سجّل جهتك", "Register Your Organization")}
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Users,    value: stats.users.toLocaleString(isRTL ? "ar-SA" : "en-US") + "+",         label: t("مستخدم نشط", "Active Users"),    color: "#e8f5e9", iconColor: "#2d7a4f" },
                { Icon: Rocket,   value: stats.initiatives.toLocaleString(isRTL ? "ar-SA" : "en-US") + "+",   label: t("مبادرة مجتمعية", "Community Initiatives"), color: "#e8f5ef", iconColor: "#1a3d26" },
                { Icon: Heart,    value: stats.partnerships.toLocaleString(isRTL ? "ar-SA" : "en-US") + "+", label: t("شراكة فعّالة", "Active Partnerships"),     color: "#fce4ec", iconColor: "#e11d48" },
                { Icon: Sparkles, value: stats.beneficiaries.toLocaleString(isRTL ? "ar-SA" : "en-US") + "+", label: t("مستفيد مباشر", "Direct Beneficiaries"),  color: "#fff8e1", iconColor: "#d97706" },
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

      <SectionDivider />

      {/* ══════════════════════════ PROGRAMS / INITIATIVES ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_SOFT_TO_MINT }} id="programs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("البرامج والمبادرات", "Programs & Initiatives")}
            title={t("أبرز مبادراتنا المجتمعية", "Our Leading Community Initiatives")}
            sub={t(
              "مبادرات فاعلة تُجسّد التزام جامعة القصيم بخدمة المجتمع وتحقيق التنمية المستدامة",
              "Effective initiatives reflecting Qassim University's commitment to community service and sustainable development",
            )}
            greenDark={GREEN_DARK}
          />
          {initiatives.length === 0 ? (
            <EmptyPlaceholder isRTL={isRTL} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((init) => (
                <div key={init.id} className="group flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className="h-1.5 w-full" style={{ backgroundColor: GREEN_MID }} />
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 flex-1 text-sm">{bi(init.titleAr, init.titleEn)}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[init.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[init.status]?.[isRTL ? "ar" : "en"] ?? init.status}
                      </span>
                    </div>
                    {(init.descriptionAr || init.descriptionEn) && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{bi(init.descriptionAr ?? "", init.descriptionEn)}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
                      {init.targetBeneficiaries != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="size-3" />{init.targetBeneficiaries.toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("مستفيد", "beneficiaries")}
                        </span>
                      )}
                      {init.sdgGoals.length > 0 && (
                        <div className="flex gap-1">
                          {init.sdgGoals.slice(0, 3).map((g) => {
                            const sdg = SDG_GOALS.find((s) => s.id === g)
                            return (
                              <span key={g} title={isRTL ? sdg?.nameAr : sdg?.nameEn} className="flex size-5 items-center justify-center rounded-full text-white text-[9px] font-bold" style={{ backgroundColor: sdg?.color ?? "#888" }}>
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
                      {t("عرض التفاصيل ←", "View Details →")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-colors hover:text-white" style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}>
              {t("عرض جميع البرامج", "View All Programs")}
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ PROJECTS ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_MINT_TO_WHITE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("المشاريع المجتمعية", "Community Projects")}
            title={t("أبرز المشاريع الجارية", "Ongoing Projects")}
            sub={t(
              "مشاريع تُترجم الرؤى إلى واقع ملموس يخدم أبناء المنطقة",
              "Projects that translate vision into tangible reality serving the region",
            )}
            greenDark={GREEN_DARK}
          />
          {projects.length === 0 ? <EmptyPlaceholder isRTL={isRTL} /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: "#2d7a4f" }} />
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1">{bi(p.titleAr, p.titleEn)}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[p.status]?.[isRTL ? "ar" : "en"] ?? p.status}
                      </span>
                    </div>
                    {(p.descriptionAr || p.descriptionEn) && <p className="text-xs text-gray-500 line-clamp-2">{bi(p.descriptionAr ?? "", p.descriptionEn)}</p>}
                    {p.startDate && <p className="text-xs text-gray-400 mt-auto pt-2 border-t">{t("بدأ في:", "Started:")} {fmt(p.startDate)}</p>}
                  </div>
                  <div className="border-t px-5 py-3">
                    <Link href="/login" className="text-xs font-semibold" style={{ color: GREEN_DARK }}>{t("عرض التفاصيل ←", "View Details →")}</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ EVENTS + NEWS ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_WHITE_TO_SOFT }} id="events">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-2">

            {/* Events */}
            <div>
              <SectionHeader
                tag={t("الفعاليات", "Events")}
                title={t("الفعاليات القادمة", "Upcoming Events")}
                sub={t("لا تفوّت أبرز فعاليات الشراكة المجتمعية", "Don't miss the top community partnership events")}
                greenDark={GREEN_DARK} compact
              />
              {events.length === 0 ? <EmptyPlaceholder small isRTL={isRTL} /> : (
                <div className="space-y-3">
                  {events.map((ev) => {
                    const d = new Date(ev.startDate)
                    const spotsLeft = ev.capacity ? ev.capacity - ev.registrations : null
                    return (
                      <div key={ev.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-white text-center" style={{ backgroundColor: GREEN_DARK }}>
                          <span className="text-lg font-black leading-none">{d.getDate()}</span>
                          <span className="text-[10px] leading-none mt-0.5 opacity-80">
                            {d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{bi(ev.titleAr, ev.titleEn)}</h4>
                          {ev.locationAr && <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin className="size-3 shrink-0" />{ev.locationAr}</p>}
                          {spotsLeft !== null && (
                            <p className="text-xs mt-1 font-medium" style={{ color: spotsLeft > 0 ? GREEN_DARK : "#b91c1c" }}>
                              {spotsLeft > 0 ? t(`${spotsLeft} مقعد متاح`, `${spotsLeft} seats available`) : t("اكتملت المقاعد", "Fully booked")}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-4 flex items-center gap-4">
                <Link href="/events" className="text-sm font-semibold" style={{ color: GREEN_DARK }}>{t("عرض جميع الفعاليات ←", "View All Events →")}</Link>
                <Link href="/events/new" className="text-sm font-semibold text-gray-500 hover:text-gray-700">{t("تقديم طلب فعالية (للجهات الخارجية)", "Submit an Event Request (External Entities)")}</Link>
              </div>
            </div>

            {/* News */}
            <div>
              <SectionHeader
                tag={t("الأخبار", "News")}
                title={t("أحدث الأخبار", "Latest News")}
                sub={t("تابع آخر إنجازات ومستجدات المنصة", "Follow the platform's latest achievements and updates")}
                greenDark={GREEN_DARK} compact
              />
              {news.length === 0 ? <EmptyPlaceholder small isRTL={isRTL} /> : (
                <div className="space-y-3">
                  {news.map((a) => (
                    <div key={a.id} className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#f0f7f2" }}>
                        <Newspaper className="size-6" style={{ color: GREEN_DARK }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{bi(a.titleAr, a.titleEn)}</h4>
                        {a.excerptAr && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.excerptAr}</p>}
                        <p className="text-xs text-gray-400 mt-1">{fmt(a.publishedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/login" className="text-sm font-semibold" style={{ color: GREEN_DARK }}>{t("عرض جميع الأخبار ←", "View All News →")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ PARTNERS ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_SOFT_TO_MINT }} id="partners">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("الشراكات", "Partnerships")}
            title={t("شركاء النجاح", "Partners of Success")}
            sub={t(
              "نفخر بشراكاتنا مع الجهات الحكومية والخاصة في تحقيق أهداف التنمية المستدامة",
              "We are proud of our partnerships with government and private entities in achieving the Sustainable Development Goals",
            )}
            greenDark={GREEN_DARK}
          />
          {partners.length === 0 ? <EmptyPlaceholder isRTL={isRTL} /> : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((p) => (
                <div key={p.id} className="group flex min-w-[130px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-[#1a3d26]/30 transition-all">
                  <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#f0f7f2" }}>
                    {p.type === "GOVERNMENT" ? <Building2 className="size-5" style={{ color: GREEN_DARK }} /> : p.type === "HEALTHCARE" ? <Heart className="size-5 text-rose-500" /> : p.type === "NGO" ? <Users className="size-5 text-blue-500" /> : <Building className="size-5 text-gray-500" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{bi(p.nameAr, p.nameEn)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/partners" className="text-sm font-semibold" style={{ color: GREEN_DARK }}>{t("عرض جميع الشركاء ←", "View All Partners →")}</Link>
            <Link href="/partners/apply" className="text-sm font-semibold text-gray-500 hover:text-gray-700">{t("تقديم طلب شراكة", "Submit a Partnership Request")}</Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ WHY ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_MINT_TO_WHITE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("مزايا المنصة", "Platform Features")}
            title={t("لماذا تستخدم المنصة؟", "Why Use the Platform?")}
            sub={t("منظومة متكاملة لإدارة الشراكة المجتمعية باحترافية", "A comprehensive system for managing community partnership professionally")}
            greenDark={GREEN_DARK}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Rocket,      titleAr: "إدارة المبادرات",    titleEn: "Initiative Management",    descAr: "أنشئ وتابع المبادرات بخطوات سهلة مع نظام سير عمل متكامل للاعتماد", descEn: "Create and track initiatives with easy steps and a full approval workflow" },
              { Icon: FolderKanban,titleAr: "إدارة المشاريع",     titleEn: "Project Management",        descAr: "خطط لمشاريعك وتابع مراحلها وفرق العمل والميزانيات بكفاءة", descEn: "Plan your projects and track milestones, teams, and budgets efficiently" },
              { Icon: MapPin,      titleAr: "الزيارات الميدانية",  titleEn: "Field Visits",             descAr: "اطلب زيارة ميدانية لمشروعك من عضو هيئة التدريس المختص مع إرفاق ملفات المشروع", descEn: "Request a field visit for your project from a specialized faculty member with project files attached" },
              { Icon: Handshake,   titleAr: "إدارة الشراكات",     titleEn: "Partnership Management",    descAr: "نسّق شراكاتك المؤسسية وتابع اتفاقياتك مع الجهات الحكومية والخاصة", descEn: "Coordinate your institutional partnerships and track agreements with government and private entities" },
              { Icon: FileText,    titleAr: "التقارير التنفيذية", titleEn: "Executive Reports",         descAr: "أنشئ تقارير احترافية قابلة للطباعة والمشاركة في لحظات", descEn: "Generate professional, printable, shareable reports in moments" },
              { Icon: GraduationCap, titleAr: "الاستشارات المتخصصة", titleEn: "Specialized Consultations", descAr: "احجز استشارة مباشرة مع أعضاء هيئة التدريس المختصين", descEn: "Book a direct consultation with specialized faculty members" },
            ].map((f) => (
              <div key={f.titleAr} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#f0f7f2" }}>
                  <f.Icon className="size-5" style={{ color: GREEN_DARK }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{t(f.titleAr, f.titleEn)}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(f.descAr, f.descEn)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      {!isAuth && (
        <section className="py-16" style={{ background: GRAD_CTA }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-black text-white mb-2">{t("انضم إلى منظومة الشراكة المجتمعية", "Join the Community Partnership Ecosystem")}</h2>
            <p className="text-white/70 mb-6 text-sm">
              {t("سواء كنت فرداً أو جهةً خارجية — المنصة توفر كل الأدوات للمشاركة الفاعلة", "Whether you're an individual or an external entity — the platform provides all the tools for active participation")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="rounded-xl bg-white px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90" style={{ color: GREEN_DARK }}>
                {t("تسجيل الدخول", "Sign In")}
              </Link>
              <Link href="/register" className="rounded-xl border-2 border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                {t("إنشاء حساب", "Create Account")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="text-gray-400" style={{ background: GRAD_FOOTER }} id="contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl font-black text-lg text-white" style={{ backgroundColor: GREEN_DARK }}>QU</div>
                <div>
                  <p className="font-bold text-white text-sm">{t("منصة الشراكة المجتمعية", "Community Partnership Platform")}</p>
                  <p className="text-xs text-gray-500">{t("جامعة القصيم", "Qassim University")}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                {t(
                  "منصة رقمية متكاملة تُمكّن جامعة القصيم من إدارة برامجها المجتمعية وشراكاتها الاستراتيجية لتحقيق مستهدفات رؤية 2030.",
                  "An integrated digital platform enabling Qassim University to manage its community programs and strategic partnerships to achieve Saudi Vision 2030 targets.",
                )}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">{t("روابط سريعة", "Quick Links")}</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: t("الرئيسية", "Home"), href: "/" },
                  { label: t("البرامج والمبادرات", "Programs & Initiatives"), href: "/login" },
                  { label: t("الفعاليات", "Events"), href: "/login" },
                  { label: t("الاستشارات", "Consultations"), href: "/login" },
                  { label: t("الشراكات", "Partnerships"), href: "/login" },
                  { label: t("إنشاء حساب", "Create Account"), href: "/register" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">{t("تواصل معنا", "Contact Us")}</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2"><MapPin className="size-4 shrink-0 mt-0.5" /><span>{t("المملكة العربية السعودية — بريدة، منطقة القصيم", "Saudi Arabia — Buraidah, Qassim Region")}</span></li>
                <li className="flex items-center gap-2"><Phone className="size-4 shrink-0" /><span dir="ltr"></span></li>
                <li className="flex items-center gap-2"><Mail className="size-4 shrink-0" /><span>cpd@qu.edu.sa</span></li>
                <li className="flex items-center gap-2"><Globe className="size-4 shrink-0" />
                  <a href="https://www.qu.edu.sa" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">www.qu.edu.sa</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} {t("جامعة القصيم — جميع الحقوق محفوظة", "Qassim University — All Rights Reserved")}</p>
            <div className="flex gap-4">
              <Link href="/terms#privacy" className="hover:text-gray-400 transition-colors">{t("سياسة الخصوصية", "Privacy Policy")}</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">{t("شروط الاستخدام", "Terms of Use")}</Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">{t("إمكانية الوصول", "Accessibility")}</Link>
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

function SectionDivider() {
  return (
    <div className="relative h-px w-full bg-black/10">
      <span
        className="absolute start-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white"
        style={{ backgroundColor: GREEN_MID }}
      />
    </div>
  )
}

function EmptyPlaceholder({ small = false, isRTL = true }: { small?: boolean; isRTL?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 ${small ? "py-8" : "py-12"}`}>
      <Inbox className="size-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{isRTL ? "لا توجد بيانات حالياً" : "No data available"}</p>
    </div>
  )
}
