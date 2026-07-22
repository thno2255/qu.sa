/**
 * Module System Entry Point
 *
 * Import all module manifests and register them here.
 * Order matters — dependencies must be registered before dependents.
 *
 * This file is imported once at application startup (in the root layout).
 */

import { moduleRegistry } from "./registry"

// Foundation modules (no dependencies)
import { iamManifest } from "@/modules/iam/manifest"
import { organizationsManifest } from "@/modules/organizations/manifest"
import { auditLogManifest } from "@/modules/audit-log/manifest"

// Engine modules
import { workflowEngineManifest } from "@/modules/workflow-engine/manifest"

// Core community modules (depend on workflow-engine)
import { initiativesManifest } from "@/modules/initiatives/manifest"
import { projectsManifest } from "@/modules/projects/manifest"
import { partnershipsManifest } from "@/modules/partnerships/manifest"

// Intelligence modules
import { reportsManifest } from "@/modules/reports/manifest"

// Communication modules
import { notificationCenterManifest } from "@/modules/notification-center/manifest"
import { cmsManifest } from "@/modules/cms/manifest"
import { communicationsManifest } from "@/modules/communications/manifest"

// Utility modules
import { certificatesManifest } from "@/modules/certificates/manifest"
import { surveysManifest } from "@/modules/surveys/manifest"
import { documentsManifest } from "@/modules/documents/manifest"
import { knowledgeBaseManifest } from "@/modules/knowledge-base/manifest"
import { complianceManifest } from "@/modules/compliance/manifest"
import { budgetTrackingManifest } from "@/modules/budget-tracking/manifest"
import { onboardingManifest } from "@/modules/onboarding/manifest"
import { calendarManifest } from "@/modules/calendar/manifest"
import { publicPortalManifest } from "@/modules/public-portal/manifest"
import { systemAdminManifest } from "@/modules/system-admin/manifest"
import { securityAuditManifest } from "@/modules/security-audit/manifest"

let initialized = false

export function initializeModules(): void {
  if (initialized) return
  initialized = true

  // Registration order matters — dependencies first
  moduleRegistry.register(iamManifest)
  moduleRegistry.register(organizationsManifest)
  moduleRegistry.register(auditLogManifest)
  moduleRegistry.register(workflowEngineManifest)
  moduleRegistry.register(initiativesManifest)
  moduleRegistry.register(projectsManifest)
  moduleRegistry.register(partnershipsManifest)
  moduleRegistry.register(reportsManifest)
  moduleRegistry.register(notificationCenterManifest)
  moduleRegistry.register(cmsManifest)
  moduleRegistry.register(communicationsManifest)
  moduleRegistry.register(certificatesManifest)
  moduleRegistry.register(surveysManifest)
  moduleRegistry.register(documentsManifest)
  moduleRegistry.register(knowledgeBaseManifest)
  moduleRegistry.register(complianceManifest)
  moduleRegistry.register(budgetTrackingManifest)
  moduleRegistry.register(onboardingManifest)
  moduleRegistry.register(calendarManifest)
  moduleRegistry.register(publicPortalManifest)
  moduleRegistry.register(systemAdminManifest)
  moduleRegistry.register(securityAuditManifest)

  if (process.env.NODE_ENV === "development") {
    const stats = moduleRegistry.getStats()
    console.log(
      `[ModuleSystem] Initialized: ${stats.enabled} modules enabled, ${stats.disabled} disabled`
    )
  }
}

export { moduleRegistry }
export type { ModuleManifest } from "./types"
