"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import type { AIMessage } from "@/core/ai/client"

interface Message {
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

const SUGGESTED_PROMPTS_AR = [
  "كيف أنشئ مبادرة مجتمعية جديدة؟",
  "ما خطوات اعتماد المبادرات؟",
  "كيف أتقدم لفرصة تطوع؟",
  "ما الفرق بين المبادرة والمشروع؟",
  "كيف أتابع حالة الموافقة على طلبي؟",
  "كيف أربط مبادرتي بأهداف التنمية المستدامة؟",
]

const SUGGESTED_PROMPTS_EN = [
  "How do I create a new community initiative?",
  "What are the steps to get an initiative approved?",
  "How do I apply for a volunteer opportunity?",
  "What is the difference between an initiative and a project?",
  "How do I track my approval request status?",
  "How do I link my initiative to SDG goals?",
]

interface Props {
  isRTL: boolean
  userName?: string
}

export function ChatClient({ isRTL, userName }: Props) {
  const locale = isRTL ? "ar" : "en"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const SUGGESTED = isRTL ? SUGGESTED_PROMPTS_AR : SUGGESTED_PROMPTS_EN

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: content.trim() }
    const updatedHistory = [...messages, userMsg]
    setMessages([...updatedHistory, { role: "assistant", content: "", isStreaming: true }])
    setInput("")
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiMessages: AIMessage[] = updatedHistory.map(m => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, locale }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error("Stream failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const current = accumulated
        startTransition(() => {
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: "assistant", content: current, isStreaming: true },
          ])
        })
      }

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: accumulated, isStreaming: false },
      ])
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: t("حدث خطأ. يرجى المحاولة مرة أخرى.", "An error occurred. Please try again."), isStreaming: false },
        ])
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearConversation() {
    if (isLoading) abortRef.current?.abort()
    setMessages([])
    setInput("")
    setIsLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const greeting = userName
    ? t(`أهلاً ${userName}! كيف يمكنني مساعدتك اليوم؟`, `Hello ${userName}! How can I help you today?`)
    : t("أهلاً! كيف يمكنني مساعدتك في منصة المسؤولية المجتمعية؟", "Hello! How can I help you with the Community Responsibility Platform?")

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-5rem)] max-h-[700px] min-h-[500px] rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">🤖</div>
          <div>
            <p className="text-sm font-semibold">{t("المساعد الذكي", "AI Assistant")}</p>
            <p className="text-xs text-muted-foreground">{t("مدعوم بـ Claude Sonnet", "Powered by Claude Sonnet")}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("محادثة جديدة", "New Chat")}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div>
              <p className="text-base font-medium text-foreground">{greeting}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("اختر سؤالاً أو اكتب استفسارك", "Pick a question or type your own")}
              </p>
            </div>
            <div className="grid gap-2 w-full max-w-md">
              {SUGGESTED.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-xl border bg-muted/40 px-4 py-2.5 text-sm text-start hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? (isRTL ? "flex-row-reverse" : "flex-row-reverse") : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base mt-0.5">🤖</div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-ee-sm"
                      : "bg-muted text-foreground rounded-es-sm"
                  }`}
                >
                  {msg.content}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-current opacity-70 animate-pulse ms-1 align-middle" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)", "Type your question... (Enter to send, Shift+Enter for new line)")}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition disabled:opacity-50 max-h-32"
            dir={isRTL ? "rtl" : "ltr"}
            style={{ minHeight: "42px" }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, 128) + "px"
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "..." : t("إرسال", "Send")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          {t("المساعد الذكي قد يخطئ أحياناً — تحقق من المعلومات المهمة", "AI may occasionally be wrong — verify important information")}
        </p>
      </div>
    </div>
  )
}
