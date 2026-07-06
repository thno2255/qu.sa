import { Queue, Worker, type Job } from "bullmq"
import { redis } from "@/core/cache/redis"

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" }

export const QUEUES = {
  NOTIFICATIONS: "notifications",
  REPORTS: "reports",
  CERTIFICATES: "certificates",
  EMAIL: "email",
  AI_PROCESSING: "ai-processing",
  DOCUMENT_PROCESSING: "document-processing",
  SEARCH_INDEXING: "search-indexing",
  AUTOMATIONS: "automations",
} as const

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES]

const queueInstances = new Map<string, Queue>()

export function getQueue(name: QueueName): Queue {
  if (!queueInstances.has(name)) {
    queueInstances.set(
      name,
      new Queue(name, {
        connection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
        },
      })
    )
  }
  return queueInstances.get(name)!
}

export async function enqueue<T>(
  queueName: QueueName,
  jobName: string,
  data: T,
  opts?: { delay?: number; priority?: number }
): Promise<void> {
  const queue = getQueue(queueName)
  await queue.add(jobName, data, opts)
}

export type { Job, Worker }
