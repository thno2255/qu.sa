"use server"

import { db } from "@/core/database/client"

export interface ReportKPIs {
  totalBeneficiaries: number
  activePrograms: number
  sdgCoverage: number
  budgetAllocated: number
  partnershipsActive: number
}

export async function getReportKPIs(): Promise<ReportKPIs> {
  const [
    beneficiariesResult,
    initiatives,
    projects,
    partnerships,
  ] = await Promise.all([
    db.initiative.aggregate({
      _sum: { targetBeneficiaries: true },
      where: { status: { in: ["active", "completed"] } },
    }),
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
    activePrograms: initiatives + projects,
    sdgCoverage: coveredGoals.size,
    budgetAllocated: Number(budgetResult._sum.budgetAllocated ?? 0),
    partnershipsActive: partnerships,
  }
}

export interface ModuleReportSummary {
  module: string
  moduleAr: string
  active: number
  completed: number
  total: number
  beneficiaries: number
}

export async function getModuleReportSummaries(): Promise<ModuleReportSummary[]> {
  const [
    initiativeStats,
    projectStats,
    partnershipStats,
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
  ]
}
