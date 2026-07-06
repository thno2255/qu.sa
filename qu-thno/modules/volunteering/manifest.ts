import type { ModuleManifest } from "@/core/module-system/types"
export const volunteeringManifest: ModuleManifest = {
  id: "volunteering", version: "1.0.0",
  name: { ar: "volunteering", en: "volunteering" },
  description: { ar: "وحدة volunteering", en: "volunteering module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/volunteering", apiRoutes: [], enabled: true,
}
