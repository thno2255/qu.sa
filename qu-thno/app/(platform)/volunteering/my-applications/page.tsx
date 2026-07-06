import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { EmptyState } from "@/shared/components/ui/empty-state"

export const metadata: Metadata = { title: "طلباتي التطوعية | My Applications" }

export default async function MyApplicationsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  if (!session?.user?.id) redirect("/login")

  const [applications, profile, logs] = await Promise.all([
    db.volunteerApplication.findMany({
      where: { volunteerId: session.user.id },
      include: { opportunity: { select: { id: true, titleAr: true, titleEn: true, startDate: true, hoursRequired: true } } },
      orderBy: { appliedAt: "desc" },
    }),
    db.volunteerProfile.findUnique({ where: { userId: session.user.id } }),
    db.volunteerLog.findMany({
      where: { volunteerId: session.user.id },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ])

  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        titleAr="طلباتي التطوعية"
        titleEn="My Volunteer Applications"
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "التطوع", labelEn: "Volunteering", href: "/volunteering" },
          { labelAr: "طلباتي", labelEn: "My Applications" },
        ]}
        action={
          <Link href="/volunteering/log-hours" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            {t("تسجيل ساعات", "Log Hours")}
          </Link>
        }
      />

      {/* Total hours */}
      {profile && (
        <div className="rounded-xl border bg-primary/5 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">🌟</div>
          <div>
            <p className="text-2xl font-bold text-primary">{Number(profile.totalHours).toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{t("إجمالي ساعات التطوع", "Total volunteer hours")}</p>
          </div>
        </div>
      )}

      {/* Applications */}
      <div>
        <h2 className="font-semibold text-sm text-foreground mb-3">{t("طلبات التطوع", "Volunteer Applications")}</h2>
        {applications.length === 0 ? (
          <EmptyState
            icon="📋"
            titleAr="لم تتقدم لأي فرصة تطوع بعد"
            titleEn="No applications yet"
            descAr="استعرض فرص التطوع المتاحة وتقدم لما يناسبك"
            descEn="Browse available opportunities and apply to what suits you"
            isRTL={isRTL}
            action={<Link href="/volunteering" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">{t("استعراض الفرص", "Browse Opportunities")}</Link>}
          />
        ) : (
          <ul className="space-y-2">
            {applications.map(app => (
              <li key={app.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/volunteering/opportunities/${app.opportunityId}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">
                    {isRTL ? app.opportunity.titleAr : (app.opportunity.titleEn ?? app.opportunity.titleAr)}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("تقدمت بتاريخ", "Applied")} {fmt.format(app.appliedAt)}
                    {app.opportunity.hoursRequired && ` · ${Number(app.opportunity.hoursRequired)} ${t("ساعة", "hrs")}`}
                  </p>
                </div>
                <EntityStatusBadge status={app.status} isRTL={isRTL} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent hour logs */}
      {logs.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-foreground mb-3">{t("سجل الساعات الأخيرة", "Recent Hour Logs")}</h2>
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
                  {Number(log.hours)}h
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.descriptionAr ?? t("تطوع مُسجَّل", "Logged volunteer work")}</p>
                  <p className="text-xs text-muted-foreground">{fmt.format(log.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
