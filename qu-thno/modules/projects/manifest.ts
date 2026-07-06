import type { ModuleManifest } from "@/core/module-system/types"
export const projectsManifest: ModuleManifest = {
  id: "projects", version: "1.0.0",
  name: { ar: "projects", en: "projects" },
  description: { ar: "وحدة projects", en: "projects module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/projects", apiRoutes: [], enabled: true,
}
