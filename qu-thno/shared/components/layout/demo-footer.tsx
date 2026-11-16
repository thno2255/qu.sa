import { GRAD_FOOTER, PLATFORM_NAME_AR } from "@/shared/lib/brand"

// Deliberately NOT PublicFooter: that component's quick links point into
// the real site (/register, /programs, …), which would leak visitors out
// of this self-contained demo and back into the real multi-role system.
export function DemoFooter() {
  return (
    <footer style={{ background: GRAD_FOOTER }} className="py-8 text-center text-white/60">
      <p className="text-sm">{PLATFORM_NAME_AR} — عرض تجريبي توضيحي</p>
      <p className="mt-1 text-xs">© {new Date().getFullYear()} جامعة القصيم — جميع الحقوق محفوظة</p>
    </footer>
  )
}
