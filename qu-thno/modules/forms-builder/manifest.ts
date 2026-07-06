import type { ModuleManifest } from "@/core/module-system/types"
export const formsBuilderManifest: ModuleManifest = {
  id: "forms-builder", version: "1.0.0",
  name: { ar: "منشئ النماذج", en: "Forms Builder" },
  description: { ar: "بناء نماذج ديناميكية بدون برمجة", en: "Build dynamic forms without code" },
  icon: "FormInput", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/forms", apiRoutes: [], enabled: true,
}
