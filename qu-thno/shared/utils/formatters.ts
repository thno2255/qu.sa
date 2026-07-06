type Locale = "ar" | "en"

export function formatNumber(
  value: number,
  locale: Locale = "ar",
  opts?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", opts).format(value)
}

export function formatCurrency(
  amount: number,
  locale: Locale = "ar",
  currency = "SAR"
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number, locale: Locale = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim()
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
}
