"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/shared/utils/cn"
import { ToastProvider } from "@/shared/components/ui/toast-provider"

interface CurrentUser {
  name: string
  email: string
  userType: string
}

interface PlatformShellProps {
  children: React.ReactNode
  locale: "ar" | "en"
  title?: string
  currentUser?: CurrentUser
}

export function PlatformShell({ children, locale, title, currentUser }: PlatformShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isRTL = locale === "ar"

  return (
    <ToastProvider>
    <div className="flex h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar locale={locale} currentUser={currentUser} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className={cn("fixed inset-y-0 z-50 lg:hidden", isRTL ? "right-0" : "left-0")}>
            <Sidebar
              locale={locale}
              currentUser={currentUser}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          locale={locale}
          title={title}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main id="main-content" className="flex-1 overflow-y-auto bg-background p-4 md:p-6">{children}</main>
      </div>
    </div>
    </ToastProvider>
  )
}
