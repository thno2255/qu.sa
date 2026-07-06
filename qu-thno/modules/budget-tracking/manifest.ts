import type { ModuleManifest } from "@/core/module-system/types"
export const budgetTrackingManifest: ModuleManifest = {
  id: "budget-tracking", version: "1.0.0",
  name: { ar: "budget-tracking", en: "budget-tracking" },
  description: { ar: "وحدة budget-tracking", en: "budget-tracking module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/budget-tracking", apiRoutes: [], enabled: true,
}
