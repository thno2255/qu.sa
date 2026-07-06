import type { ModuleManifest } from "@/core/module-system/types"
export const publicPortalManifest: ModuleManifest = {
  id: "public-portal", version: "1.0.0",
  name: { ar: "public-portal", en: "public-portal" },
  description: { ar: "وحدة public-portal", en: "public-portal module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/public-portal", apiRoutes: [], enabled: true,
}
