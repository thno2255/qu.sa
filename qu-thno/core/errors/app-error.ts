export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "WORKFLOW_ERROR"
  | "RULE_VIOLATION"

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super("FORBIDDEN", message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404)
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super("VALIDATION_ERROR", message, 422, { fieldErrors })
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super("RATE_LIMITED", message, 429)
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function toApiError(error: unknown): {
  code: string
  message: string
  details?: Record<string, unknown>
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  console.error("[Unhandled Error]", error)
  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  }
}
