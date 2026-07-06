import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/core/auth/auth"
import { markNotificationRead, markAllNotificationsRead } from "@/core/notifications/service"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { id, all } = body as { id?: string; all?: boolean }

  if (all) {
    await markAllNotificationsRead(session.user.id)
  } else if (id) {
    await markNotificationRead(id, session.user.id)
  } else {
    return NextResponse.json({ error: "id or all required" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
