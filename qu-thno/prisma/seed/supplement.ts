/**
 * Supplemental seed — fills tables left empty by demo-data.ts:
 *  - WorkflowInstance / ApprovalTask / WorkflowHistory  (correct field names)
 *  - AuditLog
 */

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL ?? ""
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d
}
function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d
}
function monthsAgo(n: number) {
  const d = new Date(); d.setMonth(d.getMonth() - n); return d
}

async function main() {
  // ── Collect existing IDs ─────────────────────────────────────────────────
  const initiatives = await prisma.initiative.findMany({ select: { id: true }, take: 30 })
  const partnerships = await prisma.partnership.findMany({ select: { id: true }, take: 18 })
  const users = await prisma.user.findMany({ select: { id: true, userType: true }, take: 80 })

  const initiativeIds = initiatives.map(i => i.id)
  const partnershipIds = partnerships.map(p => p.id)
  const allUserIds = users.map(u => u.id)
  const studentIds = users.filter(u => u.userType === "STUDENT").map(u => u.id)
  const facultyIds = users.filter(u => u.userType === "FACULTY_MEMBER").map(u => u.id)
  const staffIds = users.filter(u =>
    ["COMMUNITY_EMPLOYEE", "COMMUNITY_MANAGER", "DEPARTMENT_HEAD"].includes(u.userType)
  ).map(u => u.id)

  const actorPool = [
    "demo-admin", "demo-manager", "demo-employee", "demo-faculty", "demo-student",
    ...studentIds.slice(0, 15), ...facultyIds.slice(0, 8), ...staffIds.slice(0, 5),
  ]

  // ── 1. WORKFLOW INSTANCES ─────────────────────────────────────────────────
  console.log("[W1] Creating workflow instances for initiatives...")
  const wfInstanceIds: string[] = []

  for (let i = 0; i < Math.min(initiativeIds.length, 35); i++) {
    const entityId = initiativeIds[i]!
    const statusRoll = Math.random()
    const status =
      statusRoll < 0.45 ? "COMPLETED" :
      statusRoll < 0.75 ? "RUNNING" :
      statusRoll < 0.88 ? "REJECTED" : "CANCELLED"

    const startedAt = monthsAgo(Math.floor(Math.random() * 10) + 1)

    const inst = await prisma.workflowInstance.create({
      data: {
        definitionId: "wf-initiative-approval",
        entityType: "Initiative",
        entityId,
        status: status as "RUNNING" | "COMPLETED" | "REJECTED" | "CANCELLED",
        currentStage: status === "RUNNING" ? "step-employee-review" : undefined,
        assignedTo: pick(actorPool),
        startedAt,
        completedAt: status !== "RUNNING" ? daysAgo(Math.floor(Math.random() * 30)) : undefined,
      },
    }).catch((e) => { if (i === 0) console.error("  INST ERR:", e.message); return null })

    if (!inst) continue
    wfInstanceIds.push(inst.id)

    // ApprovalTask — correct field: stepKey (not stepId)
    await prisma.approvalTask.create({
      data: {
        instanceId: inst.id,
        stepKey: "step-employee-review",
        stepNameAr: "مراجعة الموظف",
        stepNameEn: "Employee Review",
        order: 1,
        assigneeType: "role",
        assigneeId: "COMMUNITY_EMPLOYEE",
        status: status === "RUNNING" ? "PENDING" : status === "COMPLETED" ? "APPROVED" : "REJECTED",
        dueAt: daysFromNow(Math.floor(Math.random() * 5) + 2),
        decidedAt: status !== "RUNNING" ? daysAgo(Math.floor(Math.random() * 20) + 1) : undefined,
        decidedBy: status !== "RUNNING" ? "demo-employee" : undefined,
        decision: status === "COMPLETED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : undefined,
        comment: status === "COMPLETED" ? "تمت المراجعة والاعتماد" : status === "REJECTED" ? "يحتاج مراجعة إضافية" : undefined,
      },
    }).catch(() => {})

    // WorkflowHistory — correct fields: toStage (no stepId/stepNameAr)
    await prisma.workflowHistory.create({
      data: {
        instanceId: inst.id,
        fromStage: null,
        toStage: "step-employee-review",
        action: "SUBMIT",
        actorId: pick(actorPool),
        comment: "تقديم الطلب للمراجعة",
        createdAt: new Date(startedAt.getTime() + 3_600_000),
      },
    }).catch(() => {})

    if (status !== "RUNNING") {
      await prisma.workflowHistory.create({
        data: {
          instanceId: inst.id,
          fromStage: "step-employee-review",
          toStage: status === "COMPLETED" ? "COMPLETED" : "REJECTED",
          action: status === "COMPLETED" ? "APPROVE" : "REJECT",
          actorId: "demo-employee",
          comment: status === "COMPLETED" ? "تمت الموافقة على الطلب" : "رُفض الطلب لعدم اكتمال المتطلبات",
          createdAt: new Date(startedAt.getTime() + 86_400_000 * (Math.floor(Math.random() * 3) + 1)),
        },
      }).catch(() => {})
    }
  }

  console.log(`  ✓ ${wfInstanceIds.length} initiative workflow instances`)

  // ── 2. WORKFLOW INSTANCES for PARTNERSHIPS ────────────────────────────────
  console.log("[W2] Creating workflow instances for partnerships...")
  for (let i = 0; i < Math.min(partnershipIds.length, 18); i++) {
    const entityId = partnershipIds[i]!
    const statusRoll = Math.random()
    const status =
      statusRoll < 0.5 ? "COMPLETED" :
      statusRoll < 0.75 ? "RUNNING" : "REJECTED"

    const startedAt = monthsAgo(Math.floor(Math.random() * 8) + 1)

    const inst = await prisma.workflowInstance.create({
      data: {
        definitionId: "wf-partnership-approval",
        entityType: "Partnership",
        entityId,
        status: status as "RUNNING" | "COMPLETED" | "REJECTED",
        currentStage: status === "RUNNING" ? "step-employee-review" : undefined,
        assignedTo: pick(actorPool),
        startedAt,
        completedAt: status !== "RUNNING" ? daysAgo(Math.floor(Math.random() * 15)) : undefined,
      },
    }).catch(() => null)

    if (!inst) continue

    await prisma.approvalTask.create({
      data: {
        instanceId: inst.id,
        stepKey: "step-employee-review",
        stepNameAr: "مراجعة الموظف",
        stepNameEn: "Employee Review",
        order: 1,
        assigneeType: "role",
        assigneeId: "COMMUNITY_EMPLOYEE",
        status: status === "RUNNING" ? "PENDING" : status === "COMPLETED" ? "APPROVED" : "REJECTED",
        dueAt: daysFromNow(Math.floor(Math.random() * 7) + 1),
        decidedAt: status !== "RUNNING" ? daysAgo(Math.floor(Math.random() * 15) + 1) : undefined,
        decidedBy: status !== "RUNNING" ? "demo-employee" : undefined,
        decision: status === "COMPLETED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : undefined,
      },
    }).catch(() => {})

    await prisma.workflowHistory.create({
      data: {
        instanceId: inst.id,
        fromStage: null,
        toStage: "step-employee-review",
        action: "SUBMIT",
        actorId: pick(actorPool),
        createdAt: new Date(startedAt.getTime() + 3_600_000),
      },
    }).catch(() => {})
  }
  console.log(`  ✓ 18 partnership workflow instances`)

  // ── 6. AUDIT LOGS ────────────────────────────────────────────────────────
  console.log("[A1] Creating audit logs...")
  const auditActions = [
    { action: "LOGIN", entityType: "User" },
    { action: "CREATE", entityType: "Initiative" },
    { action: "UPDATE", entityType: "Initiative" },
    { action: "APPROVE", entityType: "Initiative" },
    { action: "CREATE", entityType: "Partnership" },
    { action: "DELETE", entityType: "NewsArticle" },
    { action: "PUBLISH", entityType: "NewsArticle" },
    { action: "LOGIN_FAILED", entityType: "User" },
    { action: "PERMISSION_DENIED", entityType: "User" },
    { action: "EXPORT", entityType: "Report" },
  ]
  const entityIdsMap: Record<string, string[]> = {
    Initiative: initiativeIds.slice(0, 10),
    Partnership: partnershipIds.slice(0, 5),
    NewsArticle: ["demo-news-0", "demo-news-1", "demo-news-2"],
    User: allUserIds.slice(0, 10),
    Report: ["report-impact", "report-sdg"],
  }

  for (let i = 0; i < 80; i++) {
    const act = pick(auditActions)
    const entityList = entityIdsMap[act.entityType] ?? ["demo-obj"]
    const createdAt = monthsAgo(Math.floor(Math.random() * 11))
    createdAt.setDate(Math.floor(Math.random() * 28) + 1)
    await prisma.auditLog.create({
      data: {
        actorId: pick(actorPool),
        action: act.action,
        entityType: act.entityType,
        entityId: pick(entityList),
        ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 200) + 1}`,
        createdAt,
      },
    }).catch(() => {})
  }
  console.log(`  ✓ 80 audit logs created`)

  // ── Final counts ──────────────────────────────────────────────────────────
  const [wfCount, taskCount, histCount, auditCount] = await Promise.all([
    prisma.workflowInstance.count(),
    prisma.approvalTask.count(),
    prisma.workflowHistory.count(),
    prisma.auditLog.count(),
  ])

  console.log(`
✅ Supplement seed complete!
   Workflow instances: ${wfCount}
   Approval tasks:     ${taskCount}
   Workflow history:   ${histCount}
   Audit logs:         ${auditCount}
`)
}

main()
  .catch(e => { console.error("❌ Supplement failed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
