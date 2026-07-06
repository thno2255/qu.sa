"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { searchAll } from "@/core/search/actions"
import type { SearchResult } from "@/core/search/actions"

const TYPE_META: Record<SearchResult["type"], { ar: string; en: string; icon: string }> = {
  initiative: { ar: "مبادرة", en: "Initiative", icon: "🚀" },
  project:    { ar: "مشروع", en: "Project",    icon: "📁" },
  partnership:{ ar: "شراكة", en: "Partnership",icon: "🤝" },
  opportunity:{ ar: "تطوع", en: "Volunteer",   icon: "❤️" },
  kb:         { ar: "مقالة", en: "Article",    icon: "📖" },
}

interface Props {
  isRTL: boolean
}

export function SearchModal({ isRTL }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(""); setResults([]) }
  }, [open])

  function handleInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchAll(value.trim())
        setResults(res.items.slice(0, 8))
      })
    }, 250)
  }

  function handleSelect() {
    setOpen(false)
  }

  function handleSearchPage(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4"
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border bg-card shadow-2xl overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        {/* Search input */}
        <form onSubmit={handleSearchPage} className="flex items-center gap-3 px-4 py-3.5 border-b">
          <span className="text-muted-foreground shrink-0">
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : "🔍"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder={t("ابحث...", "Search...")}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="shrink-0 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">ESC</kbd>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map(item => {
              const meta = TYPE_META[item.type]
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleSelect}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                  >
                    <span className="text-base shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {isRTL ? item.titleAr : (item.titleEn ?? item.titleAr)}
                      </p>
                      <p className="text-xs text-muted-foreground">{isRTL ? meta.ar : meta.en}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {query.length >= 2 && results.length === 0 && !isPending && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t(`لا نتائج لـ "${query}"`, `No results for "${query}"`)}
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <span>{t("اضغط Enter للبحث التفصيلي", "Press Enter for detailed search")}</span>
          <div className="flex gap-2">
            <kbd className="rounded border bg-card px-1.5 py-0.5">↑↓</kbd>
            <span>{t("للتنقل", "navigate")}</span>
            <kbd className="rounded border bg-card px-1.5 py-0.5">↵</kbd>
            <span>{t("للفتح", "select")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
