import type { ModuleManifest } from "@/core/module-system/types"
export const onboardingManifest: ModuleManifest = {
  id: "onboarding", version: "1.0.0",
  name: { ar: "onboarding", en: "onboarding" },
  description: { ar: "وحدة onboarding", en: "onboarding module" },
  icon: "Box", navigation: [], permissions: [], events: { emits: [], listens: [] },
  apiPrefix: "/api/v1/onboarding", apiRoutes: [], enabled: true,
}
