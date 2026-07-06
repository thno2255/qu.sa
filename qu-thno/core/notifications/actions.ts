"use server"

import { auth } from "@/core/auth/auth"
import {
  markNotificationRead,
  markAllNotificationsRead,
  getNotifications,
  getUnreadCount,
} from "./service"
import { db } from "@/core/database/client"
import type { NotificationChannel } from "@prisma/client"

// ---------------------------------------------------------------------------
// Mark one notification as read
// ---------------------------------------------------------------------------

export async function markReadAction(id: string): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false }
  await markNotificationRead(id, session.user.id)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Mark all notifications as read
// ---------------------------------------------------------------------------

export async function markAllReadAction(): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false }
  await markAllNotificationsRead(session.user.id)
  return { success: true }
}

// ---------------------------------------------------------------------------
// Fetch notifications for the current user
// ---------------------------------------------------------------------------

export async function getMyNotificationsAction(options?: {
  limit?: number
  status?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return []
  return getNotifications(session.user.id, options)
}

export async function getMyUnreadCountAction(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) return 0
  return getUnreadCount(session.user.id)
}

// ---------------------------------------------------------------------------
// Update notification preferences
// ---------------------------------------------------------------------------

export type PreferencesResult = { success: true } | { error: string }

export async function updateNotificationPreferencesAction(
  _: PreferencesResult | null,
  formData: FormData,
): Promise<PreferencesResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const userId = session.user.id
  const CHANNELS: NotificationChannel[] = ["IN_APP", "EMAIL"]
  const TYPES = [
    "WORKFLOW_TASK_ASSIGNED",
    "WORKFLOW_APPROVED",
    "WORKFLOW_REJECTED",
    "WORKFLOW_RETURNED",
    "WORKFLOW_ESCALATED",
    "WORKFLOW_SLA_WARNING",
    "GENERAL",
  ]

  // Build upsert operations from form data
  const ops = []
  for (const type of TYPES) {
    for (const channel of CHANNELS) {
      const key = `${type}__${channel}`
      const enabled = formData.get(key) === "on"
      ops.push(
        db.notificationPreference.upsert({
          where: { userId_type_channel: { userId, type, channel } },
          create: { userId, type, channel, enabled },
          update: { enabled },
        }),
      )
    }
  }

  await db.$transaction(ops)
  return { success: true }
}
