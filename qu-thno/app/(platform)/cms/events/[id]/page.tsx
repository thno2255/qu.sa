import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { getCMSEvent, updateCMSEventAction, deleteCMSEventAction, createCMSEventAction } from "@/core/cms/actions"
import { EventForm } from "../event-form"

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

interface RequestedByInfo {
  orgName?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string | null
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const event = await getCMSEvent(id)
  if (!event) notFound()

  const statusLabel: Record<string, string> = isRTL
    ? { draft: "مسودة", pending: "طلب من جهة خارجية", published: "منشور", cancelled: "ملغاة" }
    : { draft: "Draft", pending: "External Request", published: "Published", cancelled: "Cancelled" }

  const requestedBy = (event.metadata as { requestedBy?: RequestedByInfo } | null)?.requestedBy

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cms" className="hover:text-foreground">{t("إدارة المحتوى", "CMS")}</Link>
        <span>/</span>
        <Link href="/cms/events" className="hover:text-foreground">{t("الفعاليات", "Events")}</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{isRTL ? event.titleAr : (event.titleEn ?? event.titleAr)}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isRTL ? event.titleAr : (event.titleEn ?? event.titleAr)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[event.status] ?? "bg-muted text-muted-foreground"}`}>
              {statusLabel[event.status] ?? event.status}
            </span>
            <span className="text-xs text-muted-foreground">
              📅 {event.startDate.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </span>
            {event.capacity && (
              <span className="text-xs text-muted-foreground">
                👥 {event.registrations}/{event.capacity} {t("مسجّل", "registered")}
              </span>
            )}
          </div>
        </div>

        <form
          action={async () => {
            "use server"
            await deleteCMSEventAction(id)
            redirect("/cms/events")
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

      {/* Requester info — only present for publicly-submitted event requests */}
      {requestedBy && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900 mb-2">{t("مقدّم الطلب", "Submitted by")}</p>
          <div className="grid gap-1 text-amber-800 sm:grid-cols-2">
            {requestedBy.orgName && <p>{t("الجهة", "Organization")}: {requestedBy.orgName}</p>}
            {requestedBy.contactName && <p>{t("المسؤول", "Contact")}: {requestedBy.contactName}</p>}
            {requestedBy.contactEmail && <p>{t("البريد الإلكتروني", "Email")}: {requestedBy.contactEmail}</p>}
            {requestedBy.contactPhone && <p>{t("الجوال", "Phone")}: {requestedBy.contactPhone}</p>}
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-5 font-semibold text-foreground">{t("تعديل الفعالية", "Edit Event")}</h2>
        <EventForm
          locale={locale}
          event={event}
          createAction={createCMSEventAction}
          updateAction={updateCMSEventAction}
        />
      </div>
    </div>
  )
}
