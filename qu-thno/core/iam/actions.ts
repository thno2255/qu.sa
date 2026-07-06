"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { hashPassword } from "@/core/auth/utils"
import { auth } from "@/core/auth/auth"

type ActionResult = { success: true } | { error: string }

const VALID_USER_TYPES = [
  "SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE",
  "COLLEGE_DEAN", "DEPARTMENT_HEAD", "FACULTY_MEMBER",
  "STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR",
] as const

async function getSession() {
  return auth()
}

// ---------------------------------------------------------------------------
// CREATE USER
// ---------------------------------------------------------------------------

export async function createUserAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession()
  const actorType = session?.user?.userType ?? ""
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(actorType)) {
    return { error: "غير مصرح بهذه العملية" }
  }

  const nameAr = (formData.get("nameAr") as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const userType = (formData.get("userType") as string)?.trim()

  if (!nameAr || !email || !password || !userType) {
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }
  }

  if (!VALID_USER_TYPES.includes(userType as (typeof VALID_USER_TYPES)[number])) {
    return { error: "نوع المستخدم غير صالح" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "صيغة البريد الإلكتروني غير صحيحة" }
  }

  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: "البريد الإلكتروني مستخدم مسبقاً" }

  const roleName = userType.toLowerCase()
  const role = await db.role.findUnique({ where: { name: roleName } })
  if (!role) return { error: "الدور غير موجود في النظام" }

  const hashed = await hashPassword(password)

  await db.user.create({
    data: {
      nameAr,
      email,
      passwordHash: hashed,
      userType: userType as (typeof VALID_USER_TYPES)[number],
      status: "ACTIVE",
      userRoles: { create: { roleId: role.id } },
    },
  })

  revalidatePath("/settings/users")
  return { success: true }
}

// ---------------------------------------------------------------------------
// EDIT USER (name + jobTitle)
// ---------------------------------------------------------------------------

export async function editUserAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession()
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session?.user?.userType ?? "")) {
    return { error: "غير مصرح بهذه العملية" }
  }

  const userId   = (formData.get("userId")   as string)?.trim()
  const nameAr   = (formData.get("nameAr")   as string)?.trim()
  const name     = (formData.get("name")     as string)?.trim() || undefined
  const jobTitle = (formData.get("jobTitle") as string)?.trim() || undefined

  if (!userId || !nameAr) return { error: "الاسم بالعربي مطلوب" }

  await db.user.update({
    where: { id: userId },
    data: { nameAr, name: name ?? null, jobTitle: jobTitle ?? null },
  })

  revalidatePath("/settings/users")
  return { success: true }
}

// ---------------------------------------------------------------------------
// DEACTIVATE / REACTIVATE USER (soft delete)
// ---------------------------------------------------------------------------

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const session = await getSession()
  if (session?.user?.userType !== "SYSTEM_ADMIN") {
    return { error: "يتطلب صلاحية مدير النظام" }
  }
  if (userId === session?.user?.id) {
    return { error: "لا يمكنك تعطيل حسابك الخاص" }
  }

  await db.user.update({ where: { id: userId }, data: { status: "DEACTIVATED" } })
  revalidatePath("/settings/users")
  return { success: true }
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session?.user?.userType ?? "")) {
    return { error: "غير مصرح بهذه العملية" }
  }

  await db.user.update({ where: { id: userId }, data: { status: "ACTIVE" } })
  revalidatePath("/settings/users")
  return { success: true }
}

// ---------------------------------------------------------------------------
// CHANGE USER ROLE
// ---------------------------------------------------------------------------

export async function changeUserRoleAction(
  userId: string,
  newUserType: string,
): Promise<ActionResult> {
  const session = await getSession()
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session?.user?.userType ?? "")) {
    return { error: "غير مصرح بهذه العملية" }
  }
  if (userId === session?.user?.id) {
    return { error: "لا يمكنك تغيير دورك الخاص" }
  }

  if (!VALID_USER_TYPES.includes(newUserType as (typeof VALID_USER_TYPES)[number])) {
    return { error: "نوع المستخدم غير صالح" }
  }

  const roleName = newUserType.toLowerCase()
  const role = await db.role.findUnique({ where: { name: roleName } })
  if (!role) return { error: "الدور غير موجود في النظام" }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { userType: newUserType as (typeof VALID_USER_TYPES)[number] },
    }),
    db.userRole.deleteMany({ where: { userId } }),
    db.userRole.create({ data: { userId, roleId: role.id } }),
  ])

  revalidatePath("/settings/users")
  return { success: true }
}
