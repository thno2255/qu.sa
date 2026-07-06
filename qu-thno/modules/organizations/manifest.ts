import type { ModuleManifest } from "@/core/module-system/types"
export const organizationsManifest: ModuleManifest = {
  id: "organizations", version: "1.0.0",
  name: { ar: "إدارة المنظمات", en: "Organizations" },
  description: { ar: "إدارة الجهات الخارجية والمنظمات", en: "Manage external organizations" },
  icon: "Building2", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/organizations", apiRoutes: [], enabled: true,
}
