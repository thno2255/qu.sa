import type { ModuleManifest } from "@/core/module-system/types"
export const certificatesManifest: ModuleManifest = {
  id: "certificates", version: "1.0.0",
  name: { ar: "certificates", en: "certificates" },
  description: { ar: "وحدة certificates", en: "certificates module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/certificates", apiRoutes: [], enabled: true,
}
