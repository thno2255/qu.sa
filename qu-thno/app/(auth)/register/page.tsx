import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import { RegisterForm } from "./register-form"
import { QULogo } from "@/shared/components/ui/qu-logo"

export const metadata: Metadata = {
  title: "إنشاء حساب | Register",
}

export default async function RegisterPage() {
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-12 px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <a href="/login">
          <QULogo height={48} />
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
        style={{ maxWidth: 640 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {t("إنشاء حساب جديد", "Create a New Account")}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t(
              "أكمل المعلومات التالية لإنشاء حسابك والاستفادة من خدمات المنصة.",
              "Complete the form below to create your account and access platform services.",
            )}
          </p>
        </div>

        {/* Info banner */}
        <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <svg
            className="mt-0.5 size-4 shrink-0 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
          <p className="text-xs text-blue-700 leading-relaxed">
            {t(
              "هذا النموذج للمستفيدين من خارج الجامعة. أعضاء جامعة القصيم يدخلون مباشرةً عبر حساب الجامعة.",
              "This form is for external visitors. Qassim University members sign in using their university account.",
            )}
          </p>
        </div>

        <RegisterForm isRTL={isRTL} />
      </div>
    </div>
  )
}
