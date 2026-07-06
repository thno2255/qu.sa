"use client"

import Link from "next/link"
import { Search, Menu, Sun, Moon, Globe } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { NotificationBell } from "@/shared/components/notifications/notification-bell"
import { SearchModal } from "@/shared/components/search/search-modal"

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
        {/* Search trigger — opens Cmd+K modal */}
        <button
          id="search-trigger"
          className="hidden sm:flex items-center gap-2.5 rounded-xl border-2 border-muted bg-muted/40 px-4 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground transition-all w-44 md:w-64"
          aria-label={isRTL ? "البحث" : "Search"}
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-start">{isRTL ? "ابحث في المنصة..." : "Search platform..."}</span>
          <kbd className="hidden md:flex items-center gap-0.5 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
            ⌘K
          </kbd>
        </button>
        <Link
          href="/search"
          className="sm:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={isRTL ? "البحث" : "Search"}
        >
          <Search className="size-5" />
        </Link>
        <SearchModal isRTL={isRTL} />

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
