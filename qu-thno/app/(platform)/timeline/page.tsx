import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"
import {
  Play, CheckCircle2, XCircle, CornerUpLeft, ArrowRight, AlertTriangle,
  CheckSquare, Plus, Pencil, Trash2, type LucideIcon,
} from "lucide-react"

export const metadata: Metadata = { title: "سجل النشاط | Activity Timeline" }

const ACTION_ICON: Record<string, LucideIcon> = {
  START: Play,
  APPROVE: CheckCircle2,
  REJECT: XCircle,
  RETURN: CornerUpLeft,
  DELEGATE: ArrowRight,
  ESCALATE: AlertTriangle,
  COMPLETE: CheckSquare,
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  SUBMIT: Plus,
  LOGIN: CheckCircle2,
  PUBLISH: CheckCircle2,
  EXPORT: ArrowRight,
  LOGIN_FAILED: XCircle,
  PERMISSION_DENIED: XCircle,
  COMPLETE_MILESTONE: CheckSquare,
  APPLY: Plus,
  LOG_HOURS: CheckCircle2,
  REGISTER: Plus,
  SUBMIT_DECISION: CheckCircle2,
}

const ACTION_COLOR: Record<string, string> = {
  START: "bg-blue-500/10 text-blue-600",
  APPROVE: "bg-green-500/10 text-green-700",
  REJECT: "bg-red-500/10 text-red-600",
  RETURN: "bg-amber-500/10 text-amber-700",
  DELEGATE: "bg-purple-500/10 text-purple-600",
  ESCALATE: "bg-orange-500/10 text-orange-600",
  COMPLETE: "bg-emerald-500/10 text-emerald-700",
  CREATE: "bg-teal-500/10 text-teal-700",
  UPDATE: "bg-indigo-500/10 text-indigo-600",
  DELETE: "bg-gray-500/10 text-gray-600",
}

const ENTITY_LABEL_AR: Record<string, string> = {
  initiative: "مبادرة",
  project: "مشروع",
  partnership: "شراكة",
  volunteer_opportunity: "فرصة تطوع",
  user: "مستخدم",
  workflow: "سير عمل",
}

export default async function TimelinePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const userId = session.user.id
  const userType = session.user.userType ?? "VISITOR"

  const isAdmin = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"].includes(userType)

  // Workflow history — global for admins, own tasks for others
  const [workflowHistory, auditLogs] = await Promise.all([
    db.workflowHistory.findMany({
      where: isAdmin ? undefined : { actorId: userId },
      include: {
        instance: {
          include: { definition: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: isAdmin ? 40 : 20,
    }),
    isAdmin
      ? db.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
  ])

  interface TimelineItem {
    id: string
    time: Date
    source: "workflow" | "audit"
    action: string
    actorId: string | null
    labelAr: string
    labelEn: string
    comment?: string | null
  }

  const wfItems: TimelineItem[] = workflowHistory.map((h) => {
    const defName = h.instance.definition.name as { ar: string; en?: string }
    return {
      id: h.id,
      time: h.createdAt,
      source: "workflow",
      action: h.action,
      actorId: h.actorId,
      labelAr: `${defName.ar} — ${h.toStage}`,
      labelEn: `${defName.en ?? defName.ar} — ${h.toStage}`,
      comment: h.comment,
    }
  })

  const auditItems: TimelineItem[] = (auditLogs as { id: string; createdAt: Date; action: string; actorId: string | null; entityType: string; entityId: string }[]).map((a) => ({
    id: a.id,
    time: a.createdAt,
    source: "audit",
    action: a.action,
    actorId: a.actorId,
    labelAr: `${ENTITY_LABEL_AR[a.entityType] ?? a.entityType} — ${a.entityId.slice(0, 8)}`,
    labelEn: `${a.entityType} — ${a.entityId.slice(0, 8)}`,
  }))

  const allItems = [...wfItems, ...auditItems].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 50)

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("سجل النشاط", "Activity Timeline")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("سجل تسلسلي لجميع الإجراءات والأحداث على المنصة", "Chronological record of all platform actions and events")}
        </p>
      </div>

      {allItems.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-foreground">{t("لا يوجد نشاط بعد", "No activity yet")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("ستظهر هنا أحداث المنصة عند بدء استخدامها", "Platform events will appear here once activity begins")}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute top-0 bottom-0 w-px bg-border ${isRTL ? "end-[1.625rem]" : "start-[1.625rem]"}`} aria-hidden />

          <ol className="space-y-4">
            {allItems.map((item) => {
              const ActionIconComp = ACTION_ICON[item.action] ?? Plus
              const color = ACTION_COLOR[item.action] ?? "bg-gray-100 text-gray-600"
              const label = isRTL ? item.labelAr : item.labelEn
              const formattedTime = new Intl.DateTimeFormat(isRTL ? "ar-SA" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(item.time)

              return (
                <li key={item.id} className={`relative flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {/* Icon */}
                  <div className={`relative z-10 flex size-[1.875rem] shrink-0 items-center justify-center rounded-full border-2 border-background ${color}`}>
                    <ActionIconComp className="size-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-xl border bg-card px-4 py-3 shadow-sm min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{label}</p>
                        {item.comment && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.comment}</p>
                        )}
                      </div>
                      <div className={`flex flex-col items-end gap-1 shrink-0`}>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">{formattedTime}</time>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
                          <ActionIconComp className="size-2.5" />
                          {item.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
