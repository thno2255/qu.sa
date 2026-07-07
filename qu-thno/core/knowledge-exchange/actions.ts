"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"

type ActionResult = { success: true; id?: string } | { error: string }

const ADMIN_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

export const KE_CATEGORY_LABEL: Record<string, string> = {
  technology:     "التقنية والابتكار",
  management:     "الإدارة والقيادة",
  sustainability: "الاستدامة والبيئة",
  legal:          "القانون والامتثال",
  finance:        "المالية والاستثمار",
  other:          "أخرى",
}

export const KE_STATUS_LABEL: Record<string, string> = {
  PENDING:   "في انتظار المراجعة",
  REVIEWING: "قيد الدراسة",
  ACCEPTED:  "مقبول",
  SCHEDULED: "مجدول",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
}

// ---------------------------------------------------------------------------
// تقديم طلب تبادل معرفي (الشركات / الجهات الخارجية)
// ---------------------------------------------------------------------------

export async function requestKnowledgeExchangeAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()

  const companyName   = (formData.get("companyName")   as string)?.trim()
  const contactName   = (formData.get("contactName")   as string)?.trim() || undefined
  const contactEmail  = (formData.get("contactEmail")  as string)?.trim() || undefined
  const contactPhone  = (formData.get("contactPhone")  as string)?.trim() || undefined
  const topicAr       = (formData.get("topicAr")       as string)?.trim()
  const descriptionAr = (formData.get("descriptionAr") as string)?.trim()
  const category      = (formData.get("category")      as string)?.trim()

  if (!companyName || !topicAr || !descriptionAr || !category)
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }

  const record = await db.knowledgeExchangeRequest.create({
    data: {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      topicAr,
      descriptionAr,
      category,
      requesterId: session?.user?.id ?? null,
    },
  })

  revalidatePath("/knowledge-exchange")
  return { success: true, id: record.id }
}

// ---------------------------------------------------------------------------
// تحديث الحالة (للإدارة)
// ---------------------------------------------------------------------------

export async function updateKEStatusAction(
  id: string,
  status: string,
  opts?: { assignedFacultyId?: string; adminNotes?: string },
): Promise<ActionResult> {
  const session = await auth()
  if (!ADMIN_ROLES.includes(session?.user?.userType ?? ""))
    return { error: "غير مصرح" }

  await db.knowledgeExchangeRequest.update({
    where: { id },
    data: {
      status:             status as never,
      assignedFacultyId:  opts?.assignedFacultyId ?? undefined,
      adminNotes:         opts?.adminNotes        ?? undefined,
    },
  })

  revalidatePath("/knowledge-exchange")
  revalidatePath(`/knowledge-exchange/${id}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// قائمة الطلبات
// ---------------------------------------------------------------------------

export async function getKnowledgeExchangeRequests(status?: string) {
  return db.knowledgeExchangeRequest.findMany({
    where:   status ? { status: status as never } : undefined,
    include: {
      assignedFaculty: { select: { nameAr: true, name: true, jobTitle: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getKnowledgeExchangeRequest(id: string) {
  return db.knowledgeExchangeRequest.findUnique({
    where:   { id },
    include: {
      requester:       { select: { nameAr: true, name: true, email: true } },
      assignedFaculty: { select: { nameAr: true, name: true, jobTitle: true, email: true } },
    },
  })
}

// إحصاءات للوحة التحكم
export async function getKEStats() {
  const [total, pending, completed] = await Promise.all([
    db.knowledgeExchangeRequest.count(),
    db.knowledgeExchangeRequest.count({ where: { status: "PENDING" } }),
    db.knowledgeExchangeRequest.count({ where: { status: "COMPLETED" } }),
  ])
  return { total, pending, completed }
}
