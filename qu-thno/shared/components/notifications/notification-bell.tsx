"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { NotificationPanel } from "./notification-panel"

interface NotificationBellProps {
  isRTL: boolean
}

export function NotificationBell({ isRTL }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications/unread-count")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count ?? 0)
        }
      } catch {
        // ignore
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label={isRTL ? `الإشعارات${unreadCount > 0 ? ` (${unreadCount})` : ""}` : `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute top-1 end-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isRTL={isRTL}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  )
}
