import type { ModuleManifest } from "@/core/module-system/types"
export const dashboardBuilderManifest: ModuleManifest = {
  id: "dashboard-builder", version: "1.0.0",
  name: { ar: "dashboard-builder", en: "dashboard-builder" },
  description: { ar: "وحدة dashboard-builder", en: "dashboard-builder module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/dashboard-builder", apiRoutes: [], enabled: true,
}
