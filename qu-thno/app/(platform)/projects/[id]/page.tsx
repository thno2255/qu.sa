import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { ProjectDetailActions, CompleteMilestoneButton } from "./project-detail-actions"
import { getWorkflowInstance } from "@/core/workflow/engine"

export const metadata: Metadata = { title: "تفاصيل المشروع | Project Details" }

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const project = await db.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { order: "asc" } },
      teamMembers: { select: { userId: true, role: true, joinedAt: true } },
    },
  })
  if (!project) notFound()

  const manager = await db.user.findUnique({
    where: { id: project.managerId },
    select: { nameAr: true, name: true },
  })

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const isManager = project.managerId === userId
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)
  const canEdit = (isManager && project.status === "draft") || isAdmin
  const canDelete = isManager || ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(userType)
  const canSubmit = isManager && project.status === "draft"
  const canManageMilestones = isManager || isAdmin

  const wfInstance = project.workflowInstanceId
    ? await getWorkflowInstance(project.workflowInstanceId)
    : null

  const totalMs = project.milestones.length
  const doneMs = project.milestones.filter(m => m.status === "completed").length
  const pct = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0
  const fmt = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "medium" })

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        titleAr={project.titleAr}
        titleEn={project.titleEn ?? project.titleAr}
        isRTL={isRTL}
        breadcrumbs={[
          { labelAr: "المشاريع", labelEn: "Projects", href: "/projects" },
          { labelAr: project.titleAr, labelEn: project.titleEn ?? project.titleAr },
        ]}
        action={
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={`/projects/${id}/edit`} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                {t("تعديل", "Edit")}
              </Link>
            )}
            <ProjectDetailActions projectId={id} status={project.status} canSubmit={canSubmit} canDelete={canDelete} isRTL={isRTL} />
          </div>
        }
      />

      {/* Meta card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <EntityStatusBadge status={project.status} isRTL={isRTL} />
          {project.riskLevel && (
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${project.riskLevel === "high" ? "bg-red-50 text-red-600" : project.riskLevel === "medium" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
              {t("مخاطرة:", "Risk:")} {t(project.riskLevel === "high" ? "عالية" : project.riskLevel === "medium" ? "متوسطة" : "منخفضة", project.riskLevel)}
            </span>
          )}
        </div>

        {project.descriptionAr && (
          <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">{project.descriptionAr}</p>
        )}

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{t("مدير المشروع", "Project Manager")}</p>
            <p className="font-medium">{manager?.nameAr ?? manager?.name ?? "—"}</p>
          </div>
          {project.startDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("البداية", "Start")}</p>
              <p className="font-medium">{fmt.format(project.startDate)}</p>
            </div>
          )}
          {project.endDate && (
            <div>
              <p className="text-xs text-muted-foreground">{t("الانتهاء", "End")}</p>
              <p className="font-medium">{fmt.format(project.endDate)}</p>
            </div>
          )}
          {project.budget && (
            <div>
              <p className="text-xs text-muted-foreground">{t("الميزانية", "Budget")}</p>
              <p className="font-medium">{Number(project.budget).toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("ريال", "SAR")}</p>
            </div>
          )}
        </div>

        {project.sdgGoals.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t("أهداف التنمية المستدامة", "SDG Goals")}</p>
            <SDGChipsRow goals={project.sdgGoals} max={17} isRTL={isRTL} />
          </div>
        )}
      </div>

      {/* Progress + Milestones */}
      {totalMs > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">{t("المراحل والتقدم", "Milestones & Progress")}</h2>
            <span className="text-sm font-medium text-primary">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ul className="space-y-2">
            {project.milestones.map((ms) => (
              <li key={ms.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${ms.status === "completed" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {ms.status === "completed" ? "✓" : (ms.order + 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${ms.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {isRTL ? ms.titleAr : (ms.titleEn ?? ms.titleAr)}
                  </p>
                  {ms.dueDate && (
                    <p className="text-xs text-muted-foreground">{fmt.format(ms.dueDate)}</p>
                  )}
                </div>
                {canManageMilestones && ms.status !== "completed" && (
                  <CompleteMilestoneButton milestoneId={ms.id} projectId={id} isRTL={isRTL} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workflow */}
      {wfInstance && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-sm">{t("حالة الموافقة", "Approval Status")}</h2>
          <EntityStatusBadge status={wfInstance.status} isRTL={isRTL} size="sm" />
          <Link href={`/workflows/${wfInstance.id}`} className="inline-flex text-sm text-primary hover:underline">
            {t("عرض تفاصيل سير العمل", "View workflow details")} →
          </Link>
        </div>
      )}

      {project.status === "draft" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
          <strong>{t("مسودة:", "Draft:")}</strong>{" "}
          {t("هذا المشروع في مرحلة المسودة ولم يُرسل للموافقة بعد.", "This project is a draft and has not been submitted for approval yet.")}
        </div>
      )}
    </div>
  )
}
