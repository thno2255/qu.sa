"use client"

import { useState, useEffect, useTransition } from "react"
import type { NotificationView } from "@/core/notifications/types"

interface NotificationItemProps {
  notification: NotificationView
  isRTL: boolean
  onRead?: (id: string) => void
}

export function NotificationItem({ notification, isRTL, onRead }: NotificationItemProps) {
  const [, startTransition] = useTransition()
  const isUnread = notification.status === "unread"

  const title = isRTL ? notification.title.ar : notification.title.en
  const body = isRTL ? notification.body.ar : notification.body.en

  // Compute relative time client-side only to avoid SSR/hydration mismatch with Date.now()
  const [timeAgo, setTimeAgo] = useState(() =>
    formatAbsoluteDate(notification.createdAt, isRTL),
  )
  useEffect(() => {
    setTimeAgo(formatRelativeTime(notification.createdAt, isRTL))
  }, [notification.createdAt, isRTL])

  function handleClick() {
    if (isUnread && onRead) {
      startTransition(() => onRead(notification.id))
    }
  }

  return (
    <div
      role="article"
      aria-label={title}
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3.5 transition-colors cursor-pointer hover:bg-muted/50 ${
        isUnread ? "bg-primary/5" : ""
      }`}
    >
      {/* Icon / type indicator */}
      <div className="mt-0.5 shrink-0">
        <NotifIcon type={notification.type} isUnread={isUnread} />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-foreground" : "text-foreground/80"}`}>
            {title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{body}</p>
        {/* Priority badge for CRITICAL/HIGH */}
        {(notification.priority === "CRITICAL" || notification.priority === "HIGH") && (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            notification.priority === "CRITICAL"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {notification.priority === "CRITICAL"
              ? (isRTL ? "عاجل" : "Critical")
              : (isRTL ? "مهم" : "High")}
          </span>
        )}
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="mt-1.5 shrink-0 size-2 rounded-full bg-primary" aria-hidden />
      )}
    </div>
  )
}

function NotifIcon({ type, isUnread }: { type: string; isUnread: boolean }) {
  const baseClass = `flex size-8 items-center justify-center rounded-full ${isUnread ? "bg-primary/15" : "bg-muted"}`

  const icons: Record<string, string> = {
    WORKFLOW_TASK_ASSIGNED: "📋",
    WORKFLOW_APPROVED: "✅",
    WORKFLOW_REJECTED: "❌",
    WORKFLOW_RETURNED: "↩️",
    WORKFLOW_ESCALATED: "⚠️",
    WORKFLOW_SLA_WARNING: "⏰",
    REGISTRATION_APPROVED: "🎉",
    REGISTRATION_REJECTED: "🚫",
    GENERAL: "🔔",
  }

  return (
    <div className={baseClass} aria-hidden>
      <span className="text-sm">{icons[type] ?? "🔔"}</span>
    </div>
  )
}

function formatAbsoluteDate(date: Date, isRTL: boolean): string {
  return new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

function formatRelativeTime(date: Date, isRTL: boolean): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (isRTL) {
    if (minutes < 1) return "الآن"
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return new Intl.DateTimeFormat("ar-SA", { month: "short", day: "numeric" }).format(date)
  } else {
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }
}
