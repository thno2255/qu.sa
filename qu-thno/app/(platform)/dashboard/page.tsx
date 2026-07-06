import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { getMyPendingTasks } from "@/core/workflow/engine"
import { getUnreadCount } from "@/core/notifications/service"
import Link from "next/link"
import {
  Users, Activity, Lock, ClipboardList, Rocket, Handshake, FolderKanban,
  Timer, CheckCircle2, Inbox, MessageSquare, Building2, GraduationCap,
  AlertTriangle, Clock, Star, Trophy, Folder, FileText, TrendingUp,
  Heart, BarChart3, Sparkles, Bell, Settings, Globe, ChevronLeft, type LucideIcon,
} from "lucide-react"

export const metadata: Metadata = {
  title: "لوحة التحكم | Dashboard",
}

const ICONS: Record<string, LucideIcon> = {
  Users, Activity, Lock, ClipboardList, Rocket, Handshake, FolderKanban,
  Timer, CheckCircle2, Inbox, MessageSquare, Building2, GraduationCap,
  AlertTriangle, Clock, Star, Trophy, Folder, FileText, TrendingUp,
  Heart, BarChart3, Sparkles, Bell, Settings, Globe,
}

function KpiIcon({ name }: { name: string }) {
  const Icon = ICONS[name]
  return Icon ? <Icon className="size-6 shrink-0" /> : null
}

const ROLE_CONFIG: Record<
  string,
  {
    greetingAr: string
    greetingEn: string
    kpis: { ar: string; en: string; icon: string; color: string }[]
    quickLinksAr: { label: string; href: string; icon: string }[]
    quickLinksEn: { label: string; href: string; icon: string }[]
  }
