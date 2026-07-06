import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { NewsForm } from "../news-form"
import { createNewsArticleAction } from "@/core/cms/actions"

export const metadata = { title: "مقال جديد" }

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {isRTL ? "إنشاء مقال جديد" : "Create New Article"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRTL ? "أضف مقالاً إخبارياً جديداً للمنصة" : "Add a new news article to the platform"}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <NewsForm locale={locale} createAction={createNewsArticleAction} />
      </div>
    </div>
  )
}
