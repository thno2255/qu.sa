"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"
import { queueEmail, buildNotificationEmail } from "@/core/notifications/email"
import { notifyRole } from "@/core/notifications/service"
import { uploadFile, generateStorageKey } from "@/core/storage/storage"
import { SLA_DAYS } from "./constants"

type ActionResult = { success: true; id?: string } | { error: string }

const REQUESTER_ROLES = ["STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
const FACULTY_ROLES   = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"]
const STAFF_ROLES     = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// ---------------------------------------------------------------------------
// REQUEST a project visit (requires ≥1 attached file)
// ---------------------------------------------------------------------------

export async function requestProjectVisitAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  if (!REQUESTER_ROLES.includes(session.user.userType ?? "")) {
    return { error: "أعضاء هيئة التدريس والإدارة لا يمكنهم تقديم طلبات زيارة ميدانية" }
  }

  const facultyId       = (formData.get("facultyId")       as string)?.trim()
  const projectTitleAr  = (formData.get("projectTitleAr")  as string)?.trim()
  const descriptionAr   = (formData.get("descriptionAr")   as string)?.trim()
  const locationAr      = (formData.get("locationAr")      as string)?.trim() || undefined
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0)

  if (!facultyId || !projectTitleAr || !descriptionAr)
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }

  if (files.length === 0)
    return { error: "يجب إرفاق ملف واحد على الأقل من ملفات المشروع" }

  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) return { error: `الملف "${f.name}" يتجاوز الحد المسموح (20 ميجابايت)` }
  }

  const faculty = await db.user.findUnique({
    where: { id: facultyId },
    select: { id: true, email: true, nameAr: true, name: true },
  })
  if (!faculty) return { error: "العضو غير موجود" }

  const requester = await db.user.findUnique({
    where: { id: session.user.id },
    select: { nameAr: true, name: true, email: true },
  })

  const visit = await db.projectVisitRequest.create({
    data: { requesterId: session.user.id, facultyId, projectTitleAr, descriptionAr, locationAr },
  })

  // Upload attached files, linked polymorphically to this request
  for (const file of files) {
    const key = generateStorageKey("project_visit", visit.id, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(key, buffer, file.type || "application/octet-stream")
    await db.document.create({
      data: {
        nameAr: file.name,
        type: file.type || "application/octet-stream",
        url,
        size: file.size,
        mimeType: file.type || null,
        moduleRef: "project_visit",
        moduleId: visit.id,
        uploadedBy: session.user.id,
      },
    })
  }

  const facultyName   = faculty.nameAr ?? faculty.name ?? faculty.email
  const requesterName = requester?.nameAr ?? requester?.name ?? "مستخدم"
  const platformUrl   = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: `طلب زيارة ميدانية جديد — ${projectTitleAr}`,
    bodyAr: `
      تلقيت طلب زيارة ميدانية جديداً من <strong>${requesterName}</strong>.<br><br>
      <strong>المشروع:</strong> ${projectTitleAr}<br>
      <strong>التفاصيل:</strong> ${descriptionAr}
      ${locationAr ? `<br><strong>الموقع:</strong> ${locationAr}` : ""}
      <br><br>يجب الرد خلال ${SLA_DAYS} أيام، وإلا سيُعاد توجيه الطلب تلقائياً عبر موظف المسؤولية المجتمعية.
    `,
    ctaUrl:     `${platformUrl}/consultations/project-visits/${visit.id}`,
    ctaLabelAr: "عرض طلب الزيارة",
  })

  await queueEmail({ to: faculty.email, toName: facultyName, subject, bodyHtml, bodyText })

  revalidatePath("/consultations/project-visits")
  return { success: true, id: visit.id }
}

// ---------------------------------------------------------------------------
// ACCEPT / REJECT / SCHEDULE / COMPLETE
// ---------------------------------------------------------------------------

