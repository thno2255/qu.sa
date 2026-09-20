"use client"

import { useState, useEffect, useId } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Globe } from "lucide-react"
import { QULogo } from "@/shared/components/ui/qu-logo"
import { BRAND_PRIMARY_DARK } from "@/shared/lib/brand"

interface NavLink {
  label: string
  href: string
}

interface Props {
  isRTL: boolean
  isAuth: boolean
}

export function PublicHeader({ isRTL, isAuth }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const NAV_LINKS: NavLink[] = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("البرامج", "Programs"), href: "/programs" },
    { label: t("الفعاليات", "Events"), href: "/events" },
    { label: t("الاستشارات", "Consultations"), href: "/consultation-info" },
    { label: t("الشراكات", "Partnerships"), href: "/partners" },
  ]

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "/en"
    return pathname === href || pathname === `/en${href}`
  }

  // Close the mobile menu on Escape, and whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <QULogo height={52} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  active ? "" : "text-gray-700 hover:text-gray-900"
                }`}
                style={active ? { color: BRAND_PRIMARY_DARK } : undefined}
              >
                {l.label}
                <span
                  className="absolute -bottom-1 start-0 h-0.5 rounded-full transition-all"
                  style={{
                    width: active ? "100%" : "0%",
                    backgroundColor: BRAND_PRIMARY_DARK,
                  }}
                />
              </Link>
            )
          })}
        </nav>

        {/* Right side: language + auth + mobile toggle */}
        <div className="flex items-center gap-1.5">
          <Link
            href={isRTL ? "/en" : "/ar"}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label={t("التبديل إلى الإنجليزية", "Switch to Arabic")}
            title={t("English", "العربية")}
          >
            <Globe className="size-5" />
          </Link>

          {isAuth ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              {t("لوحة التحكم", "Dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
                {t("تسجيل الدخول", "Sign In")}
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND_PRIMARY_DARK }}
              >
                {t("إنشاء حساب", "Create Account")}
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? t("إغلاق القائمة", "Close menu") : t("فتح القائمة", "Open menu")}
            className="ms-1 flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div id={menuId} className="border-t border-gray-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(l.href) ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-gray-100 pt-3">
              {isAuth ? (
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
                  style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                >
                  {t("لوحة التحكم", "Dashboard")}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700">
                    {t("تسجيل الدخول", "Sign In")}
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                  >
                    {t("إنشاء حساب", "Create Account")}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
