import type { ModuleManifest } from "@/core/module-system/types"
export const calendarManifest: ModuleManifest = {
  id: "calendar", version: "1.0.0",
  name: { ar: "calendar", en: "calendar" },
  description: { ar: "وحدة calendar", en: "calendar module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/calendar", apiRoutes: [], enabled: true,
}
