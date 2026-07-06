import Anthropic from "@anthropic-ai/sdk"

const globalForAI = globalThis as unknown as { anthropic: Anthropic | undefined }

export const anthropic =
  globalForAI.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

if (process.env.NODE_ENV !== "production") globalForAI.anthropic = anthropic

export const AI_MODELS = {
  default: "claude-sonnet-4-6",
  powerful: "claude-opus-4-8",
  fast: "claude-haiku-4-5-20251001",
} as const

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS]

export interface AIMessage {
  role: "user" | "assistant"
  content: string
}

export interface AIStreamOptions {
  model?: AIModel
  systemPrompt: string
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
}

export async function* streamAIResponse(options: AIStreamOptions): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: options.model ?? AI_MODELS.default,
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
    system: options.systemPrompt,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      yield chunk.delta.text
    }
  }
}

export async function generateAIResponse(options: AIStreamOptions): Promise<string> {
  const response = await anthropic.messages.create({
    model: options.model ?? AI_MODELS.default,
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
    system: options.systemPrompt,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const content = response.content[0]
  if (!content || content.type !== "text") return ""
  return content.text
}
