import type { ModuleManifest } from "@/core/module-system/types"
export const surveysManifest: ModuleManifest = {
  id: "surveys", version: "1.0.0",
  name: { ar: "surveys", en: "surveys" },
  description: { ar: "وحدة surveys", en: "surveys module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/surveys", apiRoutes: [], enabled: true,
}
