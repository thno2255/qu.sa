import type { ModuleManifest } from "@/core/module-system/types"
export const partnershipsManifest: ModuleManifest = {
  id: "partnerships", version: "1.0.0",
  name: { ar: "partnerships", en: "partnerships" },
  description: { ar: "وحدة partnerships", en: "partnerships module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/partnerships", apiRoutes: [], enabled: true,
}
