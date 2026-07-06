"use server"

import { db } from "@/core/database/client"

export interface BarDataPoint {
  label: string
  labelAr: string
  value: number
  color?: string
}

export interface LineDataPoint {
  label: string
  value: number
}

export interface DonutSegment {
  label: string
  labelAr: string
  value: number
  color: string
}

export interface AnalyticsSummary {
  initiativesByStatus: BarDataPoint[]
  projectsByStatus: BarDataPoint[]
  volunteerHoursByMonth: LineDataPoint[]
  sdgDistribution: DonutSegment[]
  partnershipsByType: BarDataPoint[]
  budgetAllocation: DonutSegment[]
  totals: {
    initiatives: number
    projects: number
    partnerships: number
    volunteers: number
    totalBeneficiaries: number
    totalVolunteerHours: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending: "#f59e0b",
  active: "#10b981",
  completed: "#3b82f6",
  rejected: "#ef4444",
  cancelled: "#6b7280",
  open: "#10b981",
  in_progress: "#8b5cf6",
  closed: "#6b7280",
}

const SDG_COLORS: Record<number, string> = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d",
  5: "#ff3a21", 6: "#26bde2", 7: "#fcc30b", 8: "#a21942",
  9: "#fd6925", 10: "#dd1367", 11: "#fd9d24", 12: "#bf8b2e",
  13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b", 16: "#00689d",
  17: "#19486a",
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [
    initiativeGroups,
    projectGroups,
    partnershipGroups,
    volOppsGroups,
    allInitiatives,
    volHoursResult,
    beneficiariesResult,
    budgetResult,
    volApplications,
  ] = await Promise.all([
    db.initiative.groupBy({ by: ["status"], _count: { id: true }, _sum: { budgetAllocated: true } }),
    db.project.groupBy({ by: ["status"], _count: { id: true } }),
    db.partnership.groupBy({ by: ["status"], _count: { id: true } }),
    db.volunteerOpportunity.groupBy({ by: ["status"], _count: { id: true } }),
    db.initiative.findMany({ select: { sdgGoals: true, status: true, budgetAllocated: true } }),
    db.volunteerProfile.aggregate({ _sum: { totalHours: true } }),
    db.initiative.aggregate({ _sum: { targetBeneficiaries: true } }),
    db.initiative.aggregate({ _sum: { budgetAllocated: true } }),
    db.volunteerApplication.count(),
  ])

  const statusLabelAr: Record<string, string> = {
    draft: "مسودة", pending: "قيد المراجعة", active: "نشطة",
    completed: "مكتملة", rejected: "مرفوضة", cancelled: "ملغاة",
    open: "مفتوحة", in_progress: "جارية", closed: "مغلقة",
  }

  const initiativesByStatus: BarDataPoint[] = initiativeGroups.map(g => ({
    label: g.status,
    labelAr: statusLabelAr[g.status] ?? g.status,
    value: g._count.id,
    color: STATUS_COLORS[g.status],
  }))

  const projectsByStatus: BarDataPoint[] = projectGroups.map(g => ({
    label: g.status,
    labelAr: statusLabelAr[g.status] ?? g.status,
    value: g._count.id,
    color: STATUS_COLORS[g.status],
  }))

  const partnershipsByType: BarDataPoint[] = partnershipGroups.map(g => ({
    label: g.status,
    labelAr: statusLabelAr[g.status] ?? g.status,
    value: g._count.id,
    color: STATUS_COLORS[g.status],
  }))

  // SDG distribution
  const goalCounts: Record<number, number> = {}
  for (const init of allInitiatives) {
    for (const g of init.sdgGoals) {
      goalCounts[g] = (goalCounts[g] ?? 0) + 1
    }
  }
  const sdgLabels: Record<number, string> = {
    1: "الفقر", 2: "الجوع", 3: "الصحة", 4: "التعليم", 5: "المساواة",
    6: "المياه", 7: "الطاقة", 8: "العمل", 9: "الابتكار", 10: "التفاوت",
    11: "المدن", 12: "الاستهلاك", 13: "المناخ", 14: "المحيطات",
    15: "البيئة", 16: "السلام", 17: "الشراكات",
  }
  const sdgDistribution: DonutSegment[] = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([g, count]) => ({
      label: `SDG ${g}`,
      labelAr: sdgLabels[Number(g)] ?? `هدف ${g}`,
      value: count,
      color: SDG_COLORS[Number(g)] ?? "#6b7280",
    }))

  // Volunteer hours trend — last 6 months
  const now = new Date()
  const volunteerHoursByMonth: LineDataPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const result = await db.volunteerLog.aggregate({
      where: { date: { gte: d, lt: nextD } },
      _sum: { hours: true },
    })
    volunteerHoursByMonth.push({
      label: d.toLocaleDateString("ar-SA", { month: "short", year: "numeric" }),
      value: Number(result._sum.hours ?? 0),
    })
  }

  // Budget allocation by status
  const totalBudget = Number(budgetResult._sum.budgetAllocated ?? 1)
  const budgetAllocation: DonutSegment[] = initiativeGroups
    .filter(g => Number(g._sum?.budgetAllocated ?? 0) > 0)
    .map(g => ({
      label: g.status,
      labelAr: statusLabelAr[g.status] ?? g.status,
      value: Number(g._sum?.budgetAllocated ?? 0),
      color: STATUS_COLORS[g.status] ?? "#6b7280",
    }))

  const totalInitiatives = initiativeGroups.reduce((a, b) => a + b._count.id, 0)
  const totalProjects = projectGroups.reduce((a, b) => a + b._count.id, 0)
  const totalPartnerships = partnershipGroups.reduce((a, b) => a + b._count.id, 0)

  return {
    initiativesByStatus,
    projectsByStatus,
    volunteerHoursByMonth,
    sdgDistribution,
    partnershipsByType,
    budgetAllocation,
    totals: {
      initiatives: totalInitiatives,
      projects: totalProjects,
      partnerships: totalPartnerships,
      volunteers: volApplications,
      totalBeneficiaries: Number(beneficiariesResult._sum.targetBeneficiaries ?? 0),
      totalVolunteerHours: Number(volHoursResult._sum.totalHours ?? 0),
    },
  }
}
