"use server"

import { db } from "@/core/database/client"

export interface PublicStats {
  users: number
  initiatives: number
  projects: number
  partnerships: number
  opportunities: number
  volunteerHours: number
  beneficiaries: number
  partners: number
}

export async function getPublicStats(): Promise<PublicStats> {
  const [
    users,
    initiatives,
    projects,
    partnerships,
    opportunities,
    hoursResult,
    beneficiariesResult,
    partners,
  ] = await Promise.all([
    db.user.count({ where: { status: "ACTIVE" } }),
    db.initiative.count({ where: { status: { not: "draft" } } }),
    db.project.count({ where: { status: { not: "draft" } } }),
    db.partnership.count({ where: { status: "active" } }),
    db.volunteerOpportunity.count({ where: { status: { in: ["open", "in_progress"] } } }),
    db.volunteerLog.aggregate({ _sum: { hours: true } }),
    db.initiative.aggregate({ _sum: { targetBeneficiaries: true } }),
    db.partner.count({ where: { status: "active" } }),
  ])

  return {
    users,
    initiatives,
    projects,
    partnerships,
    opportunities,
    volunteerHours: Math.round(Number(hoursResult._sum.hours ?? 0)),
    beneficiaries: Number(beneficiariesResult._sum.targetBeneficiaries ?? 0),
    partners,
  }
}

export interface FeaturedInitiative {
  id: string
  titleAr: string
  descriptionAr: string | null
  status: string
  targetBeneficiaries: number | null
  sdgGoals: number[]
  startDate: Date | null
}

export async function getFeaturedInitiatives(): Promise<FeaturedInitiative[]> {
  return db.initiative.findMany({
    where: { status: { in: ["active", "completed", "approved"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      titleAr: true,
      descriptionAr: true,
      status: true,
      targetBeneficiaries: true,
      sdgGoals: true,
      startDate: true,
    },
  })
}

export interface FeaturedProject {
  id: string
  titleAr: string
  descriptionAr: string | null
  status: string
  sdgGoals: number[]
  startDate: Date | null
  endDate: Date | null
}

export async function getFeaturedProjects(): Promise<FeaturedProject[]> {
  return db.project.findMany({
    where: { status: { in: ["active", "completed"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      titleAr: true,
      descriptionAr: true,
      status: true,
      sdgGoals: true,
      startDate: true,
      endDate: true,
    },
  })
}

export interface PublicNewsArticle {
  id: string
  titleAr: string
  excerptAr: string | null
  publishedAt: Date | null
  tags: string[]
}

export async function getLatestNews(): Promise<PublicNewsArticle[]> {
  return db.newsArticle.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: {
      id: true,
      titleAr: true,
      excerptAr: true,
      publishedAt: true,
      tags: true,
    },
  })
}

export interface PublicEvent {
  id: string
  titleAr: string
  descriptionAr: string | null
  startDate: Date
  endDate: Date | null
  locationAr: string | null
  capacity: number | null
  registrations: number
}

export async function getUpcomingEvents(): Promise<PublicEvent[]> {
  return db.cMSEvent.findMany({
    where: {
      status: "published",
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    take: 4,
    select: {
      id: true,
      titleAr: true,
      descriptionAr: true,
      startDate: true,
      endDate: true,
      locationAr: true,
      capacity: true,
      registrations: true,
    },
  })
}

export interface PublicPartner {
  id: string
  nameAr: string
  nameEn: string | null
  type: string
}

export async function getActivePartners(): Promise<PublicPartner[]> {
  return db.partner.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
    take: 16,
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      type: true,
    },
  })
}

export async function getSDGCoverage(): Promise<Record<number, number>> {
  const initiatives = await db.initiative.findMany({
    where: { status: { not: "draft" } },
    select: { sdgGoals: true },
  })

  const sdgCount: Record<number, number> = {}
  for (const init of initiatives) {
    for (const goal of init.sdgGoals) {
      sdgCount[goal] = (sdgCount[goal] ?? 0) + 1
    }
  }
  return sdgCount
}
