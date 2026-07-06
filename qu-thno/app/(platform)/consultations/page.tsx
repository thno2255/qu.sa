import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import {
  getFacultyList,
  getMyConsultations,
  getAdminConsultationStats,
} from "@/core/consultations/actions"
import {
  BookOpen, Clock, CheckCircle2, XCircle, CalendarCheck,
  MessageSquare, Plus, User, Briefcase, ChevronLeft,
  BarChart3, AlertCircle, ListChecks,
} from "lucide-react"

export const metadata: Metadata = { title: "الاستشارات الأكاديمية" }

// Roles allowed to submit requests
const REQUESTER_ROLES = ["STUDENT", "COMMUNITY_EMPLOYEE", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
const FACULTY_ROLES   = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"]
const ADMIN_ROLES     = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"]

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  PENDING:   { label: "قيد المراجعة",            color: "bg-amber-100 text-amber-700 border-amber-200",   Icon: Clock },
  ACCEPTED:  { label: "مقبول — في انتظار الحجز", color: "bg-blue-100 text-blue-700 border-blue-200",     Icon: CalendarCheck },
  SCHEDULED: { label: "تم تحديد الموعد",          color: "bg-purple-100 text-purple-700 border-purple-200", Icon: CalendarCheck },
  COMPLETED: { label: "مكتملة",                   color: "bg-green-100 text-green-700 border-green-200",  Icon: CheckCircle2 },
  CANCELLED: { label: "ملغية",                    color: "bg-red-100 text-red-700 border-red-200",        Icon: XCircle },
}

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  academic:  { label: "أكاديمية",          color: "bg-blue-500/10 text-blue-700" },
  research:  { label: "بحثية",             color: "bg-purple-500/10 text-purple-700" },
  career:    { label: "مهنية وتطوير ذاتي", color: "bg-teal-500/10 text-teal-700" },
  community: { label: "مسؤولية مجتمعية",   color: "bg-green-500/10 text-green-700" },
  other:     { label: "أخرى",              color: "bg-gray-500/10 text-gray-600" },
}

const USER_TYPE_LABEL: Record<string, string> = {
  FACULTY_MEMBER:  "عضو هيئة التدريس",
  DEPARTMENT_HEAD: "رئيس القسم",
  COLLEGE_DEAN:    "عميد الكلية",
}

