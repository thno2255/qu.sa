import type { ModuleManifest } from "@/core/module-system/types"
export const communicationsManifest: ModuleManifest = {
  id: "communications", version: "1.0.0",
  name: { ar: "communications", en: "communications" },
  description: { ar: "وحدة communications", en: "communications module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/communications", apiRoutes: [], enabled: true,
}
