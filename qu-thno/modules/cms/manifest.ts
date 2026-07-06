import type { ModuleManifest } from "@/core/module-system/types"
export const cmsManifest: ModuleManifest = {
  id: "cms", version: "1.0.0",
  name: { ar: "cms", en: "cms" },
  description: { ar: "وحدة cms", en: "cms module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/cms", apiRoutes: [], enabled: true,
}
