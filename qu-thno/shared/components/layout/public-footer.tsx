import Link from "next/link"
import { MapPin, Phone, Mail, Globe } from "lucide-react"
import { BRAND_PRIMARY_DARK, GRAD_FOOTER, PLATFORM_NAME_AR, PLATFORM_NAME_EN, UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN } from "@/shared/lib/brand"

interface Props {
  isRTL: boolean
}

export function PublicFooter({ isRTL }: Props) {
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const QUICK_LINKS = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("البرامج والمبادرات", "Programs & Initiatives"), href: "/programs" },
    { label: t("الفعاليات", "Events"), href: "/events" },
    { label: t("الاستشارات", "Consultations"), href: "/consultation-info" },
    { label: t("الشراكات", "Partnerships"), href: "/partners" },
    { label: t("إنشاء حساب", "Create Account"), href: "/register" },
  ]

  return (
    <footer className="text-gray-400" style={{ background: GRAD_FOOTER }} id="contact">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl font-black text-lg text-white" style={{ backgroundColor: BRAND_PRIMARY_DARK }}>QU</div>
              <div>
                <p className="font-bold text-white text-sm">{t(PLATFORM_NAME_AR, PLATFORM_NAME_EN)}</p>
                <p className="text-xs text-gray-500">{t(UNIVERSITY_NAME_AR, UNIVERSITY_NAME_EN)}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              {t(
                "منصة رقمية متكاملة تُمكّن جامعة القصيم من إدارة برامجها المجتمعية وشراكاتها الاستراتيجية لتحقيق مستهدفات رؤية 2030.",
                "An integrated digital platform enabling Qassim University to manage its community programs and strategic partnerships to achieve Saudi Vision 2030 targets.",
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">{t("روابط سريعة", "Quick Links")}</h4>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-4">{t("تواصل معنا", "Contact Us")}</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><MapPin className="size-4 shrink-0 mt-0.5" /><span>{t("المملكة العربية السعودية — بريدة، منطقة القصيم", "Saudi Arabia — Buraidah, Qassim Region")}</span></li>
              <li className="flex items-center gap-2"><Mail className="size-4 shrink-0" /><span dir="ltr">cpd@qu.edu.sa</span></li>
              <li className="flex items-center gap-2"><Globe className="size-4 shrink-0" />
                <a href="https://www.qu.edu.sa" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">www.qu.edu.sa</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} {t(`${UNIVERSITY_NAME_AR} — جميع الحقوق محفوظة`, `${UNIVERSITY_NAME_EN} — All Rights Reserved`)}</p>
          <div className="flex gap-4">
            <Link href="/terms#privacy" className="hover:text-gray-400 transition-colors">{t("سياسة الخصوصية", "Privacy Policy")}</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">{t("شروط الاستخدام", "Terms of Use")}</Link>
            <Link href="/accessibility" className="hover:text-gray-400 transition-colors">{t("إمكانية الوصول", "Accessibility")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
