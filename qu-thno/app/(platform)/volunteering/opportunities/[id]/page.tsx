import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound } from "next/navigation"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { ApplyButton } from "./apply-button"

export const metadata: Metadata = { title: "فرصة التطوع | Volunteer Opportunity" }

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const opp = await db.volunteerOpportunity.findUnique({
    where: { id },
    include: {
      applications: { select: { volunteerId: true, status: true } },
    },
  })
  if (!opp) notFound()

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const canApply = ["STUDENT", "VOLUNTEER", "FACULTY_MEMBER", "EXTERNAL_ENTITY"].includes(userType)
  const alreadyApplied = opp.applications.some(a => a.volunteerId === userId)
  const isFull = opp.spotsTotal !== null && opp.spotsFilled >= opp.spotsTotal

  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        titleAr={opp.titleAr}
        titleEn={opp.titleEn ?? opp.titleAr}
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "التطوع", labelEn: "Volunteering", href: "/volunteering" },
          { labelAr: opp.titleAr, labelEn: opp.titleEn ?? opp.titleAr },
        ]}
        action={canApply ? <ApplyButton opportunityId={id} alreadyApplied={alreadyApplied} isFull={isFull} isRTL={isRTL} /> : undefined}
      />

      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <EntityStatusBadge status={isFull ? "completed" : opp.status} isRTL={isRTL} />
        </div>

        {opp.descriptionAr && (
          <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">{opp.descriptionAr}</p>
        )}

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-sm">
          {opp.startDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ البداية", "Start Date")}</p>
              <p className="font-medium">{fmt.format(opp.startDate)}</p>
            </div>
          )}
          {opp.endDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ الانتهاء", "End Date")}</p>
              <p className="font-medium">{fmt.format(opp.endDate)}</p>
            </div>
          )}
          {opp.hoursRequired && (
            <div>
              <p className="text-xs text-muted-foreground">{t("الساعات المطلوبة", "Hours Required")}</p>
              <p className="font-medium">{Number(opp.hoursRequired)} {t("ساعة", "hours")}</p>
            </div>
          )}
          {opp.spotsTotal !== null && (
            <div>
              <p className="text-xs text-muted-foreground">{t("المقاعد", "Spots")}</p>
              <p className="font-medium">{opp.spotsFilled}/{opp.spotsTotal} {t("مشغول", "filled")}</p>
            </div>
          )}
        </div>

        {opp.spotsTotal !== null && (
          <div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(opp.spotsFilled / opp.spotsTotal) * 100}%`, backgroundColor: isFull ? "#ef4444" : "#22c55e" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {opp.spotsTotal - opp.spotsFilled} {t("مقعد متبقٍ", "spots remaining")}
            </p>
          </div>
        )}

        {opp.requiredSkills.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("المهارات المطلوبة", "Required Skills")}</p>
            <div className="flex flex-wrap gap-1.5">
              {opp.requiredSkills.map(s => (
                <span key={s} className="rounded-full bg-accent px-3 py-1 text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applicants list for admins */}
      {["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType) && opp.applications.length > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-sm">{t(`المتقدمون (${opp.applications.length})`, `Applicants (${opp.applications.length})`)}</h2>
          <ul className="divide-y">
            {opp.applications.map(app => (
              <li key={app.volunteerId} className="py-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-mono text-xs">{app.volunteerId}</span>
                <EntityStatusBadge status={app.status} isRTL={isRTL} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
