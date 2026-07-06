import Link from "next/link"

interface PageHeaderProps {
  titleAr: string
  titleEn: string
  descAr?: string
  descEn?: string
  isRTL: boolean
  breadcrumbs?: { labelAr: string; labelEn: string; href?: string }[]
  action?: React.ReactNode
}

export function PageHeader({ titleAr, titleEn, descAr, descEn, isRTL, breadcrumbs, action }: PageHeaderProps) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <div className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label={t("مسار التنقل", "Breadcrumb")}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {isRTL ? crumb.labelAr : crumb.labelEn}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{isRTL ? crumb.labelAr : crumb.labelEn}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t(titleAr, titleEn)}</h1>
          {(descAr || descEn) && (
            <p className="mt-1 text-sm text-muted-foreground">{t(descAr ?? "", descEn ?? "")}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
