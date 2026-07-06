import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getUserProfile, getLeaderboard } from "@/core/gamification/actions"
import { Star, Clock, Rocket, Medal, Award } from "lucide-react"

export const metadata = { title: "ملفي الشخصي" }

const USER_TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  SYSTEM_ADMIN: { ar: "مدير النظام", en: "System Admin" },
  COMMUNITY_MANAGER: { ar: "مدير المسؤولية المجتمعية", en: "Community Manager" },
  COMMUNITY_EMPLOYEE: { ar: "موظف المسؤولية المجتمعية", en: "Community Employee" },
  COLLEGE_DEAN: { ar: "عميد الكلية", en: "College Dean" },
  DEPARTMENT_HEAD: { ar: "رئيس القسم", en: "Department Head" },
  FACULTY_MEMBER: { ar: "عضو هيئة التدريس", en: "Faculty Member" },
  STUDENT: { ar: "طالب", en: "Student" },
  EXTERNAL_ENTITY: { ar: "جهة خارجية", en: "External Entity" },
  VOLUNTEER: { ar: "متطوع", en: "Volunteer" },
  VISITOR: { ar: "زائر", en: "Visitor" },
}

const POINTS_TYPE_LABEL: Record<string, string> = {
  INITIATIVE_CREATED: "إنشاء مبادرة",
  INITIATIVE_APPROVED: "اعتماد مبادرة",
  PROJECT_CREATED: "إنشاء مشروع",
  PROJECT_COMPLETED: "إتمام مشروع",
  PARTNERSHIP_CREATED: "إنشاء شراكة",
  VOLUNTEER_HOUR: "ساعة تطوع",
  VOLUNTEER_APPLICATION: "طلب تطوع",
  GENERAL: "نشاط عام",
}

function PointsLevelBadge({ points, isRTL }: { points: number; isRTL: boolean }) {
  const levels = [
    { min: 0, label: isRTL ? "مبتدئ" : "Beginner", color: "bg-slate-100 text-slate-700", icon: "🌱" },
    { min: 50, label: isRTL ? "نشط" : "Active", color: "bg-blue-100 text-blue-700", icon: "⭐" },
    { min: 150, label: isRTL ? "متقدم" : "Advanced", color: "bg-purple-100 text-purple-700", icon: "🌟" },
    { min: 300, label: isRTL ? "خبير" : "Expert", color: "bg-amber-100 text-amber-700", icon: "🏆" },
    { min: 600, label: isRTL ? "بطل" : "Champion", color: "bg-emerald-100 text-emerald-700", icon: "👑" },
  ]
  const level = [...levels].reverse().find(l => points >= l.min) ?? levels[0]!
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${level.color}`}>
      <span>{level.icon}</span>
      <span>{level.label}</span>
    </span>
  )
}

async function ProfileContent({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const [profile, leaderboard] = await Promise.all([
    getUserProfile(session.user.id),
    getLeaderboard(10),
  ])

  if (!profile) redirect("/login")

  const roleLabel = USER_TYPE_LABEL[profile.userType] ?? { ar: profile.userType, en: profile.userType }

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Profile Hero */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-l from-primary/30 via-primary/10 to-transparent" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground text-2xl font-bold shadow-md">
              {(isRTL ? profile.nameAr : profile.name)?.charAt(0) ?? profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="pb-2 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                {isRTL ? (profile.nameAr ?? profile.name) : (profile.name ?? profile.nameAr)}
              </h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? roleLabel.ar : roleLabel.en}</p>
            </div>
            <div className="ms-auto pb-2 shrink-0">
              <PointsLevelBadge points={profile.totalPoints} isRTL={isRTL} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t("نقاط المجتمع", "Community Points"), value: new Intl.NumberFormat(locale).format(profile.totalPoints), Icon: Star, color: "text-amber-500" },
          { label: t("ساعات التطوع", "Volunteer Hours"), value: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(profile.volunteerHours), Icon: Clock, color: "text-green-500" },
          { label: t("المبادرات", "Initiatives"), value: profile.initiativesCount, Icon: Rocket, color: "text-blue-500" },
          { label: t("الشارات", "Badges"), value: profile.badges.length, Icon: Medal, color: "text-purple-500" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <s.Icon className={`size-7 mx-auto mb-1 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-4">
              <h2 className="font-semibold text-foreground">{t("الشارات والإنجازات", "Badges & Achievements")}</h2>
            </div>
            <div className="p-4">
              {profile.badges.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  {t("لا توجد شارات بعد — شارك في الأنشطة لكسب الشارات", "No badges yet — participate in activities to earn badges")}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {profile.badges.map(b => (
                    <div key={b.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Award className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{isRTL ? b.nameAr : (b.nameEn ?? b.nameAr)}</p>
                        <p className="text-xs text-muted-foreground">{b.earnedAt.toLocaleDateString(locale)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-4">
              <h2 className="font-semibold text-foreground">{t("النشاط الأخير", "Recent Activity")}</h2>
            </div>
            <div className="divide-y">
              {profile.recentTransactions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("لا توجد نشاطات مسجّلة بعد", "No activities recorded yet")}
                </p>
              ) : (
                profile.recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Star className="size-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {tx.descriptionAr ?? POINTS_TYPE_LABEL[tx.type] ?? tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.createdAt.toLocaleDateString(locale)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      +{tx.points}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Leaderboard */}
        <div className="rounded-xl border bg-card shadow-sm self-start">
          <div className="border-b p-4">
            <h2 className="font-semibold text-foreground">{t("لوحة المتصدّرين", "Leaderboard")}</h2>
          </div>
          <div className="divide-y">
            {leaderboard.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t("لا توجد بيانات بعد", "No data yet")}
              </p>
            ) : (
              leaderboard.map(entry => {
                const isMe = entry.userId === profile.userId
                const medalIcon = entry.rank === 1 ? "1" : entry.rank === 2 ? "2" : entry.rank === 3 ? "3" : `${entry.rank}`
                const medalColor = entry.rank === 1 ? "text-amber-500" : entry.rank === 2 ? "text-slate-400" : entry.rank === 3 ? "text-amber-700" : "text-muted-foreground"
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? "bg-primary/5 border-s-2 border-primary" : "hover:bg-muted/30"}`}
                  >
                    <span className={`text-xs font-bold w-5 text-center shrink-0 ${medalColor}`}>{medalIcon}</span>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {(isRTL ? entry.nameAr : entry.name)?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                        {isRTL ? (entry.nameAr ?? entry.name) : (entry.name ?? entry.nameAr)}
                        {isMe && ` (${t("أنت", "You")})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {USER_TYPE_LABEL[entry.userType]?.[isRTL ? "ar" : "en"] ?? entry.userType}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-amber-600">
                      {new Intl.NumberFormat(locale).format(entry.totalPoints)} {t("نقطة", "pts")}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ProfilePage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-40 rounded-2xl bg-muted" /></div>}>
      <ProfileContent locale={locale} />
    </Suspense>
  )
}
