import type { ModuleManifest } from "@/core/module-system/types"

export const initiativesManifest: ModuleManifest = {
  id: "initiatives",
  version: "1.0.0",
  name: { ar: "المبادرات المجتمعية", en: "Community Initiatives" },
  description: {
    ar: "إدارة المبادرات المجتمعية من الفكرة حتى التنفيذ وقياس الأثر",
    en: "Manage community initiatives from idea to implementation and impact measurement",
  },
  icon: "Rocket",
  color: "#2563eb",

  navigation: [
    {
      id: "initiatives",
      label: { ar: "المبادرات المجتمعية", en: "Community Initiatives" },
      href: "/initiatives",
      icon: "Rocket",
      permissions: ["initiatives:read"],
      group: "community",
    },
  ],

  permissions: [
    {
      id: "initiatives:read",
      name: { ar: "عرض المبادرات", en: "View Initiatives" },
      description: { ar: "عرض قائمة المبادرات وتفاصيلها", en: "View initiatives list and details" },
      category: "initiatives",
    },
    {
      id: "initiatives:create",
      name: { ar: "إنشاء مبادرة", en: "Create Initiative" },
      description: { ar: "إنشاء مبادرات جديدة", en: "Create new initiatives" },
      category: "initiatives",
    },
    {
      id: "initiatives:update",
      name: { ar: "تعديل مبادرة", en: "Update Initiative" },
      description: { ar: "تعديل المبادرات الموجودة", en: "Edit existing initiatives" },
      category: "initiatives",
    },
    {
      id: "initiatives:delete",
      name: { ar: "حذف مبادرة", en: "Delete Initiative" },
      description: { ar: "حذف المبادرات", en: "Delete initiatives" },
      category: "initiatives",
    },
    {
      id: "initiatives:approve",
      name: { ar: "اعتماد مبادرة", en: "Approve Initiative" },
      description: { ar: "اعتماد أو رفض المبادرات", en: "Approve or reject initiatives" },
      category: "initiatives",
    },
    {
      id: "initiatives:manage",
      name: { ar: "إدارة المبادرات", en: "Manage Initiatives" },
      description: {
        ar: "إدارة كاملة للمبادرات بما فيها الأرشفة والتصدير",
        en: "Full management including archiving and export",
      },
      category: "initiatives",
    },
  ],

  events: {
    emits: [
      {
        name: "initiative.created",
        description: "Emitted when a new initiative is created",
        schema: { id: "string", title: "object", ownerId: "string", status: "string" },
      },
      {
        name: "initiative.approved",
        description: "Emitted when an initiative is approved",
        schema: { id: "string", approvedBy: "string" },
      },
      {
        name: "initiative.rejected",
        description: "Emitted when an initiative is rejected",
        schema: { id: "string", rejectedBy: "string", reason: "string" },
      },
      {
        name: "initiative.completed",
        description: "Emitted when an initiative is marked complete",
        schema: { id: "string", completedBy: "string" },
      },
    ],
    listens: [
      {
        event: "workflow.completed",
        handlerPath: "@/modules/initiatives/events/on-workflow-completed",
      },
      {
        event: "workflow.rejected",
        handlerPath: "@/modules/initiatives/events/on-workflow-rejected",
      },
    ],
  },

  apiPrefix: "/api/v1/initiatives",
  apiRoutes: [
    { method: "GET", path: "/", description: "List initiatives", permissions: ["initiatives:read"] },
    { method: "POST", path: "/", description: "Create initiative", permissions: ["initiatives:create"] },
    { method: "GET", path: "/:id", description: "Get initiative by ID", permissions: ["initiatives:read"] },
    { method: "PATCH", path: "/:id", description: "Update initiative", permissions: ["initiatives:update"] },
    { method: "DELETE", path: "/:id", description: "Delete initiative", permissions: ["initiatives:delete"] },
    { method: "POST", path: "/:id/approve", description: "Approve initiative", permissions: ["initiatives:approve"] },
    { method: "POST", path: "/:id/reject", description: "Reject initiative", permissions: ["initiatives:approve"] },
    { method: "GET", path: "/public", description: "Public initiatives list", public: true },
  ],

  searchAdapter: {
    entityTypes: ["Initiative"],
    async search(filters) {
      const { db } = await import("@/core/database/client")
      const initiatives = await db.initiative.findMany({
        where: {
          status: { in: ["active", "approved", "completed"] },
          OR: [
            { titleAr: { contains: filters.query, mode: "insensitive" } },
            { titleEn: { contains: filters.query, mode: "insensitive" } },
            { descriptionAr: { contains: filters.query, mode: "insensitive" } },
          ],
        },
        take: filters.limit ?? 10,
        orderBy: { updatedAt: "desc" },
      })
      return initiatives.map((i) => ({
        id: i.id,
        objectType: "Initiative",
        moduleId: "initiatives",
        title: { ar: i.titleAr, en: i.titleEn ?? i.titleAr },
        description: i.descriptionAr
          ? { ar: i.descriptionAr, en: i.descriptionEn ?? i.descriptionAr }
          : undefined,
        url: `/initiatives/${i.id}`,
        status: i.status,
        score: 1,
      }))
    },
    async indexEntity(_entityId, _entityType) {
      // Will be implemented in Phase 4 (Enterprise Search phase)
    },
    async removeEntity(_entityId, _entityType) {
      // Will be implemented in Phase 4
    },
  },

  widgets: [
    {
      id: "initiatives-count",
      name: { ar: "عدد المبادرات", en: "Initiatives Count" },
      description: { ar: "إجمالي المبادرات النشطة", en: "Total active initiatives" },
      category: "kpi",
      defaultSize: { w: 2, h: 2, minW: 2, minH: 2 },
      permissions: ["initiatives:read"],
      componentPath: "@/modules/initiatives/components/widgets/count-widget",
      dataSourcePath: "@/modules/initiatives/actions/get-initiatives-count",
    },
    {
      id: "initiatives-status-chart",
      name: { ar: "المبادرات حسب الحالة", en: "Initiatives by Status" },
      description: { ar: "توزيع المبادرات حسب الحالة", en: "Initiative distribution by status" },
      category: "chart",
      defaultSize: { w: 4, h: 3, minW: 3, minH: 3 },
      permissions: ["initiatives:read"],
      componentPath: "@/modules/initiatives/components/widgets/status-chart",
      dataSourcePath: "@/modules/initiatives/actions/get-initiatives-by-status",
    },
  ],

  aiContext: {
    async getSystemContext() {
      return `
You have access to the Community Initiatives module. Initiatives are community impact projects
run by Qassim University departments and partners. Each initiative has:
- Status lifecycle: draft → pending approval → approved → active → completed
- SDG goal alignment (1-17)
- Vision 2030 pillar alignment
- Budget and beneficiary targets
- Approval workflow with multi-stage review
`
    },
    async getEntityContext(entityId: string) {
      const { db } = await import("@/core/database/client")
      const initiative = await db.initiative.findUnique({ where: { id: entityId } })
      if (!initiative) return ""
      return `Current initiative: "${initiative.titleAr}" — Status: ${initiative.status}, Beneficiary target: ${initiative.targetBeneficiaries ?? "not set"}`
    },
  },

  dependencies: ["workflow-engine", "forms-builder", "rules-engine"],
  enabled: true,
}