export async function acceptProjectVisitAction(visitId: string, facultyNote?: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const visit = await db.projectVisitRequest.findUnique({
    where: { id: visitId },
    include: { requester: { select: { email: true, nameAr: true, name: true } } },
  })
  if (!visit) return { error: "الطلب غير موجود" }
  if (visit.facultyId !== session.user.id) return { error: "غير مصرح" }
  if (visit.status !== "PENDING") return { error: "تم معالجة هذا الطلب مسبقاً" }

  await db.projectVisitRequest.update({
    where: { id: visitId },
    data: { status: "ACCEPTED", facultyNote: facultyNote ?? null },
  })

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: "تمت الموافقة على طلب الزيارة الميدانية",
    bodyAr: `
      مرحباً ${visit.requester.nameAr ?? visit.requester.name}،<br><br>
      وافق العضو المكلّف على طلب الزيارة الميدانية لمشروع: <strong>${visit.projectTitleAr}</strong>.
      ${facultyNote ? `<br><br><strong>ملاحظة:</strong> ${facultyNote}` : ""}
      <br><br>سيتم التواصل معك لتحديد موعد الزيارة.
    `,
    ctaUrl:     `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/consultations/project-visits/${visitId}`,
    ctaLabelAr: "عرض تفاصيل الطلب",
  })

  await queueEmail({
    to: visit.requester.email,
    toName: visit.requester.nameAr ?? visit.requester.name ?? "",
    subject, bodyHtml, bodyText,
  })

  revalidatePath("/consultations/project-visits")
  revalidatePath(`/consultations/project-visits/${visitId}`)
  return { success: true }
}

export async function rejectProjectVisitAction(visitId: string, facultyNote?: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const visit = await db.projectVisitRequest.findUnique({
    where: { id: visitId },
    include: { requester: { select: { email: true, nameAr: true, name: true } } },
  })
  if (!visit) return { error: "الطلب غير موجود" }
  if (visit.facultyId !== session.user.id) return { error: "غير مصرح" }

  await db.projectVisitRequest.update({
    where: { id: visitId },
    data: { status: "CANCELLED", facultyNote: facultyNote ?? null },
  })

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: "اعتذار عن طلب الزيارة الميدانية",
    bodyAr: `
      نأسف لإبلاغك أن العضو المكلّف اعتذر عن طلب الزيارة الميدانية لمشروع: <strong>${visit.projectTitleAr}</strong>.
      ${facultyNote ? `<br><br><strong>السبب:</strong> ${facultyNote}` : ""}
    `,
    ctaUrl:     `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/consultations/project-visits`,
    ctaLabelAr: "تقديم طلب جديد",
  })

  await queueEmail({
    to: visit.requester.email,
    toName: visit.requester.nameAr ?? visit.requester.name ?? "",
    subject, bodyHtml, bodyText,
  })

  revalidatePath("/consultations/project-visits")
  revalidatePath(`/consultations/project-visits/${visitId}`)
  return { success: true }
}

export async function scheduleProjectVisitAction(visitId: string, scheduledAt: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const visit = await db.projectVisitRequest.findUnique({ where: { id: visitId } })
  if (!visit) return { error: "الطلب غير موجود" }
  if (visit.facultyId !== session.user.id) return { error: "غير مصرح" }
  if (visit.status !== "ACCEPTED") return { error: "يجب قبول الطلب أولاً" }

  await db.projectVisitRequest.update({
    where: { id: visitId },
    data: { status: "SCHEDULED", scheduledAt: new Date(scheduledAt) },
  })

  revalidatePath("/consultations/project-visits")
  revalidatePath(`/consultations/project-visits/${visitId}`)
  return { success: true }
}

