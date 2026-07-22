import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import {
  getFacultyList,
  getMyProjectVisits,
  getAdminProjectVisitStats,
  checkAndEscalateOverdueVisits,
} from "@/core/project-visits/actions"
import { SLA_DAYS } from "@/core/project-visits/constants"
import {
  MapPin, Clock, CheckCircle2, XCircle, CalendarCheck,
  MessageSquare, Plus, Briefcase, ChevronLeft,
  BarChart3, AlertCircle, ListChecks, AlertTriangle,
} from "lucide-react"

export const metadata: Metadata = { title: "المشاريع والزيارات الميدانية" }

const REQUESTER_ROLES = ["STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
const FACULTY_ROLES   = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"]
const ADMIN_ROLES     = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  PENDING:   { label: "بانتظار الرد",   color: "bg-amber-100 text-amber-700 border-amber-200",   Icon: Clock },
  ACCEPTED:  { label: "مقبول",          color: "bg-blue-100 text-blue-700 border-blue-200",      Icon: CalendarCheck },
  SCHEDULED: { label: "تم تحديد الموعد", color: "bg-purple-100 text-purple-700 border-purple-200", Icon: CalendarCheck },
  COMPLETED: { label: "مكتملة",         color: "bg-green-100 text-green-700 border-green-200",   Icon: CheckCircle2 },
  CANCELLED: { label: "ملغية",          color: "bg-red-100 text-red-700 border-red-200",         Icon: XCircle },
  ESCALATED: { label: "متأخرة — بحاجة لإعادة توجيه", color: "bg-orange-100 text-orange-700 border-orange-200", Icon: AlertTriangle },
}

const USER_TYPE_LABEL: Record<string, string> = {
  FACULTY_MEMBER:  "عضو هيئة التدريس",
  DEPARTMENT_HEAD: "رئيس القسم",
  COLLEGE_DEAN:    "عميد الكلية",
}

function daysRemaining(assignedAt: Date): number {
  const elapsed = (Date.now() - new Date(assignedAt).getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(SLA_DAYS - elapsed))
}

