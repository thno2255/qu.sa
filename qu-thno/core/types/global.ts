export interface LocalizedString {
  ar: string
  en: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  errors: ApiError[] | null
  requestId: string
  timestamp: string
}

export interface ApiError {
  code: string
  field?: string
  message: string
}

export function createApiResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return {
    data,
    meta,
    errors: null,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
}

export type UserType = "INTERNAL" | "EXTERNAL" | "SYSTEM"
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED"

export type OrganizationType = "COMPANY" | "NGO" | "GOVERNMENT" | "ACADEMIC" | "INTERNATIONAL"
export type OrganizationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "SUSPENDED" | "REJECTED"

export type WorkflowStatus = "RUNNING" | "COMPLETED" | "REJECTED" | "CANCELLED" | "ON_HOLD"

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP" | "PUSH"
export type NotificationPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW"
