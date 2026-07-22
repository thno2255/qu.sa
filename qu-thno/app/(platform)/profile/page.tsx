import { Suspense } from "react"
import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { redirect } from "next/navigation"
import { db } from "@/core/database/client"
import { Mail, Phone, Building2, Calendar, GraduationCap, IdCard } from "lucide-react"

export const metadata = { title: "ملفي الشخصي" }

const USER_TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  SYSTEM_ADMIN: { ar: "مدير النظام", en: "System Admin" },
  COMMUNITY_MANAGER: { ar: "مدير المسؤولية المجتمعية", en: "Community Manager" },
  COMMUNITY_EMPLOYEE: { ar: "موظف المسؤولية المجتمعية", en: "Community Employee" },
  COLLEGE_DEAN: { ar: "عميد الكلية", en: "College Dean" },
  DEPARTMENT_HEAD: { ar: "رئيس القسم", en: "Department Head" },
  FACULTY_MEMBER: { ar: "عضو هيئة التدريس", en: "Faculty Member" },
  STUDENT: { ar: "طالب", en: "Student" },
  EXTERNAL_ENTITY: { ar: "جهة خارجية", en: "External Entity" },
  VOLUNTEER: { ar: "متطوع", en: "Volunteer" },
  VISITOR: { ar: "زائر", en: "Visitor" },
}

async function ProfileContent({ locale }: { locale: string }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isRTL = locale === "ar"
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      nameAr: true,
      email: true,
      phone: true,
      userType: true,
      jobTitle: true,
      createdAt: true,
      consultationStarLevel: true,
      organization: { select: { nameAr: true, nameEn: true } },
    },
  })

  if (!user) redirect("/login")

  const roleLabel = USER_TYPE_LABEL[user.userType] ?? { ar: user.userType, en: user.userType }
  const displayName = isRTL ? (user.nameAr ?? user.name) : (user.name ?? user.nameAr)
  const isFaculty = ["FACULTY_MEMBER", "DEPARTMENT_HEAD", "COLLEGE_DEAN"].includes(user.userType)

  const infoRows = [
    { Icon: Mail, label: t("البريد الإلكتروني", "Email"), value: user.email },
    { Icon: Phone, label: t("رقم الجوال", "Phone"), value: user.phone },
    {
      Icon: Building2,
      label: t("الجهة", "Organization"),
      value: user.organization ? (isRTL ? user.organization.nameAr : (user.organization.nameEn ?? user.organization.nameAr)) : user.jobTitle,
    },
    {
      Icon: Calendar,
      label: t("عضو منذ", "Member since"),
      value: user.createdAt.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
    },
    isFaculty
      ? {
          Icon: GraduationCap,
          label: t("مستوى الاستشارات", "Consultation Level"),
          value: "★".repeat(Math.max(user.consultationStarLevel, 0)) || t("غير مصنّف بعد", "Not yet rated"),
        }
      : null,
  ].filter((r): r is { Icon: typeof Mail; label: string; value: string | null } => r !== null)

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Profile Hero */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-l from-primary/30 via-primary/10 to-transparent" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground text-2xl font-bold shadow-md">
              {displayName?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
            </div>
            <div className="pb-2 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{displayName ?? user.email}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? roleLabel.ar : roleLabel.en}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <IdCard className="size-4" />
            {t("البيانات الشخصية", "Personal Information")}
          </h2>
        </div>
        <div className="divide-y">
          {infoRows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <row.Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{row.value ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function ProfilePage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-40 rounded-2xl bg-muted" /></div>}>
      <ProfileContent locale={locale} />
    </Suspense>
  )
}
