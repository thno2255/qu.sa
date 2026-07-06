import type { ModuleManifest } from "@/core/module-system/types"
export const iamManifest: ModuleManifest = {
  id: "iam", version: "1.0.0",
  name: { ar: "إدارة الهويات والصلاحيات", en: "Identity & Access Management" },
  description: { ar: "إدارة المستخدمين والأدوار والصلاحيات", en: "Manage users, roles and permissions" },
  icon: "Shield", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/iam", apiRoutes: [], enabled: true,
}
