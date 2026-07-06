import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { PageHeader } from "@/shared/components/ui/page-header"
import { SearchClient } from "./search-client"
import { searchAll, getRecentItems } from "@/core/search/actions"
import { Suspense } from "react"

export const metadata: Metadata = { title: "البحث الموحد | Enterprise Search" }

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const initialQuery = q?.trim() ?? ""
  const initialResults = initialQuery.length >= 2 ? await searchAll(initialQuery) : null

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        titleAr="البحث الموحد"
        titleEn="Enterprise Search"
        descAr="ابحث في جميع محتويات منصة المسؤولية المجتمعية بشكل موحد"
        descEn="Search across all Community Responsibility Platform content in one place"
        isRTL={isRTL}
      />

      <Suspense fallback={null}>
        <SearchClient isRTL={isRTL} initialQuery={initialQuery} initialResults={initialResults} />
      </Suspense>

      {/* Recent items when no search */}
      {!initialQuery && (
        <RecentItems isRTL={isRTL} t={t} />
      )}
    </div>
  )
}

async function RecentItems({ isRTL, t }: { isRTL: boolean; t: (ar: string, en: string) => string }) {
  const items = await getRecentItems()
  if (items.length === 0) return null

  const TYPE_ICON: Record<string, string> = {
    initiative: "🚀", project: "📁", opportunity: "❤️",
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">{t("أحدث المحتويات", "Recent Content")}</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={item.href}
              className="flex items-center gap-3 rounded-xl border bg-card p-3.5 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <span className="text-lg">{TYPE_ICON[item.type] ?? "📄"}</span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {isRTL ? item.titleAr : (item.titleEn ?? item.titleAr)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
