"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShieldCheck, LogIn, User, ChevronDown, FileText, LogOut } from "lucide-react"
import { DEMO_USER_COOKIE } from "@/core/demo/constants"
import { BRAND_PRIMARY_DARK, PLATFORM_NAME_AR } from "@/shared/lib/brand"

// Mirrors the real PublicHeader's page structure (same sections, same
// labels) so the demo reads as "the real site" — but every link stays
// inside /demo/*, and the auth CTA goes through the mock Nafath screen
// instead of the real /login. Deliberately a separate component rather
// than reusing PublicHeader: that one hardcodes /login, /register, and the
// real page paths, which would leak visitors out of the demo.
const DEMO_NAV_LINKS = [
  { href: "/demo", label: "الرئيسية" },
  { href: "/demo/programs", label: "البرامج" },
  { href: "/demo/events", label: "الفعاليات" },
  { href: "/demo/consultation-info", label: "الاستشارات" },
  { href: "/demo/partners", label: "الشراكات" },
]

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

export function DemoHeader() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A lazy useState initializer would read the cookie during the
    // server render pass too (where `document` doesn't exist) and, once
    // guarded for that, would still render "logged out" on the server
    // and the real value on the client's very first paint — a hydration
    // mismatch. Reading it in an effect instead means the server and the
    // client's first paint agree (both "logged out"), and the avatar
    // menu appears a tick later once mounted — the standard trade-off for
    // client-only state that the server can't know.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserId(readCookie(DEMO_USER_COOKIE))
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onEscape)
    }
  }, [menuOpen])

  function handleLogout() {
    document.cookie = `${DEMO_USER_COOKIE}=; path=/demo; max-age=0`
    setUserId(null)
    setMenuOpen(false)
    router.push("/demo")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/demo" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl text-white font-black" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
            ق
          </span>
          <span className="hidden text-sm font-bold text-gray-900 sm:block">{PLATFORM_NAME_AR}</span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            عرض تجريبي
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {DEMO_NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/demo/admin"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            <ShieldCheck className="size-3.5" />
            لوحة المسؤول
          </Link>

          {userId ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 py-1 ps-1 pe-2.5 transition-colors hover:border-gray-300"
              >
                <span className="flex size-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>
                  <User className="size-4" />
                </span>
                <ChevronDown className={`size-3.5 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute end-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg" role="menu">
                  <div className="border-b border-gray-50 px-3.5 py-2 text-xs text-gray-400">
                    مسجّل الدخول برقم <span dir="ltr">{userId}</span>
                  </div>
                  <Link href="/demo/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="size-4 text-gray-400" />
                    الملف الشخصي
                  </Link>
                  <Link href="/demo/my-requests" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <FileText className="size-4 text-gray-400" />
                    طلباتي
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-gray-50 px-3.5 py-2.5 text-start text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    تسجيل خروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/demo/nafath"
              className="ease-apple flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              <LogIn className="size-3.5" />
              تسجيل الدخول
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-xl border border-gray-200 lg:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {DEMO_NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}

            {userId ? (
              <>
                <Link href="/demo/profile" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-1.5 rounded-lg border-t border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700">
                  <User className="size-4 text-gray-400" />
                  الملف الشخصي
                </Link>
                <Link href="/demo/my-requests" onClick={() => setOpen(false)} className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700">
                  <FileText className="size-4 text-gray-400" />
                  طلباتي
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); handleLogout() }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-red-600"
                >
                  <LogOut className="size-4" />
                  تسجيل خروج
                </button>
              </>
            ) : (
              <Link
                href="/demo/nafath"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: BRAND_PRIMARY_DARK }}
              >
                <LogIn className="size-4" />
                تسجيل الدخول
              </Link>
            )}

            <Link
              href="/demo/admin"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-1.5 rounded-lg border-t border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-600"
            >
              <ShieldCheck className="size-4" />
              لوحة المسؤول
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
