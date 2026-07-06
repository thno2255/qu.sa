import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ChatClient } from "./chat-client"

export const metadata: Metadata = { title: "المساعد الذكي | AI Assistant" }

export default async function AIAssistantPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()

  const userName = isRTL
    ? (session?.user as { nameAr?: string })?.nameAr
    : session?.user?.name ?? undefined

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        titleAr="المساعد الذكي"
        titleEn="AI Assistant"
        descAr="اطرح أسئلتك حول المنصة واحصل على مساعدة فورية مدعومة بتقنية الذكاء الاصطناعي"
        descEn="Ask questions about the platform and get instant AI-powered assistance"
        isRTL={isRTL}
      />

      {!process.env.ANTHROPIC_API_KEY ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-2xl mb-2">🔑</p>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {isRTL ? "مفتاح API غير مهيأ" : "API Key Not Configured"}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {isRTL
              ? "يرجى إضافة ANTHROPIC_API_KEY في ملف .env.local لتفعيل المساعد الذكي"
              : "Please add ANTHROPIC_API_KEY to your .env.local file to enable the AI assistant"}
          </p>
          <code className="mt-3 block rounded-lg bg-amber-100 dark:bg-amber-900/40 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 font-mono">
            ANTHROPIC_API_KEY=sk-ant-...
          </code>
        </div>
      ) : (
        <ChatClient isRTL={isRTL} userName={userName ?? undefined} />
      )}

      {/* Capabilities card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold text-sm mb-3">{isRTL ? "يمكن للمساعد مساعدتك في:" : "The assistant can help you with:"}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(isRTL ? [
            "🚀 شرح كيفية إنشاء المبادرات والمشاريع",
            "✅ إرشادك خلال دورة الموافقات",
            "🤝 معلومات عن الشراكات والجهات الشريكة",
            "❤️ التقديم على فرص التطوع",
            "📊 شرح تقارير الأثر والإحصائيات",
            "🎯 ربط عملك بأهداف التنمية المستدامة",
          ] : [
            "🚀 Explain how to create initiatives and projects",
            "✅ Guide you through the approval cycle",
            "🤝 Information about partnerships and partners",
            "❤️ Applying for volunteer opportunities",
            "📊 Explain impact reports and statistics",
            "🎯 Link your work to SDG goals",
          ]).map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">{item.substring(0, 2)}</span>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
