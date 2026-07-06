import type { ModuleManifest } from "@/core/module-system/types"
export const systemAdminManifest: ModuleManifest = {
  id: "system-admin", version: "1.0.0",
  name: { ar: "system-admin", en: "system-admin" },
  description: { ar: "وحدة system-admin", en: "system-admin module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/system-admin", apiRoutes: [], enabled: true,
}
