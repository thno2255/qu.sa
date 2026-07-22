import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "../../core/auth/utils"
import {
  ORG_REGISTRATION_TEMPLATE,
  INITIATIVE_APPROVAL_TEMPLATE,
  PARTNERSHIP_APPROVAL_TEMPLATE,
} from "../../core/workflow/templates"

const connectionString = process.env.DATABASE_URL ?? ""
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// PERMISSIONS — all platform modules × actions
// ---------------------------------------------------------------------------
const PERMISSIONS = [
  // Dashboard
  { module: "dashboard", action: "view", resource: "dashboard", nameAr: "عرض لوحة التحكم" },

  // Initiatives
  { module: "initiatives", action: "view", resource: "initiative", nameAr: "عرض المبادرات" },
  { module: "initiatives", action: "create", resource: "initiative", nameAr: "إنشاء مبادرة" },
  { module: "initiatives", action: "edit", resource: "initiative", nameAr: "تعديل مبادرة" },
  { module: "initiatives", action: "delete", resource: "initiative", nameAr: "حذف مبادرة" },
  { module: "initiatives", action: "approve", resource: "initiative", nameAr: "اعتماد مبادرة" },
  { module: "initiatives", action: "publish", resource: "initiative", nameAr: "نشر مبادرة" },

  // Projects
  { module: "projects", action: "view", resource: "project", nameAr: "عرض المشاريع" },
  { module: "projects", action: "create", resource: "project", nameAr: "إنشاء مشروع" },
  { module: "projects", action: "edit", resource: "project", nameAr: "تعديل مشروع" },
  { module: "projects", action: "delete", resource: "project", nameAr: "حذف مشروع" },
  { module: "projects", action: "approve", resource: "project", nameAr: "اعتماد مشروع" },

  // Partnerships
  { module: "partnerships", action: "view", resource: "partnership", nameAr: "عرض الشراكات" },
  { module: "partnerships", action: "create", resource: "partnership", nameAr: "إنشاء شراكة" },
  { module: "partnerships", action: "edit", resource: "partnership", nameAr: "تعديل شراكة" },
  { module: "partnerships", action: "approve", resource: "partnership", nameAr: "اعتماد شراكة" },


  // Impact
  { module: "impact", action: "view", resource: "impact", nameAr: "عرض قياس الأثر" },
  { module: "impact", action: "manage", resource: "impact", nameAr: "إدارة قياس الأثر" },

  // Analytics
  { module: "analytics", action: "view", resource: "analytics", nameAr: "عرض التحليلات" },
  { module: "analytics", action: "export", resource: "analytics", nameAr: "تصدير التقارير" },

  // Reports
  { module: "reports", action: "view", resource: "report", nameAr: "عرض التقارير" },
  { module: "reports", action: "generate", resource: "report", nameAr: "توليد التقارير" },
  { module: "reports", action: "export", resource: "report", nameAr: "تصدير التقارير" },

  // AI Assistant
  { module: "ai_assistant", action: "view", resource: "ai", nameAr: "استخدام المساعد الذكي" },

  // CMS
  { module: "cms", action: "view", resource: "cms", nameAr: "عرض المحتوى" },
  { module: "cms", action: "create", resource: "cms", nameAr: "إنشاء محتوى" },
  { module: "cms", action: "edit", resource: "cms", nameAr: "تعديل المحتوى" },
  { module: "cms", action: "publish", resource: "cms", nameAr: "نشر المحتوى" },

  // Settings / Admin
  { module: "settings", action: "view", resource: "settings", nameAr: "عرض الإعدادات" },
  { module: "settings", action: "manage_users", resource: "settings", nameAr: "إدارة المستخدمين" },
  { module: "settings", action: "manage_roles", resource: "settings", nameAr: "إدارة الصلاحيات" },
  { module: "settings", action: "manage_system", resource: "settings", nameAr: "إدارة النظام" },

  // Search
  { module: "search", action: "view", resource: "search", nameAr: "البحث في المنصة" },

  // Notifications
  { module: "notifications", action: "view", resource: "notifications", nameAr: "عرض الإشعارات" },

  // Timeline
  { module: "timeline", action: "view", resource: "timeline", nameAr: "عرض سجل النشاط" },
]

// ---------------------------------------------------------------------------
// ROLES — 10 types per SRS + permission sets
// ---------------------------------------------------------------------------
type PermissionKey = `${string}.${string}.${string}`

