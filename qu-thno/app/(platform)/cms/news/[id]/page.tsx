import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { getNewsArticle, updateNewsArticleAction, deleteNewsArticleAction, createNewsArticleAction } from "@/core/cms/actions"
import { NewsForm } from "../news-form"

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-600",
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const article = await getNewsArticle(id)
  if (!article) notFound()

  const statusLabel: Record<string, string> = isRTL
    ? { draft: "مسودة", published: "منشور", archived: "مؤرشف" }
    : { draft: "Draft", published: "Published", archived: "Archived" }

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cms" className="hover:text-foreground">{t("إدارة المحتوى", "CMS")}</Link>
        <span>/</span>
        <Link href="/cms/news" className="hover:text-foreground">{t("الأخبار", "News")}</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{isRTL ? article.titleAr : (article.titleEn ?? article.titleAr)}</span>
      </div>

      {/* Article header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isRTL ? article.titleAr : (article.titleEn ?? article.titleAr)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[article.status] ?? "bg-muted text-muted-foreground"}`}>
              {statusLabel[article.status] ?? article.status}
            </span>
            <span className="text-xs text-muted-foreground">
              {article.createdAt.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(`${article.viewCount} مشاهدة`, `${article.viewCount} views`)}
            </span>
          </div>
        </div>

        <form
          action={async () => {
            "use server"
            await deleteNewsArticleAction(id)
            redirect("/cms/news")
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            {t("حذف", "Delete")}
          </button>
        </form>
      </div>

      {/* Edit form */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-5 font-semibold text-foreground">{t("تعديل المقال", "Edit Article")}</h2>
        <NewsForm
          locale={locale}
          article={article}
          createAction={createNewsArticleAction}
          updateAction={updateNewsArticleAction}
        />
      </div>

      {/* Content preview */}
      {article.contentAr && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">{t("معاينة المحتوى", "Content Preview")}</h2>
          <div className="prose prose-sm max-w-none text-foreground" dir="rtl">
            <p className="whitespace-pre-wrap">{article.contentAr}</p>
          </div>
        </div>
      )}
    </div>
  )
}
