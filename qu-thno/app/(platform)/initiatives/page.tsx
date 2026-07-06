import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { EmptyState } from "@/shared/components/ui/empty-state"
import Link from "next/link"

export const metadata: Metadata = { title: "المبادرات المجتمعية | Initiatives" }

export default async function InitiativesPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userType = session?.user?.userType ?? "VISITOR"
  const userId = session?.user?.id ?? ""
  const canCreate = ["SYSTEM_ADMIN","COMMUNITY_MANAGER","COMMUNITY_EMPLOYEE","DEPARTMENT_HEAD","FACULTY_MEMBER"].includes(userType)

  // All users see all non-draft initiatives; owners see their own drafts too
  const initiatives = await db.initiative.findMany({
    where: {
      OR: [
        { status: { not: "draft" } },
        { ownerId: userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        titleAr="المبادرات المجتمعية"
        titleEn="Community Initiatives"
        descAr="استعرض وأدر مبادرات المسؤولية المجتمعية في جامعة القصيم"
        descEn="Browse and manage community responsibility initiatives at Qassim University"
        isRTL={isRTL}
        action={
          canCreate ? (
            <Link
              href="/initiatives/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span aria-hidden>+</span>
              {t("مبادرة جديدة", "New Initiative")}
            </Link>
          ) : undefined
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("إجمالي المبادرات", "Total"), count: initiatives.length, color: "bg-blue-50 border-blue-100" },
          { label: t("نشطة", "Active"), count: initiatives.filter(i => i.status === "active").length, color: "bg-green-50 border-green-100" },
          { label: t("بانتظار الموافقة", "Pending"), count: initiatives.filter(i => i.status === "pending").length, color: "bg-amber-50 border-amber-100" },
          { label: t("مكتملة", "Completed"), count: initiatives.filter(i => i.status === "completed").length, color: "bg-purple-50 border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Initiatives grid */}
      {initiatives.length === 0 ? (
        <EmptyState
          icon="🚀"
          titleAr="لا توجد مبادرات بعد"
          titleEn="No initiatives yet"
          descAr={canCreate ? "ابدأ بإنشاء أول مبادرة مجتمعية" : "لم تُنشأ مبادرات مجتمعية بعد"}
          descEn={canCreate ? "Start by creating your first initiative" : "No community initiatives have been created yet"}
          isRTL={isRTL}
          action={
            canCreate ? (
              <Link href="/initiatives/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("إنشاء مبادرة", "Create Initiative")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((init) => (
            <Link
              key={init.id}
              href={`/initiatives/${init.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              {/* Status + date row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <EntityStatusBadge status={init.status} isRTL={isRTL} size="sm" />
                {init.startDate && (
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { month: "short", year: "numeric" }).format(init.startDate)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {isRTL ? init.titleAr : (init.titleEn ?? init.titleAr)}
              </h3>

              {/* Description */}
              {init.descriptionAr && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                  {init.descriptionAr}
                </p>
              )}

              {/* Footer: SDG + beneficiaries */}
              <div className="mt-auto pt-3 border-t space-y-2">
                {init.sdgGoals.length > 0 && (
                  <SDGChipsRow goals={init.sdgGoals} max={4} isRTL={isRTL} />
                )}
                {init.targetBeneficiaries && (
                  <p className="text-xs text-muted-foreground">
                    🎯 {init.targetBeneficiaries.toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("مستفيد", "beneficiaries")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
