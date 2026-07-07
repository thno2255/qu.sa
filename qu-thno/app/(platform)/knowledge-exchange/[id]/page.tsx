import { notFound } from "next/navigation"
import { getLocale } from "next-intl/server"
import Link from "next/link"
import { BookOpen, Building2, User, Calendar, Tag } from "lucide-react"
import { getKnowledgeExchangeRequest } from "@/core/knowledge-exchange/actions"
import { KE_CATEGORY_LABEL, KE_STATUS_LABEL } from "@/core/knowledge-exchange/constants"
import { auth } from "@/core/auth/auth"
import { KEAdminActions } from "./ke-admin-actions"

export const metadata = { title: "تفاصيل طلب التبادل المعرفي" }

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700 border-amber-200",
  REVIEWING: "bg-blue-100 text-blue-700 border-blue-200",
  ACCEPTED:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  SCHEDULED: "bg-violet-100 text-violet-700 border-violet-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

export default async function KnowledgeExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [locale, session, request] = await Promise.all([
    getLocale(),
    auth(),
    getKnowledgeExchangeRequest(id),
  ])

  if (!request) notFound()

  const isRTL    = locale === "ar"
  const isAdmin  = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"].includes(session?.user?.userType ?? "")
  const isFaculty = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"].includes(session?.user?.userType ?? "")

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/knowledge-exchange" className="hover:text-foreground">تبادل المعرفة</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{request.companyName}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{request.topicAr}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                <Building2 className="size-3.5" />
                {request.companyName}
              </p>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-sm font-medium ${STATUS_COLOR[request.status] ?? "bg-muted text-muted-foreground"}`}>
            {KE_STATUS_LABEL[request.status] ?? request.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="size-4 shrink-0" />
            <span>{KE_CATEGORY_LABEL[request.category] ?? request.category}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4 shrink-0" />
            <span>{request.createdAt.toLocaleDateString(locale)}</span>
          </div>
          {request.assignedFaculty && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4 shrink-0" />
              <span>{request.assignedFaculty.nameAr ?? request.assignedFaculty.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-3">تفاصيل الطلب</h2>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{request.descriptionAr}</p>
      </div>

      {/* Contact */}
      {(request.contactName || request.contactEmail || request.contactPhone) && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-3">معلومات التواصل</h2>
          <div className="space-y-2 text-sm">
            {request.contactName  && <p><span className="text-muted-foreground">المسؤول: </span>{request.contactName}</p>}
            {request.contactEmail && <p><span className="text-muted-foreground">البريد: </span>{request.contactEmail}</p>}
            {request.contactPhone && <p><span className="text-muted-foreground">الجوال: </span>{request.contactPhone}</p>}
          </div>
        </div>
      )}

      {/* Admin notes */}
      {request.adminNotes && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-blue-800 mb-2">ملاحظات الإدارة</h2>
          <p className="text-sm text-blue-700 leading-relaxed">{request.adminNotes}</p>
        </div>
      )}

      {/* Admin actions */}
      {isAdmin && <KEAdminActions request={request} />}
    </div>
  )
}
