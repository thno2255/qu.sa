import type { ModuleManifest } from "@/core/module-system/types"
export const activityTimelineManifest: ModuleManifest = {
  id: "activity-timeline", version: "1.0.0",
  name: { ar: "activity-timeline", en: "activity-timeline" },
  description: { ar: "وحدة activity-timeline", en: "activity-timeline module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/activity-timeline", apiRoutes: [], enabled: true,
}
