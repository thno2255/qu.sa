import { getLocale } from "next-intl/server"
import { auth } from "@/core/auth/auth"
import { Eye, Keyboard, Type, MonitorSmartphone } from "lucide-react"
import { PublicHeader } from "@/shared/components/layout/public-header"
import { PublicFooter } from "@/shared/components/layout/public-footer"
import { PrototypeBanner } from "@/shared/components/layout/prototype-banner"

export const metadata = { title: "إمكانية الوصول" }

const COMMITMENTS = [
  { Icon: Type, title: "تباين نصي واضح", desc: "نلتزم بمستويات تباين واضحة بين النص والخلفية في كل صفحات المنصة." },
  { Icon: Keyboard, title: "تنقّل بلوحة المفاتيح", desc: "يمكن التنقل عبر جميع الروابط والقوائم والنماذج باستخدام لوحة المفاتيح فقط." },
  { Icon: Eye, title: "تسميات ونصوص بديلة", desc: "حقول النماذج والعناصر التفاعلية تحمل تسميات واضحة، والصور الوظيفية تحمل نصًا بديلًا." },
  { Icon: MonitorSmartphone, title: "تجاوب مع كل الأجهزة", desc: "الواجهة مُختبرة على مقاسات شاشات متعددة من الجوال إلى الشاشات الكبيرة." },
]

export default async function AccessibilityPage() {
  const session = await auth()
  const isAuth = !!session?.user
  const locale = (await getLocale()) as "ar" | "en"
  const isRTL = locale === "ar"

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner isRTL={isRTL} />
      <PublicHeader isRTL={isRTL} isAuth={isAuth} />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-black text-gray-900 mb-2">إمكانية الوصول</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          تسعى منصة الشراكة المجتمعية بجامعة القصيم إلى أن تكون متاحة لأكبر عدد ممكن من المستخدمين،
          وتستهدف تحقيق مستوى <strong>WCAG 2.2 AA</strong> كمرجع تصميمي. هذه المنصة نسخة تجريبية قيد
          التطوير المستمر، ولم يُعلَن بعد عن اجتياز تدقيق امتثال رسمي كامل.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          {COMMITMENTS.map((c) => (
            <div key={c.title} className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <c.Icon className="size-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="text-sm font-bold text-blue-900 mb-1.5">واجهت مشكلة في الوصول؟</h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            إذا واجهتك أي صعوبة في استخدام المنصة بسبب إعاقة أو حاجة خاصة، يُرجى إبلاغنا عبر البريد
            الإلكتروني <span dir="ltr" className="font-semibold">cpd@qu.edu.sa</span> حتى نتمكن من
            المساعدة أو تحسين الصفحة المعنية.
          </p>
        </div>
      </section>

      <PublicFooter isRTL={isRTL} />
    </div>
  )
}
