import Link from "next/link"
import { GRAD_FOOTER, PLATFORM_NAME_AR } from "@/shared/lib/brand"

// Deliberately NOT PublicFooter: that component's quick links point into
// the real site (/register, /programs, …), which would leak visitors out
// of this self-contained demo and back into the real multi-role system.
const DEMO_FOOTER_LINKS = [
  { href: "/demo", label: "الرئيسية" },
  { href: "/demo/programs", label: "البرامج والمبادرات" },
  { href: "/demo/events", label: "الفعاليات" },
  { href: "/demo/consultation-info", label: "الاستشارات" },
  { href: "/demo/partners", label: "الشراكات" },
]

export function DemoFooter() {
  return (
    <footer style={{ background: GRAD_FOOTER }} className="py-10 text-white/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {DEMO_FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-xs transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm">{PLATFORM_NAME_AR} — عرض تجريبي توضيحي</p>
        <p className="text-xs">© {new Date().getFullYear()} جامعة القصيم — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
