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

const ADMIN_ROLES = ["SYSTEM_ADMIN", "COMMUNITY_MANAGER", "COMMUNITY_EMPLOYEE"]
const STAFF_ROLES = [...ADMIN_ROLES]
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
        id: "requests",
        labelAr: "الطلبات الواردة",
        labelEn: "Incoming Requests",
        href: "/requests",
        icon: "Inbox",
        allowedRoles: STAFF_ROLES,
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
        id: "profile",
        labelAr: "ملفي الشخصي",
        labelEn: "My Profile",
        href: "/profile",
        icon: "User",
        // visible to all
      },
      {
        id: "consultations",
        labelAr: "الاستشارات",
        labelEn: "Consultations",
        href: "/consultations",
        icon: "GraduationCap",
        // visible to all
        children: [
          {
            id: "consultations-overview",
            labelAr: "الاستشارات الأكاديمية",
            labelEn: "Academic Consultations",
            href: "/consultations",
            icon: "GraduationCap",
            // visible to all
          },
          {
            id: "project-visits",
            labelAr: "المشاريع والزيارات الميدانية",
            labelEn: "Projects & Field Visits",
            href: "/consultations/project-visits",
            icon: "MapPin",
            // visible to all
          },
        ],
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
        id: "knowledge-exchange",
        labelAr: "التبادل المعرفي للشركات",
        labelEn: "Knowledge Exchange",
        href: "/knowledge-exchange",
        icon: "Lightbulb",
        // visible to all
      },
      {
        id: "community-needs-survey",
        labelAr: "استبيان الاحتياج المجتمعي",
        labelEn: "Community Needs Survey",
        href: "/surveys/community-needs",
        icon: "ClipboardList",
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
        id: "reports",
        labelAr: "التقارير",
        labelEn: "Reports",
        href: "/reports",
        icon: "FileText",
        allowedRoles: [...STAFF_ROLES, "COLLEGE_DEAN"],
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
