import Link from "next/link"
import { type LucideIcon, FolderOpen } from "lucide-react"

interface EmptyStateProps {
  /** Pass a LucideIcon component OR an emoji string */
  icon?: LucideIcon | string
  titleAr: string
  titleEn: string
  descAr?: string
  descEn?: string
  isRTL: boolean
  action?: React.ReactNode
  /** Convenience shorthand: label + href rendered as a primary button */
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon,
  titleAr,
  titleEn,
  descAr,
  descEn,
  isRTL,
  action,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const isString = typeof icon === "string"
  const Icon = !isString && icon ? (icon as LucideIcon) : FolderOpen

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/20 py-20 px-6 text-center">
      {/* Icon ring */}
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted shadow-sm">
        {isString && icon ? (
          <span className="text-3xl" aria-hidden>{icon}</span>
        ) : (
          <Icon className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
        )}
      </div>

      <p className="text-base font-semibold text-foreground">
        {isRTL ? titleAr : titleEn}
      </p>

      {(descAr || descEn) && (
        <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
          {isRTL ? descAr : descEn}
        </p>
      )}

      {(action ?? actionHref) && (
        <div className="mt-6">
          {action}
          {!action && actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
