import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { EmptyState } from "@/shared/components/ui/empty-state"
import Link from "next/link"

export const metadata: Metadata = { title: "التطوع | Volunteering" }

export default async function VolunteeringPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userType = session?.user?.userType ?? "VISITOR"
  const canCreate = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)
  const canApply = ["STUDENT", "VOLUNTEER", "FACULTY_MEMBER", "EXTERNAL_ENTITY"].includes(userType)

  const opportunities = await db.volunteerOpportunity.findMany({
    where: { status: { in: ["open", "in_progress"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  return (
    <div className="space-y-6">
      <PageHeader
        titleAr="فرص التطوع"
        titleEn="Volunteer Opportunities"
        descAr="انضم إلى مبادرات التطوع في جامعة القصيم وأحدث فرقاً في مجتمعك"
        descEn="Join volunteering initiatives at Qassim University and make a difference in your community"
        isRTL={isRTL}
        action={
          <div className="flex items-center gap-2">
            {canApply && (
              <Link href="/volunteering/my-applications" className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                {t("طلباتي", "My Applications")}
              </Link>
            )}
            {canCreate && (
              <Link href="/volunteering/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                <span aria-hidden>+</span>
                {t("فرصة جديدة", "New Opportunity")}
              </Link>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("الفرص المتاحة", "Open Opportunities"), count: opportunities.filter(o => o.status === "open").length, color: "bg-green-50 border-green-100" },
          { label: t("إجمالي المقاعد", "Total Spots"), count: opportunities.reduce((s, o) => s + (o.spotsTotal ?? 0), 0), color: "bg-blue-50 border-blue-100" },
          { label: t("المقاعد المتبقية", "Available Spots"), count: opportunities.reduce((s, o) => s + Math.max(0, (o.spotsTotal ?? 0) - o.spotsFilled), 0), color: "bg-amber-50 border-amber-100" },
          { label: t("جارٍ التنفيذ", "In Progress"), count: opportunities.filter(o => o.status === "in_progress").length, color: "bg-purple-50 border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          icon="🤲"
          titleAr="لا توجد فرص تطوع متاحة حالياً"
          titleEn="No volunteer opportunities available"
          descAr={canCreate ? "أضف أول فرصة تطوع للطلاب والمتطوعين" : "تابع لاحقاً للاطلاع على الفرص المتاحة"}
          descEn={canCreate ? "Add the first volunteer opportunity for students and volunteers" : "Check back later for available opportunities"}
          isRTL={isRTL}
          action={
            canCreate ? (
              <Link href="/volunteering/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("إضافة فرصة", "Add Opportunity")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => {
            const available = opp.spotsTotal !== null ? opp.spotsTotal - opp.spotsFilled : null
            const isFull = available !== null && available <= 0

            return (
              <Link
                key={opp.id}
                href={`/volunteering/opportunities/${opp.id}`}
                className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <EntityStatusBadge status={isFull ? "completed" : opp.status} isRTL={isRTL} size="sm" />
                  {opp.hoursRequired && (
                    <span className="text-xs text-muted-foreground">
                      ⏱ {Number(opp.hoursRequired)} {t("ساعة", "hrs")}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {isRTL ? opp.titleAr : (opp.titleEn ?? opp.titleAr)}
                </h3>

                {opp.descriptionAr && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{opp.descriptionAr}</p>
                )}

                <div className="mt-auto pt-3 border-t space-y-2">
                  {opp.spotsTotal !== null && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t("المقاعد", "Spots")}</span>
                        <span>{opp.spotsFilled}/{opp.spotsTotal}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(opp.spotsFilled / opp.spotsTotal) * 100}%`, backgroundColor: isFull ? "#ef4444" : "#22c55e" }}
                        />
                      </div>
                    </div>
                  )}
                  {opp.startDate && (
                    <p className="text-xs text-muted-foreground">📅 {fmt.format(opp.startDate)}</p>
                  )}
                  {opp.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {opp.requiredSkills.slice(0, 3).map(s => (
                        <span key={s} className="rounded-full bg-accent px-2 py-0.5 text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Log hours quick link */}
      {canApply && (
        <div className="rounded-xl border bg-primary/5 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">{t("سجّل ساعات تطوعك", "Log your volunteer hours")}</p>
            <p className="text-xs text-muted-foreground">{t("احتسب ساعاتك التطوعية لبناء سجلك الطوعي", "Record your hours to build your volunteer record")}</p>
          </div>
          <Link href="/volunteering/log-hours" className="shrink-0 rounded-xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            {t("تسجيل الساعات", "Log Hours")}
          </Link>
        </div>
      )}
    </div>
  )
}
