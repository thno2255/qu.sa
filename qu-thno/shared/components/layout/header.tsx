"use client"

import Link from "next/link"
import { Menu, Sun, Moon, Globe } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { NotificationBell } from "@/shared/components/notifications/notification-bell"

interface HeaderProps {
  locale: "ar" | "en"
  onMenuToggle?: () => void
  title?: string
}

export function Header({ locale, onMenuToggle, title }: HeaderProps) {
  const isRTL = locale === "ar"

  return (
    <header
      className={cn(
        "flex h-[var(--header-height)] items-center gap-3 border-b border-border",
        "bg-card px-4 shadow-sm"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label={isRTL ? "القائمة" : "Menu"}
      >
        <Menu className="size-5" />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-base font-semibold text-foreground hidden sm:block">{title}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
        {/* Notification bell — real unread count + slide-over panel */}
        <NotificationBell isRTL={isRTL} />

        {/* Language toggle — /en and /ar are handled by proxy.ts to set locale cookie */}
        <Link
          href={isRTL ? "/en" : "/ar"}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={isRTL ? "Switch to English" : "التبديل للعربية"}
        >
          <Globe className="size-5" />
        </Link>

        {/* Dark mode toggle (placeholder — Phase 9) */}
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={isRTL ? "تبديل الوضع" : "Toggle theme"}
        >
          <Sun className="size-5 dark:hidden" />
          <Moon className="hidden size-5 dark:block" />
        </button>
      </div>
    </header>
  )
}
