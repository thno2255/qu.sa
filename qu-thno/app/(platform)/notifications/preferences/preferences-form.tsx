"use client"

import { useActionState } from "react"
import { updateNotificationPreferencesAction } from "@/core/notifications/actions"
import type { PreferencesResult } from "@/core/notifications/actions"

interface NotifType {
  key: string
  ar: string
  en: string
}

interface Props {
  types: NotifType[]
  prefMap: Record<string, boolean>
  isRTL: boolean
}

const CHANNELS = [
  { key: "IN_APP", ar: "داخل التطبيق", en: "In-app" },
  { key: "EMAIL", ar: "البريد الإلكتروني", en: "Email" },
]

export function PreferencesForm({ types, prefMap, isRTL }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const [result, formAction, pending] = useActionState<PreferencesResult | null, FormData>(
    updateNotificationPreferencesAction,
    null,
  )

  function isEnabled(type: string, channel: string): boolean {
    const key = `${type}__${channel}`
    // Default: IN_APP always enabled, EMAIL enabled by default
    return prefMap[key] ?? true
  }

  return (
    <form action={formAction} className="space-y-4">
      {result && "success" in result && (
        <div role="status" className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          {t("تم حفظ التفضيلات بنجاح", "Preferences saved successfully")}
        </div>
      )}
      {result && "error" in result && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid border-b bg-muted/40 px-4 py-3" style={{ gridTemplateColumns: "1fr repeat(2, 120px)" }}>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("نوع الإشعار", "Notification Type")}
          </span>
          {CHANNELS.map((ch) => (
            <span
              key={ch.key}
              className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {isRTL ? ch.ar : ch.en}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y">
          {types.map((type) => (
            <div
              key={type.key}
              className="grid items-center px-4 py-3.5 hover:bg-muted/20"
              style={{ gridTemplateColumns: "1fr repeat(2, 120px)" }}
            >
              <span className="text-sm text-foreground">
                {isRTL ? type.ar : type.en}
              </span>
              {CHANNELS.map((ch) => (
                <div key={ch.key} className="flex justify-center">
                  <input
                    type="checkbox"
                    name={`${type.key}__${ch.key}`}
                    defaultChecked={isEnabled(type.key, ch.key)}
                    className="size-4 cursor-pointer accent-primary rounded"
                    aria-label={`${isRTL ? type.ar : type.en} — ${isRTL ? ch.ar : ch.en}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <a href="/notifications" className="text-sm text-muted-foreground hover:text-foreground">
          {t("إلغاء", "Cancel")}
        </a>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending && <Spinner />}
          {t("حفظ التفضيلات", "Save Preferences")}
        </button>
      </div>
    </form>
  )
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
