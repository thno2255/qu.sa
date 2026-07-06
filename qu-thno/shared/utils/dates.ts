import { format, formatDistanceToNow, parseISO } from "date-fns"
import { ar, enUS } from "date-fns/locale"

type Locale = "ar" | "en"

export function formatDate(
  date: Date | string,
  locale: Locale = "ar",
  fmt = "PPP"
): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, fmt, { locale: locale === "ar" ? ar : enUS })
}

export function formatRelativeDate(
  date: Date | string,
  locale: Locale = "ar"
): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: locale === "ar" ? ar : enUS,
  })
}

export function formatDateTime(
  date: Date | string,
  locale: Locale = "ar"
): string {
  return formatDate(date, locale, "PPPp")
}

export function toHijri(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function toGregorian(date: Date, locale: Locale = "ar"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}
