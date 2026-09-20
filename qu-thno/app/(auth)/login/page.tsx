import type { Metadata } from "next"
import Link from "next/link"
import { getLocale } from "next-intl/server"
import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import { LoginForm } from "./login-form"
import { QULogo } from "@/shared/components/ui/qu-logo"
import { getPublicStats } from "@/core/public/actions"
import { PLATFORM_NAME_AR, PLATFORM_NAME_EN, UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN } from "@/shared/lib/brand"

export const metadata: Metadata = {
  title: "تسجيل الدخول | Login",
}

export default async function LoginPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"
  const stats = await getPublicStats()

  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const nf = (n: number) => n.toLocaleString(isRTL ? "ar-SA" : "en-US")

  return (
    <div className="flex min-h-screen flex-row">
      {/* ── Brand side: 40% ───────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-between py-12 px-10"
        style={{ width: "40%", background: "hsl(var(--primary))" }}
      >
        {/* Top: Logo + Name */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
            <QULogo height={44} />
          </div>

          <div>
            <h1 className="font-bold text-white" style={{ fontSize: 22, lineHeight: 1.4 }}>
              {t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)}
            </h1>
            <p className="text-white/75 mt-1" style={{ fontSize: 15 }}>
              {t(UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN)}
            </p>
          </div>

          <p className="text-white/70 max-w-xs text-center" style={{ fontSize: 14, lineHeight: 1.7 }}>
            {t(
              "نحو مجتمع أكثر استدامة ومشاركة، من خلال التعاون بين الجامعة والمجتمع.",
              "Towards a more sustainable and engaged community through collaboration between the university and society.",
            )}
          </p>
        </div>

        {/* Middle: real, static platform figures — no rotating unverified claims */}
        <div className="w-full max-w-xs">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: nf(stats.initiatives), label: t("مبادرة مجتمعية", "Community initiatives") },
              { value: nf(stats.partnerships), label: t("شراكة فعّالة", "Active partnerships") },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 border border-white/15 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                <p className="mt-1 text-xs text-white/70 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-white/50">
            {t("أرقام حيّة من قاعدة بيانات المنصة", "Live figures from the platform's database")}
          </p>
        </div>

        {/* Bottom: SDG / Vision badge */}
        <div className="flex flex-wrap justify-center gap-2">
          {["رؤية 2030", "SDGs", "NCAAA"].map((badge) => (
            <span key={badge} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── Form side: 60% white ────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-6 py-12" style={{ minWidth: 0 }}>
        {/* Back to home */}
        <Link
          href="/"
          className="absolute start-6 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 rotate-180" />
          {t("العودة للرئيسية", "Back to home")}
        </Link>

        {/* Mobile logo (shown only below lg) */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <QULogo height={48} />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN)}
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="w-full rounded-2xl border bg-card shadow-sm p-8" style={{ maxWidth: 480 }}>
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground">
              {t("أهلاً بعودتك", "Welcome back")}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("تسجيل الدخول إلى", "Sign in to")} {t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)}
            </p>
          </div>

          <Suspense>
            <LoginForm isRTL={isRTL} />
          </Suspense>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
          {t("بتسجيل الدخول، أنت توافق على ", "By signing in, you agree to ")}
          <Link href="/terms#privacy" className="underline hover:text-foreground">
            {t("سياسة الخصوصية", "the privacy policy")}
          </Link>
          {t(" و", " and ")}
          <Link href="/terms" className="underline hover:text-foreground">
            {t("شروط الاستخدام", "terms of use")}
          </Link>
          {t(" الخاصة بجامعة القصيم.", " of Qassim University.")}
        </p>
      </div>
    </div>
  )
}
