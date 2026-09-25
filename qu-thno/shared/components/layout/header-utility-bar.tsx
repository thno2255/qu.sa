import Link from "next/link"
import { HelpCircle, Mail } from "lucide-react"

interface Props {
  isRTL: boolean
  collapsed: boolean
}

// Thin secondary bar above the main navbar. Deliberately quiet — small text,
// no icons/weights competing with the primary navigation below it.
export function HeaderUtilityBar({ isRTL, collapsed }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  return (
    <div
      className={`w-full overflow-hidden bg-slate-50 text-xs text-slate-500 transition-[max-height,opacity] duration-300 ease-out ${collapsed ? "" : "border-b border-slate-100"}`}
      style={{ maxHeight: collapsed ? 0 : 36, opacity: collapsed ? 0 : 1 }}
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* External QU portals — real destinations only; QU's own sub-portal
            deep links (media center, digital library) aren't verified, so
            they fall back to the main qu.edu.sa domain rather than a guess. */}
        <nav className="hidden items-center gap-4 sm:flex">
          <a href="https://www.qu.edu.sa" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">
            {t("بوابة جامعة القصيم", "Qassim University Portal")}
          </a>
          <span className="h-3 w-px bg-slate-200" aria-hidden />
          <a href="https://www.qu.edu.sa" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">
            {t("المركز الإعلامي", "Media Center")}
          </a>
          <span className="h-3 w-px bg-slate-200" aria-hidden />
          <a href="https://www.qu.edu.sa" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">
            {t("المكتبة الرقمية", "Digital Library")}
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="#contact" className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
            <Mail className="size-3.5" aria-hidden />
            {t("تواصل معنا", "Contact Us")}
          </Link>
          <Link href="/accessibility" className="hidden items-center gap-1.5 hover:text-slate-800 transition-colors sm:flex">
            <HelpCircle className="size-3.5" aria-hidden />
            {t("الدعم والمساعدة", "Support & Help")}
          </Link>
        </div>
      </div>
    </div>
  )
}
