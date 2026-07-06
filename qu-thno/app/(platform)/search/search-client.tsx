"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { searchAll } from "@/core/search/actions"
import type { SearchResult, SearchResults } from "@/core/search/actions"

const TYPE_META: Record<SearchResult["type"], { ar: string; en: string; icon: string; color: string }> = {
  initiative: { ar: "مبادرة", en: "Initiative", icon: "🚀", color: "bg-blue-50 text-blue-700 border-blue-100" },
  project:    { ar: "مشروع", en: "Project",    icon: "📁", color: "bg-green-50 text-green-700 border-green-100" },
  partnership:{ ar: "شراكة", en: "Partnership",icon: "🤝", color: "bg-purple-50 text-purple-700 border-purple-100" },
  opportunity:{ ar: "تطوع", en: "Volunteer",   icon: "❤️", color: "bg-red-50 text-red-700 border-red-100" },
  kb:         { ar: "مقالة", en: "Article",    icon: "📖", color: "bg-amber-50 text-amber-700 border-amber-100" },
}

interface Props {
  isRTL: boolean
  initialQuery: string
  initialResults: SearchResults | null
}

export function SearchClient({ isRTL, initialQuery, initialResults }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults | null>(initialResults)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setResults(null)
      return
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchAll(value.trim())
        setResults(res)
      })
      // Update URL without navigation
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", value.trim())
      router.replace(`/search?${params.toString()}`, { scroll: false })
    }, 300)
  }

  // Group results by type
  const grouped = results
    ? (["initiative", "project", "partnership", "opportunity", "kb"] as const)
        .map(type => ({
          type,
          items: results.items.filter(r => r.type === type),
        }))
        .filter(g => g.items.length > 0)
    : []

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
          {isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <span className="text-muted-foreground text-sm">🔍</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={t("ابحث في المبادرات والمشاريع والشراكات والتطوع...", "Search across initiatives, projects, partnerships, volunteering...")}
          className="w-full rounded-xl border bg-card ps-10 pe-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          dir={isRTL ? "rtl" : "ltr"}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus() }}
            className="absolute inset-y-0 end-3 flex items-center px-2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {results && (
        <div>
          {results.total === 0 ? (
            <div className="rounded-xl border border-dashed bg-card py-16 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-foreground">{t("لا توجد نتائج", "No results found")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`لم نجد نتائج لـ "${results.query}"`, `No results for "${results.query}"`)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("جرّب كلمات مختلفة أو ابحث بمصطلحات أكثر عمومية", "Try different words or broader search terms")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {t(`${results.total} نتيجة لـ "${results.query}"`, `${results.total} results for "${results.query}"`)}
              </p>
              {grouped.map(({ type, items }) => {
                const meta = TYPE_META[type]
                return (
                  <div key={type}>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <span>{meta.icon}</span>
                      {isRTL ? meta.ar : meta.en}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{items.length}</span>
                    </h2>
                    <ul className="space-y-2">
                      {items.map(item => (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all group"
                          >
                            <span className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-medium ${meta.color}`}>
                              {isRTL ? meta.ar : meta.en}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                {isRTL ? item.titleAr : (item.titleEn ?? item.titleAr)}
                              </p>
                              {item.excerpt && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.excerpt}</p>
                              )}
                            </div>
                            <span className="shrink-0 text-muted-foreground text-xs">←</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state — no query yet */}
      {!results && !query && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">🔎</p>
          <p className="text-sm text-muted-foreground">
            {t("اكتب كلمة للبحث عبر جميع محتويات المنصة", "Type a keyword to search across all platform content")}
          </p>
        </div>
      )}
    </div>
  )
}
