"use server"

import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type VolResult = { success: true; id: string } | { error: string }
export type StatusResult = { success: true } | { error: string }

const ADMIN_TYPES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

// ---------------------------------------------------------------------------
// CREATE OPPORTUNITY (admin only)
// ---------------------------------------------------------------------------

export async function createOpportunityAction(
  _: VolResult | null,
  formData: FormData,
): Promise<VolResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!ADMIN_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const titleAr = (formData.get("titleAr") as string)?.trim()
  if (!titleAr) return { error: "عنوان الفرصة مطلوب" }

  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const skillsRaw = (formData.get("skills") as string)?.trim()
  const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : []

  const opp = await db.volunteerOpportunity.create({
    data: {
      titleAr,
      titleEn: (formData.get("titleEn") as string)?.trim() || null,
      descriptionAr: (formData.get("descriptionAr") as string)?.trim() || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      endDate: endDateStr ? new Date(endDateStr) : null,
      hoursRequired: parseFloat(formData.get("hoursRequired") as string) || null,
      spotsTotal: parseInt(formData.get("spotsTotal") as string) || null,
      requiredSkills: skills,
      status: "open",
    },
  })

  revalidatePath("/volunteering")
  return { success: true, id: opp.id }
}

// ---------------------------------------------------------------------------
// APPLY TO OPPORTUNITY
// ---------------------------------------------------------------------------

export async function applyToOpportunityAction(opportunityId: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const userType = session.user.userType ?? ""
  if (!["STUDENT", "VOLUNTEER", "FACULTY_MEMBER", "EXTERNAL_ENTITY"].includes(userType)) {
    return { error: "غير مصرح بالتطوع" }
  }

  const opp = await db.volunteerOpportunity.findUnique({ where: { id: opportunityId } })
  if (!opp) return { error: "الفرصة غير موجودة" }
  if (opp.status !== "open") return { error: "هذه الفرصة لم تعد متاحة" }

  if (opp.spotsTotal !== null && opp.spotsFilled >= opp.spotsTotal) {
    return { error: "المقاعد ممتلئة" }
  }

  const existing = await db.volunteerApplication.findFirst({
    where: { opportunityId, volunteerId: session.user.id },
  })
  if (existing) return { error: "لقد تقدمت لهذه الفرصة من قبل" }

  await db.volunteerApplication.create({
    data: { opportunityId, volunteerId: session.user.id, status: "pending" },
  })

  revalidatePath(`/volunteering/opportunities/${opportunityId}`)
  revalidatePath("/volunteering/my-applications")
  return { success: true }
}

// ---------------------------------------------------------------------------
// REVIEW APPLICATION (admin)
// ---------------------------------------------------------------------------

export async function reviewApplicationAction(
  applicationId: string,
  status: "approved" | "rejected",
  notes?: string,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!ADMIN_TYPES.includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  const app = await db.volunteerApplication.findUnique({ where: { id: applicationId } })
  if (!app) return { error: "الطلب غير موجود" }

  await db.volunteerApplication.update({
    where: { id: applicationId },
    data: { status, reviewedAt: new Date(), reviewedBy: session.user.id, notes: notes ?? null },
  })

  // Increment spotsFilled on approval
  if (status === "approved") {
    await db.volunteerOpportunity.update({
      where: { id: app.opportunityId },
      data: { spotsFilled: { increment: 1 } },
    })
  }

  revalidatePath(`/volunteering/opportunities/${app.opportunityId}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// LOG VOLUNTEER HOURS
// ---------------------------------------------------------------------------

export async function logVolunteerHoursAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const hoursStr = formData.get("hours") as string
  const dateStr = formData.get("date") as string
  const hours = parseFloat(hoursStr)

  if (!hours || hours <= 0) return { error: "عدد الساعات غير صالح" }
  if (!dateStr) return { error: "التاريخ مطلوب" }

  const opportunityId = (formData.get("opportunityId") as string)?.trim() || undefined

  await db.volunteerLog.create({
    data: {
      volunteerId: session.user.id,
      opportunityId: opportunityId ?? null,
      hours,
      date: new Date(dateStr),
      descriptionAr: (formData.get("descriptionAr") as string)?.trim() || null,
    },
  })

  // Update total hours in profile (upsert)
  await db.volunteerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, totalHours: hours },
    update: { totalHours: { increment: hours } },
  })

  revalidatePath("/volunteering/my-applications")
  revalidatePath("/volunteering/log-hours")
  return { success: true }
}

// ---------------------------------------------------------------------------
// DELETE OPPORTUNITY (admin)
// ---------------------------------------------------------------------------

export async function deleteOpportunityAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }
  if (!["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(session.user.userType ?? "")) return { error: "غير مصرح" }

  await db.volunteerOpportunity.delete({ where: { id } })
  revalidatePath("/volunteering")
  redirect("/volunteering")
}