export async function completeProjectVisitAction(visitId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const visit = await db.projectVisitRequest.findUnique({ where: { id: visitId } })
  if (!visit) return { error: "الطلب غير موجود" }

  const isOwner = visit.facultyId === session.user.id || visit.requesterId === session.user.id
  if (!isOwner) return { error: "غير مصرح" }

  await db.projectVisitRequest.update({ where: { id: visitId }, data: { status: "COMPLETED" } })

  revalidatePath("/consultations/project-visits")
  revalidatePath(`/consultations/project-visits/${visitId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// SLA escalation — call on list-page load, mirrors core/workflow/engine.ts's
// checkAndEscalateOverdueTasks() but hand-rolled for this bespoke status flow.
// ---------------------------------------------------------------------------

export async function checkAndEscalateOverdueVisits(): Promise<void> {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - SLA_DAYS)

  const overdue = await db.projectVisitRequest.findMany({
    where: { status: "PENDING", assignedAt: { lt: threshold } },
    select: { id: true, projectTitleAr: true, facultyId: true },
  })

  if (overdue.length === 0) return

  await db.projectVisitRequest.updateMany({
    where: { id: { in: overdue.map((v) => v.id) } },
    data: { status: "ESCALATED", escalatedAt: new Date() },
  })

  for (const v of overdue) {
    await notifyRole("COMMUNITY_EMPLOYEE", {
      type: "GENERAL",
      title: { ar: "طلب زيارة ميدانية متأخر", en: "Overdue field visit request" },
      body: {
        ar: `تجاوز طلب الزيارة الميدانية لمشروع "${v.projectTitleAr}" مهلة ${SLA_DAYS} أيام دون رد — بحاجة لإعادة توجيه.`,
        en: `The field visit request for "${v.projectTitleAr}" has exceeded the ${SLA_DAYS}-day response window — needs reassignment.`,
      },
      data: { projectVisitId: v.id },
    })
  }
}

// ---------------------------------------------------------------------------
// REASSIGN (community employee/manager only) — the "إعادة التوجيه" step
// ---------------------------------------------------------------------------

export async function reassignProjectVisitAction(visitId: string, newFacultyId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }
  if (!STAFF_ROLES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const visit = await db.projectVisitRequest.findUnique({ where: { id: visitId } })
  if (!visit) return { error: "الطلب غير موجود" }

  const newFaculty = await db.user.findUnique({
    where: { id: newFacultyId },
    select: { id: true, email: true, nameAr: true, name: true },
  })
  if (!newFaculty) return { error: "العضو الجديد غير موجود" }

  await db.projectVisitRequest.update({
    where: { id: visitId },
    data: {
      facultyId: newFacultyId,
      assignedAt: new Date(),
      status: "PENDING",
      escalatedAt: null,
      reassignedBy: session.user.id,
    },
  })

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: `طلب زيارة ميدانية مُعاد توجيهه — ${visit.projectTitleAr}`,
    bodyAr: `
      تمت إعادة توجيه طلب زيارة ميدانية لك بخصوص مشروع: <strong>${visit.projectTitleAr}</strong>.<br>
      يرجى الرد خلال ${SLA_DAYS} أيام.
    `,
    ctaUrl:     `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/consultations/project-visits/${visitId}`,
    ctaLabelAr: "عرض طلب الزيارة",
  })

  await queueEmail({
    to: newFaculty.email,
    toName: newFaculty.nameAr ?? newFaculty.name ?? "",
    subject, bodyHtml, bodyText,
  })

  revalidatePath("/consultations/project-visits")
  revalidatePath(`/consultations/project-visits/${visitId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// READ helpers
// ---------------------------------------------------------------------------

export async function getFacultyList() {
  return db.user.findMany({
    where: { status: "ACTIVE", userType: { in: ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"] } },
    select: { id: true, nameAr: true, name: true, email: true, jobTitle: true, userType: true },
    orderBy: { nameAr: "asc" },
  })
}

export async function getMyProjectVisits() {
  const session = await auth()
  if (!session?.user?.id) return []

  const userId = session.user.id
  const isFaculty = FACULTY_ROLES.includes(session.user.userType ?? "")

  return db.projectVisitRequest.findMany({
    where: isFaculty ? { facultyId: userId } : { requesterId: userId },
    include: {
      requester: { select: { nameAr: true, name: true, email: true } },
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEscalatedProjectVisits() {
  const session = await auth()
  if (!STAFF_ROLES.includes(session?.user?.userType ?? "")) return []

  return db.projectVisitRequest.findMany({
    where: { status: "ESCALATED" },
    include: {
      requester: { select: { nameAr: true, name: true } },
      faculty:   { select: { nameAr: true, name: true, jobTitle: true } },
    },
    orderBy: { escalatedAt: "desc" },
  })
}

export async function getAdminProjectVisitStats() {
  const session = await auth()
  if (!STAFF_ROLES.includes(session?.user?.userType ?? "")) return null

  const [total, pending, escalated, completed, cancelled, recent] = await Promise.all([
    db.projectVisitRequest.count(),
    db.projectVisitRequest.count({ where: { status: "PENDING" } }),
    db.projectVisitRequest.count({ where: { status: "ESCALATED" } }),
    db.projectVisitRequest.count({ where: { status: "COMPLETED" } }),
    db.projectVisitRequest.count({ where: { status: "CANCELLED" } }),
    db.projectVisitRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        requester: { select: { nameAr: true, name: true } },
        faculty:   { select: { nameAr: true, name: true } },
      },
    }),
  ])

  return { total, pending, escalated, completed, cancelled, recent }
}

export async function getProjectVisit(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const visit = await db.projectVisitRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { nameAr: true, name: true, email: true, userType: true } },
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true } },
    },
  })
  if (!visit) return null

  const isOwner =
    visit.requesterId === session.user.id ||
    visit.facultyId   === session.user.id ||
    STAFF_ROLES.includes(session.user.userType ?? "")

  if (!isOwner) return null

  const files = await db.document.findMany({
    where: { moduleRef: "project_visit", moduleId: id },
    orderBy: { createdAt: "asc" },
  })

  return { ...visit, files }
}
