import { db } from "@/core/database/client"
import type {
  WorkflowConfig,
  WorkflowStep,
  SubmitDecisionPayload,
  WorkflowActionResult,
  WorkflowInstanceView,
} from "./types"
import type { WorkflowStatus } from "@prisma/client"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStep(config: WorkflowConfig, key: string): WorkflowStep | undefined {
  return config.steps.find((s) => s.key === key)
}

function calcDueAt(slaHours?: number): Date | null {
  if (!slaHours) return null
  return new Date(Date.now() + slaHours * 60 * 60 * 1000)
}

// ---------------------------------------------------------------------------
// Create a new workflow instance and activate its initial step
// ---------------------------------------------------------------------------

export async function createWorkflowInstance(params: {
  definitionId: string
  entityType: string
  entityId: string
  initiatorId?: string
  metadata?: Record<string, unknown>
}): Promise<string> {
  const definition = await db.workflowDefinition.findUniqueOrThrow({
    where: { id: params.definitionId },
  })

  const config = definition.config as unknown as WorkflowConfig
  const initialStep = getStep(config, config.initialStep)
  if (!initialStep) throw new Error(`Initial step "${config.initialStep}" not found in definition`)

  const instance = await db.workflowInstance.create({
    data: {
      definitionId: params.definitionId,
      entityType: params.entityType,
      entityId: params.entityId,
      currentStage: config.initialStep,
      dueAt: calcDueAt(initialStep.sla?.durationHours),
      metadata: (params.metadata ?? {}) as unknown as import("@prisma/client").Prisma.InputJsonValue,
    },
  })

  await db.workflowHistory.create({
    data: {
      instanceId: instance.id,
      fromStage: null,
      toStage: config.initialStep,
      action: "STARTED",
      actorId: params.initiatorId ?? null,
    },
  })

  await activateStep(instance.id, initialStep)

  return instance.id
}

// ---------------------------------------------------------------------------
// Activate a step: create ApprovalTask(s) for its assignees
// ---------------------------------------------------------------------------

async function activateStep(instanceId: string, step: WorkflowStep): Promise<void> {
  if (step.type !== "approval") return  // notification/auto steps self-resolve

  await db.approvalTask.create({
    data: {
      instanceId,
      stepKey: step.key,
      stepNameAr: step.nameAr,
      stepNameEn: step.nameEn,
      assigneeId: step.assigneeRef ?? step.key,
      assigneeType: step.assigneeType ?? "role",
      dueAt: calcDueAt(step.sla?.durationHours),
    },
  })
}

// ---------------------------------------------------------------------------
// Submit a decision for an ApprovalTask
// ---------------------------------------------------------------------------

export async function submitApprovalDecision(
  payload: SubmitDecisionPayload,
  actorId: string,
): Promise<WorkflowActionResult> {
  const task = await db.approvalTask.findUnique({
    where: { id: payload.taskId },
    include: { instance: { include: { definition: true } } },
  })

  if (!task) return { error: "Task not found" }
  if (task.status !== "PENDING" && task.status !== "IN_REVIEW") {
    return { error: "Task is no longer pending" }
  }

  const config = task.instance.definition.config as unknown as WorkflowConfig
  const currentStep = getStep(config, task.stepKey)
  if (!currentStep) return { error: "Step definition not found" }

  const nextStepKey = currentStep.transitions[payload.decision]
  if (!nextStepKey && !currentStep.isTerminal) {
    return { error: `No transition defined for action ${payload.decision}` }
  }

  await db.$transaction(async (tx) => {
    // Close the current task
    await tx.approvalTask.update({
      where: { id: task.id },
      data: {
        status: mapDecisionToStatus(payload.decision),
        decidedAt: new Date(),
        decidedBy: actorId,
        decision: payload.decision,
        comment: payload.comment ?? null,
        delegatedTo: payload.delegateTo ?? null,
      },
    })

    const nextStep = nextStepKey ? getStep(config, nextStepKey) : null

    // Determine new workflow status
    let newStatus: WorkflowStatus = "RUNNING"
    let completedAt: Date | null = null
    if (nextStep?.isTerminal) {
      newStatus = nextStep.terminalStatus === "REJECTED" ? "REJECTED" : "COMPLETED"
      completedAt = new Date()
    }

    // Record history
    await tx.workflowHistory.create({
      data: {
        instanceId: task.instanceId,
        fromStage: task.stepKey,
        toStage: nextStepKey ?? task.stepKey,
        action: payload.decision,
        actorId,
        comment: payload.comment ?? null,
      },
    })

    // Update instance
    await tx.workflowInstance.update({
      where: { id: task.instanceId },
      data: {
        currentStage: nextStepKey ?? task.stepKey,
        status: newStatus,
        completedAt,
      },
    })

    // Activate next step if it's an approval type
    if (nextStep && !nextStep.isTerminal) {
      await tx.approvalTask.create({
        data: {
          instanceId: task.instanceId,
          stepKey: nextStep.key,
          stepNameAr: nextStep.nameAr,
          stepNameEn: nextStep.nameEn,
          assigneeId: nextStep.assigneeRef ?? nextStep.key,
          assigneeType: nextStep.assigneeType ?? "role",
          dueAt: calcDueAt(nextStep.sla?.durationHours),
        },
      })
    }
  })

  const nextStep = nextStepKey ? getStep(config, nextStepKey) : null
  return {
    success: true,
    nextStage: nextStepKey ?? null,
    isComplete: !!nextStep?.isTerminal,
  }
}

