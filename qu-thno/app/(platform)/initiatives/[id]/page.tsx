import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { InitiativeDetailActions } from "./initiative-detail-actions"
import { getWorkflowInstance } from "@/core/workflow/engine"

export const metadata: Metadata = { title: "تفاصيل المبادرة | Initiative Details" }

export default async function InitiativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const initiative = await db.initiative.findUnique({ where: { id } })
  if (!initiative) notFound()

  const owner = await db.user.findUnique({
    where: { id: initiative.ownerId },
    select: { id: true, nameAr: true, name: true, userType: true },
  })

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const isOwner = initiative.ownerId === userId
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)
  const canEdit = (isOwner && initiative.status === "draft") || isAdmin
  const canDelete = isOwner || isAdmin
  const canSubmit = isOwner && initiative.status === "draft"

  const wfInstance = initiative.workflowInstanceId
    ? await getWorkflowInstance(initiative.workflowInstanceId)
    : null

  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        titleAr={initiative.titleAr}
        titleEn={initiative.titleEn ?? initiative.titleAr}
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المبادرات", labelEn: "Initiatives", href: "/initiatives" },
          { labelAr: initiative.titleAr, labelEn: initiative.titleEn ?? initiative.titleAr },
        ]}
        action={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/initiatives/${id}/edit`}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                {t("تعديل", "Edit")}
              </Link>
            )}
            <InitiativeDetailActions
              initiativeId={id}
              status={initiative.status}
              canSubmit={canSubmit}
              canDelete={canDelete}
              isRTL={isRTL}
            />
          </div>
        }
      />

      {/* Status + meta card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <EntityStatusBadge status={initiative.status} isRTL={isRTL} />
          {initiative.vision2030Pillar && (
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {initiative.vision2030Pillar}
            </span>
          )}
        </div>

        {initiative.descriptionAr && (
          <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">
            {initiative.descriptionAr}
          </p>
        )}

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{t("المالك", "Owner")}</p>
            <p className="font-medium">{owner?.nameAr ?? owner?.name ?? "—"}</p>
          </div>
          {initiative.startDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ البداية", "Start Date")}</p>
              <p className="font-medium">{fmt.format(initiative.startDate)}</p>
            </div>
          )}
          {initiative.endDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("تاريخ الانتهاء", "End Date")}</p>
              <p className="font-medium">{fmt.format(initiative.endDate)}</p>
            </div>
          )}
          {initiative.targetBeneficiaries && (
            <div>
              <p className="text-xs text-muted-foreground">{t("المستفيدون", "Beneficiaries")}</p>
              <p className="font-medium">{new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US").format(initiative.targetBeneficiaries)}</p>
            </div>
          )}
          {initiative.budgetAllocated && (
            <div>
              <p className="text-xs text-muted-foreground">{t("الميزانية", "Budget")}</p>
              <p className="font-medium">
                {new Intl.NumberFormat(isRTL ? "ar-SA" : "en-US").format(Number(initiative.budgetAllocated))} {t("ريال", "SAR")}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{t("تاريخ الإنشاء", "Created")}</p>
            <p className="font-medium">{fmt.format(initiative.createdAt)}</p>
          </div>
        </div>

        {initiative.sdgGoals.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("أهداف التنمية المستدامة", "SDG Goals")}</p>
            <SDGChipsRow goals={initiative.sdgGoals} max={17} isRTL={isRTL} />
          </div>
        )}

        {initiative.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {initiative.tags.map((tag) => (
              <span key={tag} className="rounded-full border bg-accent px-2.5 py-0.5 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Workflow status */}
      {wfInstance && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-sm">{t("حالة الموافقة", "Approval Status")}</h2>
          <div className="flex items-center gap-2">
            <EntityStatusBadge status={wfInstance.status} isRTL={isRTL} size="sm" />
            {wfInstance.currentStage && (
              <span className="text-sm text-muted-foreground">
                {t("الخطوة الحالية:", "Current step:")} {wfInstance.currentStage}
              </span>
            )}
          </div>
          <Link
            href={`/workflows/${wfInstance.id}`}
            className="inline-flex text-sm text-primary hover:underline"
          >
            {t("عرض تفاصيل سير العمل", "View workflow details")} →
          </Link>
        </div>
      )}

      {/* Draft notice */}
      {initiative.status === "draft" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
          <strong>{t("مسودة:", "Draft:")}</strong>{" "}
          {t(
            "هذه المبادرة في مرحلة المسودة ولم تُرسل للموافقة بعد.",
            "This initiative is a draft and has not been submitted for approval yet.",
          )}
        </div>
      )}
    </div>
  )
}
