"use server"

import { db } from "@/core/database/client"

export interface SearchResult {
  id: string
  type: "initiative" | "project" | "partnership" | "opportunity" | "kb"
  titleAr: string
  titleEn?: string | null
  excerpt?: string | null
  status: string
  href: string
  sdgGoals?: number[]
  createdAt: Date
}

export interface SearchResults {
  items: SearchResult[]
  total: number
  query: string
}

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim()
  if (q.length < 2) return { items: [], total: 0, query }

  const containsOpts = { contains: q, mode: "insensitive" as const }

  const [initiatives, projects, partnerships, opportunities, kbArticles] = await Promise.all([
    db.initiative.findMany({
      where: {
        status: { not: "draft" },
        OR: [
          { titleAr: containsOpts },
          { titleEn: containsOpts },
          { descriptionAr: containsOpts },
          { tags: { has: q } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, descriptionAr: true, status: true, sdgGoals: true, createdAt: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    db.project.findMany({
      where: {
        status: { not: "draft" },
        OR: [
          { titleAr: containsOpts },
          { titleEn: containsOpts },
          { descriptionAr: containsOpts },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, descriptionAr: true, status: true, sdgGoals: true, createdAt: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    db.partnership.findMany({
      where: {
        OR: [
          { titleAr: containsOpts },
          { titleEn: containsOpts },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, status: true, sdgGoals: true, createdAt: true },
      take: 4,
      orderBy: { updatedAt: "desc" },
    }),
    db.volunteerOpportunity.findMany({
      where: {
        status: "open",
        OR: [
          { titleAr: containsOpts },
          { titleEn: containsOpts },
          { descriptionAr: containsOpts },
          { requiredSkills: { has: q } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, descriptionAr: true, status: true, createdAt: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    db.kBArticle.findMany({
      where: {
        status: "published",
        OR: [
          { titleAr: containsOpts },
          { titleEn: containsOpts },
          { contentAr: containsOpts },
          { tags: { has: q } },
        ],
      },
      select: { id: true, titleAr: true, titleEn: true, contentAr: true, status: true, createdAt: true },
      take: 4,
      orderBy: { viewCount: "desc" },
    }),
  ])

  const items: SearchResult[] = [
    ...initiatives.map(i => ({
      id: i.id,
      type: "initiative" as const,
      titleAr: i.titleAr,
      titleEn: i.titleEn,
      excerpt: i.descriptionAr?.slice(0, 120) ?? null,
      status: i.status,
      href: `/initiatives/${i.id}`,
      sdgGoals: i.sdgGoals,
      createdAt: i.createdAt,
    })),
    ...projects.map(p => ({
      id: p.id,
      type: "project" as const,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      excerpt: p.descriptionAr?.slice(0, 120) ?? null,
      status: p.status,
      href: `/projects/${p.id}`,
      sdgGoals: p.sdgGoals,
      createdAt: p.createdAt,
    })),
    ...partnerships.map(p => ({
      id: p.id,
      type: "partnership" as const,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      status: p.status,
      href: `/partnerships/${p.id}`,
      sdgGoals: p.sdgGoals,
      createdAt: p.createdAt,
    })),
    ...opportunities.map(o => ({
      id: o.id,
      type: "opportunity" as const,
      titleAr: o.titleAr,
      titleEn: o.titleEn,
      excerpt: o.descriptionAr?.slice(0, 120) ?? null,
      status: o.status,
      href: `/volunteering/opportunities/${o.id}`,
      createdAt: o.createdAt,
    })),
    ...kbArticles.map(k => ({
      id: k.id,
      type: "kb" as const,
      titleAr: k.titleAr,
      titleEn: k.titleEn,
      excerpt: k.contentAr?.slice(0, 120) ?? null,
      status: k.status,
      href: `/kb/${k.id}`,
      createdAt: k.createdAt,
    })),
  ]

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return { items, total: items.length, query }
}

export async function getRecentItems(): Promise<SearchResult[]> {
  const [initiatives, projects, opportunities] = await Promise.all([
    db.initiative.findMany({
      where: { status: { in: ["active", "approved"] } },
      select: { id: true, titleAr: true, titleEn: true, status: true, sdgGoals: true, createdAt: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    db.project.findMany({
      where: { status: { in: ["active", "in_progress"] } },
      select: { id: true, titleAr: true, titleEn: true, status: true, sdgGoals: true, createdAt: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    db.volunteerOpportunity.findMany({
      where: { status: "open" },
      select: { id: true, titleAr: true, titleEn: true, status: true, createdAt: true },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return [
    ...initiatives.map(i => ({ id: i.id, type: "initiative" as const, titleAr: i.titleAr, titleEn: i.titleEn, status: i.status, href: `/initiatives/${i.id}`, sdgGoals: i.sdgGoals, createdAt: i.createdAt })),
    ...projects.map(p => ({ id: p.id, type: "project" as const, titleAr: p.titleAr, titleEn: p.titleEn, status: p.status, href: `/projects/${p.id}`, sdgGoals: p.sdgGoals, createdAt: p.createdAt })),
    ...opportunities.map(o => ({ id: o.id, type: "opportunity" as const, titleAr: o.titleAr, titleEn: o.titleEn, status: o.status, href: `/volunteering/opportunities/${o.id}`, createdAt: o.createdAt })),
  ]
}