// ---------------------------------------------------------------------------
// Escalate overdue tasks (called on-demand from pages — no cron needed)
// ---------------------------------------------------------------------------

export async function checkAndEscalateOverdueTasks(): Promise<number> {
  const overdue = await db.approvalTask.findMany({
    where: {
      status: "PENDING",
      isEscalated: false,
      dueAt: { lt: new Date() },
    },
    include: { instance: { include: { definition: true } } },
  })

  let escalated = 0
  for (const task of overdue) {
    const config = task.instance.definition.config as unknown as WorkflowConfig
    const step = getStep(config, task.stepKey)
    if (!step?.sla?.escalateTo) continue

    await db.$transaction(async (tx) => {
      await tx.approvalTask.update({
        where: { id: task.id },
        data: { status: "ESCALATED", isEscalated: true, escalatedAt: new Date() },
      })

      await tx.escalationLog.create({
        data: {
          instanceId: task.instanceId,
          taskId: task.id,
          stepKey: task.stepKey,
          escalatedFrom: task.assigneeId,
          escalatedTo: step.sla!.escalateTo,
          reason: "SLA_BREACH",
        },
      })

      // Create a new task for the escalation target
      await tx.approvalTask.create({
        data: {
          instanceId: task.instanceId,
          stepKey: task.stepKey,
          stepNameAr: task.stepNameAr,
          stepNameEn: task.stepNameEn,
          assigneeId: step.sla!.escalateTo,
          assigneeType: "role",
          dueAt: calcDueAt(step.sla!.durationHours / 2),  // half the original SLA
          isEscalated: true,
          escalatedAt: new Date(),
        },
      })

      await tx.workflowHistory.create({
        data: {
          instanceId: task.instanceId,
          fromStage: task.stepKey,
          toStage: task.stepKey,
          action: "ESCALATED",
          metadata: { reason: "SLA_BREACH", escalatedTo: step.sla!.escalateTo },
        },
      })
    })

    escalated++
  }

  return escalated
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export async function getWorkflowInstance(id: string): Promise<WorkflowInstanceView | null> {
  const instance = await db.workflowInstance.findUnique({
    where: { id },
    include: {
      definition: true,
      approvalTasks: { orderBy: { createdAt: "asc" } },
      history: { orderBy: { createdAt: "asc" } },
    },
  })
  if (!instance) return null

  return {
    ...instance,
    definition: {
      ...instance.definition,
      name: instance.definition.name as Record<string, string>,
      config: instance.definition.config as unknown as WorkflowConfig,
    },
    approvalTasks: instance.approvalTasks.map((t) => ({
      ...t,
      stepNameEn: t.stepNameEn ?? null,
    })),
    history: instance.history,
  }
}

export async function getMyPendingTasks(userType: string, userId: string) {
  return db.approvalTask.findMany({
    where: {
      status: { in: ["PENDING", "IN_REVIEW"] },
      OR: [
        { assigneeId: userType, assigneeType: "role" },
        { assigneeId: userId, assigneeType: "user" },
      ],
    },
    include: {
      instance: {
        include: { definition: true },
      },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
  })
}

export async function getWorkflowInstances(filters?: {
  entityType?: string
  status?: WorkflowStatus
  limit?: number
}) {
  return db.workflowInstance.findMany({
    where: {
      entityType: filters?.entityType,
      status: filters?.status,
    },
    include: {
      definition: true,
      approvalTasks: {
        where: { status: { in: ["PENDING", "IN_REVIEW"] } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
    orderBy: { startedAt: "desc" },
    take: filters?.limit ?? 50,
  })
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function mapDecisionToStatus(decision: string) {
  const map: Record<string, string> = {
    APPROVE: "APPROVED",
    REJECT: "REJECTED",
    RETURN: "RETURNED",
    DELEGATE: "DELEGATED",
  }
  return (map[decision] ?? "PENDING") as import("@prisma/client").ApprovalTaskStatus
}
