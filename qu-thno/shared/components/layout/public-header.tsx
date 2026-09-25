"use client"

import { useState, useEffect, useId, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Menu, X, Globe, Home, BookOpen, Calendar, Users, Handshake, Info,
  Search, User, ChevronDown, LogIn, UserPlus,
} from "lucide-react"
import { QULogo } from "@/shared/components/ui/qu-logo"
import { HeaderUtilityBar } from "@/shared/components/layout/header-utility-bar"
import { HeaderUserMenu } from "@/shared/components/layout/header-user-menu"
import { BRAND_PRIMARY_DARK, PLATFORM_NAME_AR, PLATFORM_NAME_EN, UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN } from "@/shared/lib/brand"

interface SubLink {
  label: string
  href: string
}

interface NavLink {
  label: string
  href: string
  Icon: typeof Home
  children?: SubLink[]
}

interface Props {
  isRTL: boolean
  isAuth: boolean
  userName?: string
}

export function PublicHeader({ isRTL, isAuth, userName }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false)
  const programsRef = useRef<HTMLDivElement>(null)
  const mobileMenuId = useId()
  const programsMenuId = useId()
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const NAV_LINKS: NavLink[] = [
    { label: t("الرئيسية", "Home"), href: "/", Icon: Home },
    {
      label: t("البرامج", "Programs"), href: "/programs", Icon: BookOpen,
      children: [
        { label: t("جميع البرامج", "All Programs"), href: "/programs" },
        { label: t("المبادرات المجتمعية", "Community Initiatives"), href: "/programs#initiatives" },
        { label: t("المشاريع المجتمعية", "Community Projects"), href: "/programs#projects" },
      ],
    },
    { label: t("الفعاليات", "Events"), href: "/events", Icon: Calendar },
    { label: t("الاستشارات", "Consultations"), href: "/consultation-info", Icon: Users },
    { label: t("الشراكات", "Partnerships"), href: "/partners", Icon: Handshake },
    { label: t("عن المنصة", "About"), href: "/#about", Icon: Info },
  ]

  function isActive(href: string) {
    // In-page anchors (e.g. "/#about") are scroll targets, not distinct
    // pages — never highlight them as the active nav item.
    if (href.includes("#")) return false
    if (href === "/") return pathname === "/" || pathname === "/en"
    return pathname === href || pathname === `/en${href}`
  }

  // Sticky scroll behavior: collapse the utility bar and tighten the main
  // navbar once the user starts scrolling.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile drawer / programs dropdown on route change — derived during
  // render (not in an effect) per React's guidance for resetting state when
  // a prop changes, avoiding an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
    setProgramsOpen(false)
  }

  // Close the programs dropdown on outside click / Escape.
  useEffect(() => {
    if (!programsOpen) return
    function onClick(e: MouseEvent) {
      if (programsRef.current && !programsRef.current.contains(e.target as Node)) setProgramsOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProgramsOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [programsOpen])

  useEffect(() => {
    if (!mobileOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mobileOpen])

  const displayName = userName?.trim() || t("حسابي", "My Account")

  return (
    <header className="sticky top-0 z-50 w-full">
      <HeaderUtilityBar isRTL={isRTL} collapsed={scrolled} />

      {/* Floating premium navbar */}
      <div className="w-full bg-gradient-to-b from-white/70 to-transparent px-3 pt-2 sm:px-4">
        <div
          className={`mx-auto max-w-7xl rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
            scrolled ? "shadow-md" : "shadow-sm"
          }`}
        >
          <div className={`flex items-center justify-between gap-3 px-4 transition-[height] duration-300 sm:px-5 ${scrolled ? "h-14" : "h-16"}`}>
            {/* Logo + platform name */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <QULogo height={scrolled ? 38 : 44} className="transition-all duration-300" />
              <span className="hidden flex-col leading-tight md:flex">
                <span className="text-sm font-bold text-gray-900">{t(UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN)}</span>
                <span className="text-[11px] text-gray-500">{t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)}</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href)
                if (l.children) {
                  return (
                    <div key={l.href} ref={programsRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setProgramsOpen((v) => !v)}
                        aria-expanded={programsOpen}
                        aria-controls={programsMenuId}
                        aria-haspopup="menu"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                          active || programsOpen ? "bg-[#eaf3fa]" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        style={active || programsOpen ? { color: BRAND_PRIMARY_DARK } : undefined}
                      >
                        <l.Icon className="size-4" aria-hidden style={active || programsOpen ? { color: BRAND_PRIMARY_DARK } : undefined} />
                        {l.label}
                        <ChevronDown className={`size-3.5 transition-transform ${programsOpen ? "rotate-180" : ""}`} aria-hidden />
                      </button>

                      {programsOpen && (
                        <div
                          id={programsMenuId}
                          role="menu"
                          className="absolute start-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-lg"
                        >
                          {l.children.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              role="menuitem"
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      active ? "" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={active ? { backgroundColor: "#eaf3fa", color: BRAND_PRIMARY_DARK } : undefined}
                  >
                    <l.Icon className="size-4" aria-hidden style={active ? { color: BRAND_PRIMARY_DARK } : undefined} />
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            {/* Search — UI only; no search backend exists yet, so it's
                clearly non-functional rather than pretending to work. */}
            <div className="hidden items-center xl:flex">
              <div className="group relative flex items-center">
                <Search className="pointer-events-none absolute start-3 size-4 text-gray-400" aria-hidden />
                <input
                  type="search"
                  disabled
                  placeholder={t("ابحث في المنصة...", "Search the platform...")}
                  title={t("البحث قيد التطوير حالياً", "Search is under development")}
                  className="w-44 rounded-full border border-dashed border-gray-200 bg-gray-50 py-2 ps-9 pe-3 text-xs text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Right side: language + auth */}
            <div className="flex items-center gap-2">
              <Link
                href={isRTL ? "/en" : "/ar"}
                className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors sm:flex"
                aria-label={t("التبديل إلى الإنجليزية", "Switch to Arabic")}
                title={t("English", "العربية")}
              >
                <Globe className="size-5" />
              </Link>

              {isAuth ? (
                <div className="hidden sm:block">
                  <HeaderUserMenu isRTL={isRTL} name={displayName} />
                </div>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/register"
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {t("إنشاء حساب", "Create Account")}
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                  >
                    <User className="size-4" aria-hidden />
                    {t("تسجيل الدخول", "Sign In")}
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls={mobileMenuId}
                aria-label={mobileOpen ? t("إغلاق القائمة", "Close menu") : t("فتح القائمة", "Open menu")}
                className="flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} aria-hidden />
          <div
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            className="absolute top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-xl"
            style={isRTL ? { right: 0 } : { left: 0 }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div className="flex items-center gap-2.5">
                <QULogo height={36} />
                <span className="text-sm font-bold text-gray-900">{t(UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN)}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={t("إغلاق القائمة", "Close menu")}
                className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href)
                if (l.children) {
                  return (
                    <div key={l.href}>
                      <button
                        type="button"
                        onClick={() => setMobileProgramsOpen((v) => !v)}
                        aria-expanded={mobileProgramsOpen}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <l.Icon className="size-4 text-gray-400" aria-hidden />
                          {l.label}
                        </span>
                        <ChevronDown className={`size-4 text-gray-400 transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`} aria-hidden />
                      </button>
                      {mobileProgramsOpen && (
                        <div className="ms-6 mt-1 flex flex-col gap-0.5 border-s border-gray-100 ps-3">
                          {l.children.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <l.Icon className="size-4 text-gray-400" aria-hidden />
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-100 p-4">
              {isAuth ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                  >
                    {t("لوحة التحكم", "Dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-red-600"
                  >
                    {t("تسجيل الخروج", "Sign Out")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND_PRIMARY_DARK }}
                  >
                    <LogIn className="size-4" aria-hidden />
                    {t("تسجيل الدخول", "Sign In")}
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700"
                  >
                    <UserPlus className="size-4" aria-hidden />
                    {t("إنشاء حساب", "Create Account")}
                  </Link>
                </div>
              )}
              <Link
                href={isRTL ? "/en" : "/ar"}
                className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500"
              >
                <Globe className="size-4" aria-hidden />
                {t("English", "العربية")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
