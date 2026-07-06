import type { ModuleManifest } from "@/core/module-system/types"

export const workflowEngineManifest: ModuleManifest = {
  id: "workflow-engine",
  version: "1.0.0",
  name: { ar: "محرك سير العمل", en: "Workflow Engine" },
  description: {
    ar: "تصميم وتنفيذ سير العمل المرئي بصلاحيات متعددة المراحل",
    en: "Design and execute visual workflows with multi-stage approvals",
  },
  icon: "GitBranch",
  color: "#7c3aed",

  navigation: [
    {
      id: "settings-workflows",
      label: { ar: "سير العمل", en: "Workflow Designer" },
      href: "/settings/workflows",
      icon: "GitBranch",
      permissions: ["workflows:manage"],
      group: "admin",
    },
  ],

  permissions: [
    {
      id: "workflows:read",
      name: { ar: "عرض سير العمل", en: "View Workflows" },
      description: { ar: "عرض تعريفات سير العمل", en: "View workflow definitions" },
      category: "workflow-engine",
    },
    {
      id: "workflows:manage",
      name: { ar: "إدارة سير العمل", en: "Manage Workflows" },
      description: { ar: "إنشاء وتعديل وحذف سير العمل", en: "Create, edit, and delete workflows" },
      category: "workflow-engine",
    },
    {
      id: "workflows:approve",
      name: { ar: "اعتماد خطوات سير العمل", en: "Approve Workflow Stages" },
      description: { ar: "اعتماد أو رفض خطوات سير العمل", en: "Approve or reject workflow stages" },
      category: "workflow-engine",
    },
  ],

  events: {
    emits: [
      {
        name: "workflow.started",
        description: "Workflow instance started",
        schema: { instanceId: "string", entityType: "string", entityId: "string" },
      },
      {
        name: "workflow.stage_completed",
        description: "A workflow stage was completed",
        schema: { instanceId: "string", stage: "string", actorId: "string" },
      },
      {
        name: "workflow.completed",
        description: "Workflow instance completed successfully",
        schema: { instanceId: "string", entityType: "string", entityId: "string" },
      },
      {
        name: "workflow.rejected",
        description: "Workflow instance was rejected",
        schema: { instanceId: "string", entityType: "string", entityId: "string", reason: "string" },
      },
      {
        name: "workflow.escalated",
        description: "Workflow escalated due to SLA breach",
        schema: { instanceId: "string", stage: "string", escalatedTo: "string" },
      },
    ],
    listens: [],
  },

  apiPrefix: "/api/v1/workflows",
  apiRoutes: [
    { method: "GET", path: "/definitions", description: "List workflow definitions", permissions: ["workflows:read"] },
    { method: "POST", path: "/definitions", description: "Create workflow definition", permissions: ["workflows:manage"] },
    { method: "GET", path: "/definitions/:id", description: "Get workflow definition", permissions: ["workflows:read"] },
    { method: "PUT", path: "/definitions/:id", description: "Update workflow definition", permissions: ["workflows:manage"] },
    { method: "DELETE", path: "/definitions/:id", description: "Delete workflow definition", permissions: ["workflows:manage"] },
    { method: "POST", path: "/instances", description: "Start workflow instance", permissions: ["workflows:approve"] },
    { method: "GET", path: "/instances/:id", description: "Get workflow instance", permissions: ["workflows:read"] },
    { method: "POST", path: "/instances/:id/approve", description: "Approve workflow stage", permissions: ["workflows:approve"] },
    { method: "POST", path: "/instances/:id/reject", description: "Reject workflow stage", permissions: ["workflows:approve"] },
  ],

  enabled: true,
}
