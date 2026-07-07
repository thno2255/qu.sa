"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"
import { queueEmail, buildNotificationEmail } from "@/core/notifications/email"

type ActionResult = { success: true; id?: string } | { error: string }

const REQUESTER_ROLES = ["STUDENT", "COMMUNITY_EMPLOYEE", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
const FACULTY_ROLES   = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"]
const ADMIN_ROLES     = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"]

const CATEGORY_LABEL: Record<string, string> = {
  academic:  "أكاديمية",
  research:  "بحثية",
  career:    "مهنية وتطوير ذاتي",
  community: "مسؤولية مجتمعية",
  other:     "أخرى",
}

// حد الاستشارات الأسبوعية لعضو هيئة التدريس
const WEEKLY_FACULTY_LIMIT = 5

// مستويات النجوم بناءً على عدد الاستشارات المكتملة
function calcStarLevel(completed: number): number {
  if (completed >= 100) return 5
  if (completed >= 50)  return 4
  if (completed >= 30)  return 3
  if (completed >= 15)  return 2
  if (completed >= 5)   return 1
  return 0
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

  const facultyId     = (formData.get("facultyId")     as string)?.trim()
  const category      = (formData.get("category")      as string)?.trim()
  const titleAr       = (formData.get("titleAr")       as string)?.trim()
  const descriptionAr = (formData.get("descriptionAr") as string)?.trim()
  const preferredNote = (formData.get("preferredNote") as string)?.trim() || undefined

  if (!facultyId || !category || !titleAr || !descriptionAr)
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }

  const faculty = await db.user.findUnique({
    where: { id: facultyId },
    select: { id: true, email: true, nameAr: true, name: true, userType: true },
  })
  if (!faculty) return { error: "عضو هيئة التدريس غير موجود" }

  // ── فحص الحد الأسبوعي (5 استشارات / أسبوع) ──
  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const weeklyCount = await db.consultationRequest.count({
    where: {
      facultyId,
      createdAt: { gte: weekStart },
      status:    { not: "CANCELLED" },
    },
  })

  if (weeklyCount >= WEEKLY_FACULTY_LIMIT) {
    return {
      error: `وصل ${faculty.nameAr ?? faculty.name} إلى الحد الأقصى الأسبوعي (${WEEKLY_FACULTY_LIMIT} استشارات). يرجى اختيار عضو آخر أو المحاولة الأسبوع القادم.`,
    }
  }

  const requester = await db.user.findUnique({
    where: { id: session.user.id },
    select: { nameAr: true, name: true, email: true },
  })

  const consultation = await db.consultationRequest.create({
    data: { requesterId: session.user.id, facultyId, category, titleAr, descriptionAr, preferredNote },
  })

  const facultyName   = faculty.nameAr ?? faculty.name ?? faculty.email
  const requesterName = requester?.nameAr ?? requester?.name ?? "مستخدم"
  const platformUrl   = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: `طلب استشارة جديد — ${titleAr}`,
    bodyAr: `
      تلقيت طلب استشارة جديداً من <strong>${requesterName}</strong>.<br><br>
      <strong>نوع الاستشارة:</strong> ${CATEGORY_LABEL[category] ?? category}<br>
      <strong>الموضوع:</strong> ${titleAr}<br>
      <strong>التفاصيل:</strong> ${descriptionAr}
      ${preferredNote ? `<br><strong>الأوقات المفضلة:</strong> ${preferredNote}` : ""}
      <br><br>يرجى الدخول إلى المنصة لقبول الطلب وإرسال رابط الحجز.
    `,
    ctaUrl:     `${platformUrl}/consultations/${consultation.id}`,
    ctaLabelAr: "عرض طلب الاستشارة",
  })

  await queueEmail({ to: faculty.email, toName: facultyName, subject, bodyHtml, bodyText })

  revalidatePath("/consultations")
  return { success: true, id: consultation.id }
}

// ---------------------------------------------------------------------------
// ACCEPT consultation
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

  const bookingsUrl =
    consultation.faculty.bookingsUrl ??
    `https://outlook.office365.com/bookwithme/${encodeURIComponent(consultation.faculty.email)}`

  await db.consultationRequest.update({
    where: { id: consultationId },
    data: { status: "ACCEPTED", bookingUrl: bookingsUrl, facultyNote: facultyNote ?? null },
  })

  const facultyName   = consultation.faculty.nameAr ?? consultation.faculty.name ?? "الدكتور"
  const requesterName = consultation.requester.nameAr ?? consultation.requester.name ?? "الطالب"

  const { subject, bodyHtml, bodyText } = buildNotificationEmail({
    titleAr: "تمت الموافقة على طلب استشارتك",
    bodyAr: `
      مرحباً ${requesterName}،<br><br>
      وافق <strong>${facultyName}</strong> على طلب استشارتك بموضوع: <strong>${consultation.titleAr}</strong>.<br>
      ${facultyNote ? `<strong>ملاحظة:</strong> ${facultyNote}<br><br>` : ""}
      انقر على الزر أدناه لحجز موعدك عبر Microsoft Bookings:
    `,
    ctaUrl:     bookingsUrl,
    ctaLabelAr: "📅 حجز موعد الاستشارة",
  })

  await queueEmail({
    to: consultation.requester.email, toName: requesterName, subject, bodyHtml, bodyText,
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
    to: consultation.requester.email,
    toName: consultation.requester.nameAr ?? consultation.requester.name ?? "",
    subject, bodyHtml, bodyText,
  })

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// COMPLETE consultation + تحديث النجوم
// ---------------------------------------------------------------------------

