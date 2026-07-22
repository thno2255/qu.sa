"use server"

import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createWorkflowInstance } from "@/core/workflow/engine"
import { notifyRole } from "@/core/notifications/service"

export type PartnershipResult = { success: true; id: string } | { error: string }
export type StatusResult = { success: true } | { error: string }

const ADMIN_TYPES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

// ---------------------------------------------------------------------------
// CREATE (also upserts Partner record)
// ---------------------------------------------------------------------------

export async function createPartnershipAction(
  _: PartnershipResult | null,
  formData: FormData,
): Promise<PartnershipResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!ADMIN_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  const partnerNameAr = (formData.get("partnerNameAr") as string)?.trim()
  const partnerType = (formData.get("partnerType") as string)?.trim()

  if (!titleAr) return { error: "عنوان الشراكة مطلوب" }
  if (!partnerNameAr) return { error: "اسم الجهة الشريكة مطلوب" }

  // Upsert partner by name
  const partner = await db.partner.upsert({
    where: { id: `name:${partnerNameAr}` },
    create: {
      id: `name:${partnerNameAr}`,
      nameAr: partnerNameAr,
      nameEn: (formData.get("partnerNameEn") as string)?.trim() || null,
      type: partnerType || "government",
      sector: (formData.get("partnerSector") as string)?.trim() || null,
      email: (formData.get("partnerEmail") as string)?.trim() || null,
      website: (formData.get("partnerWebsite") as string)?.trim() || null,
    },
    update: {
      nameEn: (formData.get("partnerNameEn") as string)?.trim() || null,
      sector: (formData.get("partnerSector") as string)?.trim() || null,
    },
  })

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const renewalDateStr = formData.get("renewalDate") as string

  const partnership = await db.partnership.create({
    data: {
      partnerId: partner.id,
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      type: (formData.get("type") as string)?.trim() || "مذكرة تفاهم",
      status: "draft",
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      renewalDate: renewalDateStr ? new Date(renewalDateStr) : null,
      partnershipValue: parseFloat(formData.get("partnershipValue") as string) || null,
      sdgGoals,
    },
  })

  revalidatePath("/partnerships")
  return { success: true, id: partnership.id }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updatePartnershipAction(
  _: PartnershipResult | null,
  formData: FormData,
): Promise<PartnershipResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!ADMIN_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const id = formData.get("id") as string
  if (!id) return { error: "معرّف الشراكة مطلوب" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!titleAr) return { error: "عنوان الشراكة مطلوب" }

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const renewalDateStr = formData.get("renewalDate") as string

  await db.partnership.update({
    where: { id },
    data: {
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      type: (formData.get("type") as string)?.trim() || "مذكرة تفاهم",
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      renewalDate: renewalDateStr ? new Date(renewalDateStr) : null,
      partnershipValue: parseFloat(formData.get("partnershipValue") as string) || null,
      sdgGoals,
    },
  })

  revalidatePath(`/partnerships/${id}`)
  revalidatePath("/partnerships")
  return { success: true, id }
}

// ---------------------------------------------------------------------------
// SUBMIT FOR APPROVAL
// ---------------------------------------------------------------------------

export async function submitPartnershipForApprovalAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!ADMIN_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const partnership = await db.partnership.findUnique({ where: { id } })
  if (!partnership) return { error: "الشراكة غير موجودة" }

  const wfDef = await db.workflowDefinition.findFirst({
    where: { moduleId: "partnerships", isDefault: true },
  })

  let workflowInstanceId: string | undefined
  if (wfDef) {
    try {
      workflowInstanceId = await createWorkflowInstance({
        definitionId: wfDef.id,
        entityType: "Partnership",
        entityId: id,
        initiatorId: session.user.id,
        metadata: { partnershipTitle: partnership.titleAr, initiatorId: session.user.id },
      })
    } catch (e) {
      console.error("[workflow] Failed to start partnership approval:", e)
    }
  }

  await db.partnership.update({
    where: { id },
    data: { status: "pending", workflowInstanceId: workflowInstanceId ?? null },
  })

  revalidatePath(`/partnerships/${id}`)
  revalidatePath("/partnerships")
  return { success: true }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deletePartnershipAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  await db.partnership.delete({ where: { id } })
  revalidatePath("/partnerships")
  redirect("/partnerships")
}

// ---------------------------------------------------------------------------
// Public partnership request (no login required)
// ---------------------------------------------------------------------------

export async function requestPublicPartnershipAction(
  _: PartnershipResult | null,
  formData: FormData,
): Promise<PartnershipResult> {
  const partnerNameAr = (formData.get("partnerNameAr") as string)?.trim()
  const titleAr = (formData.get("titleAr") as string)?.trim()
  const contactName = (formData.get("contactName") as string)?.trim()
  const contactEmail = (formData.get("contactEmail") as string)?.trim()
  const contactPhone = (formData.get("contactPhone") as string)?.trim() || null

  if (!partnerNameAr) return { error: "اسم الجهة مطلوب" }
  if (!titleAr) return { error: "عنوان الشراكة المقترحة مطلوب" }
  if (!contactEmail) return { error: "البريد الإلكتروني للتواصل مطلوب" }

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)

  const partner = await db.partner.upsert({
    where: { id: `name:${partnerNameAr}` },
    create: {
      id: `name:${partnerNameAr}`,
      nameAr: partnerNameAr,
      nameEn: (formData.get("partnerNameEn") as string)?.trim() || null,
      type: (formData.get("partnerType") as string)?.trim() || "government",
      sector: (formData.get("partnerSector") as string)?.trim() || null,
      email: (formData.get("partnerEmail") as string)?.trim() || contactEmail,
      phone: (formData.get("partnerPhone") as string)?.trim() || contactPhone,
      website: (formData.get("partnerWebsite") as string)?.trim() || null,
      status: "pending",
    },
    update: {},
  })

  const partnership = await db.partnership.create({
    data: {
      partnerId: partner.id,
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      type: (formData.get("type") as string)?.trim() || "مذكرة تفاهم",
      status: "pending",
      sdgGoals,
      metadata: {
        requestedBy: { contactName, contactEmail, contactPhone },
        source: "public",
      },
    },
  })

  const wfDef = await db.workflowDefinition.findFirst({
    where: { moduleId: "partnerships", isDefault: true },
  })

  if (wfDef) {
    try {
      const workflowInstanceId = await createWorkflowInstance({
        definitionId: wfDef.id,
        entityType: "Partnership",
        entityId: partnership.id,
        metadata: { partnershipTitle: titleAr, requestedBy: contactName || partnerNameAr },
      })
      await db.partnership.update({
        where: { id: partnership.id },
        data: { workflowInstanceId },
      })
    } catch (e) {
      console.error("[workflow] Failed to start partnership approval:", e)
    }
  }

  await notifyRole("COMMUNITY_EMPLOYEE", {
    type: "GENERAL",
    title: { ar: "طلب شراكة جديد", en: "New partnership request" },
    body: {
      ar: `تقدّمت جهة "${partnerNameAr}" بطلب شراكة: ${titleAr}`,
      en: `"${partnerNameAr}" requested a partnership: ${titleAr}`,
    },
    data: { partnershipId: partnership.id },
  })

  revalidatePath("/partnerships")
  return { success: true, id: partnership.id }
}
