import type { ModuleManifest } from "@/core/module-system/types"
export const knowledgeBaseManifest: ModuleManifest = {
  id: "knowledge-base", version: "1.0.0",
  name: { ar: "knowledge-base", en: "knowledge-base" },
  description: { ar: "وحدة knowledge-base", en: "knowledge-base module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/knowledge-base", apiRoutes: [], enabled: true,
}
