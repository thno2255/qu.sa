"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"
import { queueEmail, buildNotificationEmail } from "@/core/notifications/email"

type ActionResult = { success: true; id?: string } | { error: string }

// Roles that can SUBMIT consultation requests
const REQUESTER_ROLES = ["STUDENT", "COMMUNITY_EMPLOYEE", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
// Roles that RECEIVE consultation requests
const FACULTY_ROLES   = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"]
// Roles that see admin statistics
const ADMIN_ROLES     = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"]

const CATEGORY_LABEL: Record<string, string> = {
  academic:  "أكاديمية",
  research:  "بحثية",
  career:    "مهنية وتطوير ذاتي",
  community: "مسؤولية مجتمعية",
  other:     "أخرى",
}

// ---------------------------------------------------------------------------
// REQUEST consultation
// ---------------------------------------------------------------------------

export async function requestConsultationAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  if (!REQUESTER_ROLES.includes(session.user.userType ?? "")) {
    return { error: "أعضاء هيئة التدريس والإدارة لا يمكنهم تقديم طلبات استشارة" }
  }

  const facultyId    = (formData.get("facultyId")    as string)?.trim()
  const category     = (formData.get("category")     as string)?.trim()
  const titleAr      = (formData.get("titleAr")      as string)?.trim()
  const descriptionAr= (formData.get("descriptionAr") as string)?.trim()
  const preferredNote= (formData.get("preferredNote") as string)?.trim() || undefined

  if (!facultyId || !category || !titleAr || !descriptionAr) {
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }
  }

  const faculty = await db.user.findUnique({
    where: { id: facultyId },
    select: { id: true, email: true, nameAr: true, name: true, userType: true },
  })
  if (!faculty) return { error: "عضو هيئة التدريس غير موجود" }

  const requester = await db.user.findUnique({
    where: { id: session.user.id },
    select: { nameAr: true, name: true, email: true },
  })

  const consultation = await db.consultationRequest.create({
    data: {
      requesterId: session.user.id,
      facultyId,
      category,
      titleAr,
      descriptionAr,
      preferredNote,
    },
  })

  // Email to faculty member
  const facultyName = faculty.nameAr ?? faculty.name ?? faculty.email
  const requesterName = requester?.nameAr ?? requester?.name ?? "مستخدم"
  const platformUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: `طلب استشارة جديد — ${titleAr}`,
    bodyAr: `
      تلقيت طلب استشارة جديداً من <strong>${requesterName}</strong>.<br><br>
      <strong>نوع الاستشارة:</strong> ${CATEGORY_LABEL[category] ?? category}<br>
      <strong>الموضوع:</strong> ${titleAr}<br>
      <strong>التفاصيل:</strong> ${descriptionAr}
      ${preferredNote ? `<br><strong>الأوقات المفضلة:</strong> ${preferredNote}` : ""}
      <br><br>
      يرجى الدخول إلى المنصة لقبول الطلب وإرسال رابط الحجز للطالب.
    `,
    ctaUrl:      `${platformUrl}/consultations/${consultation.id}`,
    ctaLabelAr:  "عرض طلب الاستشارة",
  })

  await queueEmail({
    to:       faculty.email,
    toName:   facultyName,
    subject,
    bodyHtml,
    bodyText,
  })

  revalidatePath("/consultations")
  return { success: true, id: consultation.id }
}

// ---------------------------------------------------------------------------
// ACCEPT consultation (faculty only) — sends Bookings link to requester
// ---------------------------------------------------------------------------

export async function acceptConsultationAction(
  consultationId: string,
  facultyNote?: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const consultation = await db.consultationRequest.findUnique({
    where: { id: consultationId },
    include: {
      requester: { select: { email: true, nameAr: true, name: true } },
      faculty:   { select: { email: true, nameAr: true, name: true, bookingsUrl: true } },
    },
  })

  if (!consultation) return { error: "الطلب غير موجود" }
  if (consultation.facultyId !== session.user.id) return { error: "غير مصرح" }
  if (consultation.status !== "PENDING") return { error: "تم معالجة هذا الطلب مسبقاً" }

  // Generate Bookings URL — use stored URL or auto-generate from email
  const bookingsUrl =
    consultation.faculty.bookingsUrl ??
    `https://outlook.office365.com/bookwithme/${encodeURIComponent(consultation.faculty.email)}`

  await db.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "ACCEPTED", bookingUrl: bookingsUrl, facultyNote: facultyNote ?? null },
  })

  // Email to requester with Bookings link
  const facultyName   = consultation.faculty.nameAr ?? consultation.faculty.name ?? "الدكتور"
  const requesterName = consultation.requester.nameAr ?? consultation.requester.name ?? "الطالب"

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: `تمت الموافقة على طلب استشارتك`,
    bodyAr: `
      مرحباً ${requesterName}،<br><br>
      وافق <strong>${facultyName}</strong> على طلب استشارتك بموضوع: <strong>${consultation.titleAr}</strong>.<br><br>
      ${facultyNote ? `<strong>ملاحظة الدكتور:</strong> ${facultyNote}<br><br>` : ""}
      لحجز موعدك، انقر على الزر أدناه لفتح تطبيق Microsoft Bookings وتحديد الوقت المناسب:
    `,
    ctaUrl:     bookingsUrl,
    ctaLabelAr: "📅 حجز موعد الاستشارة",
  })

  await queueEmail({
    to:       consultation.requester.email,
    toName:   requesterName,
    subject,
    bodyHtml,
    bodyText,
  })

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// REJECT consultation
// ---------------------------------------------------------------------------

