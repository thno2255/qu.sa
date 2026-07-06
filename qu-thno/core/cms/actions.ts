"use server"

import { db } from "@/core/database/client"
import { auth } from "@/core/auth/auth"
import { revalidatePath } from "next/cache"

export interface StatusResult {
  success: boolean
  error?: string
  id?: string
}

// ─── News Articles ───────────────────────────────────────────────────────────

export async function getNewsArticles(status?: string, limit = 20) {
  return db.newsArticle.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getNewsArticle(id: string) {
  return db.newsArticle.findUnique({ where: { id } })
}

export async function createNewsArticleAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  const titleAr = formData.get("titleAr") as string
  const titleEn = formData.get("titleEn") as string | null
  const contentAr = formData.get("contentAr") as string | null
  const contentEn = formData.get("contentEn") as string | null
  const excerptAr = formData.get("excerptAr") as string | null
  const tagsRaw = formData.get("tags") as string | null
  const status = (formData.get("status") as string) || "draft"

  if (!titleAr?.trim()) return { success: false, error: "العنوان بالعربية مطلوب" }

  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : []

  const article = await db.newsArticle.create({
    data: {
      titleAr: titleAr.trim(),
      titleEn: titleEn?.trim() || null,
      contentAr: contentAr?.trim() || null,
      contentEn: contentEn?.trim() || null,
      excerptAr: excerptAr?.trim() || null,
      tags,
      status,
      authorId: session.user.id,
      publishedAt: status === "published" ? new Date() : null,
    },
  })

  revalidatePath("/cms/news")
  return { success: true, id: article.id }
}

export async function updateNewsArticleAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  const id = formData.get("id") as string
  const titleAr = formData.get("titleAr") as string
  const titleEn = formData.get("titleEn") as string | null
  const contentAr = formData.get("contentAr") as string | null
  const contentEn = formData.get("contentEn") as string | null
  const excerptAr = formData.get("excerptAr") as string | null
  const tagsRaw = formData.get("tags") as string | null
  const status = (formData.get("status") as string) || "draft"

  if (!titleAr?.trim()) return { success: false, error: "العنوان بالعربية مطلوب" }

  const existing = await db.newsArticle.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "المقال غير موجود" }

  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : []

  await db.newsArticle.update({
    where: { id },
    data: {
      titleAr: titleAr.trim(),
      titleEn: titleEn?.trim() || null,
      contentAr: contentAr?.trim() || null,
      contentEn: contentEn?.trim() || null,
      excerptAr: excerptAr?.trim() || null,
      tags,
      status,
      publishedAt: status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  })

  revalidatePath("/cms/news")
  revalidatePath(`/cms/news/${id}`)
  return { success: true, id }
}

export async function deleteNewsArticleAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  await db.newsArticle.delete({ where: { id } })
  revalidatePath("/cms/news")
  return { success: true }
}

// ─── CMS Events ──────────────────────────────────────────────────────────────

export async function getCMSEvents(status?: string, limit = 20) {
  return db.cMSEvent.findMany({
    where: status ? { status } : undefined,
    orderBy: { startDate: "asc" },
    take: limit,
  })
}

export async function getCMSEvent(id: string) {
  return db.cMSEvent.findUnique({ where: { id } })
}

export async function createCMSEventAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  const titleAr = formData.get("titleAr") as string
  const titleEn = formData.get("titleEn") as string | null
  const descriptionAr = formData.get("descriptionAr") as string | null
  const descriptionEn = formData.get("descriptionEn") as string | null
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string | null
  const locationAr = formData.get("locationAr") as string | null
  const locationEn = formData.get("locationEn") as string | null
  const capacityRaw = formData.get("capacity") as string | null
  const status = (formData.get("status") as string) || "draft"

  if (!titleAr?.trim()) return { success: false, error: "العنوان بالعربية مطلوب" }
  if (!startDate) return { success: false, error: "تاريخ البداية مطلوب" }

  const event = await db.cMSEvent.create({
    data: {
      titleAr: titleAr.trim(),
      titleEn: titleEn?.trim() || null,
      descriptionAr: descriptionAr?.trim() || null,
      descriptionEn: descriptionEn?.trim() || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      locationAr: locationAr?.trim() || null,
      locationEn: locationEn?.trim() || null,
      capacity: capacityRaw ? parseInt(capacityRaw) : null,
      status,
      isPublic: true,
    },
  })

  revalidatePath("/cms/events")
  return { success: true, id: event.id }
}

export async function updateCMSEventAction(
  _: StatusResult | null,
  formData: FormData,
): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  const id = formData.get("id") as string
  const titleAr = formData.get("titleAr") as string
  const titleEn = formData.get("titleEn") as string | null
  const descriptionAr = formData.get("descriptionAr") as string | null
  const descriptionEn = formData.get("descriptionEn") as string | null
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string | null
  const locationAr = formData.get("locationAr") as string | null
  const locationEn = formData.get("locationEn") as string | null
  const capacityRaw = formData.get("capacity") as string | null
  const status = (formData.get("status") as string) || "draft"

  if (!titleAr?.trim()) return { success: false, error: "العنوان بالعربية مطلوب" }
  if (!startDate) return { success: false, error: "تاريخ البداية مطلوب" }

  const existing = await db.cMSEvent.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "الفعالية غير موجودة" }

  await db.cMSEvent.update({
    where: { id },
    data: {
      titleAr: titleAr.trim(),
      titleEn: titleEn?.trim() || null,
      descriptionAr: descriptionAr?.trim() || null,
      descriptionEn: descriptionEn?.trim() || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      locationAr: locationAr?.trim() || null,
      locationEn: locationEn?.trim() || null,
      capacity: capacityRaw ? parseInt(capacityRaw) : null,
      status,
    },
  })

  revalidatePath("/cms/events")
  revalidatePath(`/cms/events/${id}`)
  return { success: true, id }
}

export async function deleteCMSEventAction(id: string): Promise<StatusResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "غير مصرح" }

  await db.cMSEvent.delete({ where: { id } })
  revalidatePath("/cms/events")
  return { success: true }
}
