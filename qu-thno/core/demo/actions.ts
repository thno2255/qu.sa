"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { db } from "@/core/database/client"

// Standalone demo flow — no relation to the real IAM/session system. The
// admin gate below is a single shared passcode behind an httpOnly cookie,
// proportionate to what this is: a disposable showcase of fake submissions,
// not a real authentication boundary.
const DEMO_ADMIN_COOKIE = "demo_admin"
const DEMO_ADMIN_PASSCODE = process.env.DEMO_ADMIN_PASSCODE ?? "Demo@2026!"

export async function isDemoAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  return store.get(DEMO_ADMIN_COOKIE)?.value === "1"
}

export async function demoAdminLoginAction(formData: FormData): Promise<void> {
  const passcode = String(formData.get("passcode") ?? "")
  if (passcode !== DEMO_ADMIN_PASSCODE) {
    redirect("/demo/admin/login?error=1")
  }
  const store = await cookies()
  // path left at the default ("/") deliberately — cookies().delete() in
  // demoAdminLogoutAction clears at the default path too, and a mismatched
  // path means the browser treats set and delete as different cookies,
  // silently leaving the session cookie in place after "logout".
  store.set(DEMO_ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  })
  redirect("/demo/admin")
}

export async function demoAdminLogoutAction(): Promise<void> {
  const store = await cookies()
  store.delete(DEMO_ADMIN_COOKIE)
  redirect("/demo/admin/login")
}

export interface SubmitDemoRequestInput {
  nationalId: string
  serviceSlug: string
  serviceLabelAr: string
  payload: Record<string, unknown>
}

export async function submitDemoRequestAction(input: SubmitDemoRequestInput): Promise<{ id: string }> {
  const created = await db.demoRequest.create({
    data: {
      nationalId: input.nationalId,
      serviceSlug: input.serviceSlug,
      serviceLabelAr: input.serviceLabelAr,
      payload: input.payload as Prisma.InputJsonValue,
    },
  })
  return { id: created.id }
}

export async function getDemoRequests() {
  return db.demoRequest.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getDemoRequestsByNationalId(nationalId: string) {
  return db.demoRequest.findMany({ where: { nationalId }, orderBy: { createdAt: "desc" } })
}

export async function updateDemoRequestStatusAction(id: string, status: "approved" | "rejected"): Promise<void> {
  if (!(await isDemoAdminAuthed())) {
    throw new Error("غير مصرّح")
  }
  await db.demoRequest.update({ where: { id }, data: { status } })
  revalidatePath("/demo/admin")
}
