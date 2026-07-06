import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { PreferencesForm } from "./preferences-form"
import Link from "next/link"

export const metadata: Metadata = { title: "تفضيلات الإشعارات | Notification Preferences" }

const NOTIFICATION_TYPES = [
  { key: "WORKFLOW_TASK_ASSIGNED", ar: "مهمة موافقة جديدة", en: "New approval task assigned" },
  { key: "WORKFLOW_APPROVED", ar: "تمت الموافقة", en: "Request approved" },
  { key: "WORKFLOW_REJECTED", ar: "تم الرفض", en: "Request rejected" },
  { key: "WORKFLOW_RETURNED", ar: "إعادة للمراجعة", en: "Returned for review" },
  { key: "WORKFLOW_ESCALATED", ar: "تصعيد", en: "Escalated to you" },
  { key: "WORKFLOW_SLA_WARNING", ar: "تحذير انتهاء المهلة", en: "SLA warning" },
  { key: "GENERAL", ar: "إشعارات عامة", en: "General notifications" },
]

export default async function NotificationPreferencesPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userId = session?.user?.id ?? ""

  const existingPrefs = userId
    ? await db.notificationPreference.findMany({ where: { userId } })
    : []

  // Build a map: type__channel → enabled
  const prefMap: Record<string, boolean> = {}
  for (const p of existingPrefs) {
    prefMap[`${p.type}__${p.channel}`] = p.enabled
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/notifications" className="hover:text-foreground transition-colors">
          {t("الإشعارات", "Notifications")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground font-medium">{t("التفضيلات", "Preferences")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("تفضيلات الإشعارات", "Notification Preferences")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "اختر كيف وأين تريد تلقي الإشعارات",
            "Choose how and where you want to receive notifications",
          )}
        </p>
      </div>

      <PreferencesForm
        types={NOTIFICATION_TYPES}
        prefMap={prefMap}
        isRTL={isRTL}
      />
    </div>
  )
}
