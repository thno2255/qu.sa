import type { ModuleManifest } from "@/core/module-system/types"
export const impactManifest: ModuleManifest = {
  id: "impact", version: "1.0.0",
  name: { ar: "impact", en: "impact" },
  description: { ar: "وحدة impact", en: "impact module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/impact", apiRoutes: [], enabled: true,
}
