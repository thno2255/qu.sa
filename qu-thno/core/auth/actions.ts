"use server"

import { redirect } from "next/navigation"
import { signIn } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { hashPassword, generateOtp } from "@/core/auth/utils"
import { AuthError } from "next-auth"

// ---------------------------------------------------------------------------
// LOGIN (with server-side redirect — used directly as form action)
// ---------------------------------------------------------------------------

export async function loginAndRedirectAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard"

  if (!email || !password) {
    redirect(`/login?error=INVALID_CREDENTIALS`)
  }

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl })
  } catch (err) {
    if (err instanceof AuthError) {
      // Extract the error from the cause thrown inside authorize()
      const causeMsg =
        (err.cause as { err?: Error } | undefined)?.err?.message ?? ""
      if (causeMsg === "ACCOUNT_LOCKED") redirect(`/login?error=ACCOUNT_LOCKED`)
      if (causeMsg === "ACCOUNT_INACTIVE")
        redirect(`/login?error=ACCOUNT_INACTIVE`)
      redirect(`/login?error=INVALID_CREDENTIALS`)
    }
    // Re-throw NEXT_REDIRECT and other non-auth errors
    throw err
  }
}

// ---------------------------------------------------------------------------
// REGISTER INDIVIDUAL (visitor from outside the university)
// ---------------------------------------------------------------------------

export type RegisterResult =
  | { success: true; message: string }
  | { error: string }

export async function registerExternalAction(
  _: RegisterResult | null,
  formData: FormData,
): Promise<RegisterResult> {
  const nameAr = (formData.get("nameAr") as string)?.trim()
  const nameEn = (formData.get("nameEn") as string)?.trim() || undefined
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const phone = (formData.get("phone") as string)?.trim() || undefined
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const agreeTerms = formData.get("agreeTerms") === "on"

  if (!nameAr || !email || !password) {
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }
  }

  if (!agreeTerms) {
    return { error: "يجب الموافقة على الشروط والأحكام لإنشاء الحساب" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "صيغة البريد الإلكتروني غير صحيحة" }
  }

  if (password !== confirmPassword) {
    return { error: "كلمة المرور وتأكيدها غير متطابقتين" }
  }
  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return { error: "البريد الإلكتروني مسجل مسبقاً" }
  }

  const passwordHash = await hashPassword(password)

  await db.user.create({
    data: {
      name: nameEn ?? nameAr,
      nameAr,
      email,
      phone,
      passwordHash,
      userType: "VISITOR",
      status: "ACTIVE",
    },
  })

  return {
    success: true,
    message: "تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول والاستفادة من خدمات المنصة.",
  }
}

// ---------------------------------------------------------------------------
// FORGOT PASSWORD — SEND OTP
// ---------------------------------------------------------------------------

export type ForgotPasswordResult =
  | { success: true; message: string }
  | { error: string }

export async function sendPasswordResetOtpAction(
  _: ForgotPasswordResult | null,
  formData: FormData,
): Promise<ForgotPasswordResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()

  if (!email) return { error: "يرجى إدخال البريد الإلكتروني" }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { error: "صيغة البريد الإلكتروني غير صحيحة" }

  // Rate limiting: reject if a valid OTP was created in the last 60 seconds
  const recentOtp = await db.otpCode.findFirst({
    where: {
      email,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      expiresAt: { gt: new Date() },
      createdAt: { gt: new Date(Date.now() - 60 * 1000) },
    },
  })
  if (recentOtp) {
    return { error: "يرجى الانتظار دقيقة قبل إعادة الإرسال" }
  }

  // Always return success to prevent email enumeration
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (!user) {
    return {
      success: true,
      message: "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة تحتوي على رمز التحقق.",
    }
  }

  const code = generateOtp(6)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await db.otpCode.create({
    data: { email, code, purpose: "PASSWORD_RESET", expiresAt },
  })

  // TODO Phase 2: Send via Resend (email) or Unifonic (SMS)
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV OTP] ${email} → ${code}`)
  }

  return {
    success: true,
    message: "تم إرسال رمز التحقق. يُرجى التحقق من بريدك الإلكتروني أو رسائل الجوال.",
  }
}

// ---------------------------------------------------------------------------
// VERIFY OTP + RESET PASSWORD
// ---------------------------------------------------------------------------

export type ResetPasswordResult = { success: true } | { error: string }

export async function resetPasswordAction(
  _: ResetPasswordResult | null,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const code = (formData.get("code") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !code || !password) return { error: "جميع الحقول مطلوبة" }

  if (password !== confirmPassword) {
    return { error: "كلمة المرور وتأكيدها غير متطابقتين" }
  }
  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
  }

  const otpRecord = await db.otpCode.findFirst({
    where: {
      email,
      code,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otpRecord) {
    return { error: "رمز التحقق غير صحيح أو منتهي الصلاحية" }
  }

  const passwordHash = await hashPassword(password)

  await db.$transaction([
    db.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { email },
      data: { passwordHash, loginAttempts: 0, lockedUntil: null },
    }),
  ])

  return { success: true }
}
