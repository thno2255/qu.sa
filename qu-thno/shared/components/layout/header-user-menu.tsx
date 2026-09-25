"use client"

import { useState, useEffect, useRef, useId } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import { BRAND_PRIMARY_DARK } from "@/shared/lib/brand"

interface Props {
  isRTL: boolean
  name: string
}

export function HeaderUserMenu({ isRTL, name }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const t = (ar: string, en: string) => (isRTL ? ar : en)
  const initial = name.trim().charAt(0) || "؟"

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-gray-200 py-1 ps-1 pe-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: BRAND_PRIMARY_DARK }}
        >
          {initial}
        </span>
        <span className="hidden max-w-[9rem] truncate sm:inline">{name}</span>
        <ChevronDown className={`size-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 top-[calc(100%+0.5rem)] w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-lg"
        >
          <Link
            href="/dashboard"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="size-4 text-gray-400" aria-hidden />
            {t("لوحة التحكم", "Dashboard")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-4" aria-hidden />
            {t("تسجيل الخروج", "Sign Out")}
          </button>
        </div>
      )}
    </div>
  )
}
