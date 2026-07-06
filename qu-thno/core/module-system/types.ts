import type { LocalizedString } from "@/core/types/global"

// =============================================
// PERMISSION SYSTEM
// =============================================

export interface PermissionDefinition {
  id: string
  name: LocalizedString
  description: LocalizedString
  category: string
}

// =============================================
// NAVIGATION SYSTEM
// =============================================

export interface NavigationItem {
  id: string
  label: LocalizedString
  href: string
  icon: string
  permissions?: string[]
  badge?: () => Promise<number | null>
  children?: NavigationItem[]
  group?: string
  external?: boolean
}

// =============================================
// EVENT SYSTEM
// =============================================

export interface EventDefinition {
  name: string
  description: string
  schema?: Record<string, unknown>
}

export interface EventSubscription {
  event: string
  handlerPath: string
  priority?: number
}

// =============================================
// SEARCH SYSTEM
// =============================================

export interface SearchResult {
  id: string
  objectType: string
  moduleId: string
  title: LocalizedString
  description?: LocalizedString
  url: string
  status?: string
  metadata?: Record<string, unknown>
  score?: number
  updatedAt?: Date
}

export interface SearchFilters {
  query: string
  moduleIds?: string[]
  objectTypes?: string[]
  status?: string[]
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}

export interface SearchAdapter {
  entityTypes: string[]
  search: (filters: SearchFilters) => Promise<SearchResult[]>
  indexEntity: (entityId: string, entityType: string) => Promise<void>
  removeEntity: (entityId: string, entityType: string) => Promise<void>
}

// =============================================
// DASHBOARD WIDGET SYSTEM
// =============================================

export interface WidgetSize {
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export interface WidgetDefinition {
  id: string
  name: LocalizedString
  description: LocalizedString
  category: string
  defaultSize: WidgetSize
  permissions?: string[]
  componentPath: string
  dataSourcePath: string
  configSchema?: Record<string, unknown>
  previewImagePath?: string
}

// =============================================
// AI CONTEXT SYSTEM
// =============================================

export interface AITool {
  name: string
  description: string
  parameters: Record<string, unknown>
  executePath: string
}

export interface AIContextProvider {
  getSystemContext: () => Promise<string>
  getEntityContext?: (entityId: string, entityType: string) => Promise<string>
  tools?: AITool[]
}

// =============================================
// API SYSTEM
// =============================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface APIRouteDefinition {
  method: HttpMethod
  path: string
  description: string
  permissions?: string[]
  public?: boolean
  rateLimit?: number
}

// =============================================
// FORM SCHEMA SYSTEM
// =============================================

export interface BuiltinFormSchema {
  id: string
  name: LocalizedString
  schemaPath: string
}

// =============================================
// REPORT SYSTEM
// =============================================

export interface ReportTemplate {
  id: string
  name: LocalizedString
  description: LocalizedString
  templatePath: string
  permissions?: string[]
  formats: ("pdf" | "excel" | "csv")[]
}

// =============================================
// MODULE MANIFEST (THE CONTRACT)
// =============================================

export interface ModuleManifest {
  // Identity
  id: string
  version: string
  name: LocalizedString
  description: LocalizedString
  icon: string
  color?: string

  // Navigation contributions
  navigation: NavigationItem[]

  // Permission definitions
  permissions: PermissionDefinition[]

  // Cross-module event system
  events: {
    emits: EventDefinition[]
    listens: EventSubscription[]
  }

  // REST API
  apiPrefix: string
  apiRoutes: APIRouteDefinition[]

  // Optional capabilities
  searchAdapter?: SearchAdapter
  widgets?: WidgetDefinition[]
  aiContext?: AIContextProvider
  formSchemas?: BuiltinFormSchema[]
  reportTemplates?: ReportTemplate[]

  // Module dependencies
  dependencies?: string[]

  // Metadata
  enabled?: boolean
  beta?: boolean
  adminOnly?: boolean
}
