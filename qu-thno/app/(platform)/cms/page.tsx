import Link from "next/link"
import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"
import { Newspaper, CheckCircle2, Calendar, Clock, type LucideIcon } from "lucide-react"

export const metadata = { title: "إدارة المحتوى" }

async function CMSDashboard({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const [newsTotal, newsPublished, eventTotal, eventUpcoming] = await Promise.all([
    db.newsArticle.count(),
    db.newsArticle.count({ where: { status: "published" } }),
    db.cMSEvent.count(),
    db.cMSEvent.count({ where: { status: "published", startDate: { gte: new Date() } } }),
  ])

  const recentNews = await db.newsArticle.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, titleAr: true, titleEn: true, status: true, createdAt: true },
  })

  const upcomingEvents = await db.cMSEvent.findMany({
    where: { startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 5,
    select: { id: true, titleAr: true, titleEn: true, status: true, startDate: true },
  })

  const statusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600",
  }
  const statusLabel: Record<string, string> = isRTL
    ? { draft: "مسودة", published: "منشور", archived: "مؤرشف" }
    : { draft: "Draft", published: "Published", archived: "Archived" }

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("إدارة المحتوى", "Content Management")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("إدارة الأخبار والفعاليات والصفحات", "Manage news, events, and pages")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { label: t("إجمالي الأخبار", "Total News"), value: newsTotal, Icon: Newspaper, color: "bg-blue-500/10 text-blue-600" },
          { label: t("أخبار منشورة", "Published"), value: newsPublished, Icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
          { label: t("الفعاليات", "Events"), value: eventTotal, Icon: Calendar, color: "bg-purple-500/10 text-purple-600" },
          { label: t("فعاليات قادمة", "Upcoming"), value: eventUpcoming, Icon: Clock, color: "bg-amber-500/10 text-amber-600" },
        ] as { label: string; value: number; Icon: LucideIcon; color: string }[]).map((s, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.Icon className="size-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          { href: "/cms/news", Icon: Newspaper, ar: "إدارة الأخبار", en: "Manage News", color: "border-blue-200 hover:border-blue-400" },
          { href: "/cms/events", Icon: Calendar, ar: "إدارة الفعاليات", en: "Manage Events", color: "border-purple-200 hover:border-purple-400" },
          { href: "/cms/pages", Icon: CheckCircle2, ar: "إدارة الصفحات", en: "Manage Pages", color: "border-emerald-200 hover:border-emerald-400" },
        ] as { href: string; Icon: LucideIcon; ar: string; en: string; color: string }[]).map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className={`group flex items-center gap-4 rounded-xl border-2 bg-card p-5 shadow-sm transition-all hover:shadow-md ${link.color}`}
          >
            <link.Icon className="size-7 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
              {isRTL ? link.ar : link.en}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent News */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">{t("أحدث الأخبار", "Recent News")}</h2>
            <Link href="/cms/news/new" className="text-xs text-primary hover:underline">
              + {t("مقال جديد", "New Article")}
            </Link>
          </div>
          <div className="divide-y">
            {recentNews.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t("لا توجد أخبار", "No news yet")}</p>
            )}
            {recentNews.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {isRTL ? a.titleAr : (a.titleEn ?? a.titleAr)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.createdAt.toLocaleDateString(locale)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabel[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">{t("الفعاليات القادمة", "Upcoming Events")}</h2>
            <Link href="/cms/events/new" className="text-xs text-primary hover:underline">
              + {t("فعالية جديدة", "New Event")}
            </Link>
          </div>
          <div className="divide-y">
            {upcomingEvents.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t("لا توجد فعاليات قادمة", "No upcoming events")}</p>
            )}
            {upcomingEvents.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {isRTL ? e.titleAr : (e.titleEn ?? e.titleAr)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.startDate.toLocaleDateString(locale)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[e.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabel[e.status] ?? e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function CMSPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-muted" /></div>}>
      <CMSDashboard locale={locale} />
    </Suspense>
  )
}
