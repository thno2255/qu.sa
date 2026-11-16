import Link from "next/link"
import { MapPin, Mail, Globe } from "lucide-react"
import { BRAND_PRIMARY_DARK, GRAD_FOOTER, PLATFORM_NAME_AR, UNIVERSITY_NAME_AR } from "@/shared/lib/brand"

// A full mirror of PublicFooter's content (same sections, same contact
// info — all public/static, harmless to reuse) — but every link stays
// inside /demo/*, and "إنشاء حساب" goes through the mock Nafath screen
// instead of the real /register. Terms/privacy/accessibility are plain
// static info pages with no login involved, so they link straight to the
// real ones rather than needing a demo copy.
const QUICK_LINKS = [
  { label: "الرئيسية", href: "/demo" },
  { label: "البرامج والمبادرات", href: "/demo/programs" },
  { label: "الفعاليات", href: "/demo/events" },
  { label: "الاستشارات", href: "/demo/consultation-info" },
  { label: "الشراكات", href: "/demo/partners" },
  { label: "إنشاء حساب", href: "/demo/nafath" },
]

export function DemoFooter() {
  return (
    <footer className="text-gray-400" style={{ background: GRAD_FOOTER }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl font-black text-lg text-white" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>QU</div>
              <div>
                <p className="font-bold text-white text-sm">{PLATFORM_NAME_AR}</p>
                <p className="text-xs text-gray-500">{UNIVERSITY_NAME_AR} — عرض تجريبي</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              منصة رقمية متكاملة تُمكّن جامعة القصيم من إدارة برامجها المجتمعية وشراكاتها الاستراتيجية
              لتحقيق مستهدفات رؤية 2030. (نسخة عرض تجريبي توضيحية)
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">تواصل معنا</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><MapPin className="size-4 shrink-0 mt-0.5" /><span>المملكة العربية السعودية — بريدة، منطقة القصيم</span></li>
              <li className="flex items-center gap-2"><Mail className="size-4 shrink-0" /><span dir="ltr">cpd@qu.edu.sa</span></li>
              <li className="flex items-center gap-2"><Globe className="size-4 shrink-0" />
                <a href="https://www.qu.edu.sa" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">www.qu.edu.sa</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} {UNIVERSITY_NAME_AR} — جميع الحقوق محفوظة — عرض تجريبي توضيحي</p>
          <div className="flex gap-4">
            <Link href="/terms#privacy" className="hover:text-gray-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">شروط الاستخدام</Link>
            <Link href="/accessibility" className="hover:text-gray-400 transition-colors">إمكانية الوصول</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
