"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShieldCheck, LogIn } from "lucide-react"
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

export function DemoHeader() {
  const [open, setOpen] = useState(false)

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
          <Link
            href="/demo/nafath"
            className="ease-apple flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: BRAND_PRIMARY_DARK }}
          >
            <LogIn className="size-3.5" />
            تسجيل الدخول
          </Link>
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
            <Link
              href="/demo/nafath"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND_PRIMARY_DARK }}
            >
              <LogIn className="size-4" />
              تسجيل الدخول
            </Link>
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
