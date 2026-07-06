import { TableSkeleton } from "@/shared/components/ui/skeleton"
import Link from "next/link"
import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getNewsArticles } from "@/core/cms/actions"

export const metadata = { title: "إدارة الأخبار" }

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
}

async function NewsList({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const articles = await getNewsArticles(undefined, 50)

  const statusLabel: Record<string, string> = isRTL
    ? { draft: "مسودة", published: "منشور", archived: "مؤرشف" }
    : { draft: "Draft", published: "Published", archived: "Archived" }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/cms" className="hover:text-foreground transition-colors">
              {t("إدارة المحتوى", "CMS")}
            </Link>
            <span>/</span>
            <span>{t("الأخبار", "News")}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("إدارة الأخبار", "News Management")}</h1>
        </div>
        <Link
          href="/cms/news/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + {t("مقال جديد", "New Article")}
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📰</span>
            <p className="font-medium text-foreground">{t("لا توجد مقالات", "No articles yet")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("أنشئ مقالك الأول", "Create your first article")}</p>
            <Link href="/cms/news/new" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              + {t("مقال جديد", "New Article")}
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">{t("العنوان", "Title")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الحالة", "Status")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("تاريخ الإنشاء", "Created")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الإجراءات", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{isRTL ? a.titleAr : (a.titleEn ?? a.titleAr)}</p>
                    {a.excerptAr && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.excerptAr}</p>
                    )}
                    {a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {a.tags.map(tag => (
                          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[a.status] ?? "bg-muted text-muted-foreground"}`}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {a.createdAt.toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/cms/news/${a.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("عرض / تعديل", "View / Edit")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default async function NewsPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NewsList locale={locale} />
    </Suspense>
  )
}
