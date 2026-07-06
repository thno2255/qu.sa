import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { getNotifications } from "@/core/notifications/service"
import { NotificationsClient } from "./notifications-client"
import type { NotificationView } from "@/core/notifications/types"
import Link from "next/link"

export const metadata: Metadata = { title: "الإشعارات | Notifications" }

export default async function NotificationsPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const session = await auth()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userId = session?.user?.id ?? ""
  const rawNotifications = userId ? await getNotifications(userId, { limit: 100 }) : []
  // Cast JSON fields to typed shape — title/body are always { ar, en } objects
  const notifications = rawNotifications as unknown as NotificationView[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("الإشعارات", "Notifications")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("سجل كامل بجميع إشعاراتك", "Your complete notification history")}
          </p>
        </div>
        <Link
          href="/notifications/preferences"
          className="flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <SettingsIcon />
          {t("التفضيلات", "Preferences")}
        </Link>
      </div>

      <NotificationsClient initialNotifications={notifications} isRTL={isRTL} />
    </div>
  )
}

function SettingsIcon() {
  return (
    <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
