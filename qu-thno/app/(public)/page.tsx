import Link from "next/link"
import { auth } from "@/core/auth/auth"
import { getLocale } from "next-intl/server"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { PublicFooter } from "@/shared/components/layout/public-footer"
import { PrototypeBanner } from "@/shared/components/layout/prototype-banner"
import { HeroTagline } from "@/shared/components/ui/hero-tagline"
import { Reveal } from "@/shared/components/ui/reveal"
import { AnimatedCounter } from "@/shared/components/ui/animated-counter"
import { ScrollParallax } from "@/shared/components/ui/scroll-parallax"
import {
  getPublicStats,
  getFeaturedInitiatives,
  getFeaturedProjects,
  getLatestNews,
  getUpcomingEvents,
  getActivePartners,
} from "@/core/public/actions"
import {
  BRAND_PRIMARY_DARK, BRAND_PRIMARY, BRAND_ACCENT, BRAND_ACCENT_LIGHT,
  GRAD_HERO, GRAD_WHITE_TO_SOFT, GRAD_SOFT_TO_TINT, GRAD_TINT_TO_WHITE, GRAD_CTA,
  PLATFORM_NAME_AR, PLATFORM_NAME_EN,
} from "@/shared/lib/brand"
import {
  Users, Rocket, Calendar, Handshake, Sparkles,
  GraduationCap, MapPin, Newspaper, Inbox,
  Building2, Building, Heart, Clock, ArrowLeft,
  Landmark, HeartHandshake, BookOpen,
  Compass, ListChecks, LogIn, ClipboardCheck,
} from "lucide-react"

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
  const fmtTime = (d: Date) =>
    new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(d))

  const [stats, initiatives, projects, news, events, partners] = await Promise.all([
    getPublicStats(),
    getFeaturedInitiatives(),
    getFeaturedProjects(),
    getLatestNews(),
    getUpcomingEvents(),
    getActivePartners(),
  ])

  const nf = (n: number) => n.toLocaleString(isRTL ? "ar-SA" : "en-US")

  const SERVICE_PATHS = [
    {
      Icon: Rocket,
      titleAr: "استكشاف البرامج والمبادرات", titleEn: "Explore Programs & Initiatives",
      descAr: "تصفّح المبادرات والمشاريع المجتمعية الجارية والمكتملة", descEn: "Browse ongoing and completed community initiatives and projects",
      href: "/programs",
      color: BRAND_PRIMARY_DARK,
      bg: "#eaf5ee",
      statAr: `${nf(stats.initiatives + stats.projects)} مبادرة ومشروع`,
      statEn: `${nf(stats.initiatives + stats.projects)} initiatives & projects`,
    },
    {
      Icon: Calendar,
      titleAr: "حضور الفعاليات", titleEn: "Attend Events",
      descAr: "اطّلع على الفعاليات القادمة وسجّل حضورك", descEn: "See upcoming events and register to attend",
      href: "/events",
      color: BRAND_ACCENT,
      bg: "#e3faf0",
      statAr: `${nf(stats.events)} فعالية قادمة`,
      statEn: `${nf(stats.events)} upcoming events`,
    },
    {
      Icon: GraduationCap,
      titleAr: "طلب استشارة", titleEn: "Request a Consultation",
      descAr: "تواصل مع عضو هيئة تدريس مختص لطلب استشارة", descEn: "Reach a specialized faculty member to request a consultation",
      href: "/consultation-info",
      color: BRAND_PRIMARY_DARK,
      bg: "#eaf5ee",
      statAr: `${nf(stats.faculty)} عضو هيئة تدريس متاح`,
      statEn: `${nf(stats.faculty)} faculty members available`,
    },
    {
      Icon: Handshake,
      titleAr: "التعرّف على فرص الشراكة", titleEn: "Discover Partnership Opportunities",
      descAr: "تعرّف على آلية بناء شراكة مؤسسية مع الجامعة", descEn: "Learn how to build an institutional partnership with the university",
      href: "/partners",
      color: BRAND_ACCENT,
      bg: "#e3faf0",
      statAr: `${nf(stats.partners)} شريك مجتمعي`,
      statEn: `${nf(stats.partners)} community partners`,
    },
  ]

  const AUDIENCES = [
    {
      Icon: Landmark,
      titleAr: "الجهات الحكومية والخاصة", titleEn: "Government & Private Entities",
      descAr: "ابنِ شراكة مؤسسية مع الجامعة تخدم أهداف التنمية المستدامة ورؤية 2030", descEn: "Build an institutional partnership with the university supporting the SDGs and Vision 2030",
      actionAr: "استكشف الشراكة", actionEn: "Explore Partnership",
      href: "/partners",
    },
    {
      Icon: HeartHandshake,
      titleAr: "الجمعيات والجهات غير الربحية", titleEn: "NGOs & Non-Profits",
      descAr: "انضم كشريك مجتمعي ضمن منظومة شراكات الجامعة الفاعلة", descEn: "Join as a community partner within the university's active partnership network",
      actionAr: "تعرّف على الشركاء", actionEn: "Meet Our Partners",
      href: "/partners",
    },
    {
      Icon: BookOpen,
      titleAr: "أعضاء هيئة التدريس والباحثون", titleEn: "Faculty & Researchers",
      descAr: "قدّم استشارة متخصصة أو أشرف على مبادرة مجتمعية من واقع تخصصك", descEn: "Offer specialized consultations or supervise a community initiative in your field",
      actionAr: "تعرّف على الاستشارات", actionEn: "View Consultations",
      href: "/consultation-info",
    },
    {
      Icon: GraduationCap,
      titleAr: "الطلاب والمجتمع الجامعي", titleEn: "Students & the University Community",
      descAr: "تصفّح المبادرات والمشاريع المجتمعية وكن جزءًا من أثرها", descEn: "Browse community initiatives and projects and be part of their impact",
      actionAr: "استكشف البرامج", actionEn: "Explore Programs",
      href: "/programs",
    },
  ]

  const HOW_IT_WORKS = [
    {
      Icon: Compass,
      titleAr: "تصفّح الخدمات والبرامج", titleEn: "Browse Services & Programs",
      descAr: "استعرض المبادرات والمشاريع والفعاليات وفرص الشراكة المتاحة على المنصة", descEn: "Explore the initiatives, projects, events, and partnership opportunities on the platform",
    },
    {
      Icon: ListChecks,
      titleAr: "حدّد ما يناسبك", titleEn: "Choose What Fits You",
      descAr: "اختر البرنامج أو نوع الشراكة أو الاستشارة الأقرب لاحتياجك", descEn: "Pick the program, partnership type, or consultation closest to your need",
    },
    {
      Icon: LogIn,
      titleAr: "سجّل أو تواصل", titleEn: "Register or Reach Out",
      descAr: "أنشئ حسابًا أو سجّل دخولك لتقديم طلبك أو التواصل مع الجهة المعنية", descEn: "Create an account or sign in to submit your request or reach the relevant team",
    },
    {
      Icon: ClipboardCheck,
      titleAr: "تابع طلبك", titleEn: "Track Your Request",
      descAr: "تابع حالة طلبك وتحديثاته من خلال حسابك على المنصة", descEn: "Track your request's status and updates from your account on the platform",
    },
  ]

  const STATS_BAR_ITEMS = [
    { Icon: Users, value: stats.users, label: t("مستخدم مسجَّل", "Registered users") },
    { Icon: Handshake, value: stats.partners, label: t("شريك مجتمعي", "Community partners") },
    { Icon: Rocket, value: stats.initiatives, label: t("مبادرة مجتمعية", "Community initiatives") },
    { Icon: Calendar, value: stats.events, label: t("فعالية قادمة", "Upcoming events") },
    { Icon: HeartHandshake, value: stats.partnerships, label: t("شراكة فعّالة", "Active partnerships") },
    { Icon: Sparkles, value: stats.beneficiaries, label: t("مستفيد مستهدف", "Targeted beneficiaries") },
  ]

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner isRTL={isRTL} />
      <PublicHeader isRTL={isRTL} isAuth={isAuth} userName={session?.user?.nameAr ?? session?.user?.name ?? undefined} />

      {/* ══════════════════════════ HERO — two columns ══════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: GRAD_HERO }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          {/* Text column — first in reading order on mobile too */}
          <div className="hero-enter text-center lg:text-start">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_ACCENT }} />
              <span className="text-sm text-white/80">{t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)} — {t("جامعة القصيم", "Qassim University")}</span>
            </div>

            <HeroTagline isRTL={isRTL} />

            <p className="mb-8 text-base sm:text-lg text-white/75 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t(
                "برامج ومبادرات واستشارات تربط خبرات جامعة القصيم باحتياجات المجتمع، وتفتح آفاقًا للمشاركة والشراكة.",
                "Programs, initiatives, and consultations that connect Qassim University's expertise with community needs, opening horizons for participation and partnership.",
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/programs"
                className="ease-apple rounded-xl bg-white px-7 py-3 text-base font-semibold shadow-apple transition-all duration-300 hover:bg-gray-50 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0"
                style={{ color: BRAND_PRIMARY_DARK }}
              >
                {t("استكشف البرامج", "Explore Programs")}
              </Link>
              <Link
                href="/partners"
                className="ease-apple rounded-xl border-2 border-white/40 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0"
              >
                {t("تعرّف على خدمات الشراكة", "Learn About Partnership Services")}
              </Link>
            </div>
          </div>

          {/* Visual column — abstract composition standing in for real photography.
              TODO(content): replace with a licensed photo of the university/its
              community activities once one is available; do not fabricate a
              photorealistic image implying documented activity that didn't happen. */}
          <ScrollParallax
            factor={0.1}
            maxOffset={28}
            className="relative order-first mx-auto hidden aspect-square w-full max-w-md lg:order-last lg:block"
          >
            <HeroGraphic />
          </ScrollParallax>
        </div>

        {/* Stats bar — real live counts. Scrolls continuously toward the
            left (paused on hover/focus, disabled under
            prefers-reduced-motion); as a card exits on the left, the loop
            brings the next one in from the right — see .stats-marquee /
            .stats-marquee-track in globals.css. Each number also counts up
            the first time it scrolls into view. Stands in for the old
            separate "أرقام من المنصة" section further down the page
            (removed to avoid showing the same numbers twice). The card
            list is duplicated once so the loop is seamless. */}
        <div
          className="relative z-10 border-t border-white/10 py-6"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.24))" }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden" style={{ backgroundColor: BRAND_ACCENT_LIGHT }} />
              <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: BRAND_ACCENT_LIGHT }} />
            </span>
            <span className="text-xs font-semibold tracking-wide text-white/70">
              {t("أرقام حيّة من المنصة", "Live numbers from the platform")}
            </span>
          </div>

          <div className="stats-marquee">
            <div className="stats-marquee-track gap-4 px-4 sm:px-6">
              {[...STATS_BAR_ITEMS, ...STATS_BAR_ITEMS].map((s, i) => {
                const accent = [BRAND_ACCENT_LIGHT, "#ffffff", BRAND_ACCENT][i % 3]!
                return (
                  <div
                    key={`${s.label}-${i}`}
                    className={`ease-apple group relative flex w-[180px] shrink-0 flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] px-4 pb-4 pt-5 text-start backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 ${i >= STATS_BAR_ITEMS.length ? "stats-dup" : ""}`}
                    aria-hidden={i >= STATS_BAR_ITEMS.length}
                  >
                    <span className="absolute inset-x-0 top-0 h-[3px] opacity-80 transition-opacity group-hover:opacity-100" style={{ backgroundColor: accent }} />
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl ease-apple transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${accent}26` }}>
                      <s.Icon className="size-5" style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white tabular-nums leading-tight">
                        <AnimatedCounter value={s.value} locale={isRTL ? "ar-SA" : "en-US"} durationMs={2200} />
                      </p>
                      <p className="mt-0.5 text-xs text-white/65 whitespace-nowrap">{s.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ HOW CAN WE SERVE YOU ══════════════════════════ */}
      <section className="py-16" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("ابدأ من هنا", "Start Here")}
            title={t("كيف يمكننا خدمتك؟", "How Can We Serve You?")}
            sub={t("أربعة مسارات رئيسية للتفاعل مع المنصة", "Four main paths to engage with the platform")}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_PATHS.map((s, i) => (
              <Reveal key={s.href} delay={i * 0.08}>
                <Link
                  href={s.href}
                  className="ease-apple group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-apple active:scale-[0.98] active:translate-y-0"
                >
                  <div className="h-1 w-full" style={{ backgroundColor: s.color }} />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex size-12 items-center justify-center rounded-xl ease-apple transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: s.bg }}
                      >
                        <s.Icon className="size-6" style={{ color: s.color }} />
                      </div>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {t(s.statAr, s.statEn)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{t(s.titleAr, s.titleEn)}</h3>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t(s.descAr, s.descEn)}</p>
                    </div>
                    <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-gray-700">
                      {t("ابدأ", "Start")}
                      <ArrowLeft className="size-3.5 rtl:rotate-0 -rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TARGET AUDIENCE ══════════════════════════ */}
      <section className="py-16" style={{ background: GRAD_SOFT_TO_TINT }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("لمن هذه المنصة؟", "Who Is This Platform For?")}
            title={t("المنصة صُممت لخدمتكم", "Designed to Serve You")}
            sub={t(
              "تجمع المنصة الفئات المعنية بالشراكة المجتمعية تحت تجربة رقمية موحدة",
              "The platform brings everyone involved in community partnership together in one unified digital experience",
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.href} delay={i * 0.08}>
                <Link
                  href={a.href}
                  className="ease-apple group flex h-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-apple active:scale-[0.98] active:translate-y-0"
                >
                  <div
                    className="flex size-12 items-center justify-center rounded-xl ease-apple transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "#eaf5ee" }}
                  >
                    <a.Icon className="size-6" style={{ color: BRAND_PRIMARY_DARK }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{t(a.titleAr, a.titleEn)}</h3>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t(a.descAr, a.descEn)}</p>
                  </div>
                  <span className="mt-auto flex items-center gap-1 text-xs font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
                    {t(a.actionAr, a.actionEn)}
                    <ArrowLeft className="size-3.5 rtl:rotate-0 -rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ HOW THE PLATFORM WORKS ══════════════════════════ */}
      <section className="py-16" style={{ background: GRAD_TINT_TO_WHITE }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeader
            tag={t("آلية العمل", "How It Works")}
            title={t("كيف تعمل المنصة؟", "How Does the Platform Work?")}
            sub={t("أربع خطوات بسيطة من التصفح إلى متابعة طلبك", "Four simple steps from browsing to tracking your request")}
          />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute top-6 hidden h-px w-full bg-gray-200 lg:block" aria-hidden="true" />
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.titleAr} delay={i * 0.1}>
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div
                    className="relative z-10 flex size-12 items-center justify-center rounded-full text-white font-black"
                    style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                  >
                    <step.Icon className="size-5" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: BRAND_ACCENT }}>{t(`الخطوة ${nf(i + 1)}`, `Step ${i + 1}`)}</span>
                  <h3 className="font-bold text-gray-900 text-sm">{t(step.titleAr, step.titleEn)}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{t(step.descAr, step.descEn)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ ABOUT — trimmed to one paragraph ══════════════════════════ */}
      <section className="py-14 scroll-mt-28" style={{ background: GRAD_SOFT_TO_TINT }} id="about">
        <Reveal className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span
            className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: BRAND_PRIMARY_DARK }}
          >
            {t("من نحن", "About Us")}
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {t("جسرٌ بين الجامعة والمجتمع", "A Bridge Between the University and Community")}
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {t(
              "تربط منصة الشراكة المجتمعية جامعة القصيم بمحيطها من خلال مبادرات ومشاريع مجتمعية وشراكات استراتيجية مع الجهات الحكومية والخاصة، إسهامًا في تحقيق أهداف التنمية المستدامة ومستهدفات رؤية 2030.",
              "The Community Partnership Platform connects Qassim University with its surroundings through community initiatives, projects, and strategic partnerships with government and private entities, contributing to the Sustainable Development Goals and Saudi Vision 2030.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/programs"
              className="ease-apple rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              {t("استكشف البرامج", "Explore Programs")}
            </Link>
            <Link
              href="/register"
              className="ease-apple rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:text-white hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0"
              style={{ borderColor: BRAND_PRIMARY_DARK, color: BRAND_PRIMARY_DARK }}
            >
              {t("سجّل جهتك", "Register Your Organization")}
            </Link>
          </div>
        </Reveal>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ PROGRAMS: INITIATIVES + PROJECTS ══════════════════════════ */}
      <section className="py-20 scroll-mt-28" style={{ background: GRAD_TINT_TO_WHITE }} id="programs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("البرامج والمبادرات", "Programs & Initiatives")}
            title={t("أبرز برامجنا المجتمعية", "Our Leading Community Programs")}
            sub={t(
              "مبادرات ومشاريع تُجسّد التزام جامعة القصيم بخدمة المجتمع وتحقيق التنمية المستدامة",
              "Initiatives and projects reflecting Qassim University's commitment to community service and sustainable development",
            )}
          />

          {/* Initiatives */}
          {initiatives.length === 0 ? (
            <EmptyPlaceholder isRTL={isRTL} />
          ) : initiatives.length === 1 ? (
            <FeaturedSingleCard item={initiatives[0]!} isRTL={isRTL} bi={bi} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((init) => (
                <div key={init.id} className="ease-apple group flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-apple hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 w-full" style={{ backgroundColor: BRAND_PRIMARY }} />
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
                    {init.targetBeneficiaries != null && (
                      <div className="mt-auto flex items-center gap-1 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <Users className="size-3" />{nf(init.targetBeneficiaries)} {t("مستفيد مستهدف", "targeted beneficiaries")}
                      </div>
                    )}
                  </div>
                  <div className="border-t px-5 py-3">
                    <Link href={`/login?callbackUrl=/initiatives`} className="text-xs font-semibold transition-colors" style={{ color: BRAND_PRIMARY_DARK }}>
                      {t("عرض التفاصيل (يتطلب دخول) ←", "View Details (sign-in required) →")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects — lighter sub-header, same section to avoid repeating a full header block */}
          {projects.length > 0 && (
            <div className="mt-14">
              <h3 className="mb-5 text-lg font-bold text-gray-900">{t("مشاريع مجتمعية جارية", "Ongoing Community Projects")}</h3>
              {projects.length === 1 ? (
                <FeaturedSingleCard item={projects[0]!} isRTL={isRTL} bi={bi} isProject fmt={fmt} />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p) => (
                    <div key={p.id} className="ease-apple flex flex-col rounded-2xl border border-gray-200 bg-white hover:shadow-apple hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      <div className="h-1.5" style={{ backgroundColor: BRAND_ACCENT }} />
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
                        <Link href="/login?callbackUrl=/projects" className="text-xs font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>{t("عرض التفاصيل (يتطلب دخول) ←", "View Details (sign-in required) →")}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/programs" className="ease-apple inline-flex items-center gap-2 rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:text-white hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0" style={{ borderColor: BRAND_PRIMARY_DARK, color: BRAND_PRIMARY_DARK }}>
              {t("عرض جميع البرامج", "View All Programs")}
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ EVENTS ══════════════════════════ */}
      <section className="py-20 scroll-mt-28" style={{ background: GRAD_WHITE_TO_SOFT }} id="events">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeader
            tag={t("الفعاليات", "Events")}
            title={t("الفعاليات القادمة", "Upcoming Events")}
            sub={t("لا تفوّت أبرز فعاليات الشراكة المجتمعية", "Don't miss the top community partnership events")}
          />
          {events.length === 0 ? <EmptyPlaceholder isRTL={isRTL} /> : (
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((ev) => {
                const d = new Date(ev.startDate)
                const spotsLeft = ev.capacity ? ev.capacity - ev.registrations : null
                return (
                  <div key={ev.id} className="ease-apple flex gap-4 rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-apple hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl text-white text-center" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
                      <span className="text-lg font-black leading-none">{d.getDate()}</span>
                      <span className="text-[10px] leading-none mt-0.5 opacity-80">
                        {d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { month: "short", year: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{bi(ev.titleAr, ev.titleEn)}</h4>
                      <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="size-3 shrink-0" />{fmt(ev.startDate)} — {fmtTime(ev.startDate)}
                      </p>
                      {ev.locationAr && <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin className="size-3 shrink-0" />{ev.locationAr}</p>}
                      {spotsLeft !== null && (
                        <p className="text-xs mt-1.5 font-medium" style={{ color: spotsLeft > 0 ? BRAND_PRIMARY_DARK : "#b91c1c" }}>
                          {spotsLeft > 0 ? t(`${nf(spotsLeft)} مقعد متاح`, `${nf(spotsLeft)} seats available`) : t("اكتملت المقاعد", "Fully booked")}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/events" className="text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>{t("عرض جميع الفعاليات ←", "View All Events →")}</Link>
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-700">{t("تقديم طلب فعالية (للجهات الخارجية)", "Submit an Event Request (External Entities)")}</Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ PARTNERS ══════════════════════════ */}
      <section className="py-20 scroll-mt-28" style={{ background: GRAD_TINT_TO_WHITE }} id="partners">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            tag={t("الشراكات", "Partnerships")}
            title={t("شركاء النجاح", "Partners of Success")}
            sub={t(
              "نفخر بشراكاتنا مع الجهات الحكومية والخاصة في تحقيق أهداف التنمية المستدامة",
              "We are proud of our partnerships with government and private entities in achieving the Sustainable Development Goals",
            )}
          />
          {partners.length === 0 ? <EmptyPlaceholder isRTL={isRTL} /> : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((p) => (
                <div key={p.id} className="ease-apple group flex min-w-[130px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-apple hover:-translate-y-1 transition-all duration-300">
                  <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#eaf5ee" }}>
                    {p.type === "GOVERNMENT" ? <Building2 className="size-5" style={{ color: BRAND_PRIMARY_DARK }} /> : p.type === "HEALTHCARE" ? <Heart className="size-5 text-rose-500" /> : p.type === "NGO" ? <Users className="size-5 text-blue-500" /> : <Building className="size-5 text-gray-500" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{bi(p.nameAr, p.nameEn)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/partners" className="text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>{t("عرض جميع الشركاء ←", "View All Partners →")}</Link>
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-700">{t("تقديم طلب شراكة", "Submit a Partnership Request")}</Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════ NEWS ══════════════════════════ */}
      <section className="py-20" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeader
            tag={t("الأخبار", "News")}
            title={t("أحدث الأخبار", "Latest News")}
            sub={t("تابع آخر إنجازات ومستجدات المنصة", "Follow the platform's latest achievements and updates")}
          />
          {news.length === 0 ? <EmptyPlaceholder isRTL={isRTL} /> : (
            <div className="space-y-3">
              {news.map((a) => (
                <div key={a.id} className="ease-apple flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-apple hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#eaf5ee" }}>
                    <Newspaper className="size-6" style={{ color: BRAND_PRIMARY_DARK }} />
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
        </div>
      </section>

      {/* ══════════════════════════ SHORT CTA ══════════════════════════ */}
      {!isAuth && (
        <section className="py-14" style={{ background: GRAD_CTA }}>
          <Reveal className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">{t("انضم إلى منظومة الشراكة المجتمعية", "Join the Community Partnership Ecosystem")}</h2>
            <p className="text-white/70 mb-6 text-sm">
              {t("سواء كنت فردًا أو جهةً خارجية، المنصة توفر أدوات المشاركة الفاعلة", "Whether you're an individual or an external entity, the platform provides tools for active participation")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="ease-apple rounded-xl bg-white px-7 py-3 text-sm font-bold transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0" style={{ color: BRAND_PRIMARY_DARK }}>
                {t("تسجيل الدخول", "Sign In")}
              </Link>
              <Link href="/register" className="ease-apple rounded-xl border-2 border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0">
                {t("إنشاء حساب", "Create Account")}
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      <PublicFooter isRTL={isRTL} />
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <Reveal className="mb-10 text-center">
      <span
        className="inline-block rounded-full px-4 py-1 text-xs font-semibold mb-3 text-white"
        style={{ backgroundColor: BRAND_PRIMARY_DARK }}
      >
        {tag}
      </span>
      <h2 className="font-black text-2xl sm:text-3xl text-gray-900">{title}</h2>
      <p className="mt-2 text-sm max-w-xl mx-auto leading-relaxed text-gray-500">{sub}</p>
    </Reveal>
  )
}

function SectionDivider() {
  return (
    <div className="relative h-px w-full bg-black/10">
      <span
        className="absolute start-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white"
        style={{ backgroundColor: BRAND_PRIMARY }}
      />
    </div>
  )
}

function EmptyPlaceholder({ isRTL = true }: { isRTL?: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 py-12">
      <Inbox className="size-8 mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{isRTL ? "لا توجد بيانات حالياً" : "No data available"}</p>
    </div>
  )
}

// A single item shouldn't be dropped into a 3-column grid with empty gaps —
// give it a featured layout that fills the space intentionally instead.
function FeaturedSingleCard({
  item, isRTL, bi, isProject = false, fmt,
}: {
  item: { id: string; titleAr: string; titleEn: string | null; descriptionAr: string | null; descriptionEn: string | null; status: string; startDate?: Date | null; targetBeneficiaries?: number | null }
  isRTL: boolean
  bi: (ar: string, en: string | null) => string
  isProject?: boolean
  fmt?: (d: Date | null | undefined) => string
}) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900">{bi(item.titleAr, item.titleEn)}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[item.status] ?? "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABEL[item.status]?.[isRTL ? "ar" : "en"] ?? item.status}
        </span>
      </div>
      {(item.descriptionAr || item.descriptionEn) && (
        <p className="text-sm text-gray-600 leading-relaxed">{bi(item.descriptionAr ?? "", item.descriptionEn)}</p>
      )}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        {item.targetBeneficiaries != null && (
          <span className="flex items-center gap-1"><Users className="size-3.5" />{item.targetBeneficiaries.toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("مستفيد مستهدف", "targeted beneficiaries")}</span>
        )}
        {isProject && item.startDate && fmt && (
          <span>{t("بدأ في:", "Started:")} {fmt(item.startDate)}</span>
        )}
      </div>
      <Link href={`/login?callbackUrl=${isProject ? "/projects" : "/initiatives"}`} className="mt-2 text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
        {t("عرض التفاصيل (يتطلب دخول) ←", "View Details (sign-in required) →")}
      </Link>
    </div>
  )
}

// Abstract geometric composition standing in for real photography — nodes
// and connecting lines suggesting collaboration/network, built from brand
// colors only. See TODO above for replacing it with a real photo.
function HeroGraphic() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <circle cx="200" cy="200" r="170" fill="rgba(255,255,255,0.05)" />
      <circle cx="200" cy="200" r="130" fill="rgba(255,255,255,0.06)" />
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
        <line x1="120" y1="150" x2="210" y2="110" />
        <line x1="210" y1="110" x2="290" y2="160" />
        <line x1="120" y1="150" x2="150" y2="250" />
        <line x1="210" y1="110" x2="230" y2="230" />
        <line x1="290" y1="160" x2="260" y2="270" />
        <line x1="150" y1="250" x2="230" y2="230" />
        <line x1="230" y1="230" x2="260" y2="270" />
      </g>
      {[
        { cx: 120, cy: 150, r: 10, fill: BRAND_ACCENT },
        { cx: 210, cy: 110, r: 14, fill: "#ffffff" },
        { cx: 290, cy: 160, r: 9, fill: BRAND_ACCENT },
        { cx: 150, cy: 250, r: 8, fill: "#ffffff" },
        { cx: 230, cy: 230, r: 16, fill: BRAND_ACCENT },
        { cx: 260, cy: 270, r: 10, fill: "#ffffff" },
      ].map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill={n.fill} opacity={0.9} />
      ))}
    </svg>
  )
}