export default async function ProjectVisitsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userType    = session.user.userType ?? ""
  const isRequester = REQUESTER_ROLES.includes(userType)
  const isFaculty    = FACULTY_ROLES.includes(userType)
  const isAdmin      = ADMIN_ROLES.includes(userType)

  // Check and escalate any overdue requests (runs on page load — no cron needed)
  await checkAndEscalateOverdueVisits()

  const [facultyList, myVisits, adminStats] = await Promise.all([
    isRequester ? getFacultyList() : Promise.resolve([]),
    !isAdmin    ? getMyProjectVisits() : Promise.resolve([]),
    isAdmin     ? getAdminProjectVisitStats() : Promise.resolve(null),
  ])

  // ── ADMIN / EMPLOYEE VIEW ──────────────────────────────────────────────────
  if (isAdmin && adminStats) {
    return (
      <div className="space-y-8" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المشاريع والزيارات الميدانية</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على جميع طلبات الزيارة الميدانية في المنصة</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "إجمالي الطلبات", value: adminStats.total,     color: "bg-blue-500/10 text-blue-600",   Icon: BarChart3 },
            { label: "بانتظار الرد",   value: adminStats.pending,   color: "bg-amber-500/10 text-amber-600", Icon: AlertCircle },
            { label: "متأخرة",         value: adminStats.escalated, color: "bg-orange-500/10 text-orange-600", Icon: AlertTriangle },
            { label: "مكتملة",         value: adminStats.completed, color: "bg-green-500/10 text-green-600", Icon: CheckCircle2 },
            { label: "ملغية",          value: adminStats.cancelled, color: "bg-red-500/10 text-red-600",     Icon: XCircle },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className={`mb-3 inline-flex size-11 items-center justify-center rounded-xl ${s.color}`}>
                <s.Icon className="size-5" />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Escalated — needs reassignment */}
        {adminStats.escalated > 0 && (
          <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-600" />
              <h2 className="font-semibold text-orange-900">
                طلبات متأخرة — بحاجة لإعادة توجيه ({adminStats.escalated})
              </h2>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              هذه الطلبات تجاوزت مهلة {SLA_DAYS} أيام دون رد من العضو المكلّف. افتح كل طلب لإعادة توجيهه لعضو آخر.
            </p>
            <div className="space-y-2">
              {adminStats.recent.filter(v => v.status === "ESCALATED").map(v => (
                <Link key={v.id} href={`/consultations/project-visits/${v.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-white p-3 hover:shadow-sm transition-shadow">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{v.projectTitleAr}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.requester.nameAr ?? v.requester.name} ← {v.faculty.nameAr ?? v.faculty.name}
                    </p>
                  </div>
                  <ChevronLeft className="size-4 shrink-0 text-orange-600" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent requests table */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b p-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="size-4" />
              آخر الطلبات
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">المشروع</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">مقدم الطلب</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">العضو</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">التاريخ</th>
                  <th className="sr-only">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminStats.recent.map(v => {
                  const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG["PENDING"]!
                  return (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{v.projectTitleAr}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.requester.nameAr ?? v.requester.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.faculty.nameAr ?? v.faculty.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/consultations/project-visits/${v.id}`} className="text-xs text-primary hover:underline">عرض</Link>
                      </td>
                    </tr>
                  )
                })}
                {adminStats.recent.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── FACULTY VIEW ────────────────────────────────────────────────────────────
  if (isFaculty) {
    const pending   = myVisits.filter(v => v.status === "PENDING")
    const active    = myVisits.filter(v => ["ACCEPTED", "SCHEDULED"].includes(v.status))
    const completed = myVisits.filter(v => v.status === "COMPLETED")

    return (
      <div className="space-y-8" dir="rtl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">طلبات الزيارة الميدانية الواردة</h1>
            <p className="mt-2 text-white/80 text-sm">
              يجب الرد خلال {SLA_DAYS} أيام، وإلا يُعاد توجيه الطلب تلقائياً لعضو آخر عبر موظف المسؤولية المجتمعية.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              {[
                { label: "تحتاج ردك", value: pending.length },
                { label: "قيد التنفيذ", value: active.length },
                { label: "مكتملة",     value: completed.length },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -end-12 -top-12 size-64 rounded-full bg-white/5" />
        </div>

        {pending.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-600" />
              <h2 className="font-semibold text-foreground">تحتاج ردك ({pending.length})</h2>
            </div>
            <div className="space-y-3">
              {pending.map(v => {
                const remaining = daysRemaining(v.assignedAt)
                return (
                  <Link key={v.id} href={`/consultations/project-visits/${v.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 font-bold text-sm">
                        {(v.requester.nameAr ?? v.requester.name ?? "").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{v.projectTitleAr}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.requester.nameAr ?? v.requester.name}
                          {" • "}
                          <span className={remaining <= 1 ? "text-red-600 font-medium" : ""}>
                            متبقٍ {remaining} {remaining === 1 ? "يوم" : "أيام"} للرد
                          </span>
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="size-4 shrink-0 text-amber-600" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {myVisits.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold text-foreground">جميع الطلبات ({myVisits.length})</h2>
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">المشروع</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">مقدم الطلب</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">التاريخ</th>
                    <th className="sr-only">عرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myVisits.map(v => {
                    const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG["PENDING"]!
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground max-w-[220px] truncate">{v.projectTitleAr}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.requester.nameAr ?? v.requester.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {new Date(v.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link href={`/consultations/project-visits/${v.id}`} className="text-xs text-primary hover:underline">عرض</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {myVisits.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <MessageSquare className="size-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground">لا توجد طلبات زيارة ميدانية بعد</p>
          </div>
        )}
      </div>
    )
  }

  // ── REQUESTER VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">المشاريع والزيارات الميدانية</h1>
              <p className="mt-2 max-w-lg text-primary-foreground/80 text-sm leading-relaxed">
                اطلب زيارة ميدانية لمشروعك من عضو هيئة التدريس المختص، مع إرفاق ملفات المشروع.
              </p>
            </div>
            <Link
              href="/consultations/project-visits/new"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-white/90 transition-colors"
            >
              <Plus className="size-4" />
              طلب زيارة جديد
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { label: "إجمالي طلباتي", value: myVisits.length },
              { label: "بانتظار الرد",  value: myVisits.filter(v => v.status === "PENDING").length },
              { label: "مكتملة",        value: myVisits.filter(v => v.status === "COMPLETED").length },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -end-12 -top-12 size-64 rounded-full bg-white/5" />
      </div>

      {myVisits.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">طلباتي</h2>
          <div className="space-y-3">
            {myVisits.map(v => {
              const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG["PENDING"]!
              return (
                <Link key={v.id} href={`/consultations/project-visits/${v.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${cfg.color}`}>
                    <cfg.Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{v.projectTitleAr}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">إلى: {v.faculty.nameAr ?? v.faculty.name}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">أعضاء هيئة التدريس</h2>
          <p className="text-sm text-muted-foreground">{facultyList.length} عضو متاح</p>
        </div>

        {facultyList.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <MapPin className="size-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground">لا يوجد أعضاء هيئة تدريس مسجلون حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facultyList.map(f => {
              const initials  = (f.nameAr ?? f.name ?? f.email).charAt(0)
              const roleLabel = USER_TYPE_LABEL[f.userType] ?? f.userType
              return (
                <div key={f.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-bold text-primary">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{f.nameAr ?? f.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
                      {f.jobTitle && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="size-3 shrink-0" />
                          <span className="truncate">{f.jobTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/consultations/project-visits/new?faculty=${f.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/5 border border-primary/20 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Plus className="size-4" />
                    طلب زيارة
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
