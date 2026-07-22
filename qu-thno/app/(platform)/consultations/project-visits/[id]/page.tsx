import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { getProjectVisit, getFacultyList } from "@/core/project-visits/actions"
import { ProjectVisitActions } from "./project-visit-actions"
import {
  ArrowRight, Clock, CheckCircle2, XCircle, CalendarCheck,
  MapPin, FileText, Paperclip, AlertTriangle,
} from "lucide-react"

export const metadata: Metadata = { title: "تفاصيل طلب الزيارة الميدانية" }

const STAFF_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: typeof Clock }> = {
  PENDING:   { label: "بانتظار الرد",   color: "text-amber-700",  bg: "bg-amber-100",  Icon: Clock },
  ACCEPTED:  { label: "مقبول",          color: "text-blue-700",   bg: "bg-blue-100",   Icon: CalendarCheck },
  SCHEDULED: { label: "تم تحديد الموعد", color: "text-purple-700", bg: "bg-purple-100", Icon: CalendarCheck },
  COMPLETED: { label: "مكتملة",         color: "text-green-700",  bg: "bg-green-100",  Icon: CheckCircle2 },
  CANCELLED: { label: "ملغية / مرفوضة", color: "text-red-700",    bg: "bg-red-100",    Icon: XCircle },
  ESCALATED: { label: "متأخرة — بحاجة لإعادة توجيه", color: "text-orange-700", bg: "bg-orange-100", Icon: AlertTriangle },
}

const TIMELINE = [
  { status: "PENDING",   label: "تم إرسال الطلب" },
  { status: "ACCEPTED",  label: "تمت الموافقة" },
  { status: "SCHEDULED", label: "تم تحديد الموعد" },
  { status: "COMPLETED", label: "اكتملت الزيارة" },
]

function getTimelineStep(status: string): number {
  return { PENDING: 0, ACCEPTED: 1, SCHEDULED: 2, COMPLETED: 3, CANCELLED: -1, ESCALATED: 0 }[status] ?? 0
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectVisitDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const visit = await getProjectVisit(id)
  if (!visit) notFound()

  const currentStep = getTimelineStep(visit.status)
  const cfg = STATUS_CONFIG[visit.status] ?? STATUS_CONFIG["PENDING"]!

  const isFacultyOwner = visit.facultyId === session.user.id
  const isRequester    = visit.requesterId === session.user.id
  const isStaff        = STAFF_ROLES.includes(session.user.userType ?? "")

  const facultyOptions = visit.status === "ESCALATED" && isStaff ? await getFacultyList() : []

  return (
    <div className="space-y-6" dir="rtl">
      <Link href="/consultations/project-visits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="size-4" />
        المشاريع والزيارات الميدانية
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{visit.projectTitleAr}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(visit.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${cfg.bg} ${cfg.color}`}>
          <cfg.Icon className="size-4" />
          {cfg.label}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">تفاصيل المشروع</h2>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{visit.descriptionAr}</p>
            {visit.locationAr && (
              <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {visit.locationAr}
              </div>
            )}
          </div>

          {/* Attached files */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">ملفات المشروع ({visit.files.length})</h2>
            </div>
            {visit.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد ملفات مرفقة</p>
            ) : (
              <ul className="space-y-2">
                {visit.files.map(f => (
                  <li key={f.id}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm hover:bg-muted transition-colors">
                      <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1">{f.nameAr}</span>
                      {f.size != null && (
                        <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {visit.facultyNote && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-medium text-blue-600 mb-1">ملاحظة العضو</p>
              <p className="text-sm text-blue-900">{visit.facultyNote}</p>
            </div>
          )}

          <ProjectVisitActions
            visitId={visit.id}
            status={visit.status}
            isFacultyOwner={isFacultyOwner}
            isParticipant={isFacultyOwner || isRequester}
            isStaff={isStaff}
            facultyOptions={facultyOptions}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground">الأطراف</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">مقدم الطلب</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {(visit.requester.nameAr ?? visit.requester.name ?? "").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{visit.requester.nameAr ?? visit.requester.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{visit.requester.email}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">العضو المكلّف</p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                    {(visit.faculty.nameAr ?? visit.faculty.name ?? "").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{visit.faculty.nameAr ?? visit.faculty.name}</p>
                    {visit.faculty.jobTitle && <p className="text-xs text-muted-foreground truncate">{visit.faculty.jobTitle}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {visit.status !== "CANCELLED" && (
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">مراحل الطلب</h3>
              <ol className="space-y-3">
                {TIMELINE.map((step, i) => {
                  const done = currentStep >= i && visit.status !== "ESCALATED"
                  const active = currentStep === i
                  return (
                    <li key={step.status} className="flex items-center gap-3">
                      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        done ? (active ? "bg-primary text-primary-foreground" : "bg-green-500 text-white") : "bg-muted text-muted-foreground"
                      }`}>
                        {done && !active ? <CheckCircle2 className="size-3.5" /> : i + 1}
                      </div>
                      <span className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
