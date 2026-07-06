import type { ModuleManifest } from "@/core/module-system/types"
export const complianceManifest: ModuleManifest = {
  id: "compliance", version: "1.0.0",
  name: { ar: "compliance", en: "compliance" },
  description: { ar: "وحدة compliance", en: "compliance module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/compliance", apiRoutes: [], enabled: true,
}
