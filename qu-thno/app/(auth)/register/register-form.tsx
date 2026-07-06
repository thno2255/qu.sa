"use client"

import { useActionState, useState } from "react"
import { registerExternalAction, type RegisterResult } from "@/core/auth/actions"

export function RegisterForm({ isRTL }: { isRTL: boolean }) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [result, formAction, pending] = useActionState<RegisterResult | null, FormData>(
    registerExternalAction,
    null,
  )
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  const strength = getPasswordStrength(password)

  if (result && "success" in result) {
    return (
      <div className="space-y-4 py-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
          <CheckIcon />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {t("تم إنشاء الحساب بنجاح!", "Account Created!")}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{result.message}</p>
        <a
          href="/login"
          className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("تسجيل الدخول الآن", "Sign in now")}
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {result && "error" in result && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertIcon />
          <span>{result.error}</span>
        </div>
      )}

      {/* ── Personal Info ── */}
      <fieldset className="space-y-1">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("المعلومات الشخصية", "Personal Information")}
        </legend>
        <div className="rounded-xl border bg-muted/30 p-4 space-y-4 mt-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("الاسم (بالعربية)", "Name (Arabic)")} required>
              <input
                name="nameAr"
                type="text"
                required
                dir="rtl"
                autoComplete="name"
                placeholder={t("الاسم الكامل", "Full name")}
                className={inputCls}
              />
            </Field>
            <Field label={t("الاسم (بالإنجليزية)", "Name (English)")}>
              <input
                name="nameEn"
                type="text"
                dir="ltr"
                autoComplete="name"
                placeholder="Full name"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("البريد الإلكتروني", "Email")} required>
              <input
                name="email"
                type="email"
                required
                dir="ltr"
                autoComplete="email"
                placeholder="example@mail.com"
                className={inputCls}
              />
            </Field>
            <Field label={t("رقم الجوال", "Mobile Number")}>
              <input
                name="phone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                placeholder="+966 5X XXX XXXX"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      {/* ── Password ── */}
      <fieldset className="space-y-1">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("كلمة المرور", "Password")}
        </legend>
        <div className="rounded-xl border bg-muted/30 p-4 space-y-4 mt-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("كلمة المرور", "Password")} required>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`${inputCls} pe-11`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? t("إخفاء", "Hide") : t("إظهار", "Show")}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </Field>
            <Field label={t("تأكيد كلمة المرور", "Confirm Password")} required>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                dir="ltr"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>
          </div>

          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{ background: strength.score >= level ? strength.color : "hsl(var(--muted))" }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: strength.color }}>
                {isRTL ? strength.labelAr : strength.labelEn}
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {t(
              "يجب أن تكون كلمة المرور ٨ أحرف على الأقل وتحتوي على أحرف وأرقام.",
              "Password must be at least 8 characters with letters and numbers.",
            )}
          </p>
        </div>
      </fieldset>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" required className="mt-0.5 size-4 accent-primary" />
        <span className="text-sm leading-relaxed text-muted-foreground">
          {t(
            "أوافق على سياسة الخصوصية وشروط الاستخدام الخاصة بجامعة القصيم.",
            "I agree to Qassim University's privacy policy and terms of use.",
          )}
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending
          ? t("جارٍ إنشاء الحساب...", "Creating account...")
          : t("إنشاء الحساب", "Create Account")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("لديك حساب بالفعل؟ ", "Already have an account? ")}
        <a href="/login" className="font-semibold text-primary hover:underline">
          {t("تسجيل الدخول", "Sign in")}
        </a>
      </p>
    </form>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ms-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const levels = [
    { labelAr: "ضعيفة جداً", labelEn: "Very weak", color: "#ef4444" },
    { labelAr: "ضعيفة",      labelEn: "Weak",      color: "#f97316" },
    { labelAr: "متوسطة",     labelEn: "Fair",      color: "#eab308" },
    { labelAr: "قوية",       labelEn: "Strong",    color: "#22c55e" },
  ]
  return { score: Math.max(score, 1), ...(levels[Math.max(score - 1, 0)] ?? levels[0]!) }
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}
