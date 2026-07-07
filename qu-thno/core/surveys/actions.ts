"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"

type ActionResult = { success: true } | { error: string }

// الحصول على الاستبيان النشط (أو إنشاؤه تلقائياً)
async function getActiveSurvey() {
  let survey = await db.communityNeedsSurvey.findFirst({ where: { isActive: true } })
  if (!survey) {
    survey = await db.communityNeedsSurvey.create({
      data: { titleAr: "استبيان الاحتياج المجتمعي 2026", isActive: true },
    })
  }
  return survey
}

// تقديم الاستبيان
export async function submitCommunityNeedsSurveyAction(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()

  const respondentName     = (formData.get("respondentName")    as string)?.trim() || undefined
  const respondentOrg      = (formData.get("respondentOrg")     as string)?.trim() || undefined
  const respondentType     = (formData.get("respondentType")    as string)?.trim() || undefined
  const needsCategory      = (formData.get("needsCategory")     as string)?.trim()
  const needDescription    = (formData.get("needDescription")   as string)?.trim()
  const priority           = (formData.get("priority")          as string)?.trim()
  const suggestedSolution  = (formData.get("suggestedSolution") as string)?.trim() || undefined
  const willingToPartner   = formData.get("willingToPartner") === "true"

  if (!needsCategory || !needDescription || !priority)
    return { error: "يرجى ملء جميع الحقول المطلوبة" }

  const survey = await getActiveSurvey()

  await db.communityNeedsResponse.create({
    data: {
      surveyId: survey.id,
      respondentId:   session?.user?.id ?? null,
      respondentName,
      respondentOrg,
      respondentType,
      needsCategory,
      needDescription,
      priority,
      suggestedSolution,
      willingToPartner,
    },
  })

  revalidatePath("/surveys/community-needs")
  return { success: true }
}

// إحصاءات الاستبيان للإدارة
export async function getCommunityNeedsStats() {
  const survey = await getActiveSurvey()

  const responses = await db.communityNeedsResponse.findMany({
    where: { surveyId: survey.id },
    orderBy: { submittedAt: "desc" },
  })

  const byCategory: Record<string, number> = {}
  const byPriority: Record<string, number> = {}
  let willingCount = 0

  for (const r of responses) {
    byCategory[r.needsCategory] = (byCategory[r.needsCategory] ?? 0) + 1
    byPriority[r.priority]      = (byPriority[r.priority]      ?? 0) + 1
    if (r.willingToPartner) willingCount++
  }

  return { total: responses.length, byCategory, byPriority, willingCount, recent: responses.slice(0, 10) }
}
