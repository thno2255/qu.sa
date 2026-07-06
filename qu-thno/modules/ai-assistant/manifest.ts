import type { ModuleManifest } from "@/core/module-system/types"
export const aiAssistantManifest: ModuleManifest = {
  id: "ai-assistant", version: "1.0.0",
  name: { ar: "ai-assistant", en: "ai-assistant" },
  description: { ar: "وحدة ai-assistant", en: "ai-assistant module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/ai-assistant", apiRoutes: [], enabled: true,
}
