"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { loginAndRedirectAction } from "@/core/auth/actions"

const ERROR_MESSAGES: Record<string, { ar: string; en: string }> = {
  ACCOUNT_LOCKED: {
    ar: "تم تعطيل حسابك مؤقتاً بسبب محاولات تسجيل دخول فاشلة. يرجى المحاولة بعد ٣٠ دقيقة أو إعادة تعيين كلمة المرور.",
    en: "Your account is temporarily locked due to failed login attempts. Try again after 30 minutes or reset your password.",
  },
  ACCOUNT_INACTIVE: {
    ar: "حسابك غير نشط. يرجى التواصل مع مدير النظام.",
    en: "Your account is inactive. Please contact the system administrator.",
  },
  INVALID_CREDENTIALS: {
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    en: "Invalid email or password.",
  },
  CredentialsSignin: {
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    en: "Invalid email or password.",
  },
  SSO_UNAVAILABLE: {
    ar: "تسجيل الدخول عبر حساب الجامعة (SSO) قيد التطوير وسيُتاح قريباً. يُرجى استخدام البريد الإلكتروني وكلمة المرور في الوقت الحالي.",
    en: "University SSO login is under development and will be available soon. Please use email and password for now.",
  },
}

export function LoginForm({ isRTL }: { isRTL: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const urlError = searchParams.get("error") || ""

  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  // Reset pending if an error appears in the URL (action redirected back with error)
  useEffect(() => {
    if (urlError) setPending(false)
  }, [urlError])

  const errorMsg = ERROR_MESSAGES[urlError]
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <form
      action={loginAndRedirectAction}
      onSubmit={(e) => {
        // Let native validation fire first; only set pending if form will submit
        if ((e.target as HTMLFormElement).checkValidity()) {
          setPending(true)
        }
      }}
      className="space-y-4"
      noValidate={false}
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <svg
            className="mt-0.5 size-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{isRTL ? errorMsg.ar : errorMsg.en}</span>
        </div>
      )}

      {/* Email / University ID */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          {t("البريد الإلكتروني أو رقم الهوية الجامعية", "Email or University ID")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          placeholder="example@qu.edu.sa"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          {t("كلمة المرور", "Password")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            dir="ltr"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow pe-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              showPassword
                ? t("إخفاء كلمة المرور", "Hide password")
                : t("إظهار كلمة المرور", "Show password")
            }
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input
            type="checkbox"
            name="rememberMe"
            className="size-4 rounded border-input accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            {t("تذكرني", "Remember me")}
          </span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("نسيت كلمة المرور؟", "Forgot password?")}
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending
          ? t("جارٍ تسجيل الدخول...", "Signing in...")
          : t("تسجيل الدخول", "Sign In")}
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("أو", "or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* SSO Button — placeholder until Phase 4 (SSO integration) */}
      <button
        type="button"
        onClick={() => router.push("/login?error=SSO_UNAVAILABLE")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-input py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        title={t(
          "سيتم تفعيل هذا الخيار في المرحلة القادمة",
          "Will be activated in a future phase",
        )}
      >
        <UniversityLogo />
        {t("الدخول بحساب الجامعة (SSO)", "Sign in with University Account (SSO)")}
      </button>

      {/* External entity link */}
      <p className="text-center text-sm text-muted-foreground">
        {t("جهة خارجية؟ ", "External organization? ")}
        <a href="/register" className="font-semibold text-primary hover:underline">
          {t("إنشاء حساب جديد", "Create an account")}
        </a>
      </p>
    </form>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function UniversityLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="hsl(var(--primary))" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">ق</text>
    </svg>
  )
}
