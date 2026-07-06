import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_DIRECT_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(32),
    REDIS_URL: z.string().url(),
    ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
    ANTHROPIC_DEFAULT_MODEL: z.string().default("claude-sonnet-4-6"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().default("noreply@qu.edu.sa"),
    EMAIL_FROM_NAME: z.string().default("منصة المسؤولية المجتمعية"),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().default("crp-media"),
    R2_PUBLIC_URL: z.string().url().optional(),
    UNIFONIC_APP_ID: z.string().optional(),
    UNIFONIC_SENDER_ID: z.string().default("QU-CRP"),
    WHATSAPP_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    DEPLOYMENT_TARGET: z.enum(["vercel", "vps", "docker"]).default("vercel"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z.string().default("منصة المسؤولية المجتمعية"),
    NEXT_PUBLIC_APP_NAME_EN: z.string().default("Community Responsibility Platform"),
    NEXT_PUBLIC_UNIVERSITY_NAME: z.string().default("جامعة القصيم"),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["ar", "en"]).default("ar"),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_FEATURE_AI_ASSISTANT: z
      .string()
      .optional()
      .transform((v) => v !== "false"),
    NEXT_PUBLIC_FEATURE_WORKFLOW_DESIGNER: z
      .string()
      .optional()
      .transform((v) => v !== "false"),
    NEXT_PUBLIC_FEATURE_FORMS_BUILDER: z
      .string()
      .optional()
      .transform((v) => v !== "false"),
    NEXT_PUBLIC_FEATURE_RULES_ENGINE: z
      .string()
      .optional()
      .transform((v) => v !== "false"),
    NEXT_PUBLIC_FEATURE_DASHBOARD_BUILDER: z
      .string()
      .optional()
      .transform((v) => v !== "false"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_DEFAULT_MODEL: process.env.ANTHROPIC_DEFAULT_MODEL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    UNIFONIC_APP_ID: process.env.UNIFONIC_APP_ID,
    UNIFONIC_SENDER_ID: process.env.UNIFONIC_SENDER_ID,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    SENTRY_DSN: process.env.SENTRY_DSN,
    DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_NAME_EN: process.env.NEXT_PUBLIC_APP_NAME_EN,
    NEXT_PUBLIC_UNIVERSITY_NAME: process.env.NEXT_PUBLIC_UNIVERSITY_NAME,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_FEATURE_AI_ASSISTANT: process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT,
    NEXT_PUBLIC_FEATURE_WORKFLOW_DESIGNER: process.env.NEXT_PUBLIC_FEATURE_WORKFLOW_DESIGNER,
    NEXT_PUBLIC_FEATURE_FORMS_BUILDER: process.env.NEXT_PUBLIC_FEATURE_FORMS_BUILDER,
    NEXT_PUBLIC_FEATURE_RULES_ENGINE: process.env.NEXT_PUBLIC_FEATURE_RULES_ENGINE,
    NEXT_PUBLIC_FEATURE_DASHBOARD_BUILDER: process.env.NEXT_PUBLIC_FEATURE_DASHBOARD_BUILDER,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
