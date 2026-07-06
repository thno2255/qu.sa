"use server"

import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createWorkflowInstance } from "@/core/workflow/engine"

export type ProjectResult = { success: true; id: string } | { error: string }
export type StatusResult = { success: true } | { error: string }

const ADMIN_TYPES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]
const CREATE_TYPES = [...ADMIN_TYPES, "DEPARTMENT_HEAD", "FACULTY_MEMBER"]

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createProjectAction(
  _: ProjectResult | null,
  formData: FormData,
): Promise<ProjectResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!CREATE_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!titleAr) return { error: "العنوان بالعربية مطلوب" }

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const initiativeId = (formData.get("initiativeId") as string)?.trim() || undefined

  const project = await db.project.create({
    data: {
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      descriptionAr: (formData.get("descriptionAr") as string)?.trim() || null,
      managerId: session.user.id,
      initiativeId: initiativeId ?? null,
      status: "draft",
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      budget: parseFloat(formData.get("budget") as string) || null,
      riskLevel: (formData.get("riskLevel") as string)?.trim() || null,
      sdgGoals,
    },
  })

  revalidatePath("/projects")
  return { success: true, id: project.id }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateProjectAction(
  _: ProjectResult | null,
  formData: FormData,
): Promise<ProjectResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const id = formData.get("id") as string
  if (!id) return { error: "معرّف المشروع مطلوب" }

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return { error: "المشروع غير موجود" }

  const isManager = project.managerId === session.user.id
  const isAdmin = ADMIN_TYPES.includes(session.user.userType ?? "")
  if (!isManager && !isAdmin) return { error: "غير مصرح" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!titleAr) return { error: "العنوان بالعربية مطلوب" }

  const sdgRaw = formData.getAll("sdgGoals") as string[]
  const sdgGoals = sdgRaw.map(Number).filter((n) => n >= 1 && n <= 17)
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string

  await db.project.update({
    where: { id },
    data: {
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      descriptionAr: (formData.get("descriptionAr") as string)?.trim() || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      budget: parseFloat(formData.get("budget") as string) || null,
      riskLevel: (formData.get("riskLevel") as string)?.trim() || null,
      sdgGoals,
    },
  })

  revalidatePath(`/projects/${id}`)
  revalidatePath("/projects")
  return { success: true, id }
}

// ---------------------------------------------------------------------------
// SUBMIT FOR APPROVAL
// ---------------------------------------------------------------------------

export async function submitProjectForApprovalAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return { error: "المشروع غير موجود" }

  const isManager = project.managerId === session.user.id
  const isAdmin = ADMIN_TYPES.includes(session.user.userType ?? "")
  if (!isManager && !isAdmin) return { error: "غير مصرح" }

  const wfDef = await db.workflowDefinition.findFirst({
    where: { moduleId: "projects", isDefault: true },
  })

  let workflowInstanceId: string | undefined
  if (wfDef) {
    try {
      workflowInstanceId = await createWorkflowInstance({
        definitionId: wfDef.id,
        entityType: "Project",
        entityId: id,
        initiatorId: session.user.id,
        metadata: { projectTitle: project.titleAr, initiatorId: session.user.id },
      })
    } catch (e) {
      console.error("[workflow] Failed to start project approval:", e)
    }
  }

  await db.project.update({
    where: { id },
    data: { status: "pending", workflowInstanceId: workflowInstanceId ?? null },
  })

  revalidatePath(`/projects/${id}`)
  revalidatePath("/projects")
  return { success: true }
}

// ---------------------------------------------------------------------------
// ADD MILESTONE
// ---------------------------------------------------------------------------

export async function addMilestoneAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const projectId = formData.get("projectId") as string
  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!projectId || !titleAr) return { error: "البيانات مطلوبة" }

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) return { error: "المشروع غير موجود" }

  const dueDateStr = formData.get("dueDate") as string
  const count = await db.projectMilestone.count({ where: { projectId } })

  await db.projectMilestone.create({
    data: {
      projectId,
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      order: count,
    },
  })

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// COMPLETE MILESTONE
// ---------------------------------------------------------------------------

export async function completeMilestoneAction(milestoneId: string, projectId: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  await db.projectMilestone.update({
    where: { id: milestoneId },
    data: { status: "completed", completedAt: new Date() },
  })

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteProjectAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return { error: "المشروع غير موجود" }

  const isManager = project.managerId === session.user.id
  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session.user.userType ?? "")
  if (!isManager && !isAdmin) return { error: "غير مصرح" }

  await db.project.delete({ where: { id } })
  revalidatePath("/projects")
  redirect("/projects")
}
