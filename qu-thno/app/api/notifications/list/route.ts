import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/core/auth/auth"
import { getNotifications } from "@/core/notifications/service"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json([])
  }

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status") ?? undefined
  const limit = parseInt(searchParams.get("limit") ?? "30", 10)

  const notifications = await getNotifications(session.user.id, { status, limit })
  return NextResponse.json(notifications)
}
