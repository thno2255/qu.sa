const STATUS_CONFIG: Record<string, { ar: string; en: string; className: string }> = {
  // Generic
  draft:        { ar: "مسودة",        en: "Draft",        className: "bg-gray-100 text-gray-600 border-gray-200" },
  pending:      { ar: "بانتظار الموافقة", en: "Pending",  className: "bg-amber-100 text-amber-800 border-amber-200" },
  under_review: { ar: "قيد المراجعة", en: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
  approved:     { ar: "مُعتمد",       en: "Approved",     className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  active:       { ar: "نشط",          en: "Active",       className: "bg-green-100 text-green-700 border-green-200" },
  in_progress:  { ar: "جارٍ",         en: "In Progress",  className: "bg-blue-100 text-blue-700 border-blue-200" },
  completed:    { ar: "مكتمل",        en: "Completed",    className: "bg-green-100 text-green-800 border-green-200" },
  rejected:     { ar: "مرفوض",        en: "Rejected",     className: "bg-red-100 text-red-700 border-red-200" },
  suspended:    { ar: "موقوف",        en: "Suspended",    className: "bg-orange-100 text-orange-700 border-orange-200" },
  cancelled:    { ar: "ملغى",         en: "Cancelled",    className: "bg-gray-100 text-gray-500 border-gray-200" },
  closed:       { ar: "مغلق",         en: "Closed",       className: "bg-gray-100 text-gray-600 border-gray-200" },
  open:         { ar: "مفتوح",        en: "Open",         className: "bg-green-100 text-green-700 border-green-200" },
  expired:      { ar: "منتهي الصلاحية", en: "Expired",   className: "bg-gray-100 text-gray-400 border-gray-200" },
  // Org statuses
  PENDING:      { ar: "بانتظار الموافقة", en: "Pending",  className: "bg-amber-100 text-amber-800 border-amber-200" },
  APPROVED:     { ar: "معتمد",        en: "Approved",     className: "bg-green-100 text-green-700 border-green-200" },
  SUSPENDED:    { ar: "موقوف",        en: "Suspended",    className: "bg-orange-100 text-orange-700 border-orange-200" },
  REJECTED:     { ar: "مرفوض",        en: "Rejected",     className: "bg-red-100 text-red-700 border-red-200" },
}

interface EntityStatusBadgeProps {
  status: string
  isRTL: boolean
  size?: "sm" | "md"
}

export function EntityStatusBadge({ status, isRTL, size = "md" }: EntityStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    ar: status,
    en: status,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  }

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${config.className}`}>
      {isRTL ? config.ar : config.en}
    </span>
  )
}
