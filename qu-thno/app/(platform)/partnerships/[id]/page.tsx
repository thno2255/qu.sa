import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { PartnershipDetailActions } from "./partnership-detail-actions"
import { getWorkflowInstance } from "@/core/workflow/engine"

export const metadata: Metadata = { title: "تفاصيل الشراكة | Partnership Details" }

export default async function PartnershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const partnership = await db.partnership.findUnique({
    where: { id },
    include: { partner: true },
  })
  if (!partnership) notFound()

  const userType = session?.user?.userType ?? "VISITOR"
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)
  const canEdit = isAdmin && ["draft", "active"].includes(partnership.status)
  const canDelete = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(userType)
  const canSubmit = isAdmin && partnership.status === "draft"

  const wfInstance = partnership.workflowInstanceId
    ? await getWorkflowInstance(partnership.workflowInstanceId)
    : null

  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  const PARTNER_TYPE: Record<string, { ar: string; en: string }> = {
    government: { ar: "حكومية", en: "Government" },
    private: { ar: "خاصة", en: "Private" },
    ngo: { ar: "غير ربحية", en: "NGO" },
    academic: { ar: "أكاديمية", en: "Academic" },
    international: { ar: "دولية", en: "International" },
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        titleAr={partnership.titleAr}
        titleEn={partnership.titleEn ?? partnership.titleAr}
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "الشراكات", labelEn: "Partnerships", href: "/partnerships" },
          { labelAr: partnership.titleAr, labelEn: partnership.titleEn ?? partnership.titleAr },
        ]}
        action={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={`/partnerships/${id}/edit`} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                {t("تعديل", "Edit")}
              </Link>
            )}
            <PartnershipDetailActions partnershipId={id} status={partnership.status} canSubmit={canSubmit} canDelete={canDelete} isRTL={isRTL} />
          </div>
        }
      />

      {/* Main card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <EntityStatusBadge status={partnership.status} isRTL={isRTL} />
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium">{partnership.type}</span>
        </div>

        {/* Partner info */}
        <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">{t("الجهة الشريكة", "Partner")}</p>
          <p className="font-semibold">🏢 {isRTL ? partnership.partner.nameAr : (partnership.partner.nameEn ?? partnership.partner.nameAr)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{t(PARTNER_TYPE[partnership.partner.type]?.ar ?? partnership.partner.type, PARTNER_TYPE[partnership.partner.type]?.en ?? partnership.partner.type)}</span>
            {partnership.partner.sector && <span>· {partnership.partner.sector}</span>}
            {partnership.partner.email && <a href={`mailto:${partnership.partner.email}`} className="text-primary hover:underline">{partnership.partner.email}</a>}
            {partnership.partner.website && <a href={partnership.partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{partnership.partner.website}</a>}
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-sm">
          {partnership.startDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ البداية", "Start Date")}</p>
              <p className="font-medium">{fmt.format(partnership.startDate)}</p>
            </div>
          )}
          {partnership.endDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ الانتهاء", "End Date")}</p>
              <p className="font-medium">{fmt.format(partnership.endDate)}</p>
            </div>
          )}
          {partnership.renewalDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ التجديد", "Renewal Date")}</p>
              <p className="font-medium">{fmt.format(partnership.renewalDate)}</p>
            </div>
          )}
          {partnership.partnershipValue && (
            <div>
              <p className="text-xs text-muted-foreground">{t("قيمة الشراكة", "Value")}</p>
              <p className="font-medium">{Number(partnership.partnershipValue).toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("ريال", "SAR")}</p>
            </div>
          )}
        </div>

        {partnership.sdgGoals.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("أهداف التنمية المستدامة", "SDG Goals")}</p>
            <SDGChipsRow goals={partnership.sdgGoals} max={17} isRTL={isRTL} />
          </div>
        )}
      </div>

      {wfInstance && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-sm">{t("حالة الموافقة", "Approval Status")}</h2>
          <EntityStatusBadge status={wfInstance.status} isRTL={isRTL} size="sm" />
          <Link href={`/workflows/${wfInstance.id}`} className="inline-flex text-sm text-primary hover:underline">
            {t("عرض تفاصيل سير العمل", "View workflow details")} →
          </Link>
        </div>
      )}

      {partnership.status === "draft" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
          <strong>{t("مسودة:", "Draft:")}</strong>{" "}
          {t("هذه الشراكة في مرحلة المسودة ولم تُرسل للموافقة بعد.", "This partnership is a draft and has not been submitted for approval yet.")}
        </div>
      )}
    </div>
  )
}
