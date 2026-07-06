import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { EmptyState } from "@/shared/components/ui/empty-state"
import Link from "next/link"

export const metadata: Metadata = { title: "المشاريع المجتمعية | Projects" }

export default async function ProjectsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const canCreate = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE", "DEPARTMENT_HEAD", "FACULTY_MEMBER"].includes(userType)

  const projects = await db.project.findMany({
    where: {
      OR: [
        { status: { not: "draft" } },
        { managerId: userId },
      ],
    },
    include: {
      milestones: { select: { status: true } },
      teamMembers: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const RISK_COLOR: Record<string, string> = {
    low: "text-green-600 bg-green-50", medium: "text-amber-600 bg-amber-50", high: "text-red-600 bg-red-50",
  }
  const RISK_LABEL: Record<string, { ar: string; en: string }> = {
    low: { ar: "منخفض", en: "Low" }, medium: { ar: "متوسط", en: "Medium" }, high: { ar: "عالٍ", en: "High" },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titleAr="المشاريع المجتمعية"
        titleEn="Community Projects"
        descAr="إدارة ومتابعة مشاريع المسؤولية المجتمعية"
        descEn="Manage and track community responsibility projects"
        isRTL={isRTL}
        action={
          canCreate ? (
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span aria-hidden>+</span>
              {t("مشروع جديد", "New Project")}
            </Link>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("إجمالي المشاريع", "Total"), count: projects.length, color: "bg-blue-50 border-blue-100" },
          { label: t("نشطة", "Active"), count: projects.filter(p => p.status === "active" || p.status === "in_progress").length, color: "bg-green-50 border-green-100" },
          { label: t("بانتظار الموافقة", "Pending"), count: projects.filter(p => p.status === "pending").length, color: "bg-amber-50 border-amber-100" },
          { label: t("مكتملة", "Completed"), count: projects.filter(p => p.status === "completed").length, color: "bg-purple-50 border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          titleAr="لا توجد مشاريع بعد"
          titleEn="No projects yet"
          descAr={canCreate ? "ابدأ بإنشاء أول مشروع مجتمعي" : "لم تُنشأ مشاريع مجتمعية بعد"}
          descEn={canCreate ? "Start by creating your first project" : "No community projects have been created yet"}
          isRTL={isRTL}
          action={
            canCreate ? (
              <Link href="/projects/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("إنشاء مشروع", "Create Project")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const totalMs = proj.milestones.length
            const doneMs = proj.milestones.filter(m => m.status === "completed").length
            const pct = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <EntityStatusBadge status={proj.status} isRTL={isRTL} size="sm" />
                  {proj.riskLevel && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_COLOR[proj.riskLevel] ?? ""}`}>
                      {isRTL ? RISK_LABEL[proj.riskLevel]?.ar : RISK_LABEL[proj.riskLevel]?.en}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {isRTL ? proj.titleAr : (proj.titleEn ?? proj.titleAr)}
                </h3>

                {proj.descriptionAr && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{proj.descriptionAr}</p>
                )}

                <div className="mt-auto pt-3 border-t space-y-2.5">
                  {totalMs > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t("التقدم", "Progress")}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {proj.sdgGoals.length > 0 && <SDGChipsRow goals={proj.sdgGoals} max={4} isRTL={isRTL} />}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {totalMs > 0 && (
                      <span>📌 {doneMs}/{totalMs} {t("مراحل", "milestones")}</span>
                    )}
                    {proj.teamMembers.length > 0 && (
                      <span>👥 {proj.teamMembers.length} {t("أعضاء", "members")}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