> = {
  SYSTEM_ADMIN: {
    greetingAr: "لوحة تحكم مدير النظام",
    greetingEn: "System Administrator Dashboard",
    kpis: [
      { ar: "إجمالي المستخدمين", en: "Total Users", icon: "Users", color: "text-blue-600" },
      { ar: "النظام يعمل بكفاءة", en: "System Uptime", icon: "Activity", color: "text-green-600" },
      { ar: "أحداث الأمان", en: "Security Events", icon: "Lock", color: "text-yellow-600" },
      { ar: "طلبات التسجيل الجديدة", en: "New Registrations", icon: "ClipboardList", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "إدارة المستخدمين", href: "/settings/users", icon: "Users" },
      { label: "سجل الأمان", href: "/settings/general", icon: "Lock" },
      { label: "النظام والأداء", href: "/settings/general", icon: "Settings" },
    ],
    quickLinksEn: [
      { label: "User Management", href: "/settings/users", icon: "Users" },
      { label: "Security Log", href: "/settings/general", icon: "Lock" },
      { label: "System Health", href: "/settings/general", icon: "Settings" },
    ],
  },
  COMMUNITY_MANAGER: {
    greetingAr: "لوحة تحكم مدير المسؤولية المجتمعية",
    greetingEn: "Community Responsibility Manager Dashboard",
    kpis: [
      { ar: "المبادرات النشطة", en: "Active Initiatives", icon: "Rocket", color: "text-blue-600" },
      { ar: "الشراكات الفعالة", en: "Active Partnerships", icon: "Handshake", color: "text-green-600" },
      { ar: "المشاريع الجارية", en: "Ongoing Projects", icon: "FolderKanban", color: "text-yellow-600" },
      { ar: "طلبات قيد الانتظار", en: "Pending Requests", icon: "Timer", color: "text-red-600" },
    ],
    quickLinksAr: [
      { label: "المبادرات", href: "/initiatives", icon: "Rocket" },
      { label: "الشراكات", href: "/partnerships", icon: "Handshake" },
      { label: "التقارير", href: "/reports", icon: "BarChart3" },
    ],
    quickLinksEn: [
      { label: "Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "Partnerships", href: "/partnerships", icon: "Handshake" },
      { label: "Reports", href: "/reports", icon: "BarChart3" },
    ],
  },
  COMMUNITY_EMPLOYEE: {
    greetingAr: "لوحة تحكم موظف المسؤولية المجتمعية",
    greetingEn: "Community Responsibility Employee Dashboard",
    kpis: [
      { ar: "مهامي اليوم", en: "My Tasks Today", icon: "CheckCircle2", color: "text-blue-600" },
      { ar: "المبادرات تحت الإشراف", en: "Supervised Initiatives", icon: "Rocket", color: "text-green-600" },
      { ar: "الطلبات الجديدة", en: "New Requests", icon: "Inbox", color: "text-yellow-600" },
      { ar: "الرسائل غير المقروءة", en: "Unread Messages", icon: "MessageSquare", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "المبادرات", href: "/initiatives", icon: "Rocket" },
      { label: "المشاريع", href: "/projects", icon: "FolderKanban" },
      { label: "الإشعارات", href: "/notifications", icon: "Bell" },
    ],
    quickLinksEn: [
      { label: "Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "Projects", href: "/projects", icon: "FolderKanban" },
      { label: "Notifications", href: "/notifications", icon: "Bell" },
    ],
  },
  COLLEGE_DEAN: {
    greetingAr: "لوحة تحكم عميد الكلية",
    greetingEn: "College Dean Dashboard",
    kpis: [
      { ar: "مبادرات الكلية", en: "College Initiatives", icon: "Building2", color: "text-blue-600" },
      { ar: "أعضاء هيئة التدريس النشطون", en: "Active Faculty", icon: "GraduationCap", color: "text-green-600" },
      { ar: "طلبات الموافقة", en: "Approval Requests", icon: "ClipboardList", color: "text-yellow-600" },
      { ar: "ساعات التطوع في الكلية", en: "College Volunteer Hours", icon: "Clock", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "مبادرات الكلية", href: "/initiatives", icon: "Rocket" },
      { label: "الموافقات", href: "/workflows", icon: "CheckCircle2" },
      { label: "التقارير", href: "/reports", icon: "BarChart3" },
    ],
    quickLinksEn: [
      { label: "College Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "Approvals", href: "/workflows", icon: "CheckCircle2" },
      { label: "Reports", href: "/reports", icon: "BarChart3" },
    ],
  },
  DEPARTMENT_HEAD: {
    greetingAr: "لوحة تحكم رئيس القسم",
    greetingEn: "Department Head Dashboard",
    kpis: [
      { ar: "مبادرات القسم", en: "Dept. Initiatives", icon: "Folder", color: "text-blue-600" },
      { ar: "أعضاء النشطون", en: "Active Members", icon: "Users", color: "text-green-600" },
      { ar: "المهام المتأخرة", en: "Delayed Tasks", icon: "AlertTriangle", color: "text-red-600" },
      { ar: "ساعات التطوع", en: "Volunteer Hours", icon: "Clock", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "مبادراتي", href: "/initiatives", icon: "Rocket" },
      { label: "مشاريعي", href: "/projects", icon: "FolderKanban" },
      { label: "التطوع", href: "/volunteering", icon: "Heart" },
    ],
    quickLinksEn: [
      { label: "My Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "My Projects", href: "/projects", icon: "FolderKanban" },
      { label: "Volunteering", href: "/volunteering", icon: "Heart" },
    ],
  },
  FACULTY_MEMBER: {
    greetingAr: "لوحة تحكم عضو هيئة التدريس",
    greetingEn: "Faculty Member Dashboard",
    kpis: [
      { ar: "مبادراتي", en: "My Initiatives", icon: "Rocket", color: "text-blue-600" },
      { ar: "مشاريعي الجارية", en: "My Active Projects", icon: "FolderKanban", color: "text-green-600" },
      { ar: "ساعات التطوع", en: "Volunteer Hours", icon: "Clock", color: "text-yellow-600" },
      { ar: "نقاط المجتمع", en: "Community Points", icon: "Star", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "مبادراتي", href: "/initiatives", icon: "Rocket" },
      { label: "مشاريعي", href: "/projects", icon: "FolderKanban" },
      { label: "التأثير", href: "/impact", icon: "TrendingUp" },
    ],
    quickLinksEn: [
      { label: "My Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "My Projects", href: "/projects", icon: "FolderKanban" },
      { label: "Impact", href: "/impact", icon: "TrendingUp" },
    ],
  },
  STUDENT: {
    greetingAr: "لوحة تحكم الطالب",
    greetingEn: "Student Dashboard",
    kpis: [
      { ar: "ساعات التطوع", en: "Volunteer Hours", icon: "Clock", color: "text-blue-600" },
      { ar: "المبادرات المشارك بها", en: "Initiatives Joined", icon: "Rocket", color: "text-green-600" },
      { ar: "نقاط المجتمع", en: "Community Points", icon: "Star", color: "text-yellow-600" },
      { ar: "الشهادات المكتسبة", en: "Certificates Earned", icon: "Trophy", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "استكشف المبادرات", href: "/initiatives", icon: "Rocket" },
      { label: "التطوع", href: "/volunteering", icon: "Heart" },
      { label: "معرض إنجازاتي", href: "/profile", icon: "Trophy" },
    ],
    quickLinksEn: [
      { label: "Explore Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "Volunteering", href: "/volunteering", icon: "Heart" },
      { label: "My Portfolio", href: "/profile", icon: "Trophy" },
    ],
  },
  EXTERNAL_ENTITY: {
    greetingAr: "لوحة تحكم الجهة الخارجية",
    greetingEn: "External Entity Dashboard",
    kpis: [
      { ar: "الشراكات الفعالة", en: "Active Partnerships", icon: "Handshake", color: "text-blue-600" },
      { ar: "المبادرات المتاحة", en: "Available Initiatives", icon: "Rocket", color: "text-green-600" },
      { ar: "طلباتي المرسلة", en: "My Requests", icon: "Inbox", color: "text-yellow-600" },
      { ar: "الاتفاقيات النافذة", en: "Active Agreements", icon: "FileText", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "استعرض المبادرات", href: "/initiatives", icon: "Rocket" },
      { label: "الشراكات", href: "/partnerships", icon: "Handshake" },
      { label: "طلباتي", href: "/projects", icon: "ClipboardList" },
    ],
    quickLinksEn: [
      { label: "Browse Initiatives", href: "/initiatives", icon: "Rocket" },
      { label: "Partnerships", href: "/partnerships", icon: "Handshake" },
      { label: "My Requests", href: "/projects", icon: "ClipboardList" },
    ],
  },
  VOLUNTEER: {
    greetingAr: "لوحة تحكم المتطوع",
    greetingEn: "Volunteer Dashboard",
    kpis: [
      { ar: "إجمالي ساعات التطوع", en: "Total Volunteer Hours", icon: "Clock", color: "text-blue-600" },
      { ar: "الفرص المتاحة", en: "Open Opportunities", icon: "Sparkles", color: "text-green-600" },
      { ar: "نقاط المجتمع", en: "Community Points", icon: "Star", color: "text-yellow-600" },
      { ar: "الشهادات", en: "Certificates", icon: "Trophy", color: "text-purple-600" },
    ],
    quickLinksAr: [
      { label: "فرص التطوع", href: "/volunteering", icon: "Heart" },
      { label: "شهاداتي", href: "/profile", icon: "Trophy" },
      { label: "المبادرات", href: "/initiatives", icon: "Rocket" },
    ],
    quickLinksEn: [
      { label: "Volunteer Opportunities", href: "/volunteering", icon: "Heart" },
      { label: "My Certificates", href: "/profile", icon: "Trophy" },
      { label: "Initiatives", href: "/initiatives", icon: "Rocket" },
    ],
  },
}

const DEFAULT_CONFIG = {
  greetingAr: "لوحة التحكم",
  greetingEn: "Dashboard",
  kpis: [
    { ar: "المبادرات النشطة", en: "Active Initiatives", icon: "Rocket", color: "text-blue-600" },
    { ar: "المشاريع الجارية", en: "Ongoing Projects", icon: "FolderKanban", color: "text-green-600" },
    { ar: "المتطوعون النشطون", en: "Active Volunteers", icon: "Heart", color: "text-yellow-600" },
    { ar: "الشراكات الفعّالة", en: "Active Partnerships", icon: "Handshake", color: "text-purple-600" },
  ],
  quickLinksAr: [
    { label: "المبادرات", href: "/initiatives", icon: "Rocket" },
    { label: "المشاريع", href: "/projects", icon: "FolderKanban" },
    { label: "التطوع", href: "/volunteering", icon: "Heart" },
  ],
  quickLinksEn: [
    { label: "Initiatives", href: "/initiatives", icon: "Rocket" },
    { label: "Projects", href: "/projects", icon: "FolderKanban" },
    { label: "Volunteering", href: "/volunteering", icon: "Heart" },
  ],
}

export default async function DashboardPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const userName = isRTL
    ? (session?.user as { nameAr?: string })?.nameAr || session?.user?.name || ""
    : session?.user?.name || ""

  const config = ROLE_CONFIG[userType] ?? DEFAULT_CONFIG
  const quickLinks = isRTL ? config.quickLinksAr : config.quickLinksEn

  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const [myPendingTasks, unreadCount, initiativesCount, projectsCount, partnershipsCount, volOppsCount, volHours, totalUsersCount, pendingUsersCount] = await Promise.all([
    userId ? getMyPendingTasks(userType, userId) : Promise.resolve([]),
    userId ? getUnreadCount(userId) : Promise.resolve(0),
    db.initiative.count({ where: { status: { in: ["active", "completed"] } } }),
    db.project.count({ where: { status: { in: ["active", "pending"] } } }),
    db.partnership.count({ where: { status: "active" } }),
    db.volunteerOpportunity.count({ where: { status: "open" } }),
    userId ? db.volunteerProfile.findUnique({ where: { userId }, select: { totalHours: true } }) : Promise.resolve(null),
    db.user.count(),
    db.user.count({ where: { status: "PENDING" } }),
  ])

  const myInitiativesCount = userId ? await db.initiative.count({ where: { ownerId: userId } }) : 0
  const myProjectsCount = userId ? await db.project.count({ where: { managerId: userId, status: { in: ["active", "pending"] } } }) : 0

  const kpiValues: Record<string, number | string> = {
    "Active Initiatives": initiativesCount,
    "Active Partnerships": partnershipsCount,
    "Ongoing Projects": projectsCount,
    "Open Opportunities": volOppsCount,
    "My Initiatives": myInitiativesCount,
    "My Active Projects": myProjectsCount,
    "Volunteer Hours": volHours ? Number(volHours.totalHours).toFixed(1) : "0",
    "Total Volunteer Hours": volHours ? Number(volHours.totalHours).toFixed(1) : "0",
    "Available Initiatives": initiativesCount,
    "Total Users": totalUsersCount,
    "New Registrations": pendingUsersCount,
    "System Uptime": "99.9%",
    "Security Events": 0,
    "Supervised Initiatives": initiativesCount,
    "New Requests": pendingUsersCount,
    "Unread Messages": unreadCount,
    "Approval Requests": myPendingTasks.length,
    "College Initiatives": initiativesCount,
    "Active Faculty": 0,
    "College Volunteer Hours": volHours ? Number(volHours.totalHours).toFixed(1) : "0",
    "Dept. Initiatives": myInitiativesCount,
    "Active Members": 0,
    "Delayed Tasks": 0,
    "Community Points": 0,
    "Certificates Earned": 0,
    "Active Volunteers": 0,
    "My Requests": myInitiativesCount,
    "Active Agreements": partnershipsCount,
    "Initiatives Joined": 0,
    "My Tasks Today": myPendingTasks.length,
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {userName
              ? t(`أهلاً، ${userName} 👋`, `Welcome, ${userName} 👋`)
              : t(config.greetingAr, config.greetingEn)}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t(
              "نظرة عامة على نشاطك في منصة المسؤولية المجتمعية",
              "Overview of your activity in the Community Responsibility Platform",
            )}
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
          {new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Onboarding card — VISITOR only */}
      {userType === "VISITOR" && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-teal-50 p-6">
          <div className="pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-emerald-200/40" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-xl">
              🎉
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-emerald-900">
                {t("أهلاً وسهلاً في منصة المسؤولية المجتمعية!", "Welcome to the Community Responsibility Platform!")}
              </h2>
              <p className="mt-1 text-sm text-emerald-700">
                {t("ابدأ رحلتك من خلال هذه الخطوات البسيطة", "Get started with these simple steps")}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { step: "١", titleAr: "أكمل ملفك الشخصي", titleEn: "Complete your profile", href: "/profile", icon: "👤" },
                  { step: "٢", titleAr: "استكشف المبادرات",  titleEn: "Explore initiatives",    href: "/initiatives", icon: "🚀" },
                  { step: "٣", titleAr: "اطلب استشارة",      titleEn: "Request a consultation", href: "/consultations", icon: "💬" },
                ].map((s) => (
                  <Link key={s.step} href={s.href}
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all">
                    <span className="text-lg">{s.icon}</span>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-500">{t(`الخطوة ${s.step}`, `Step ${s.step}`)}</p>
                      <p className="text-xs font-bold text-gray-800">{isRTL ? s.titleAr : s.titleEn}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ماذا تريد اليوم؟ — Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t("ماذا تريد اليوم؟", "What would you like to do today?")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => {
            const LinkIcon = ICONS[link.icon]
            return (
              <Link key={link.href} href={link.href}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {LinkIcon && <LinkIcon className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{t("انقر للوصول", "Click to access")}</p>
                </div>
                <ChevronLeft className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {config.kpis.map((kpi) => (
          <div
            key={kpi.en}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {isRTL ? kpi.ar : kpi.en}
                </p>
                <p className={`text-2xl font-bold text-foreground ${kpi.color}`}>
                  {kpiValues[kpi.en] ?? "—"}
                </p>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ${kpi.color}`}>
                <KpiIcon name={kpi.icon} />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-primary/40" style={{ width: "0%" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick links + SDG row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity summary */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {t("ملخص النشاط", "Activity Summary")}
          </h3>
          <div className="space-y-3">
            {[
              { labelAr: "المبادرات النشطة",  labelEn: "Active Initiatives",   value: initiativesCount,   max: Math.max(initiativesCount, 10), color: "bg-blue-500" },
              { labelAr: "المشاريع الجارية",  labelEn: "Ongoing Projects",     value: projectsCount,     max: Math.max(projectsCount, 10),    color: "bg-violet-500" },
              { labelAr: "الشراكات الفعّالة", labelEn: "Active Partnerships",  value: partnershipsCount, max: Math.max(partnershipsCount, 10), color: "bg-emerald-500" },
              { labelAr: "فرص التطوع المفتوحة",labelEn: "Open Vol. Opportunities", value: volOppsCount, max: Math.max(volOppsCount, 10),    color: "bg-rose-500" },
            ].map((row) => (
              <div key={row.labelEn} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{isRTL ? row.labelAr : row.labelEn}</span>
                  <span className="font-semibold text-foreground">{row.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-2 rounded-full ${row.color} transition-all`}
                    style={{ width: `${Math.min((row.value / row.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SDG Goals card */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {t("أهداف التنمية المستدامة", "SDG Alignment")}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 4, 8, 10, 11, 16, 17].map((n) => (
              <div
                key={n}
                className="flex aspect-square items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground"
                title={`SDG ${n}`}
              >
                {n}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t(
              "المبادرات مرتبطة بأهداف التنمية المستدامة للأمم المتحدة",
              "Initiatives aligned with UN Sustainable Development Goals",
            )}
          </p>
        </div>
      </div>

      {/* Pending Approvals + Notifications */}
      {(myPendingTasks.length > 0 || unreadCount > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {myPendingTasks.length > 0 && (
            <Link
              href="/workflows"
              className="flex items-center gap-4 rounded-xl border bg-amber-50 border-amber-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Timer className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {myPendingTasks.length === 1
                    ? t("لديك طلب موافقة معلق", "You have 1 pending approval")
                    : t(`لديك ${myPendingTasks.length} طلبات موافقة معلقة`, `You have ${myPendingTasks.length} pending approvals`)}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {t("انقر للمراجعة والاتخاذ قرار", "Click to review and decide")}
                </p>
              </div>
            </Link>
          )}

          {unreadCount > 0 && (
            <Link
              href="/notifications"
              className="flex items-center gap-4 rounded-xl border bg-primary/5 border-primary/20 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {unreadCount === 1
                    ? t("إشعار جديد غير مقروء", "1 unread notification")
                    : t(`${unreadCount} إشعارات غير مقروءة`, `${unreadCount} unread notifications`)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("انقر لعرض الإشعارات", "Click to view notifications")}
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Phase completion notice */}
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-6 text-center">
        <h3 className="font-semibold text-green-900">
          {t("اكتملت جميع مراحل التطوير", "All Development Phases Complete")}
        </h3>
        <p className="mt-1 text-sm text-green-700">
          {t(
            "اكتملت جميع المراحل التسع للمنصة — من الأساسيات إلى الجوال والـ PWA وإمكانية الوصول.",
            "All 10 phases complete — from Foundation through Mobile, PWA & Accessibility.",
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            "0: Foundation", "1: IAM", "2: Workflow", "3: Core Modules",
            "4: AI + Search", "5: Impact", "6: Gamification", "7: CMS", "8: Analytics", "9: PWA + A11y",
          ].map((label) => (
            <span key={label} className="rounded-full border border-green-300 bg-green-100 px-3 py-1 text-green-700">
              ✓ {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
