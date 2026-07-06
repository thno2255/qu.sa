import type { ModuleManifest } from "@/core/module-system/types"
export const documentsManifest: ModuleManifest = {
  id: "documents", version: "1.0.0",
  name: { ar: "documents", en: "documents" },
  description: { ar: "وحدة documents", en: "documents module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/documents", apiRoutes: [], enabled: true,
}
