import type { ModuleManifest } from "@/core/module-system/types"
export const auditLogManifest: ModuleManifest = {
  id: "audit-log", version: "1.0.0",
  name: { ar: "سجل الأنشطة", en: "Audit Log" },
  description: { ar: "سجل شامل لجميع أنشطة المنصة", en: "Comprehensive activity audit trail" },
  icon: "ScrollText", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/audit-log", apiRoutes: [], enabled: true,
}
