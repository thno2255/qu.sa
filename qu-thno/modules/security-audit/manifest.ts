import type { ModuleManifest } from "@/core/module-system/types"
export const securityAuditManifest: ModuleManifest = {
  id: "security-audit", version: "1.0.0",
  name: { ar: "security-audit", en: "security-audit" },
  description: { ar: "وحدة security-audit", en: "security-audit module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/security-audit", apiRoutes: [], enabled: true,
}
