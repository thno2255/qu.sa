import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"
import { Shield, Key, Package } from "lucide-react"

export const metadata = { title: "الأدوار والصلاحيات" }

const MODULE_LABEL_AR: Record<string, string> = {
  dashboard: "لوحة التحكم",
  initiatives: "المبادرات",
  projects: "المشاريع",
  partnerships: "الشراكات",
  impact: "قياس الأثر",
  analytics: "التحليلات",
  reports: "التقارير",
  ai_assistant: "المساعد الذكي",
  cms: "إدارة المحتوى",
  notifications: "الإشعارات",
  search: "البحث",
  timeline: "سجل النشاط",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  workflow: "سير العمل",
  users: "المستخدمون",
}

async function RolesManagement({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.userType !== "SYSTEM_ADMIN") redirect("/dashboard")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const roles = await db.role.findMany({
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { userRoles: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const permissions = await db.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
  })

  const permByModule = permissions.reduce<Record<string, typeof permissions>>(
    (acc, p) => {
      acc[p.module] = [...(acc[p.module] ?? []), p]
      return acc
    },
    {},
  )

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("الأدوار والصلاحيات", "Roles & Permissions")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "مراجعة الأدوار والصلاحيات المُعرَّفة في النظام",
            "View system roles and their permissions",
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: t("الأدوار", "Roles"), value: roles.length, Icon: Shield, color: "bg-blue-500/10 text-blue-600" },
          { label: t("الصلاحيات", "Permissions"), value: permissions.length, Icon: Key, color: "bg-amber-500/10 text-amber-600" },
          { label: t("الوحدات", "Modules"), value: Object.keys(permByModule).length, Icon: Package, color: "bg-purple-500/10 text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-5 py-3 shadow-sm">
            <div className={`inline-flex size-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.Icon className="size-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Roles cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const perms = role.rolePermissions.map((rp) => rp.permission)
          const permModules = [...new Set(perms.map((p) => p.module))]
          return (
            <div key={role.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {isRTL ? role.nameAr : role.name}
                  </p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {role.isSystem && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {t("نظام", "System")}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {role._count.userRoles} {t("مستخدم", "users")}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(
                    `${perms.length} صلاحية في ${permModules.length} وحدة`,
                    `${perms.length} permissions across ${permModules.length} modules`,
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {permModules.slice(0, 8).map((mod) => (
                    <span
                      key={mod}
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium"
                    >
                      {isRTL ? (MODULE_LABEL_AR[mod] ?? mod) : mod}
                    </span>
                  ))}
                  {permModules.length > 8 && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      +{permModules.length - 8}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Permissions by module — Arabic labels */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">
            {t("الصلاحيات حسب الوحدة", "Permissions by Module")}
          </h2>
        </div>
        <div className="divide-y">
          {Object.entries(permByModule).map(([module, perms]) => (
            <div key={module} className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                {isRTL ? (MODULE_LABEL_AR[module] ?? module) : module}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {perms.map((p) => (
                  <span
                    key={p.id}
                    title={isRTL ? (p.nameAr ?? p.description ?? "") : (p.description ?? "")}
                    className="rounded-md border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted transition-colors cursor-default"
                  >
                    {isRTL ? (p.nameAr ?? `${p.action}:${p.resource}`) : `${p.action}:${p.resource}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function RolesPage() {
  const locale = await getLocale()
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      }
    >
      <RolesManagement locale={locale} />
    </Suspense>
  )
}
