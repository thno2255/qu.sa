"use client"

import { useActionState, useState } from "react"
import {
  sendPasswordResetOtpAction,
  resetPasswordAction,
  type ForgotPasswordResult,
  type ResetPasswordResult,
} from "@/core/auth/actions"

export function ForgotForm({ isRTL }: { isRTL: boolean }) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  // Track the email so it can be passed to the OTP step
  const [email, setEmail] = useState("")

  const [sendResult, sendAction, sendPending] = useActionState<
    ForgotPasswordResult | null,
    FormData
  >(sendPasswordResetOtpAction, null)

  const [resetResult, resetAction, resetPending] = useActionState<
    ResetPasswordResult | null,
    FormData
  >(resetPasswordAction, null)

  // Derive current step from action results — no setState during render
  const step: "email" | "otp" | "done" =
    resetResult && "success" in resetResult
      ? "done"
      : sendResult && "success" in sendResult
        ? "otp"
        : "email"

  // ── Step 3: Done ────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {t("تم تغيير كلمة المرور", "Password Changed")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
            "You can now sign in with your new password.",
          )}
        </p>
        <a
          href="/login"
          className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("تسجيل الدخول", "Sign In")}
        </a>
      </div>
    )
  }

  // ── Step 2: OTP + new password ──────────────────────────────────────
  if (step === "otp") {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />

        {resetResult && "error" in resetResult && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {resetResult.error}
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {t(
            `تم إرسال رمز التحقق إلى ${email}`,
            `Verification code sent to ${email}`,
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            {t("رمز التحقق (OTP)", "Verification Code (OTP)")}
          </label>
          <input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            dir="ltr"
            autoComplete="one-time-code"
            placeholder="000000"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <p className="text-xs text-muted-foreground">
            {t("الرمز صالح لمدة ١٥ دقيقة.", "Code is valid for 15 minutes.")}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            {t("كلمة المرور الجديدة", "New Password")}
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            dir="ltr"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            {t("تأكيد كلمة المرور", "Confirm Password")}
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            dir="ltr"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={resetPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetPending && <Spinner />}
          {t("تغيير كلمة المرور", "Reset Password")}
        </button>
      </form>
    )
  }

  // ── Step 1: Email entry ─────────────────────────────────────────────
  return (
    <form
      action={(fd: FormData) => {
        const v = (fd.get("email") as string)?.trim().toLowerCase()
        if (v) setEmail(v)
        return sendAction(fd)
      }}
      className="space-y-4"
    >
      {sendResult && "error" in sendResult && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {sendResult.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="fp-email"
          className="block text-sm font-medium text-foreground"
        >
          {t("البريد الإلكتروني", "Email Address")}
        </label>
        <input
          id="fp-email"
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          placeholder="example@qu.edu.sa"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <button
        type="submit"
        disabled={sendPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sendPending && <Spinner />}
        {t("إرسال رمز التحقق", "Send Verification Code")}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {t("تذكرت كلمة المرور؟ ", "Remembered your password? ")}
        <a href="/login" className="font-semibold text-primary hover:underline">
          {t("تسجيل الدخول", "Sign In")}
        </a>
      </p>
    </form>
  )
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