export async function rejectConsultationAction(
  consultationId: string,
  facultyNote?: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const consultation = await db.consultationRequest.findUnique({
    where: { id: consultationId },
    include: {
      requester: { select: { email: true, nameAr: true, name: true } },
      faculty:   { select: { nameAr: true, name: true } },
    },
  })

  if (!consultation) return { error: "الطلب غير موجود" }
  if (consultation.facultyId !== session.user.id) return { error: "غير مصرح" }

  await db.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "CANCELLED", facultyNote: facultyNote ?? null },
  })

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: "اعتذار عن طلب الاستشارة",
    bodyAr: `
      نأسف لإبلاغك أن <strong>${consultation.faculty.nameAr ?? consultation.faculty.name}</strong>
      اعتذر عن قبول طلب استشارتك بموضوع: <strong>${consultation.titleAr}</strong>.
      ${facultyNote ? `<br><br><strong>السبب:</strong> ${facultyNote}` : ""}
      <br><br>يمكنك تقديم طلب استشارة لعضو آخر من هيئة التدريس.
    `,
    ctaUrl:     `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/consultations`,
    ctaLabelAr: "طلب استشارة جديدة",
  })

  await queueEmail({
    to:     consultation.requester.email,
    toName: consultation.requester.nameAr ?? consultation.requester.name ?? "",
    subject,
    bodyHtml,
    bodyText,
  })

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// COMPLETE consultation
// ---------------------------------------------------------------------------

export async function completeConsultationAction(consultationId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const consultation = await db.consultationRequest.findUnique({
    where: { id: consultationId },
  })

  if (!consultation) return { error: "الطلب غير موجود" }
  const isOwner = consultation.facultyId === session.user.id || consultation.requesterId === session.user.id
  if (!isOwner) return { error: "غير مصرح" }

  await db.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "COMPLETED" },
  })

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// GET faculty list (for request form)
// ---------------------------------------------------------------------------

export async function getFacultyList() {
  return db.user.findMany({
    where: {
      status:   "ACTIVE",
      userType: { in: ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"] },
    },
    select: {
      id:          true,
      nameAr:      true,
      name:        true,
      email:       true,
      jobTitle:    true,
      userType:    true,
      bookingsUrl: true,
      _count: {
        select: { consultationFacultySlots: true },
      },
    },
    orderBy: { nameAr: "asc" },
  })
}

// ---------------------------------------------------------------------------
// GET consultations for current user
// ---------------------------------------------------------------------------

export async function getMyConsultations() {
  const session = await auth()
  if (!session?.user?.id) return []

  const userId   = session.user.id
  const userType = session.user.userType ?? ""

  const isFaculty = FACULTY_ROLES.includes(userType)

  return db.consultationRequest.findMany({
    where: isFaculty ? { facultyId: userId } : { requesterId: userId },
    include: {
      requester: { select: { nameAr: true, name: true, email: true } },
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ---------------------------------------------------------------------------
// GET admin statistics (all consultations)
// ---------------------------------------------------------------------------

export async function getAdminConsultationStats() {
  const session = await auth()
  if (!ADMIN_ROLES.includes(session?.user?.userType ?? "")) return null

  const [total, pending, accepted, completed, cancelled, recent] = await Promise.all([
    db.consultationRequest.count(),
    db.consultationRequest.count({ where: { status: "PENDING" } }),
    db.consultationRequest.count({ where: { status: { in: ["ACCEPTED", "SCHEDULED"] } } }),
    db.consultationRequest.count({ where: { status: "COMPLETED" } }),
    db.consultationRequest.count({ where: { status: "CANCELLED" } }),
    db.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        requester: { select: { nameAr: true, name: true } },
        faculty:   { select: { nameAr: true, name: true } },
      },
    }),
  ])

  return { total, pending, accepted, completed, cancelled, recent }
}

// ---------------------------------------------------------------------------
// GET single consultation
// ---------------------------------------------------------------------------

export async function getConsultation(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const consultation = await db.consultationRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { nameAr: true, name: true, email: true, userType: true } },
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true, bookingsUrl: true } },
    },
  })

  if (!consultation) return null

  const isOwner =
    consultation.requesterId === session.user.id ||
    consultation.facultyId   === session.user.id ||
    ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session.user.userType ?? "")

  return isOwner ? consultation : null
}
