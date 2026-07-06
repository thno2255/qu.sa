import { db } from "@/core/database/client"
import type { SendNotificationParams } from "./types"
import { queueEmail, buildNotificationEmail } from "./email"

// ---------------------------------------------------------------------------
// Core send function — creates in-app notification + optionally queues email
// ---------------------------------------------------------------------------

export async function sendNotification(params: SendNotificationParams): Promise<string> {
  const channels = params.channels ?? ["IN_APP"]

  // Create in-app notification
  const notification = await db.notification.create({
    data: {
      recipientId: params.recipientId,
      type: params.type,
      title: params.title as unknown as import("@prisma/client").Prisma.InputJsonValue,
      body: params.body as unknown as import("@prisma/client").Prisma.InputJsonValue,
      data: (params.data ?? {}) as unknown as import("@prisma/client").Prisma.InputJsonValue,
      channel: "IN_APP",
      priority: params.priority ?? "NORMAL",
      status: "unread",
      expiresAt: params.expiresAt ?? null,
    },
  })

  // Queue email if requested and user prefers email
  if (channels.includes("EMAIL")) {
    const user = await db.user.findUnique({
      where: { id: params.recipientId },
      select: { email: true, name: true, nameAr: true },
    })

    // Check user preference
    const pref = await db.notificationPreference.findFirst({
      where: {
        userId: params.recipientId,
        type: params.type,
        channel: "EMAIL",
      },
    })

    // Send unless explicitly disabled
    if (user && pref?.enabled !== false) {
      const { subject, bodyHtml, bodyText } = buildNotificationEmail({
        titleAr: params.title.ar,
        bodyAr: params.body.ar,
        titleEn: params.title.en,
        bodyEn: params.body.en,
      })

      await queueEmail({
        to: user.email,
        toName: user.nameAr ?? user.name ?? undefined,
        subject,
        bodyHtml,
        bodyText,
        notificationId: notification.id,
      })
    }
  }

  return notification.id
}

// ---------------------------------------------------------------------------
// Workflow-specific notification dispatcher
// ---------------------------------------------------------------------------

export async function sendWorkflowNotification(params: {
  instanceId: string
  decision: string
  actorId: string
}): Promise<void> {
  const task = await db.approvalTask.findFirst({
    where: { id: params.instanceId },
    include: {
      instance: {
        include: { definition: true },
      },
    },
  })
  if (!task) return

  const defName = task.instance.definition.name as Record<string, string>
  const nameAr = defName.ar ?? defName["ar"] ?? "سير العمل"

  // Notify the initiator (metadata.initiatorId) if available
  const meta = task.instance.metadata as Record<string, unknown> | null
  const initiatorId = meta?.initiatorId as string | undefined

  if (!initiatorId) return

  const notifMap: Record<string, { titleAr: string; bodyAr: string; type: string }> = {
    APPROVE: {
      type: "WORKFLOW_APPROVED",
      titleAr: `تمت الموافقة على ${nameAr}`,
      bodyAr: `تمت الموافقة على طلبك في "${nameAr}" بواسطة المراجع المختص.`,
    },
    REJECT: {
      type: "WORKFLOW_REJECTED",
      titleAr: `تم رفض ${nameAr}`,
      bodyAr: `تم رفض طلبك في "${nameAr}". يرجى مراجعة التعليقات واتخاذ الإجراء اللازم.`,
    },
    RETURN: {
      type: "WORKFLOW_RETURNED",
      titleAr: `إعادة ${nameAr} للمراجعة`,
      bodyAr: `أُعيد طلبك في "${nameAr}" للمراجعة. يرجى الاطلاع على التعليقات.`,
    },
  }

  const notif = notifMap[params.decision]
  if (!notif) return

  await sendNotification({
    recipientId: initiatorId,
    type: notif.type as import("./types").NotificationType,
    title: { ar: notif.titleAr, en: notif.titleAr },
    body: { ar: notif.bodyAr, en: notif.bodyAr },
    data: { instanceId: task.instanceId, decision: params.decision },
    channels: ["IN_APP", "EMAIL"],
  })
}

// ---------------------------------------------------------------------------
// Send a notification to all users of a given role
// ---------------------------------------------------------------------------

export async function notifyRole(
  userType: string,
  params: Omit<SendNotificationParams, "recipientId">,
): Promise<void> {
  const users = await db.user.findMany({
    where: { userType: userType as import("@prisma/client").UserType, status: "ACTIVE" },
    select: { id: true },
  })

  await Promise.all(
    users.map((u) => sendNotification({ ...params, recipientId: u.id })),
  )
}

// ---------------------------------------------------------------------------
// Mark notification as read
// ---------------------------------------------------------------------------

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { id, recipientId: userId },
    data: { status: "read", readAt: new Date() },
  })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { recipientId: userId, status: "unread" },
    data: { status: "read", readAt: new Date() },
  })
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { recipientId: userId, status: "unread" },
  })
}

export async function getNotifications(userId: string, options?: { limit?: number; status?: string }) {
  return db.notification.findMany({
    where: {
      recipientId: userId,
      status: options?.status,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  })
}
