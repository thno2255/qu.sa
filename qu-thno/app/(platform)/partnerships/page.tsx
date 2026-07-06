import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { PageHeader } from "@/shared/components/ui/page-header"
import { EntityStatusBadge } from "@/shared/components/ui/entity-status-badge"
import { SDGChipsRow } from "@/shared/components/ui/sdg-chip"
import { EmptyState } from "@/shared/components/ui/empty-state"
import Link from "next/link"

export const metadata: Metadata = { title: "الشراكات | Partnerships" }

export default async function PartnershipsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userType = session?.user?.userType ?? "VISITOR"
  const canCreate = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(userType)

  const partnerships = await db.partnership.findMany({
    include: { partner: { select: { nameAr: true, nameEn: true, type: true, sector: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const TYPE_LABEL: Record<string, string> = {
    "مذكرة تفاهم": "MOU", "اتفاقية تعاون": "Cooperation Agreement",
    "رعاية": "Sponsorship", "عقد": "Contract",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titleAr="الشراكات المجتمعية"
        titleEn="Community Partnerships"
        descAr="إدارة شراكات جامعة القصيم مع الجهات الخارجية"
        descEn="Manage Qassim University partnerships with external entities"
        isRTL={isRTL}
        action={
          canCreate ? (
            <Link
              href="/partnerships/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span aria-hidden>+</span>
              {t("شراكة جديدة", "New Partnership")}
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("إجمالي الشراكات", "Total"), count: partnerships.length, color: "bg-blue-50 border-blue-100" },
          { label: t("نشطة", "Active"), count: partnerships.filter(p => p.status === "active").length, color: "bg-green-50 border-green-100" },
          { label: t("بانتظار الموافقة", "Pending"), count: partnerships.filter(p => p.status === "pending").length, color: "bg-amber-50 border-amber-100" },
          { label: t("منتهية", "Expired"), count: partnerships.filter(p => p.status === "expired" || p.status === "closed").length, color: "bg-gray-50 border-gray-100" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {partnerships.length === 0 ? (
        <EmptyState
          icon="🤝"
          titleAr="لا توجد شراكات بعد"
          titleEn="No partnerships yet"
          descAr={canCreate ? "ابدأ بإضافة شراكة مع جهة خارجية" : "لم تُسجَّل شراكات بعد"}
          descEn={canCreate ? "Start by adding a partnership with an external entity" : "No partnerships have been registered yet"}
          isRTL={isRTL}
          action={
            canCreate ? (
              <Link href="/partnerships/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("إضافة شراكة", "Add Partnership")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerships.map((ps) => (
            <Link
              key={ps.id}
              href={`/partnerships/${ps.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <EntityStatusBadge status={ps.status} isRTL={isRTL} size="sm" />
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {isRTL ? ps.type : (TYPE_LABEL[ps.type] ?? ps.type)}
                </span>
              </div>

              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                {isRTL ? ps.titleAr : (ps.titleEn ?? ps.titleAr)}
              </h3>

              <p className="text-sm text-muted-foreground mb-3">
                🏢 {isRTL ? ps.partner.nameAr : (ps.partner.nameEn ?? ps.partner.nameAr)}
                {ps.partner.sector && <span className="text-xs"> · {ps.partner.sector}</span>}
              </p>

              <div className="mt-auto pt-3 border-t space-y-2">
                {ps.sdgGoals.length > 0 && <SDGChipsRow goals={ps.sdgGoals} max={4} isRTL={isRTL} />}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {ps.startDate && (
                    <span>📅 {new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", { dateStyle: "short" }).format(ps.startDate)}</span>
                  )}
                  {ps.partnershipValue && (
                    <span>💰 {Number(ps.partnershipValue).toLocaleString(isRTL ? "ar-SA" : "en-US")} {t("ريال", "SAR")}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
