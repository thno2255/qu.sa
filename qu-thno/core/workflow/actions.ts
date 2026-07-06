"use server"

import { auth } from "@/core/auth/auth"
import { submitApprovalDecision, createWorkflowInstance } from "./engine"
import type { ApprovalDecision, WorkflowActionResult } from "./types"
import { sendWorkflowNotification } from "@/core/notifications/service"

// ---------------------------------------------------------------------------
// Submit an approval decision (approve / reject / return / delegate)
// ---------------------------------------------------------------------------

export async function submitDecisionAction(
  _: WorkflowActionResult | null,
  formData: FormData,
): Promise<WorkflowActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const taskId = formData.get("taskId") as string
  const decision = formData.get("decision") as ApprovalDecision
  const comment = (formData.get("comment") as string)?.trim() || undefined

  if (!taskId || !decision) return { error: "بيانات مطلوبة" }

  const validDecisions: ApprovalDecision[] = ["APPROVE", "REJECT", "RETURN", "DELEGATE"]
  if (!validDecisions.includes(decision)) return { error: "قرار غير صالح" }

  const result = await submitApprovalDecision(
    { taskId, decision, comment },
    session.user.id,
  )

  if ("success" in result) {
    // Fire notifications async (don't await — don't block the response)
    void sendWorkflowNotification({
      instanceId: taskId,
      decision,
      actorId: session.user.id,
    }).catch((e) => console.error("[workflow notification error]", e))
  }

  return result
}

// ---------------------------------------------------------------------------
// Start a new workflow instance for an entity
// ---------------------------------------------------------------------------

export type StartWorkflowResult = { success: true; instanceId: string } | { error: string }

export async function startWorkflowAction(
  definitionId: string,
  entityType: string,
  entityId: string,
): Promise<StartWorkflowResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  try {
    const instanceId = await createWorkflowInstance({
      definitionId,
      entityType,
      entityId,
      initiatorId: session.user.id,
    })
    return { success: true, instanceId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ غير متوقع"
    return { error: msg }
  }
}
