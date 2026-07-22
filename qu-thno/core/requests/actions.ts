"use server"

import { db } from "@/core/database/client"
import type { RequestBucket, UnifiedRequest } from "./types"

function partnershipBucket(status: string): RequestBucket {
  if (status === "active") return "completed"
  if (status === "rejected") return "on_hold"
  return "new" // draft | pending
}

function eventBucket(status: string): RequestBucket {
  if (status === "published") return "completed"
  if (status === "cancelled") return "on_hold"
  return "new" // draft | pending
}

function consultationBucket(status: string): RequestBucket {
  if (status === "COMPLETED") return "completed"
  if (status === "CANCELLED") return "on_hold"
  if (status === "ACCEPTED" || status === "SCHEDULED") return "in_review"
  return "new" // PENDING
}

function knowledgeExchangeBucket(status: string): RequestBucket {
  if (status === "COMPLETED") return "completed"
  if (status === "CANCELLED") return "on_hold"
  if (status === "REVIEWING" || status === "ACCEPTED" || status === "SCHEDULED") return "in_review"
  return "new" // PENDING
}

function projectVisitBucket(status: string): RequestBucket {
  if (status === "COMPLETED") return "completed"
  if (status === "CANCELLED" || status === "ESCALATED") return "on_hold"
  if (status === "ACCEPTED" || status === "SCHEDULED") return "in_review"
  return "new" // PENDING
}

export async function getAllRequests(limit = 200): Promise<UnifiedRequest[]> {
  const [partnerships, events, consultations, knowledgeExchanges, projectVisits] = await Promise.all([
    db.partnership.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, titleAr: true, titleEn: true, status: true, createdAt: true },
    }),
    db.cMSEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, titleAr: true, titleEn: true, status: true, createdAt: true },
    }),
    db.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, titleAr: true, status: true, createdAt: true },
    }),
    db.knowledgeExchangeRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, topicAr: true, status: true, createdAt: true },
    }),
    db.projectVisitRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, projectTitleAr: true, status: true, createdAt: true },
    }),
  ])

  const unified: UnifiedRequest[] = [
    ...partnerships.map((p): UnifiedRequest => ({
      id: p.id,
      type: "partnership",
      typeLabelAr: "شراكة",
      typeLabelEn: "Partnership",
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      bucket: partnershipBucket(p.status),
      rawStatus: p.status,
      createdAt: p.createdAt,
      href: `/partnerships/${p.id}`,
    })),
    ...events.map((e): UnifiedRequest => ({
      id: e.id,
      type: "event",
      typeLabelAr: "فعالية",
      typeLabelEn: "Event",
      titleAr: e.titleAr,
      titleEn: e.titleEn,
      bucket: eventBucket(e.status),
      rawStatus: e.status,
      createdAt: e.createdAt,
      href: `/cms/events/${e.id}`,
    })),
    ...consultations.map((c): UnifiedRequest => ({
      id: c.id,
      type: "consultation",
      typeLabelAr: "استشارة",
      typeLabelEn: "Consultation",
      titleAr: c.titleAr,
      titleEn: null,
      bucket: consultationBucket(c.status),
      rawStatus: c.status,
      createdAt: c.createdAt,
      href: `/consultations/${c.id}`,
    })),
    ...knowledgeExchanges.map((k): UnifiedRequest => ({
      id: k.id,
      type: "knowledge_exchange",
      typeLabelAr: "تبادل معرفي",
      typeLabelEn: "Knowledge Exchange",
      titleAr: k.topicAr,
      titleEn: null,
      bucket: knowledgeExchangeBucket(k.status),
      rawStatus: k.status,
      createdAt: k.createdAt,
      href: `/knowledge-exchange/${k.id}`,
    })),
    ...projectVisits.map((v): UnifiedRequest => ({
      id: v.id,
      type: "project_visit",
      typeLabelAr: "زيارة ميدانية",
      typeLabelEn: "Field Visit",
      titleAr: v.projectTitleAr,
      titleEn: null,
      bucket: projectVisitBucket(v.status),
      rawStatus: v.status,
      createdAt: v.createdAt,
      href: `/consultations/project-visits/${v.id}`,
    })),
  ]

  unified.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return unified
}
