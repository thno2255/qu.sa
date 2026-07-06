import type { ModuleManifest } from "@/core/module-system/types"
export const rulesEngineManifest: ModuleManifest = {
  id: "rules-engine", version: "1.0.0",
  name: { ar: "محرك قواعد الأعمال", en: "Business Rules Engine" },
  description: { ar: "تعريف قواعد الأعمال بدون برمجة", en: "Define business rules without code" },
  icon: "Zap", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/rules", apiRoutes: [], enabled: true,
}
