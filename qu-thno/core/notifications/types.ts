import type { NotificationChannel, NotificationPriority } from "@prisma/client"

// ---------------------------------------------------------------------------
// Notification types (maps to NotificationTemplate.type)
// ---------------------------------------------------------------------------

export type NotificationType =
  | "WORKFLOW_TASK_ASSIGNED"
  | "WORKFLOW_APPROVED"
  | "WORKFLOW_REJECTED"
  | "WORKFLOW_RETURNED"
  | "WORKFLOW_ESCALATED"
  | "WORKFLOW_SLA_WARNING"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "GENERAL"

// ---------------------------------------------------------------------------
// Send payload
// ---------------------------------------------------------------------------

export interface SendNotificationParams {
  recipientId: string
  type: NotificationType
  title: { ar: string; en: string }
  body: { ar: string; en: string }
  data?: Record<string, unknown>
  channels?: NotificationChannel[]
  priority?: NotificationPriority
  expiresAt?: Date
}

// ---------------------------------------------------------------------------
// Email params
// ---------------------------------------------------------------------------

export interface SendEmailParams {
  to: string
  toName?: string
  subject: string
  bodyHtml: string
  bodyText?: string
  notificationId?: string
}

// ---------------------------------------------------------------------------
// View types
// ---------------------------------------------------------------------------

export interface NotificationView {
  id: string
  type: string
  title: { ar: string; en: string }
  body: { ar: string; en: string }
  data: Record<string, unknown> | null
  channel: NotificationChannel
  priority: NotificationPriority
  status: string
  readAt: Date | null
  createdAt: Date
}
