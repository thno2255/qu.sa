export type RequestBucket = "new" | "in_review" | "on_hold" | "completed"

export const BUCKET_LABEL: Record<RequestBucket, { ar: string; en: string; className: string }> = {
  new:        { ar: "جديد",         en: "New",        className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_review:  { ar: "قيد الدراسة",   en: "In Review",  className: "bg-amber-100 text-amber-700 border-amber-200" },
  on_hold:    { ar: "معلق",          en: "On Hold",    className: "bg-red-100 text-red-700 border-red-200" },
  completed:  { ar: "مكتمل",         en: "Completed",  className: "bg-green-100 text-green-700 border-green-200" },
}

export interface UnifiedRequest {
  id: string
  type: "partnership" | "event" | "consultation" | "knowledge_exchange" | "project_visit"
  typeLabelAr: string
  typeLabelEn: string
  titleAr: string
  titleEn: string | null
  bucket: RequestBucket
  rawStatus: string
  createdAt: Date
  href: string
}
