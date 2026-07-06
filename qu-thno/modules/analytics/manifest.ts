import type { ModuleManifest } from "@/core/module-system/types"
export const analyticsManifest: ModuleManifest = {
  id: "analytics", version: "1.0.0",
  name: { ar: "analytics", en: "analytics" },
  description: { ar: "وحدة analytics", en: "analytics module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/analytics", apiRoutes: [], enabled: true,
}
