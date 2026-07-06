"use server"

import { db } from "@/core/database/client"

export interface ImpactKPIs {
  totalBeneficiaries: number
  totalVolunteerHours: number
  activePrograms: number
  sdgCoverage: number
  budgetAllocated: number
  partnershipsActive: number
}

export interface SDGCoverage {
  goal: number
  count: number
  labelAr: string
  labelEn: string
}

export interface ImpactTrend {
  month: string // "YYYY-MM"
  beneficiaries: number
  volunteerHours: number
}

const SDG_LABELS: Record<number, { ar: string; en: string }> = {
  1: { ar: "القضاء على الفقر", en: "No Poverty" },
  2: { ar: "القضاء على الجوع", en: "Zero Hunger" },
  3: { ar: "الصحة الجيدة", en: "Good Health" },
  4: { ar: "التعليم الجيد", en: "Quality Education" },
  5: { ar: "المساواة بين الجنسين", en: "Gender Equality" },
  6: { ar: "المياه النظيفة", en: "Clean Water" },
  7: { ar: "طاقة نظيفة", en: "Clean Energy" },
  8: { ar: "العمل اللائق", en: "Decent Work" },
  9: { ar: "الصناعة والابتكار", en: "Industry & Innovation" },
  10: { ar: "الحد من التفاوت", en: "Reduced Inequalities" },
  11: { ar: "المدن المستدامة", en: "Sustainable Cities" },
  12: { ar: "الاستهلاك المسؤول", en: "Responsible Consumption" },
  13: { ar: "المناخ", en: "Climate Action" },
  14: { ar: "الحياة المائية", en: "Life Below Water" },
  15: { ar: "الحياة البرية", en: "Life on Land" },
  16: { ar: "السلام والعدل", en: "Peace & Justice" },
  17: { ar: "الشراكات", en: "Partnerships" },
}

export async function getImpactKPIs(): Promise<ImpactKPIs> {
  const [
    beneficiariesResult,
    volProfile,
    initiatives,
    projects,
    partnerships,
  ] = await Promise.all([
    db.initiative.aggregate({
      _sum: { targetBeneficiaries: true },
      where: { status: { in: ["active", "completed"] } },
    }),
    db.volunteerProfile.aggregate({ _sum: { totalHours: true } }),
    db.initiative.count({ where: { status: "active" } }),
    db.project.count({ where: { status: "active" } }),
    db.partnership.count({ where: { status: "active" } }),
  ])

  const allSdgGoals = await db.initiative.findMany({
    select: { sdgGoals: true },
    where: { status: { in: ["active", "completed"] } },
  })
  const coveredGoals = new Set<number>()
  for (const i of allSdgGoals) {
    for (const g of i.sdgGoals) coveredGoals.add(g)
  }

  const budgetResult = await db.initiative.aggregate({
    _sum: { budgetAllocated: true },
    where: { status: { in: ["active", "completed"] } },
  })

  return {
    totalBeneficiaries: Number(beneficiariesResult._sum.targetBeneficiaries ?? 0),
    totalVolunteerHours: Number(volProfile._sum.totalHours ?? 0),
    activePrograms: initiatives + projects,
    sdgCoverage: coveredGoals.size,
    budgetAllocated: Number(budgetResult._sum.budgetAllocated ?? 0),
    partnershipsActive: partnerships,
  }
}

export async function getSDGCoverage(): Promise<SDGCoverage[]> {
  const initiatives = await db.initiative.findMany({
    select: { sdgGoals: true },
    where: { status: { in: ["active", "completed", "pending"] } },
  })

  const goalCounts: Record<number, number> = {}
  for (const init of initiatives) {
    for (const g of init.sdgGoals) {
      goalCounts[g] = (goalCounts[g] ?? 0) + 1
    }
  }

  return Object.entries(goalCounts)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([goal, count]) => ({
      goal: Number(goal),
      count,
      labelAr: SDG_LABELS[Number(goal)]?.ar ?? `هدف ${goal}`,
      labelEn: SDG_LABELS[Number(goal)]?.en ?? `Goal ${goal}`,
    }))
}

export interface ModuleImpactSummary {
  module: string
  moduleAr: string
  active: number
  completed: number
  total: number
  beneficiaries: number
}

export async function getModuleImpactSummaries(): Promise<ModuleImpactSummary[]> {
  const [
    initiativeStats,
    projectStats,
    partnershipStats,
    volStats,
  ] = await Promise.all([
    db.initiative.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { targetBeneficiaries: true },
    }),
    db.project.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.partnership.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.volunteerOpportunity.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ])

  function sumStatus(groups: { status: string; _count: { id: number }; _sum?: { targetBeneficiaries: number | null } }[], status: string) {
    return groups.filter(g => g.status === status).reduce((a, b) => a + b._count.id, 0)
  }

  return [
    {
      module: "initiatives",
      moduleAr: "المبادرات",
      active: sumStatus(initiativeStats, "active"),
      completed: sumStatus(initiativeStats, "completed"),
      total: initiativeStats.reduce((a, b) => a + b._count.id, 0),
      beneficiaries: initiativeStats.reduce((a, b) => a + Number(b._sum?.targetBeneficiaries ?? 0), 0),
    },
    {
      module: "projects",
      moduleAr: "المشاريع",
      active: sumStatus(projectStats, "active"),
      completed: sumStatus(projectStats, "completed"),
      total: projectStats.reduce((a, b) => a + b._count.id, 0),
      beneficiaries: 0,
    },
    {
      module: "partnerships",
      moduleAr: "الشراكات",
      active: sumStatus(partnershipStats, "active"),
      completed: sumStatus(partnershipStats, "completed"),
      total: partnershipStats.reduce((a, b) => a + b._count.id, 0),
      beneficiaries: 0,
    },
    {
      module: "volunteering",
      moduleAr: "التطوع",
      active: sumStatus(volStats, "open") + sumStatus(volStats, "in_progress"),
      completed: sumStatus(volStats, "completed"),
      total: volStats.reduce((a, b) => a + b._count.id, 0),
      beneficiaries: 0,
    },
  ]
}
