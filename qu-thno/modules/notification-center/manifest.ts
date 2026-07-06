import type { ModuleManifest } from "@/core/module-system/types"
export const notificationCenterManifest: ModuleManifest = {
  id: "notification-center", version: "1.0.0",
  name: { ar: "notification-center", en: "notification-center" },
  description: { ar: "وحدة notification-center", en: "notification-center module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/notification-center", apiRoutes: [], enabled: true,
}
