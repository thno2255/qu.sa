type EventHandler<T = unknown> = (payload: T) => void | Promise<void>

interface EventSubscription {
  id: string
  event: string
  handler: EventHandler
  once: boolean
}

class EventBus {
  private subscriptions = new Map<string, EventSubscription[]>()
  private idCounter = 0

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const id = String(++this.idCounter)
    const subscription: EventSubscription = {
      id,
      event,
      handler: handler as EventHandler,
      once: false,
    }

    const existing = this.subscriptions.get(event) ?? []
    this.subscriptions.set(event, [...existing, subscription])

    return () => this.off(event, id)
  }

  once<T = unknown>(event: string, handler: EventHandler<T>): void {
    const id = String(++this.idCounter)
    const subscription: EventSubscription = {
      id,
      event,
      handler: handler as EventHandler,
      once: true,
    }

    const existing = this.subscriptions.get(event) ?? []
    this.subscriptions.set(event, [...existing, subscription])
  }

  off(event: string, id: string): void {
    const subscriptions = this.subscriptions.get(event) ?? []
    this.subscriptions.set(
      event,
      subscriptions.filter((s) => s.id !== id)
    )
  }

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const subscriptions = this.subscriptions.get(event) ?? []
    const toRemove: string[] = []

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await sub.handler(payload)
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err)
        }
        if (sub.once) toRemove.push(sub.id)
      })
    )

    if (toRemove.length > 0) {
      this.subscriptions.set(
        event,
        subscriptions.filter((s) => !toRemove.includes(s.id))
      )
    }
  }

  clear(event?: string): void {
    if (event) {
      this.subscriptions.delete(event)
    } else {
      this.subscriptions.clear()
    }
  }
}

const globalForEventBus = globalThis as unknown as { eventBus: EventBus | undefined }
export const eventBus = globalForEventBus.eventBus ?? new EventBus()
if (process.env.NODE_ENV !== "production") globalForEventBus.eventBus = eventBus

export const EVENTS = {
  // Initiative events
  INITIATIVE_CREATED: "initiative.created",
  INITIATIVE_UPDATED: "initiative.updated",
  INITIATIVE_APPROVED: "initiative.approved",
  INITIATIVE_REJECTED: "initiative.rejected",
  // Project events
  PROJECT_CREATED: "project.created",
  PROJECT_STATUS_CHANGED: "project.status_changed",
  PROJECT_COMPLETED: "project.completed",
  // Partnership events
  PARTNERSHIP_CREATED: "partnership.created",
  PARTNERSHIP_SIGNED: "partnership.signed",
  PARTNERSHIP_EXPIRING: "partnership.expiring",
  // Workflow events
  WORKFLOW_STARTED: "workflow.started",
  WORKFLOW_STAGE_COMPLETED: "workflow.stage_completed",
  WORKFLOW_COMPLETED: "workflow.completed",
  WORKFLOW_REJECTED: "workflow.rejected",
  WORKFLOW_ESCALATED: "workflow.escalated",
  // User events
  USER_REGISTERED: "user.registered",
  USER_APPROVED: "user.approved",
  USER_SUSPENDED: "user.suspended",
  // Organization events
  ORGANIZATION_APPROVED: "organization.approved",
  ORGANIZATION_REJECTED: "organization.rejected",
} as const

export type PlatformEvent = (typeof EVENTS)[keyof typeof EVENTS]