export default async function ConsultationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userType    = session.user.userType ?? ""
  const isRequester = REQUESTER_ROLES.includes(userType)
  const isFaculty   = FACULTY_ROLES.includes(userType)
  const isAdmin     = ADMIN_ROLES.includes(userType)

  // Fetch data based on role
  const [facultyList, myConsultations, adminStats] = await Promise.all([
    isRequester ? getFacultyList() : Promise.resolve([]),
    !isAdmin    ? getMyConsultations() : Promise.resolve([]),
    isAdmin     ? getAdminConsultationStats() : Promise.resolve(null),
  ])

  // ── ADMIN VIEW ────────────────────────────────────────────────────────────
  if (isAdmin && adminStats) {
    return (
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الاستشارات الأكاديمية</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على جميع طلبات الاستشارة في المنصة</p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "إجمالي الطلبات",      value: adminStats.total,     color: "bg-blue-500/10 text-blue-600",   Icon: BarChart3 },
            { label: "لم تُعالَج بعد",      value: adminStats.pending,   color: "bg-amber-500/10 text-amber-600", Icon: AlertCircle },
            { label: "قيد المعالجة / محجوز", value: adminStats.accepted,  color: "bg-purple-500/10 text-purple-600", Icon: Clock },
            { label: "مكتملة",              value: adminStats.completed,  color: "bg-green-500/10 text-green-600", Icon: CheckCircle2 },
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

        {/* Progress bar */}
        {adminStats.total > 0 && (
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">نسبة المعالجة</h2>
              <span className="text-sm font-bold text-primary">
                {Math.round(((adminStats.completed + adminStats.accepted) / adminStats.total) * 100)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-3 rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(((adminStats.completed + adminStats.accepted) / adminStats.total) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400 inline-block" /> لم تُعالَج: {adminStats.pending}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary inline-block" /> تمت المعالجة: {adminStats.completed + adminStats.accepted}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400 inline-block" /> ملغية: {adminStats.cancelled}</span>
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
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">الموضوع</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">مقدم الطلب</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">الدكتور</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">التاريخ</th>
                  <th className="sr-only">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminStats.recent.map(c => {
                  const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["PENDING"]!
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{c.titleAr}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.requester.nameAr ?? c.requester.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.faculty.nameAr ?? c.faculty.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/consultations/${c.id}`} className="text-xs text-primary hover:underline">عرض</Link>
                      </td>
                    </tr>
                  )
                })}
                {adminStats.recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      لا توجد طلبات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── FACULTY VIEW ──────────────────────────────────────────────────────────
  if (isFaculty) {
    const pending   = myConsultations.filter(c => c.status === "PENDING")
    const active    = myConsultations.filter(c => ["ACCEPTED", "SCHEDULED"].includes(c.status))
    const completed = myConsultations.filter(c => c.status === "COMPLETED")

    return (
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">طلبات الاستشارة الواردة</h1>
            <p className="mt-2 text-white/80 text-sm">الطلبات المقدمة إليك من الطلاب والموظفين</p>
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

        {/* Pending — needs action */}
        {pending.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-600" />
              <h2 className="font-semibold text-foreground">تحتاج ردك ({pending.length})</h2>
            </div>
            <div className="space-y-3">
              {pending.map(c => (
                <Link key={c.id} href={`/consultations/${c.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 font-bold text-sm">
                      {(c.requester.nameAr ?? c.requester.name ?? "").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.titleAr}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.requester.nameAr ?? c.requester.name} • {CATEGORY_LABEL[c.category]?.label ?? c.category}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="size-4 shrink-0 text-amber-600" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All my consultations */}
        {myConsultations.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold text-foreground">جميع الطلبات ({myConsultations.length})</h2>
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">الموضوع</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">مقدم الطلب</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">التاريخ</th>
                    <th className="sr-only">عرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myConsultations.map(c => {
                    const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["PENDING"]!
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground max-w-[220px] truncate">{c.titleAr}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.requester.nameAr ?? c.requester.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link href={`/consultations/${c.id}`} className="text-xs text-primary hover:underline">عرض</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {myConsultations.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <MessageSquare className="size-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground">لا توجد طلبات استشارة بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">ستظهر طلبات الطلاب هنا عند إرسالها</p>
          </div>
        )}
      </div>
    )
  }

  // ── REQUESTER VIEW (students, employees, external, volunteers) ────────────
  return (
    <div className="space-y-8" dir="rtl">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">الاستشارات الأكاديمية</h1>
              <p className="mt-2 max-w-lg text-primary-foreground/80 text-sm leading-relaxed">
                تواصل مع أعضاء هيئة التدريس لطلب الاستشارات الأكاديمية والبحثية والمهنية.
                سيصلك رابط حجز الموعد عبر Microsoft Bookings بعد موافقة الدكتور.
              </p>
            </div>
            <Link
              href="/consultations/new"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-white/90 transition-colors"
            >
              <Plus className="size-4" />
              طلب استشارة
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { label: "إجمالي طلباتي", value: myConsultations.length },
              { label: "قيد المراجعة",  value: myConsultations.filter(c => c.status === "PENDING").length },
              { label: "مكتملة",        value: myConsultations.filter(c => c.status === "COMPLETED").length },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -end-12 -top-12 size-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -start-8 size-48 rounded-full bg-white/5" />
      </div>

      {/* My Consultations */}
      {myConsultations.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">طلباتي</h2>
          <div className="space-y-3">
            {myConsultations.map(c => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG["PENDING"]!
              if (!cfg) return null
              const cat = CATEGORY_LABEL[c.category]
              return (
                <Link key={c.id} href={`/consultations/${c.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${cfg.color}`}>
                    <cfg.Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{c.titleAr}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      إلى: {c.faculty.nameAr ?? c.faculty.name}
                      {cat && <span className={`me-2 ms-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>{cat.label}</span>}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Faculty Directory */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">أعضاء هيئة التدريس</h2>
          <p className="text-sm text-muted-foreground">{facultyList.length} عضو متاح</p>
        </div>

        {facultyList.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
            <BookOpen className="size-10 mx-auto mb-3 text-muted-foreground/40" />
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
                  <div className="mt-4 flex items-center gap-3 border-t pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      <span>{f._count.consultationFacultySlots} استشارة</span>
                    </div>
                    {f.bookingsUrl && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        Bookings مفعّل
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/consultations/new?faculty=${f.id}`}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/5 border border-primary/20 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Plus className="size-4" />
                    طلب استشارة
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