const ALL_PERMS: PermissionKey[] = PERMISSIONS.map(
  (p) => `${p.module}.${p.action}.${p.resource}` as PermissionKey,
)

const BASE_PERMS: PermissionKey[] = [
  "dashboard.view.dashboard",
  "search.view.search",
  "notifications.view.notifications",
  "timeline.view.timeline",
]

const ROLES: {
  name: string
  nameAr: string
  description: string
  permissions: PermissionKey[]
}[] = [
  {
    name: "system_admin",
    nameAr: "مدير النظام",
    description: "Full system access",
    permissions: ALL_PERMS,
  },
  {
    name: "community_manager",
    nameAr: "مدير المسؤولية المجتمعية",
    description: "Full platform management",
    permissions: ALL_PERMS.filter((p) => !p.includes("settings.manage_system")),
  },
  {
    name: "community_employee",
    nameAr: "موظف المسؤولية المجتمعية",
    description: "Full platform management (same as community manager) — processes all incoming requests",
    permissions: ALL_PERMS.filter((p) => !p.includes("settings.manage_system")),
  },
  {
    name: "college_dean",
    nameAr: "عميد الكلية",
    description: "College-level oversight",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
      "initiatives.approve.initiative",
      "projects.view.project",
      "projects.approve.project",
      "partnerships.view.partnership",
      "partnerships.approve.partnership",
      "impact.view.impact",
      "reports.view.report",
      "reports.generate.report",
      "reports.export.report",
      "analytics.view.analytics",
      "analytics.export.analytics",
      "ai_assistant.view.ai",
    ],
  },
  {
    name: "department_head",
    nameAr: "رئيس القسم",
    description: "Department-level management",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
      "initiatives.create.initiative",
      "initiatives.edit.initiative",
      "initiatives.approve.initiative",
      "projects.view.project",
      "projects.create.project",
      "projects.edit.project",
      "impact.view.impact",
      "reports.view.report",
      "reports.generate.report",
      "analytics.view.analytics",
      "ai_assistant.view.ai",
    ],
  },
  {
    name: "faculty_member",
    nameAr: "عضو هيئة التدريس",
    description: "Initiative creation and supervision",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
      "initiatives.create.initiative",
      "initiatives.edit.initiative",
      "projects.view.project",
      "projects.create.project",
      "projects.edit.project",
      "impact.view.impact",
      "reports.view.report",
      "analytics.view.analytics",
      "ai_assistant.view.ai",
    ],
  },
  {
    name: "student",
    nameAr: "الطالب",
    description: "Volunteer, participate in initiatives",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
      "projects.view.project",
      "impact.view.impact",
      "ai_assistant.view.ai",
    ],
  },
  {
    name: "external_entity",
    nameAr: "الجهة الخارجية",
    description: "External organization or partner",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
      "projects.view.project",
      "partnerships.view.partnership",
      "partnerships.create.partnership",
    ],
  },
  {
    name: "volunteer",
    nameAr: "المتطوع",
    description: "Community volunteer (non-student)",
    permissions: [
      ...BASE_PERMS,
      "initiatives.view.initiative",
    ],
  },
  {
    name: "visitor",
    nameAr: "الزائر",
    description: "Read-only access to public content",
    permissions: [
      "dashboard.view.dashboard",
      "initiatives.view.initiative",
      "cms.view.cms",
    ],
  },
]

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 Seeding database...")

  // 1. Permissions
  const permMap = new Map<string, string>()
  for (const perm of PERMISSIONS) {
    const name = `${perm.module}.${perm.action}.${perm.resource}`
    const record = await prisma.permission.upsert({
      where: { name },
      update: { nameAr: perm.nameAr },
      create: {
        module: perm.module,
        action: perm.action,
        resource: perm.resource,
        name,
        nameAr: perm.nameAr,
      },
    })
    permMap.set(name, record.id)
  }
  console.log(`  ✓ Upserted ${PERMISSIONS.length} permissions`)

  // 2. Roles + permission assignments
  for (const role of ROLES) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { nameAr: role.nameAr, description: role.description },
      create: {
        name: role.name,
        nameAr: role.nameAr,
        description: role.description,
        isSystem: true,
      },
    })

    // Delete old assignments then re-insert
    await prisma.rolePermission.deleteMany({ where: { roleId: r.id } })
    const assignments = role.permissions
      .map((permKey) => permMap.get(permKey))
      .filter(Boolean) as string[]

    if (assignments.length > 0) {
      await prisma.rolePermission.createMany({
        data: assignments.map((permissionId) => ({ roleId: r.id, permissionId })),
        skipDuplicates: true,
      })
    }
  }
  console.log(`  ✓ Upserted ${ROLES.length} roles with permission assignments`)

  // 4. Certificate templates
  await prisma.certificateTemplate.upsert({
    where: { id: "initiative-cert" },
    update: {},
    create: {
      id: "initiative-cert",
      nameAr: "شهادة مشاركة في مبادرة",
      nameEn: "Initiative Participation Certificate",
      isDefault: false,
      variables: ["recipientName", "initiativeTitle", "role", "date"],
      template: {
        type: "initiative_participation",
        titleAr: "شهادة مشاركة في مبادرة",
        titleEn: "Initiative Participation Certificate",
        issuer: "جامعة القصيم",
        issuerEn: "Qassim University",
      },
    },
  })
  console.log("  ✓ Upserted certificate templates")

  // 5. Compliance frameworks
  await prisma.complianceFramework.upsert({
    where: { id: "ncaaa" },
    update: {},
    create: {
      id: "ncaaa",
      nameAr: "المركز الوطني للتقييم والاعتماد الأكاديمي",
      nameEn: "NCAAA",
      type: "accreditation",
      authority: "NCAAA",
    },
  })
  console.log("  ✓ Upserted compliance frameworks")

  // 7. Demo users (dev only)
  if (process.env.NODE_ENV !== "production") {
    const demoPassword = await hashPassword("Demo@2026!")
    const demoUsers = [
      {
        id: "demo-admin",
        email: "admin@qu.edu.sa",
        nameAr: "مدير النظام",
        name: "System Admin",
        userType: "SYSTEM_ADMIN",
        status: "ACTIVE",
        roleName: "system_admin",
      },
      {
        id: "demo-manager",
        email: "manager@qu.edu.sa",
        nameAr: "مدير المسؤولية",
        name: "Community Manager",
        userType: "COMMUNITY_MANAGER",
        status: "ACTIVE",
        roleName: "community_manager",
      },
      {
        id: "demo-employee",
        email: "employee@qu.edu.sa",
        nameAr: "موظف المسؤولية",
        name: "Community Employee",
        userType: "COMMUNITY_EMPLOYEE",
        status: "ACTIVE",
        roleName: "community_employee",
      },
      {
        id: "demo-dean",
        email: "dean@qu.edu.sa",
        nameAr: "عميد الكلية",
        name: "College Dean",
        userType: "COLLEGE_DEAN",
        status: "ACTIVE",
        roleName: "college_dean",
      },
      {
        id: "demo-faculty",
        email: "faculty@qu.edu.sa",
        nameAr: "عضو هيئة التدريس",
        name: "Faculty Member",
        userType: "FACULTY_MEMBER",
        status: "ACTIVE",
        roleName: "faculty_member",
      },
      {
        id: "demo-student",
        email: "student@qu.edu.sa",
        nameAr: "الطالب التجريبي",
        name: "Demo Student",
        userType: "STUDENT",
        status: "ACTIVE",
        roleName: "student",
      },
      {
        id: "demo-external",
        email: "external@example.com",
        nameAr: "الجهة الخارجية",
        name: "External Entity",
        userType: "EXTERNAL_ENTITY",
        status: "ACTIVE",
        roleName: "external_entity",
      },
    ] as const

    for (const u of demoUsers) {
      const user = await prisma.user.upsert({
        where: { id: u.id },
        update: { passwordHash: demoPassword },
        create: {
          id: u.id,
          email: u.email,
          nameAr: u.nameAr,
          name: u.name,
          passwordHash: demoPassword,
          userType: u.userType as Parameters<typeof prisma.user.create>[0]["data"]["userType"],
          status: u.status as Parameters<typeof prisma.user.create>[0]["data"]["status"],
          emailVerified: new Date(),
        },
      })

      const role = await prisma.role.findUnique({ where: { name: u.roleName } })
      if (role) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id },
        })
      }
    }
    console.log(`  ✓ Upserted ${demoUsers.length} demo users (password: Demo@2026!)`)

    // 8. Workflow templates (dev only — seeded once)
    const workflowTemplates = [
      {
        id: "wf-org-registration",
        name: { ar: "اعتماد تسجيل جهة خارجية", en: "External Entity Registration Approval" },
        description: { ar: "مراجعة واعتماد طلبات تسجيل الجهات الخارجية", en: "Review and approve external entity registration requests" },
        moduleId: "organizations",
        entityType: "Organization",
        config: ORG_REGISTRATION_TEMPLATE,
        visualConfig: { nodes: [], edges: [] },
        status: "active",
        isDefault: true,
      },
      {
        id: "wf-initiative-approval",
        name: { ar: "اعتماد مبادرة مجتمعية", en: "Community Initiative Approval" },
        description: { ar: "دورة اعتماد المبادرات المجتمعية متعددة المستويات", en: "Multi-level community initiative approval cycle" },
        moduleId: "initiatives",
        entityType: "Initiative",
        config: INITIATIVE_APPROVAL_TEMPLATE,
        visualConfig: { nodes: [], edges: [] },
        status: "active",
        isDefault: true,
      },
      {
        id: "wf-partnership-approval",
        name: { ar: "اعتماد شراكة مجتمعية", en: "Community Partnership Approval" },
        description: { ar: "مراجعة واعتماد طلبات الشراكات", en: "Review and approve partnership requests" },
        moduleId: "partnerships",
        entityType: "Partnership",
        config: PARTNERSHIP_APPROVAL_TEMPLATE,
        visualConfig: { nodes: [], edges: [] },
        status: "active",
        isDefault: true,
      },
    ]

    for (const wf of workflowTemplates) {
      await prisma.workflowDefinition.upsert({
        where: { id: wf.id },
        update: {
          name: wf.name,
          description: wf.description,
          config: wf.config as unknown as Parameters<typeof prisma.workflowDefinition.create>[0]["data"]["config"],
          status: wf.status,
        },
        create: {
          id: wf.id,
          name: wf.name,
          description: wf.description,
          moduleId: wf.moduleId,
          entityType: wf.entityType,
          config: wf.config as unknown as Parameters<typeof prisma.workflowDefinition.create>[0]["data"]["config"],
          visualConfig: wf.visualConfig,
          status: wf.status,
          isDefault: wf.isDefault,
          createdBy: "demo-admin",
        },
      })
    }
    console.log(`  ✓ Upserted ${workflowTemplates.length} workflow templates`)

    // 9. Notification templates
    const notifTemplates = [
      {
        id: "nt-task-assigned",
        name: "WORKFLOW_TASK_ASSIGNED",
        type: "WORKFLOW_TASK_ASSIGNED",
        channels: ["IN_APP", "EMAIL"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "مهمة موافقة جديدة",
        titleEn: "New Approval Task",
        bodyAr: "لديك مهمة موافقة جديدة في {{workflowName}} — يرجى المراجعة والبت فيها خلال {{slaHours}} ساعة.",
        bodyEn: "You have a new approval task in {{workflowName}}. Please review and decide within {{slaHours}} hours.",
        variables: ["workflowName", "slaHours", "stepName"],
      },
      {
        id: "nt-approved",
        name: "WORKFLOW_APPROVED",
        type: "WORKFLOW_APPROVED",
        channels: ["IN_APP", "EMAIL"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "تمت الموافقة على طلبك",
        titleEn: "Your Request Was Approved",
        bodyAr: "تمت الموافقة على {{entityName}} من قِبَل المراجع المختص.",
        bodyEn: "{{entityName}} has been approved by the designated reviewer.",
        variables: ["entityName", "workflowName"],
      },
      {
        id: "nt-rejected",
        name: "WORKFLOW_REJECTED",
        type: "WORKFLOW_REJECTED",
        channels: ["IN_APP", "EMAIL"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "تم رفض طلبك",
        titleEn: "Your Request Was Rejected",
        bodyAr: "تم رفض {{entityName}}. يُرجى مراجعة التعليقات والتعديل وإعادة الإرسال.",
        bodyEn: "{{entityName}} was rejected. Please review the comments, make corrections, and resubmit.",
        variables: ["entityName", "workflowName", "comment"],
      },
      {
        id: "nt-returned",
        name: "WORKFLOW_RETURNED",
        type: "WORKFLOW_RETURNED",
        channels: ["IN_APP", "EMAIL"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "أُعيد طلبك للمراجعة",
        titleEn: "Your Request Was Returned for Revision",
        bodyAr: "أُعيد {{entityName}} إليك للمراجعة. يرجى الاطلاع على التعليقات.",
        bodyEn: "{{entityName}} was returned for revision. Please review the comments.",
        variables: ["entityName", "workflowName", "comment"],
      },
      {
        id: "nt-escalated",
        name: "WORKFLOW_ESCALATED",
        type: "WORKFLOW_ESCALATED",
        channels: ["IN_APP", "EMAIL"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "تصعيد: انتهت مهلة المراجعة",
        titleEn: "Escalation: Review SLA Breached",
        bodyAr: "تم تصعيد {{stepName}} إليك بسبب انتهاء المهلة. يرجى المراجعة الفورية.",
        bodyEn: "{{stepName}} has been escalated to you due to SLA breach. Immediate review required.",
        variables: ["stepName", "workflowName", "escalatedFrom"],
      },
      {
        id: "nt-sla-warning",
        name: "WORKFLOW_SLA_WARNING",
        type: "WORKFLOW_SLA_WARNING",
        channels: ["IN_APP"] as Parameters<typeof prisma.notificationTemplate.create>[0]["data"]["channels"],
        titleAr: "تحذير: المهلة تقترب",
        titleEn: "Warning: SLA Deadline Approaching",
        bodyAr: "تبقّت {{hoursRemaining}} ساعة على انتهاء مهلة {{stepName}} في {{workflowName}}.",
        bodyEn: "{{hoursRemaining}} hours remaining to complete {{stepName}} in {{workflowName}}.",
        variables: ["stepName", "workflowName", "hoursRemaining"],
      },
    ]

    for (const tmpl of notifTemplates) {
      await prisma.notificationTemplate.upsert({
        where: { id: tmpl.id },
        update: { titleAr: tmpl.titleAr, bodyAr: tmpl.bodyAr },
        create: tmpl,
      })
    }
    console.log(`  ✓ Upserted ${notifTemplates.length} notification templates`)

    // 10. Sample notifications for demo users (so the UI has something to show)
    const sampleNotifications = [
      {
        recipientId: "demo-employee",
        type: "WORKFLOW_TASK_ASSIGNED",
        title: { ar: "مهمة موافقة جديدة", en: "New Approval Task" },
        body: { ar: "لديك مهمة مراجعة طلب تسجيل جهة خارجية جديدة", en: "You have a new external entity registration review task" },
        channel: "IN_APP" as const,
        priority: "HIGH" as const,
        status: "unread",
      },
      {
        recipientId: "demo-manager",
        type: "WORKFLOW_TASK_ASSIGNED",
        title: { ar: "مهمة اعتماد نهائي", en: "Final Approval Task" },
        body: { ar: "طلب اعتماد شراكة جديدة بانتظار موافقتك النهائية", en: "A new partnership approval request awaits your final decision" },
        channel: "IN_APP" as const,
        priority: "NORMAL" as const,
        status: "unread",
      },
      {
        recipientId: "demo-admin",
        type: "GENERAL",
        title: { ar: "اكتملت تهيئة المنصة", en: "Platform Setup Complete" },
        body: { ar: "تم تهيئة جميع البيانات الأولية بنجاح. المنصة جاهزة للاستخدام.", en: "All initial data has been seeded successfully. The platform is ready to use." },
        channel: "IN_APP" as const,
        priority: "NORMAL" as const,
        status: "read",
      },
    ]

    for (const notif of sampleNotifications) {
      await prisma.notification.create({ data: notif })
    }
    console.log(`  ✓ Created ${sampleNotifications.length} sample notifications`)

    // 11. Sample Phase 3 data: initiatives, projects, partnerships
    const sampleInitiatives = [
      {
        id: "init-literacy",
        titleAr: "مبادرة تعزيز القراءة والكتابة",
        titleEn: "Literacy Enhancement Initiative",
        descriptionAr: "مبادرة لتعزيز مهارات القراءة والكتابة لدى طلاب المجتمع المحيط بالجامعة",
        ownerId: "demo-faculty",
        status: "active",
        sdgGoals: [4, 10],
        vision2030Pillar: "مجتمع حيوي",
        targetBeneficiaries: 500,
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-12-31"),
        tags: ["تعليم", "مجتمع"],
      },
      {
        id: "init-environment",
        titleAr: "مبادرة الحرم الجامعي الأخضر",
        titleEn: "Green Campus Initiative",
        descriptionAr: "تحويل الحرم الجامعي إلى بيئة مستدامة من خلال التشجير والطاقة الشمسية",
        ownerId: "demo-employee",
        status: "pending",
        sdgGoals: [7, 11, 13],
        vision2030Pillar: "وطن طموح",
        targetBeneficiaries: 15000,
        startDate: new Date("2026-03-01"),
        tags: ["بيئة", "استدامة"],
      },
      {
        id: "init-health",
        titleAr: "مبادرة الصحة المجتمعية",
        titleEn: "Community Health Initiative",
        descriptionAr: "توفير خدمات صحية توعوية مجانية للأحياء المحيطة بالجامعة",
        ownerId: "demo-employee",
        status: "draft",
        sdgGoals: [3],
        vision2030Pillar: "مجتمع حيوي",
        targetBeneficiaries: 2000,
        tags: ["صحة", "توعية"],
      },
    ]

    for (const init of sampleInitiatives) {
      await prisma.initiative.upsert({
        where: { id: init.id },
        update: { status: init.status },
        create: init,
      })
    }
    console.log(`  ✓ Upserted ${sampleInitiatives.length} sample initiatives`)

    // Sample projects
    const sampleProjects = [
      {
        id: "proj-coding",
        titleAr: "مشروع تعليم البرمجة للشباب",
        titleEn: "Youth Coding Education Project",
        descriptionAr: "تعليم أساسيات البرمجة لطلاب المدارس الثانوية في منطقة القصيم",
        managerId: "demo-faculty",
        status: "active",
        sdgGoals: [4, 9],
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-06-30"),
        riskLevel: "low",
      },
      {
        id: "proj-food",
        titleAr: "مشروع مبادرة إفطار الصائم",
        titleEn: "Iftar Initiative Project",
        descriptionAr: "توزيع وجبات إفطار يومية على المحتاجين خلال شهر رمضان",
        managerId: "demo-employee",
        status: "pending",
        sdgGoals: [1, 2],
        riskLevel: "medium",
      },
    ]

    for (const proj of sampleProjects) {
      await prisma.project.upsert({
        where: { id: proj.id },
        update: { status: proj.status },
        create: proj,
      })
    }

    // Sample milestones for coding project
    const milestones = [
      { projectId: "proj-coding", titleAr: "تصميم المنهج التعليمي", order: 0, status: "completed", completedAt: new Date("2026-02-15") },
      { projectId: "proj-coding", titleAr: "التسجيل والقبول", order: 1, status: "completed", completedAt: new Date("2026-02-28") },
      { projectId: "proj-coding", titleAr: "الجلسات التعليمية (المرحلة الأولى)", order: 2, status: "pending", dueDate: new Date("2026-04-30") },
      { projectId: "proj-coding", titleAr: "التقييم النهائي وشهادات التخرج", order: 3, status: "pending", dueDate: new Date("2026-06-30") },
    ]
    for (const ms of milestones) {
      await prisma.projectMilestone.upsert({
        where: { id: `ms-${ms.projectId}-${ms.order}` },
        update: { status: ms.status },
        create: { id: `ms-${ms.projectId}-${ms.order}`, ...ms },
      })
    }
    console.log(`  ✓ Upserted ${sampleProjects.length} sample projects with milestones`)

    // Sample partner + partnership
    await prisma.partner.upsert({
      where: { id: "partner-aramco" },
      update: {},
      create: {
        id: "partner-aramco",
        nameAr: "شركة أرامكو السعودية",
        nameEn: "Saudi Aramco",
        type: "private",
        sector: "طاقة",
        email: "csr@aramco.com",
        status: "active",
      },
    })

    await prisma.partnership.upsert({
      where: { id: "ps-aramco-stem" },
      update: {},
      create: {
        id: "ps-aramco-stem",
        partnerId: "partner-aramco",
        titleAr: "شراكة في تعليم STEM",
        titleEn: "STEM Education Partnership",
        type: "اتفاقية تعاون",
        status: "active",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2027-12-31"),
        sdgGoals: [4, 8, 9],
        partnershipValue: 500000,
      },
    })
    console.log("  ✓ Upserted sample partner and partnership")

    // 12. Phase 4: KB Articles for search indexing + AI context
    const kbArticles = [
      {
        id: "kb-how-to-initiative",
        titleAr: "كيفية إنشاء مبادرة مجتمعية",
        titleEn: "How to Create a Community Initiative",
        contentAr: "لإنشاء مبادرة مجتمعية، انتقل إلى قسم المبادرات واضغط على زر إنشاء مبادرة. أدخل العنوان بالعربية والإنجليزية، والوصف التفصيلي، وتواريخ البداية والنهاية، وعدد المستفيدين المستهدفين. اربط مبادرتك بأهداف التنمية المستدامة المناسبة ومحور رؤية 2030. بعد الحفظ، ستحتاج إلى إرسالها للموافقة عبر زر إرسال للموافقة.",
        authorId: "demo-admin",
        status: "published",
        tags: ["مبادرات", "دليل المستخدم"],
        publishedAt: new Date("2026-01-01"),
      },
      {
        id: "kb-approval-workflow",
        titleAr: "فهم دورة الموافقات في المنصة",
        titleEn: "Understanding the Platform Approval Cycle",
        contentAr: "تمر المبادرات في المنصة بمراحل موافقة متعددة: المرحلة الأولى تتم مع رئيس القسم الذي يراجع الجدوى الأكاديمية، ثم عميد الكلية الذي يتحقق من الانسجام مع أهداف الكلية، وأخيراً مدير المسؤولية المجتمعية للاعتماد النهائي. يمكنك متابعة حالة موافقتك في صفحة سير العمل.",
        authorId: "demo-admin",
        status: "published",
        tags: ["موافقات", "سير العمل"],
        publishedAt: new Date("2026-01-01"),
      },
    ]

    for (const article of kbArticles) {
      await prisma.kBArticle.upsert({
        where: { id: article.id },
        update: { status: article.status },
        create: article,
      })
    }
    console.log(`  ✓ Upserted ${kbArticles.length} KB articles`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 14: Sample CMS content
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[14] Seeding CMS content...")
  {
    const news = [
      {
        id: "news-vision2030",
        titleAr: "جامعة القصيم تطلق منصة المسؤولية المجتمعية",
        titleEn: "Qassim University Launches Community Responsibility Platform",
        excerptAr: "في إطار رؤية 2030، أطلقت جامعة القصيم منصة رقمية متكاملة لإدارة برامج المسؤولية المجتمعية",
        contentAr: "تعلن جامعة القصيم عن إطلاق منصة المسؤولية المجتمعية، وهي منصة رقمية متطورة تهدف إلى تعزيز مساهمة الجامعة في التنمية المجتمعية في إطار رؤية المملكة 2030. تتيح المنصة إدارة المبادرات والمشاريع والشراكات وبرامج التطوع بشكل متكامل.",
        authorId: "demo-admin",
        status: "published",
        tags: ["رؤية 2030", "مسؤولية مجتمعية", "تقنية"],
        publishedAt: new Date("2026-01-15"),
      },
    ]

    const events = [
      {
        id: "event-community-day",
        titleAr: "يوم المجتمع المفتوح",
        titleEn: "Open Community Day",
        descriptionAr: "يوم مفتوح للمجتمع المحلي للتعرف على برامج الجامعة ومبادراتها المجتمعية",
        startDate: new Date("2026-09-15T09:00:00"),
        endDate: new Date("2026-09-15T15:00:00"),
        locationAr: "المبنى الإداري الرئيسي — جامعة القصيم",
        locationEn: "Main Administrative Building — Qassim University",
        status: "published",
        capacity: 200,
        isPublic: true,
      },
      {
        id: "event-sdg-workshop",
        titleAr: "ورشة أهداف التنمية المستدامة",
        titleEn: "SDG Workshop",
        descriptionAr: "ورشة عمل تفاعلية لتعريف المجتمع الجامعي بأهداف التنمية المستدامة وكيفية المساهمة فيها",
        startDate: new Date("2026-10-01T10:00:00"),
        endDate: new Date("2026-10-01T13:00:00"),
        locationAr: "قاعة المؤتمرات — مبنى الإدارة",
        locationEn: "Conference Hall — Admin Building",
        status: "published",
        capacity: 100,
        isPublic: true,
      },
    ]

    for (const article of news) {
      await prisma.newsArticle.upsert({
        where: { id: article.id },
        update: { status: article.status },
        create: article,
      })
    }
    for (const event of events) {
      await prisma.cMSEvent.upsert({
        where: { id: event.id },
        update: { status: event.status },
        create: event,
      })
    }
    console.log(`  ✓ Upserted ${news.length} news articles and ${events.length} events`)
  }

  console.log("\n✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
