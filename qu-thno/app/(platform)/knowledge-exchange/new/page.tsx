import { getLocale } from "next-intl/server"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { KnowledgeExchangeForm } from "./ke-form"

export const metadata = { title: "طلب تبادل معرفي" }

export default async function NewKnowledgeExchangePage() {
  const locale = await getLocale()
  const isRTL  = locale === "ar"

  return (
    <div className="mx-auto max-w-2xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/knowledge-exchange" className="hover:text-foreground">تبادل المعرفة</Link>
          <span>/</span>
          <span>طلب جديد</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="size-6 text-primary" />
          طلب تبادل معرفي مع الشركات
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          قدّم طلبك للاستفادة من الخبرات الأكاديمية لجامعة القصيم
        </p>
      </div>
      <KnowledgeExchangeForm locale={locale} />
    </div>
  )
}
