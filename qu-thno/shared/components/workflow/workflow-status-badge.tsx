import type { WorkflowStatus, ApprovalTaskStatus } from "@prisma/client"

type Status = WorkflowStatus | ApprovalTaskStatus | string

const WORKFLOW_LABELS: Record<string, { ar: string; en: string; className: string }> = {
  RUNNING: {
    ar: "جارٍ",
    en: "Running",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    ar: "مكتمل",
    en: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    ar: "مرفوض",
    en: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  CANCELLED: {
    ar: "ملغى",
    en: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  ON_HOLD: {
    ar: "موقوف مؤقتاً",
    en: "On Hold",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  // Task statuses
  PENDING: {
    ar: "بانتظار الموافقة",
    en: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  IN_REVIEW: {
    ar: "قيد المراجعة",
    en: "In Review",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  APPROVED: {
    ar: "موافق عليه",
    en: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  RETURNED: {
    ar: "أُعيد للمراجعة",
    en: "Returned",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  DELEGATED: {
    ar: "تم التفويض",
    en: "Delegated",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ESCALATED: {
    ar: "تصعيد",
    en: "Escalated",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  EXPIRED: {
    ar: "منتهية الصلاحية",
    en: "Expired",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
}

export function WorkflowStatusBadge({
  status,
  isRTL,
}: {
  status: Status
  isRTL: boolean
}) {
  const config = WORKFLOW_LABELS[status] ?? {
    ar: status,
    en: status,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {isRTL ? config.ar : config.en}
    </span>
  )
}
