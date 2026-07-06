import { TableSkeleton } from "@/shared/components/ui/skeleton"
import Link from "next/link"
import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getCMSEvents } from "@/core/cms/actions"

export const metadata = { title: "إدارة الفعاليات" }

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

async function EventsList({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const events = await getCMSEvents(undefined, 50)

  const statusLabel: Record<string, string> = isRTL
    ? { draft: "مسودة", published: "منشور", cancelled: "ملغاة" }
    : { draft: "Draft", published: "Published", cancelled: "Cancelled" }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/cms" className="hover:text-foreground">{t("إدارة المحتوى", "CMS")}</Link>
            <span>/</span>
            <span>{t("الفعاليات", "Events")}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("إدارة الفعاليات", "Events Management")}</h1>
        </div>
        <Link
          href="/cms/events/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + {t("فعالية جديدة", "New Event")}
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📅</span>
            <p className="font-medium text-foreground">{t("لا توجد فعاليات", "No events yet")}</p>
            <Link href="/cms/events/new" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              + {t("فعالية جديدة", "New Event")}
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">{t("الفعالية", "Event")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("تاريخ البداية", "Start Date")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("المقاعد", "Capacity")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الحالة", "Status")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الإجراءات", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{isRTL ? e.titleAr : (e.titleEn ?? e.titleAr)}</p>
                    {(e.locationAr || e.locationEn) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📍 {isRTL ? e.locationAr : (e.locationEn ?? e.locationAr)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {e.startDate.toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {e.capacity ? `${e.registrations}/${e.capacity}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[e.status] ?? "bg-muted text-muted-foreground"}`}>
                      {statusLabel[e.status] ?? e.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link href={`/cms/events/${e.id}`} className="text-xs text-primary hover:underline">
                      {t("تعديل", "Edit")}
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

export default async function EventsPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<TableSkeleton />}>
      <EventsList locale={locale} />
    </Suspense>
  )
}
