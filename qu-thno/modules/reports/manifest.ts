import type { ModuleManifest } from "@/core/module-system/types"
export const reportsManifest: ModuleManifest = {
  id: "reports", version: "1.0.0",
  name: { ar: "reports", en: "reports" },
  description: { ar: "وحدة reports", en: "reports module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/reports", apiRoutes: [], enabled: true,
}
