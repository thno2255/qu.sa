"use server"

import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createWorkflowInstance } from "@/core/workflow/engine"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InitiativeResult = { success: true; id: string } | { error: string }
export type StatusResult = { success: true } | { error: string }

const VALID_STATUSES = ["draft", "pending", "under_review", "approved", "active", "completed", "rejected", "cancelled"]

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createInitiativeAction(
  _: InitiativeResult | null,
  formData: FormData,
): Promise<InitiativeResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  const titleEn = (formData.get("titleEn") as string)?.trim() || undefined
  const descriptionAr = (formData.get("descriptionAr") as string)?.trim() || undefined
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const targetBeneficiaries = parseInt(formData.get("targetBeneficiaries") as string) || undefined
  const budgetAllocated = parseFloat(formData.get("budgetAllocated") as string) || undefined
  const vision2030Pillar = (formData.get("vision2030Pillar") as string)?.trim() || undefined
  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const tagsRaw = (formData.get("tags") as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []

  if (!titleAr) return { error: "العنوان بالعربية مطلوب" }

  const initiative = await db.initiative.create({
    data: {
      titleAr,
      titleEn,
      descriptionAr,
      ownerId: session.user.id,
      status: "draft",
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      targetBeneficiaries,
      budgetAllocated,
      vision2030Pillar,
      sdgGoals,
      tags,
    },
  })

  revalidatePath("/initiatives")
  return { success: true, id: initiative.id }
}

// ---------------------------------------------------------------------------
// SUBMIT FOR APPROVAL (draft → pending + start workflow)
// ---------------------------------------------------------------------------

export async function submitInitiativeForApprovalAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const initiative = await db.initiative.findUnique({ where: { id } })
  if (!initiative) return { error: "المبادرة غير موجودة" }
  if (initiative.ownerId !== session.user.id && !["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType ?? "")) {
    return { error: "غير مصرح" }
  }

  // Find the initiative approval workflow definition
  const wfDef = await db.workflowDefinition.findFirst({
    where: { moduleId: "initiatives", isDefault: true },
  })

  let workflowInstanceId: string | undefined
  if (wfDef) {
    try {
      workflowInstanceId = await createWorkflowInstance({
        definitionId: wfDef.id,
        entityType: "Initiative",
        entityId: id,
        initiatorId: session.user.id,
        metadata: { initiativeTitle: initiative.titleAr, initiatorId: session.user.id },
      })
    } catch (e) {
      console.error("[workflow] Failed to start initiative approval:", e)
    }
  }

  await db.initiative.update({
    where: { id },
    data: {
      status: "pending",
      workflowInstanceId: workflowInstanceId ?? null,
    },
  })

  revalidatePath(`/initiatives/${id}`)
  revalidatePath("/initiatives")
  return { success: true }
}

// ---------------------------------------------------------------------------
// UPDATE STATUS (admin / manager)
// ---------------------------------------------------------------------------

export async function updateInitiativeStatusAction(id: string, status: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType ?? "")) {
    return { error: "غير مصرح" }
  }
  if (!VALID_STATUSES.includes(status)) return { error: "حالة غير صالحة" }

  await db.initiative.update({ where: { id }, data: { status } })
  revalidatePath(`/initiatives/${id}`)
  revalidatePath("/initiatives")
  return { success: true }
}

// ---------------------------------------------------------------------------
// UPDATE (edit)
// ---------------------------------------------------------------------------

export async function updateInitiativeAction(
  _: InitiativeResult | null,
  formData: FormData,
): Promise<InitiativeResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const id = formData.get("id") as string
  if (!id) return { error: "معرّف المبادرة مطلوب" }

  const initiative = await db.initiative.findUnique({ where: { id } })
  if (!initiative) return { error: "المبادرة غير موجودة" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!titleAr) return { error: "العنوان بالعربية مطلوب" }

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const tagsRaw = (formData.get("tags") as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string

  await db.initiative.update({
    where: { id },
    data: {
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      descriptionAr: (formData.get("descriptionAr") as string)?.trim() || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      targetBeneficiaries: parseInt(formData.get("targetBeneficiaries") as string) || null,
      budgetAllocated: parseFloat(formData.get("budgetAllocated") as string) || null,
      vision2030Pillar: (formData.get("vision2030Pillar") as string)?.trim() || null,
      sdgGoals,
      tags,
    },
  })

  revalidatePath(`/initiatives/${id}`)
  revalidatePath("/initiatives")
  return { success: true, id }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteInitiativeAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const initiative = await db.initiative.findUnique({ where: { id } })
  if (!initiative) return { error: "المبادرة غير موجودة" }
  if (initiative.ownerId !== session.user.id && !["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session.user.userType ?? "")) {
    return { error: "غير مصرح" }
  }

  await db.initiative.delete({ where: { id } })
  revalidatePath("/initiatives")
  redirect("/initiatives")
}
