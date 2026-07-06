import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { ForgotForm } from "./forgot-form"

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | Reset Password",
}

export default async function ForgotPasswordPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-12 px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <a href="/login">
          <div
            className="flex items-center justify-center rounded-2xl shadow-md"
            style={{ width: 56, height: 56, background: "hsl(var(--primary))" }}
          >
            <span className="text-2xl font-bold text-white">ق</span>
          </div>
        </a>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">
            {t("منصة المسؤولية المجتمعية", "Community Responsibility Platform")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("جامعة القصيم", "Qassim University")}
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full rounded-2xl border bg-card shadow-sm p-8"
        style={{ maxWidth: 440 }}
      >
        <div className="mb-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t("استعادة كلمة المرور", "Reset Password")}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t(
              "أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.",
              "Enter your email and we'll send you a verification code to reset your password.",
            )}
          </p>
        </div>

        <ForgotForm isRTL={isRTL} />
      </div>
    </div>
  )
}
