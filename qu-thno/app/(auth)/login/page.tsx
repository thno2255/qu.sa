import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { Suspense } from "react"
import { StatsSlider } from "./stats-slider"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "تسجيل الدخول | Login",
}

export default async function LoginPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <div className="flex min-h-screen flex-row">
      {/* ── Brand side: 40% green ───────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-between py-12 px-10"
        style={{ width: "40%", background: "hsl(var(--primary))" }}
      >
        {/* Top: Logo + Name */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* University emblem placeholder */}
          <div
            className="flex items-center justify-center rounded-2xl bg-white/20 shadow-lg"
            style={{ width: 88, height: 88 }}
          >
            <span
              className="font-bold text-white"
              style={{ fontSize: 36 }}
            >
              ق
            </span>
          </div>

          <div>
            <h1
              className="font-bold text-white"
              style={{ fontSize: 22, lineHeight: 1.4 }}
            >
              {t("منصة المسؤولية المجتمعية", "Community Responsibility Platform")}
            </h1>
            <p className="text-white/75 mt-1" style={{ fontSize: 15 }}>
              {t("جامعة القصيم", "Qassim University")}
            </p>
          </div>

          <p
            className="text-white/70 max-w-xs text-center"
            style={{ fontSize: 14, lineHeight: 1.7 }}
          >
            {t(
              "نحو مجتمع أكثر استدامة ومشاركة، من خلال التعاون بين الجامعة والمجتمع.",
              "Towards a more sustainable and engaged community through collaboration between the university and society.",
            )}
          </p>
        </div>

        {/* Middle: Stats Slider */}
        <div className="w-full max-w-xs">
          <StatsSlider isRTL={isRTL} />
        </div>

        {/* Bottom: SDG / Vision badge */}
        <div className="flex flex-wrap justify-center gap-2">
          {["رؤية 2030", "SDGs", "NCAAA"].map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── Form side: 60% white ────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12"
        style={{ minWidth: 0 }}
      >
        {/* Mobile logo (shown only below lg) */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <div
            className="flex items-center justify-center rounded-2xl shadow-md"
            style={{
              width: 56,
              height: 56,
              background: "hsl(var(--primary))",
            }}
          >
            <span className="text-2xl font-bold text-white">ق</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {t("منصة المسؤولية المجتمعية", "Community Responsibility Platform")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("جامعة القصيم", "Qassim University")}
            </p>
          </div>
        </div>

        {/* Login card */}
        <div
          className="w-full rounded-2xl border bg-card shadow-sm p-8"
          style={{ maxWidth: 480 }}
        >
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground">
              {t("أهلاً بعودتك", "Welcome back")}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t(
                "تسجيل الدخول إلى منصة المسؤولية المجتمعية",
                "Sign in to the Community Responsibility Platform",
              )}
            </p>
          </div>

          <Suspense>
            <LoginForm isRTL={isRTL} />
          </Suspense>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
          {t(
            "بتسجيل الدخول، أنت توافق على سياسة الخصوصية وشروط الاستخدام الخاصة بجامعة القصيم.",
            "By signing in, you agree to Qassim University's privacy policy and terms of use.",
          )}
        </p>
      </div>
    </div>
  )
}
