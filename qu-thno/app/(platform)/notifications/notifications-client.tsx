"use client"

import { useState, useTransition } from "react"
import { NotificationItem } from "@/shared/components/notifications/notification-item"
import type { NotificationView } from "@/core/notifications/types"

const FILTER_TABS = [
  { key: "all", labelAr: "الكل", labelEn: "All" },
  { key: "unread", labelAr: "غير مقروءة", labelEn: "Unread" },
  { key: "read", labelAr: "مقروءة", labelEn: "Read" },
] as const

type FilterKey = (typeof FILTER_TABS)[number]["key"]

interface Props {
  initialNotifications: NotificationView[]
  isRTL: boolean
}

export function NotificationsClient({ initialNotifications, isRTL }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [notifications, setNotifications] = useState<NotificationView[]>(initialNotifications)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [, startTransition] = useTransition()

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return n.status === "unread"
    if (filter === "read") return n.status === "read"
    return true
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  async function handleRead(id: string) {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read", readAt: new Date() } : n)),
    )
  }

  async function handleMarkAllRead() {
    startTransition(async () => {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read", readAt: new Date() })))
    })
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isRTL ? tab.labelAr : tab.labelEn}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ms-1.5 rounded-full bg-primary/20 px-1.5 text-primary text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("تحديد الكل كمقروء", "Mark all as read")}
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <span className="text-4xl mb-3" aria-hidden>🔔</span>
          <p className="text-base font-medium text-foreground">
            {t("لا توجد إشعارات", "No notifications")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {filter === "unread"
              ? t("جميع إشعاراتك مقروءة", "All your notifications have been read")
              : t("ستظهر الإشعارات هنا عند ورودها", "Notifications will appear here when received")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} isRTL={isRTL} onRead={handleRead} />
          ))}
        </div>
      )}
    </div>
  )
}
