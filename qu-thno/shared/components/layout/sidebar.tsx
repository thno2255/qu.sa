"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Search,
  Activity,
  Rocket,
  FolderKanban,
  Handshake,
  Heart,
  TrendingUp,
  BarChart3,
  FileText,
  BrainCircuit,
  Bell,
  Newspaper,
  Calendar,
  FileStack,
  Settings,
  Users,
  Shield,
  GitBranch,
  FormInput,
  Zap,
  LayoutGrid,
  Trophy,
  GraduationCap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { NAVIGATION, type NavGroup, type NavItem } from "@/config/navigation"

const USER_TYPE_LABEL: Record<string, string> = {
  SYSTEM_ADMIN:       "مدير النظام",
  COMMUNITY_MANAGER:  "مدير المسؤولية",
  COMMUNITY_EMPLOYEE: "موظف المسؤولية",
  COLLEGE_DEAN:       "عميد الكلية",
  DEPARTMENT_HEAD:    "رئيس القسم",
  FACULTY_MEMBER:     "عضو هيئة التدريس",
  STUDENT:            "طالب",
  EXTERNAL_ENTITY:    "جهة خارجية",
  VOLUNTEER:          "متطوع",
  VISITOR:            "زائر",
}

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  SYSTEM_ADMIN:       { bg: "bg-red-100",    text: "text-red-700" },
  COMMUNITY_MANAGER:  { bg: "bg-purple-100", text: "text-purple-700" },
  COMMUNITY_EMPLOYEE: { bg: "bg-indigo-100", text: "text-indigo-700" },
  COLLEGE_DEAN:       { bg: "bg-blue-100",   text: "text-blue-700" },
  DEPARTMENT_HEAD:    { bg: "bg-cyan-100",   text: "text-cyan-700" },
  FACULTY_MEMBER:     { bg: "bg-teal-100",   text: "text-teal-700" },
  STUDENT:            { bg: "bg-emerald-100",text: "text-emerald-700" },
  EXTERNAL_ENTITY:    { bg: "bg-orange-100", text: "text-orange-700" },
  VOLUNTEER:          { bg: "bg-pink-100",   text: "text-pink-700" },
  VISITOR:            { bg: "bg-gray-100",   text: "text-gray-600" },
}

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Search,
  Activity,
  Rocket,
  FolderKanban,
  Handshake,
  Heart,
  TrendingUp,
  BarChart3,
  FileText,
  BrainCircuit,
  Bell,
  Newspaper,
  Calendar,
  FileStack,
  Settings,
  Users,
  Shield,
  GitBranch,
  FormInput,
  Zap,
  LayoutGrid,
  Trophy,
  GraduationCap,
}

interface CurrentUser {
  name: string
  email: string
  userType: string
}

interface SidebarProps {
  locale: "ar" | "en"
  onClose?: () => void
  isMobile?: boolean
  currentUser?: CurrentUser
}

function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? LayoutDashboard
}

function NavItemComponent({
  item,
  locale,
  depth = 0,
}: {
  item: NavItem
  locale: "ar" | "en"
  depth?: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const Icon = getIcon(item.icon)
  const label = locale === "ar" ? item.labelAr : item.labelEn
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  const hasChildren = item.children && item.children.length > 0
  const ChevronIcon = locale === "ar" ? ChevronLeft : ChevronRight

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            "text-sidebar-fg/70 hover:bg-sidebar-hover hover:text-sidebar-fg",
            depth > 0 && "ps-8",
            isActive && "bg-sidebar-hover text-sidebar-fg"
          )}
          aria-expanded={open}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-start">{label}</span>
          <ChevronDown
            className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5 ps-3">
            {item.children!.map((child) => (
              <NavItemComponent key={child.id} item={child} locale={locale} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        "text-sidebar-fg/70 hover:bg-sidebar-hover hover:text-sidebar-fg",
        depth > 0 && "ps-8",
        isActive && "bg-sidebar-active text-sidebar-active-fg font-medium"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

function filterItems(items: NavItem[], userType: string): NavItem[] {
  return items
    .filter((item) => !item.allowedRoles || item.allowedRoles.includes(userType))
    .map((item) =>
      item.children
        ? { ...item, children: filterItems(item.children, userType) }
        : item,
    )
}

function NavGroupComponent({
  group,
  locale,
  userType,
}: {
  group: NavGroup
  locale: "ar" | "en"
  userType: string
}) {
  const label = locale === "ar" ? group.labelAr : group.labelEn
  const visibleItems = filterItems(group.items, userType)
  if (visibleItems.length === 0) return null

  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-fg/40">
        {label}
      </p>
      {visibleItems.map((item) => (
        <NavItemComponent key={item.id} item={item} locale={locale} />
      ))}
    </div>
  )
}

export function Sidebar({ locale, onClose, isMobile, currentUser }: SidebarProps) {
  const appName = locale === "ar" ? "منصة المسؤولية المجتمعية" : "CRP Platform"
  const university = locale === "ar" ? "جامعة القصيم" : "Qassim University"

  return (
    <aside
      className={cn(
        "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar-bg",
        "border-e border-sidebar-border"
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex h-[var(--header-height)] items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">م</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-sidebar-fg leading-tight">
            {appName}
          </span>
          <span className="truncate text-xs text-sidebar-fg/50">{university}</span>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="ms-auto rounded-md p-1 text-sidebar-fg/50 hover:text-sidebar-fg"
            aria-label="إغلاق القائمة"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {NAVIGATION.map((group) => (
          <NavGroupComponent key={group.id} group={group} locale={locale} userType={currentUser?.userType ?? "VISITOR"} />
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-hover/60 p-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
            {currentUser?.name?.charAt(0)?.toUpperCase() ?? "م"}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-sidebar-fg leading-none">
              {currentUser?.name ?? "مستخدم النظام"}
            </span>
            {currentUser && (() => {
              const badge = ROLE_BADGE[currentUser.userType] ?? ROLE_BADGE["VISITOR"]!
              return (
                <span className={cn("inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.bg, badge.text)}>
                  {USER_TYPE_LABEL[currentUser.userType] ?? currentUser.userType}
                </span>
              )
            })()}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-fg/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{locale === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  )
}
