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
const REQUESTER_ROLES = ["STUDENT", "EXTERNAL_ENTITY", "VOLUNTEER", "VISITOR"]
const ALL_ROLES = [...ACADEMIC_ROLES, ...REQUESTER_ROLES]
// External entities get a dedicated, curated portal (dashboard, partnership
// request, events, notifications, my requests) instead of the full nav.
const NON_EXTERNAL_ROLES = ALL_ROLES.filter((r) => r !== "EXTERNAL_ENTITY")

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
        id: "my-requests",
        labelAr: "طلباتي",
        labelEn: "My Requests",
        href: "/my-requests",
        icon: "Inbox",
        allowedRoles: REQUESTER_ROLES,
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
        labelAr: "الاستشارات والزيارات الميدانية",
        labelEn: "Consultations & Field Visits",
        href: "/consultations",
        icon: "GraduationCap",
        allowedRoles: NON_EXTERNAL_ROLES,
      },
      {
        id: "partnership-request",
        labelAr: "طلب شراكة",
        labelEn: "Partnership Request",
        href: "/partners/apply",
        icon: "Handshake",
        allowedRoles: ["EXTERNAL_ENTITY"],
      },
      {
        id: "portal-events",
        labelAr: "الفعاليات",
        labelEn: "Events",
        href: "/events",
        icon: "Calendar",
        allowedRoles: ["EXTERNAL_ENTITY"],
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
        allowedRoles: NON_EXTERNAL_ROLES,
      },
      {
        id: "projects",
        labelAr: "المشاريع المجتمعية",
        labelEn: "Projects",
        href: "/projects",
        icon: "FolderKanban",
        allowedRoles: ACADEMIC_ROLES,
      },
      {
        id: "partnerships",
        labelAr: "شركاء النجاح",
        labelEn: "Success Partners",
        href: "/partnerships",
        icon: "Handshake",
        allowedRoles: ACADEMIC_ROLES,
      },
      {
        id: "knowledge-exchange",
        labelAr: "التبادل المعرفي للشركات",
        labelEn: "Knowledge Exchange",
        href: "/knowledge-exchange",
        icon: "Lightbulb",
        allowedRoles: NON_EXTERNAL_ROLES,
      },
      {
        id: "community-needs-survey",
        labelAr: "استبيان الاحتياج المجتمعي",
        labelEn: "Community Needs Survey",
        href: "/surveys/community-needs",
        icon: "ClipboardList",
        allowedRoles: NON_EXTERNAL_ROLES,
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
