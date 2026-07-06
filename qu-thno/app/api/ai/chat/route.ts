import { auth } from "@/core/auth/auth"
import { streamAIResponse } from "@/core/ai/client"
import { getPlatformContext, buildSystemPrompt } from "@/core/ai/system-prompt"
import type { AIMessage } from "@/core/ai/client"
import { NextRequest } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()

  const body = await req.json() as { messages: AIMessage[]; locale?: "ar" | "en" }
  const { messages, locale = "ar" } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 })
  }

  const ctx = await getPlatformContext(
    session?.user?.id,
    session?.user?.userType ?? "VISITOR",
  )
  const systemPrompt = buildSystemPrompt(ctx, locale)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAIResponse({ systemPrompt, messages })) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        controller.enqueue(encoder.encode("\n\n[حدث خطأ في الاتصال]"))
        console.error("[ai/chat] stream error:", err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
