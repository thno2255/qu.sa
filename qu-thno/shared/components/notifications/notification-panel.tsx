"use client"

import { useState, useEffect, useCallback } from "react"
import { NotificationItem } from "./notification-item"
import type { NotificationView } from "@/core/notifications/types"

interface NotificationPanelProps {
  isRTL: boolean
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isRTL, isOpen, onClose }: NotificationPanelProps) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [notifications, setNotifications] = useState<NotificationView[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("unread")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter === "unread" ? "?status=unread" : ""
      const res = await fetch(`/api/notifications/list${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen, fetchNotifications])

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
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read", readAt: new Date() })))
  }

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={t("مركز الإشعارات", "Notification Center")}
        className={`fixed top-[var(--header-height)] z-50 flex flex-col bg-card shadow-xl border rounded-xl overflow-hidden
          ${isRTL ? "end-4" : "end-4"} w-full max-w-sm`}
        style={{ maxHeight: "calc(100vh - var(--header-height) - 1rem)" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {t("الإشعارات", "Notifications")}
            </h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                {t("تحديد الكل كمقروء", "Mark all read")}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted ms-2"
              aria-label={t("إغلاق", "Close")}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b">
          {(["unread", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "unread" ? t("غير مقروءة", "Unread") : t("الكل", "All")}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span className="text-3xl mb-3" aria-hidden>🔔</span>
              <p className="text-sm font-medium text-foreground">
                {t("لا توجد إشعارات", "No notifications")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("ستظهر الإشعارات هنا عند وصولها", "Notifications will appear here")}
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isRTL={isRTL}
                onRead={handleRead}
              />
            ))
          )}
        </div>

        {/* Panel footer */}
        <div className="border-t px-4 py-2.5 bg-muted/20">
          <a
            href="/notifications"
            className="block text-center text-xs font-medium text-primary hover:underline"
            onClick={onClose}
          >
            {t("عرض كل الإشعارات", "View all notifications")}
          </a>
        </div>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="size-5 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
