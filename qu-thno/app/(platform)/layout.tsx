import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { PlatformShell } from "@/shared/components/layout/shell"

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = (await getLocale()) as "ar" | "en"
  const session = await auth()

  const currentUser = session?.user
    ? {
        name: (session.user as { nameAr?: string }).nameAr ?? session.user.name ?? "مستخدم",
        email: session.user.email ?? "",
        userType: (session.user as { userType?: string }).userType ?? "VISITOR",
      }
    : undefined

  return (
    <PlatformShell locale={locale} currentUser={currentUser}>
      {children}
    </PlatformShell>
  )
}
