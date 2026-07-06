import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getConsultation } from "@/core/consultations/actions"
import { ConsultationActions } from "./consultation-actions"
import {
  ArrowRight, Clock, CheckCircle2, XCircle, CalendarCheck,
  User, BookOpen, MessageSquare, Calendar,
} from "lucide-react"

export const metadata: Metadata = { title: "تفاصيل الاستشارة" }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: typeof Clock }> = {
  PENDING:   { label: "قيد المراجعة",       color: "text-amber-700",  bg: "bg-amber-100",  Icon: Clock },
  ACCEPTED:  { label: "مقبول — في انتظار الحجز", color: "text-blue-700",   bg: "bg-blue-100",   Icon: CalendarCheck },
  SCHEDULED: { label: "تم تحديد الموعد",    color: "text-purple-700", bg: "bg-purple-100", Icon: CalendarCheck },
  COMPLETED: { label: "مكتملة",             color: "text-green-700",  bg: "bg-green-100",  Icon: CheckCircle2 },
  CANCELLED: { label: "ملغية / مرفوضة",    color: "text-red-700",    bg: "bg-red-100",    Icon: XCircle },
}

const CATEGORY_LABEL: Record<string, string> = {
  academic:  "أكاديمية",
  research:  "بحثية",
  career:    "مهنية وتطوير ذاتي",
  community: "مسؤولية مجتمعية",
  other:     "أخرى",
}

const TIMELINE = [
  { status: "PENDING",   label: "تم إرسال الطلب" },
  { status: "ACCEPTED",  label: "تمت الموافقة" },
  { status: "SCHEDULED", label: "تم تحديد الموعد" },
  { status: "COMPLETED", label: "اكتملت الاستشارة" },
]

function getTimelineStep(status: string): number {
  return { PENDING: 0, ACCEPTED: 1, SCHEDULED: 2, COMPLETED: 3, CANCELLED: -1 }[status] ?? 0
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConsultationDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const consultation = await getConsultation(id)
  if (!consultation) notFound()

  const currentStep = getTimelineStep(consultation.status)
  const cfg = STATUS_CONFIG[consultation.status] ?? STATUS_CONFIG["PENDING"]!
  if (!cfg) notFound()

  const isFacultyOwner = consultation.facultyId === session.user.id
  const isRequester    = consultation.requesterId === session.user.id

  return (
    <div className="space-y-6" dir="rtl">
      {/* Back link */}
      <Link
        href="/consultations"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="size-4" />
        الاستشارات
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{consultation.titleAr}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CATEGORY_LABEL[consultation.category] ?? consultation.category} •{" "}
            {new Date(consultation.createdAt).toLocaleDateString("ar-SA", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${cfg.bg} ${cfg.color}`}>
          <cfg.Icon className="size-4" />
          {cfg.label}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">

          {/* Description */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">تفاصيل الطلب</h2>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {consultation.descriptionAr}
            </p>

            {consultation.preferredNote && (
              <div className="mt-4 rounded-xl bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">الأوقات المفضلة</p>
                <p className="text-sm text-foreground">{consultation.preferredNote}</p>
              </div>
            )}
          </div>

          {/* Faculty note if any */}
          {consultation.facultyNote && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-medium text-blue-600 mb-1">ملاحظة الدكتور</p>
              <p className="text-sm text-blue-900">{consultation.facultyNote}</p>
            </div>
          )}

          {/* Actions */}
          <ConsultationActions
            consultationId={consultation.id}
            status={consultation.status}
            bookingUrl={consultation.bookingUrl}
            isFacultyOwner={isFacultyOwner}
            isParticipant={isFacultyOwner || isRequester}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Participants */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground">الأطراف</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">الطالب / مقدم الطلب</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {(consultation.requester.nameAr ?? consultation.requester.name ?? "").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {consultation.requester.nameAr ?? consultation.requester.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{consultation.requester.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">عضو هيئة التدريس</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                    {(consultation.faculty.nameAr ?? consultation.faculty.name ?? "").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {consultation.faculty.nameAr ?? consultation.faculty.name}
                    </p>
                    {consultation.faculty.jobTitle && (
                      <p className="text-xs text-muted-foreground truncate">{consultation.faculty.jobTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {consultation.status !== "CANCELLED" && (
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">مراحل الطلب</h3>
              <ol className="space-y-3">
                {TIMELINE.map((step, i) => {
                  const done = currentStep >= i
                  const active = currentStep === i
                  return (
                    <li key={step.status} className="flex items-center gap-3">
                      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        done
                          ? active
                            ? "bg-primary text-primary-foreground"
                            : "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {done && !active ? <CheckCircle2 className="size-3.5" /> : i + 1}
                      </div>
                      <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {/* Booking URL display */}
          {consultation.bookingUrl && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">رابط Bookings</p>
              </div>
              <a
                href={consultation.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {consultation.bookingUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
