"use server"

import { db } from "@/core/database/client"

export type PointsType =
  | "INITIATIVE_CREATED"
  | "INITIATIVE_APPROVED"
  | "PROJECT_CREATED"
  | "PROJECT_COMPLETED"
  | "PARTNERSHIP_CREATED"
  | "VOLUNTEER_HOUR"
  | "VOLUNTEER_APPLICATION"
  | "GENERAL"

const POINTS_VALUES: Record<PointsType, number> = {
  INITIATIVE_CREATED: 20,
  INITIATIVE_APPROVED: 50,
  PROJECT_CREATED: 20,
  PROJECT_COMPLETED: 100,
  PARTNERSHIP_CREATED: 30,
  VOLUNTEER_HOUR: 10,
  VOLUNTEER_APPLICATION: 5,
  GENERAL: 10,
}

const POINTS_DESC_AR: Record<PointsType, string> = {
  INITIATIVE_CREATED: "إنشاء مبادرة مجتمعية",
  INITIATIVE_APPROVED: "اعتماد مبادرة مجتمعية",
  PROJECT_CREATED: "إنشاء مشروع مجتمعي",
  PROJECT_COMPLETED: "إتمام مشروع مجتمعي",
  PARTNERSHIP_CREATED: "إنشاء شراكة مجتمعية",
  VOLUNTEER_HOUR: "ساعة تطوع مسجّلة",
  VOLUNTEER_APPLICATION: "تقديم طلب تطوع",
  GENERAL: "نشاط عام",
}

export async function awardPoints(
  userId: string,
  type: PointsType,
  sourceType?: string,
  sourceId?: string,
): Promise<void> {
  const points = POINTS_VALUES[type]
  await db.communityPointsTransaction.create({
    data: {
      userId,
      points,
      type,
      sourceType,
      sourceId,
      descriptionAr: POINTS_DESC_AR[type],
    },
  })
  await checkAndAwardBadges(userId)
}

export async function getUserTotalPoints(userId: string): Promise<number> {
  const result = await db.communityPointsTransaction.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

export interface LeaderboardEntry {
  userId: string
  name: string | null
  nameAr: string | null
  userType: string
  totalPoints: number
  rank: number
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const results = await db.communityPointsTransaction.groupBy({
    by: ["userId"],
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: limit,
  })

  const userIds = results.map(r => r.userId)
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, nameAr: true, userType: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  return results.map((entry, idx) => {
    const user = userMap.get(entry.userId)
    return {
      userId: entry.userId,
      name: user?.name ?? null,
      nameAr: user?.nameAr ?? null,
      userType: user?.userType ?? "VISITOR",
      totalPoints: entry._sum.points ?? 0,
      rank: idx + 1,
    }
  })
}

export interface UserProfile {
  userId: string
  name: string | null
  nameAr: string | null
  userType: string
  email: string
  totalPoints: number
  volunteerHours: number
  badges: BadgeWithEarned[]
  recentTransactions: PointsTransaction[]
  initiativesCount: number
  projectsCount: number
}

export interface BadgeWithEarned {
  id: string
  nameAr: string
  nameEn: string | null
  descriptionAr: string | null
  iconUrl: string | null
  category: string | null
  earnedAt: Date
}

export interface PointsTransaction {
  id: string
  points: number
  type: string
  descriptionAr: string | null
  createdAt: Date
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [user, totalPointsResult, volProfile, userBadges, recentTx, initiativesCount, projectsCount] =
    await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, nameAr: true, userType: true, email: true } }),
      db.communityPointsTransaction.aggregate({ where: { userId }, _sum: { points: true } }),
      db.volunteerProfile.findUnique({ where: { userId }, select: { totalHours: true } }),
      db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
      db.communityPointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.initiative.count({ where: { ownerId: userId } }),
      db.project.count({ where: { managerId: userId } }),
    ])

  if (!user) return null

  return {
    userId: user.id,
    name: user.name,
    nameAr: user.nameAr,
    userType: user.userType,
    email: user.email,
    totalPoints: totalPointsResult._sum.points ?? 0,
    volunteerHours: Number(volProfile?.totalHours ?? 0),
    badges: userBadges.map(ub => ({
      id: ub.badge.id,
      nameAr: ub.badge.nameAr,
      nameEn: ub.badge.nameEn,
      descriptionAr: ub.badge.descriptionAr,
      iconUrl: ub.badge.iconUrl,
      category: ub.badge.category,
      earnedAt: ub.earnedAt,
    })),
    recentTransactions: recentTx.map(tx => ({
      id: tx.id,
      points: tx.points,
      type: tx.type,
      descriptionAr: tx.descriptionAr,
      createdAt: tx.createdAt,
    })),
    initiativesCount,
    projectsCount,
  }
}

async function checkAndAwardBadges(userId: string): Promise<void> {
  const [totalPoints, volProfile, initiativesCount, existingBadges, allBadges] = await Promise.all([
    getUserTotalPoints(userId),
    db.volunteerProfile.findUnique({ where: { userId }, select: { totalHours: true } }),
    db.initiative.count({ where: { ownerId: userId } }),
    db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    db.badge.findMany({ where: { isActive: true } }),
  ])

  const earnedIds = new Set(existingBadges.map(b => b.badgeId))
  const volHours = Number(volProfile?.totalHours ?? 0)

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue
    let shouldAward = false

    if (badge.pointsRequired > 0 && totalPoints >= badge.pointsRequired) {
      shouldAward = true
    }
    if (badge.category === "volunteering" && volHours >= 10) shouldAward = true
    if (badge.category === "initiatives" && initiativesCount >= 1) shouldAward = true

    if (shouldAward) {
      await db.userBadge.create({
        data: { userId, badgeId: badge.id, sourceType: "auto" },
      })
    }
  }
}
