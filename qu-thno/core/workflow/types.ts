import type { ApprovalTaskStatus, WorkflowStatus } from "@prisma/client"

// ---------------------------------------------------------------------------
// Workflow Definition config (stored in WorkflowDefinition.config JSON field)
// ---------------------------------------------------------------------------

export interface WorkflowStepSLA {
  durationHours: number  // total SLA window
  warningHours: number   // trigger warning this many hours before breach
  escalateTo: string     // UserType string or userId to escalate to
}

export interface WorkflowStep {
  key: string
  nameAr: string
  nameEn: string
  type: "approval" | "notification" | "auto"
  // For "approval" steps:
  assigneeType?: "role" | "user"
  assigneeRef?: string  // UserType string (e.g. "COMMUNITY_EMPLOYEE") or userId
  sla?: WorkflowStepSLA
  allowedActions?: string[]  // e.g. ["APPROVE", "REJECT", "RETURN"]
  // Transitions: action → next step key (or terminal keys "APPROVED" / "REJECTED" / "COMPLETED")
  transitions: Record<string, string>
  isTerminal?: boolean
  terminalStatus?: "COMPLETED" | "REJECTED"
}

export interface WorkflowConfig {
  steps: WorkflowStep[]
  initialStep: string
}

// ---------------------------------------------------------------------------
// Runtime types
// ---------------------------------------------------------------------------

export interface ApprovalTaskView {
  id: string
  instanceId: string
  stepKey: string
  stepNameAr: string
  stepNameEn: string | null
  order: number
  assigneeId: string
  assigneeType: string
  status: ApprovalTaskStatus
  dueAt: Date | null
  decidedAt: Date | null
  decidedBy: string | null
  decision: string | null
  comment: string | null
  isEscalated: boolean
  createdAt: Date
}

export interface WorkflowInstanceView {
  id: string
  definitionId: string
  entityType: string
  entityId: string
  status: WorkflowStatus
  currentStage: string | null
  startedAt: Date
  completedAt: Date | null
  dueAt: Date | null
  definition: {
    id: string
    name: Record<string, string>
    moduleId: string
    entityType: string
    config: WorkflowConfig
  }
  approvalTasks: ApprovalTaskView[]
  history: WorkflowHistoryView[]
}

export interface WorkflowHistoryView {
  id: string
  fromStage: string | null
  toStage: string
  action: string
  actorId: string | null
  comment: string | null
  createdAt: Date
}

// ---------------------------------------------------------------------------
// Action payloads
// ---------------------------------------------------------------------------

export type ApprovalDecision = "APPROVE" | "REJECT" | "RETURN" | "DELEGATE"

export interface SubmitDecisionPayload {
  taskId: string
  decision: ApprovalDecision
  comment?: string
  delegateTo?: string  // userId, required when decision = "DELEGATE"
}

export type WorkflowActionResult =
  | { success: true; nextStage: string | null; isComplete: boolean }
  | { error: string }

// ---------------------------------------------------------------------------
// SLA helpers
// ---------------------------------------------------------------------------

export type SLAStatus = "ok" | "warning" | "breached" | "none"

export function getSLAStatus(dueAt: Date | null): SLAStatus {
  if (!dueAt) return "none"
  const now = Date.now()
  const due = dueAt.getTime()
  const remaining = due - now
  if (remaining < 0) return "breached"
  if (remaining < 6 * 60 * 60 * 1000) return "warning"  // < 6 hours
  return "ok"
}

export function getSLALabel(status: SLAStatus, isRTL: boolean): string {
  const labels: Record<SLAStatus, [string, string]> = {
    none: ["", ""],
    ok: ["ضمن المهلة", "Within SLA"],
    warning: ["تحذير: المهلة تقترب", "Warning: SLA approaching"],
    breached: ["انتهت المهلة", "SLA Breached"],
  }
  const [ar, en] = labels[status]
  return isRTL ? ar : en
}
