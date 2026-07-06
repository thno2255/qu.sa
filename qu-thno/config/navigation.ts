export interface NavGroup {
  id: string
  labelAr: string
  labelEn: string
  items: NavItem[]
}

export interface NavItem {
  id: string
  labelAr: string
  labelEn: string
  href: string
  icon: string
  allowedRoles?: string[]   // undefined = visible to all authenticated users
  badge?: string
  children?: NavItem[]
}

const ADMIN_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER"]
const STAFF_ROLES = [...ADMIN_ROLES, "COMMUNITY_EMPLOYEE"]
const ACADEMIC_ROLES = [...STAFF_ROLES, "COLLEGE_DEAN", "DEPARTMENT_HEAD", "FACULTY_MEMBER"]
const ALL_ROLES = [...ACADEMIC_ROLES, "STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]

export const NAVIGATION: NavGroup[] = [
  {
    id: "overview",
    labelAr: "الرئيسية",
    labelEn: "Overview",
    items: [
      {
        id: "dashboard",
        labelAr: "لوحة التحكم",
        labelEn: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        // visible to all
      },
      {
        id: "workflows",
        labelAr: "سير العمل",
        labelEn: "Workflows",
        href: "/workflows",
        icon: "GitBranch",
        allowedRoles: ACADEMIC_ROLES,
      },
      {
        id: "notifications",
        labelAr: "الإشعارات",
        labelEn: "Notifications",
        href: "/notifications",
        icon: "Bell",
        // visible to all
      },
      {
        id: "search",
        labelAr: "البحث الموحد",
        labelEn: "Enterprise Search",
        href: "/search",
        icon: "Search",
        // visible to all
      },
      {
        id: "timeline",
        labelAr: "سجل النشاط",
        labelEn: "Activity Timeline",
        href: "/timeline",
        icon: "Activity",
        allowedRoles: ACADEMIC_ROLES,
      },
      {
        id: "profile",
        labelAr: "ملفي الشخصي",
        labelEn: "My Profile",
        href: "/profile",
        icon: "Trophy",
        // visible to all
      },
      {
        id: "consultations",
        labelAr: "الاستشارات",
        labelEn: "Consultations",
        href: "/consultations",
        icon: "GraduationCap",
        // visible to all
      },
    ],
  },
  {
    id: "community",
    labelAr: "المجتمع",
    labelEn: "Community",
    items: [
      {
        id: "initiatives",
        labelAr: "المبادرات المجتمعية",
        labelEn: "Initiatives",
        href: "/initiatives",
        icon: "Rocket",
        // visible to all
      },
      {
        id: "projects",
        labelAr: "المشاريع المجتمعية",
        labelEn: "Projects",
        href: "/projects",
        icon: "FolderKanban",
        allowedRoles: [...ACADEMIC_ROLES, "EXTERNAL_ENTITY"],
      },
      {
        id: "partnerships",
        labelAr: "الشراكات المجتمعية",
        labelEn: "Partnerships",
        href: "/partnerships",
        icon: "Handshake",
        allowedRoles: [...ACADEMIC_ROLES, "EXTERNAL_ENTITY"],
      },
      {
        id: "volunteering",
        labelAr: "التطوع",
        labelEn: "Volunteering",
        href: "/volunteering",
        icon: "Heart",
        // visible to all
      },
    ],
  },
  {
    id: "intelligence",
    labelAr: "الذكاء والتحليل",
    labelEn: "Intelligence",
    items: [
      {
        id: "impact",
        labelAr: "قياس الأثر المجتمعي",
        labelEn: "Impact Measurement",
        href: "/impact",
        icon: "TrendingUp",
        allowedRoles: ACADEMIC_ROLES,
      },
      {
        id: "analytics",
        labelAr: "التحليلات",
        labelEn: "Analytics",
        href: "/analytics",
        icon: "BarChart3",
        allowedRoles: ADMIN_ROLES,
      },
      {
        id: "reports",
        labelAr: "التقارير",
        labelEn: "Reports",
        href: "/reports",
        icon: "FileText",
        allowedRoles: [...STAFF_ROLES, "COLLEGE_DEAN"],
      },
      {
        id: "ai-assistant",
        labelAr: "المساعد الذكي",
        labelEn: "AI Assistant",
        href: "/ai-assistant",
        icon: "BrainCircuit",
        // visible to all
      },
    ],
  },
  {
    id: "content",
    labelAr: "المحتوى",
    labelEn: "Content",
    items: [
      {
        id: "cms",
        labelAr: "إدارة المحتوى",
        labelEn: "Content Management",
        href: "/cms",
        icon: "Newspaper",
        allowedRoles: STAFF_ROLES,
        children: [
          {
            id: "news",
            labelAr: "الأخبار",
            labelEn: "News",
            href: "/cms/news",
            icon: "Newspaper",
            allowedRoles: STAFF_ROLES,
          },
          {
            id: "events",
            labelAr: "الفعاليات",
            labelEn: "Events",
            href: "/cms/events",
            icon: "Calendar",
            allowedRoles: STAFF_ROLES,
          },
          {
            id: "pages",
            labelAr: "الصفحات",
            labelEn: "Pages",
            href: "/cms/pages",
            icon: "FileStack",
            allowedRoles: STAFF_ROLES,
          },
        ],
      },
    ],
  },
  {
    id: "admin",
    labelAr: "الإدارة",
    labelEn: "Administration",
    items: [
      {
        id: "settings",
        labelAr: "الإعدادات",
        labelEn: "Settings",
        href: "/settings",
        icon: "Settings",
        allowedRoles: ADMIN_ROLES,
        children: [
          {
            id: "users",
            labelAr: "المستخدمون",
            labelEn: "Users",
            href: "/settings/users",
            icon: "Users",
            allowedRoles: ADMIN_ROLES,
          },
          {
            id: "roles",
            labelAr: "الأدوار والصلاحيات",
            labelEn: "Roles & Permissions",
            href: "/settings/roles",
            icon: "Shield",
            allowedRoles: ["SYSTEM_ADMIN"],
          },
          {
            id: "workflows-settings",
            labelAr: "سير العمل",
            labelEn: "Workflow Designer",
            href: "/settings/workflows",
            icon: "GitBranch",
            allowedRoles: ADMIN_ROLES,
          },
          {
            id: "forms",
            labelAr: "منشئ النماذج",
            labelEn: "Forms Builder",
            href: "/settings/forms",
            icon: "FormInput",
            allowedRoles: ADMIN_ROLES,
          },
          {
            id: "rules",
            labelAr: "قواعد الأعمال",
            labelEn: "Business Rules",
            href: "/settings/rules",
            icon: "Zap",
            allowedRoles: ADMIN_ROLES,
          },
          {
            id: "dashboards",
            labelAr: "منشئ لوحات البيانات",
            labelEn: "Dashboard Builder",
            href: "/settings/dashboards",
            icon: "LayoutGrid",
            allowedRoles: ADMIN_ROLES,
          },
          {
            id: "general",
            labelAr: "عام",
            labelEn: "General",
            href: "/settings/general",
            icon: "Settings",
            allowedRoles: ["SYSTEM_ADMIN"],
          },
        ],
      },
    ],
  },
]