export async function completeConsultationAction(consultationId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const consultation = await db.consultationRequest.findUnique({ where: { id: consultationId } })
  if (!consultation) return { error: "الطلب غير موجود" }

  const isOwner =
    consultation.facultyId   === session.user.id ||
    consultation.requesterId === session.user.id

  if (!isOwner) return { error: "غير مصرح" }

  await db.consultationRequest.update({
    where: { id: consultationId },
    data:  { status: "COMPLETED" },
  })

  // ── تحديث مستوى نجوم عضو هيئة التدريس ──
  const completedCount = await db.consultationRequest.count({
    where: { facultyId: consultation.facultyId, status: "COMPLETED" },
  })

  const newStarLevel = calcStarLevel(completedCount)

  await db.user.update({
    where: { id: consultation.facultyId },
    data:  { consultationStarLevel: newStarLevel },
  })

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// SUBMIT RATING (تقييم ما بعد الاستشارة)
// ---------------------------------------------------------------------------

export async function submitConsultationRatingAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" }

  const consultationId = (formData.get("consultationId") as string)?.trim()
  const stars          = parseInt(formData.get("stars") as string)
  const commentAr      = (formData.get("commentAr") as string)?.trim() || undefined

  if (!consultationId || !stars || stars < 1 || stars > 5)
    return { error: "يرجى اختيار تقييم بين 1 و 5 نجوم" }

  const consultation = await db.consultationRequest.findUnique({ where: { id: consultationId } })
  if (!consultation) return { error: "الاستشارة غير موجودة" }
  if (consultation.status !== "COMPLETED") return { error: "يمكن التقييم بعد اكتمال الاستشارة فقط" }

  const isRequester = consultation.requesterId === session.user.id
  const isFaculty   = consultation.facultyId   === session.user.id

  if (!isRequester && !isFaculty) return { error: "غير مصرح" }

  const raterType = isRequester ? "requester" : "faculty"

  await db.consultationRating.upsert({
    where:  { consultationId_raterType: { consultationId, raterType } },
    create: { consultationId, raterId: session.user.id, raterType, stars, commentAr },
    update: { stars, commentAr },
  })

  revalidatePath(`/consultations/${consultationId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// GET faculty star stats
// ---------------------------------------------------------------------------

export async function getFacultyStarStats(facultyId: string) {
  const [user, completed, ratings] = await Promise.all([
    db.user.findUnique({
      where:  { id: facultyId },
      select: { consultationStarLevel: true },
    }),
    db.consultationRequest.count({ where: { facultyId, status: "COMPLETED" } }),
    db.consultationRating.findMany({
      where: { consultation: { facultyId }, raterType: "requester" },
      select: { stars: true },
    }),
  ])

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
      : null

  const nextMilestone =
    completed < 5  ? 5  :
    completed < 15 ? 15 :
    completed < 30 ? 30 :
    completed < 50 ? 50 :
    completed < 100 ? 100 : null

  return {
    starLevel:     user?.consultationStarLevel ?? 0,
    completed,
    avgRating,
    nextMilestone,
  }
}

// ---------------------------------------------------------------------------
// GET faculty list
// ---------------------------------------------------------------------------

export async function getFacultyList() {
  return db.user.findMany({
    where: { status: "ACTIVE", userType: { in: ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"] } },
    select: {
      id: true, nameAr: true, name: true, email: true,
      jobTitle: true, userType: true, bookingsUrl: true,
      consultationStarLevel: true,
      _count: { select: { consultationFacultySlots: true } },
    },
    orderBy: [{ consultationStarLevel: "desc" }, { nameAr: "asc" }],
  })
}

// ---------------------------------------------------------------------------
// GET my consultations
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
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true, consultationStarLevel: true } },
      ratings:   true,
    },
    orderBy: { createdAt: "desc" },
  })
}

// ---------------------------------------------------------------------------
// GET admin stats
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
        faculty:   { select: { nameAr: true, name: true, consultationStarLevel: true } },
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
      faculty:   { select: { nameAr: true, name: true, email: true, jobTitle: true, bookingsUrl: true, consultationStarLevel: true } },
      ratings:   true,
    },
  })

  if (!consultation) return null

  const isOwner =
    consultation.requesterId === session.user.id ||
    consultation.facultyId   === session.user.id ||
    ADMIN_ROLES.includes(session.user.userType ?? "")

  return isOwner ? consultation : null
}

// ---------------------------------------------------------------------------
// GET weekly remaining slots for a faculty member
// ---------------------------------------------------------------------------

export async function getFacultyWeeklySlots(facultyId: string) {
  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const used = await db.consultationRequest.count({
    where: { facultyId, createdAt: { gte: weekStart }, status: { not: "CANCELLED" } },
  })

  return { used, limit: WEEKLY_FACULTY_LIMIT, remaining: Math.max(0, WEEKLY_FACULTY_LIMIT - used) }
}
