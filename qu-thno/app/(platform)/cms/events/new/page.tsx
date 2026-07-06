import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { EventForm } from "../event-form"
import { createCMSEventAction } from "@/core/cms/actions"

export const metadata = { title: "فعالية جديدة" }

export default async function NewEventPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {isRTL ? "إنشاء فعالية جديدة" : "Create New Event"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRTL ? "أضف فعالية جديدة للمنصة" : "Add a new event to the platform"}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EventForm locale={locale} createAction={createCMSEventAction} />
      </div>
    </div>
  )
}
