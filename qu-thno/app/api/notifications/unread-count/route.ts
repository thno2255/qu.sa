import { NextResponse } from "next/server"
import { auth } from "@/core/auth/auth"
import { getUnreadCount } from "@/core/notifications/service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 })
  }
  const count = await getUnreadCount(session.user.id)
  return NextResponse.json({ count })
}
