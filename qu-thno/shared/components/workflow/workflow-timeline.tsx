import type { WorkflowHistoryView } from "@/core/workflow/types"
import { formatDistanceToNow } from "date-fns"
import { ar as arLocale } from "date-fns/locale"

const ACTION_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  STARTED: { ar: "بدأ سير العمل", en: "Workflow started", color: "bg-blue-500" },
  APPROVE: { ar: "موافقة", en: "Approved", color: "bg-green-500" },
  REJECT: { ar: "رفض", en: "Rejected", color: "bg-red-500" },
  RETURN: { ar: "إعادة للمراجعة", en: "Returned for review", color: "bg-orange-500" },
  DELEGATE: { ar: "تفويض", en: "Delegated", color: "bg-purple-500" },
  ESCALATED: { ar: "تصعيد بسبب انتهاء المهلة", en: "Escalated (SLA breach)", color: "bg-red-400" },
}

interface WorkflowTimelineProps {
  history: WorkflowHistoryView[]
  isRTL: boolean
}

export function WorkflowTimeline({ history, isRTL }: WorkflowTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {isRTL ? "لا يوجد سجل بعد" : "No history yet"}
      </p>
    )
  }

  return (
    <ol className="relative space-y-6 border-s-2 border-border ps-6">
      {history.map((entry, i) => {
        const label = ACTION_LABELS[entry.action] ?? {
          ar: entry.action,
          en: entry.action,
          color: "bg-gray-400",
        }
        const ago = formatDistanceToNow(entry.createdAt, {
          addSuffix: true,
          locale: isRTL ? arLocale : undefined,
        })

        return (
          <li key={entry.id} className="relative">
            {/* Dot */}
            <span
              className={`absolute -start-[1.65rem] top-0.5 flex size-3.5 items-center justify-center rounded-full ring-2 ring-background ${label.color}`}
            />

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {isRTL ? label.ar : label.en}
                </span>
                {entry.toStage && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
                    {entry.toStage}
                  </span>
                )}
                <span className="ms-auto text-xs text-muted-foreground">{ago}</span>
              </div>

              {entry.comment && (
                <blockquote className="border-s-2 border-primary/30 ps-3 text-sm text-muted-foreground italic">
                  {entry.comment}
                </blockquote>
              )}

              {entry.actorId && (
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "بواسطة: " : "By: "}
                  <span className="font-medium text-foreground">{entry.actorId}</span>
                </p>
              )}
            </div>

            {/* Connector line between items */}
            {i < history.length - 1 && (
              <div className="absolute -start-[1.35rem] top-5 h-full border-s-2 border-dashed border-border" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
