import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import { DemoHeader } from "@/shared/components/layout/demo-header"
import { DemoFooter } from "@/shared/components/layout/demo-footer"
import { DEMO_SERVICES } from "@/core/demo/services"
import { BRAND_PRIMARY_DARK, GRAD_HERO, PLATFORM_NAME_AR } from "@/shared/lib/brand"

export const metadata = { title: "عرض تجريبي — المنصة بصفحة واحدة" }

// Standalone showcase page — presents the platform's services behind a
// single page with a mock Nafath-style login, for demonstrating the idea
// to a decision-maker without any real authentication/IAM involved. See
// core/demo/actions.ts for how submissions are stored (fully separate
// DemoRequest table, unrelated to the real system).
export default function DemoHomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <DemoHeader />

      <section className="relative overflow-hidden py-16 px-4 text-center text-white sm:py-20" style={{ background: GRAD_HERO }}>
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
            <Info className="size-3.5" />
            {PLATFORM_NAME_AR} — عرض تجريبي بصفحة واحدة
          </span>
          <h1 className="text-3xl font-black sm:text-4xl leading-tight">
            كل خدمات الشراكة المجتمعية في صفحة واحدة
          </h1>
          <p className="mt-4 text-sm text-white/75 leading-relaxed max-w-lg mx-auto sm:text-base">
            اختر الخدمة التي تحتاجها، سجّل دخولك برقم الهوية فقط (محاكاة توضيحية)،
            وقدّم طلبك مباشرة دون الحاجة لإنشاء حساب.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">اختر خدمتك</h2>
          <p className="mt-2 text-sm text-gray-500">الضغط على أي خدمة ينقلك لشاشة تسجيل الدخول (محاكاة)</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {DEMO_SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/demo/nafath?service=${s.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#eaf5ee" }}>
                <s.Icon className="size-6" style={{ color: BRAND_PRIMARY_DARK }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{s.titleAr}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{s.descAr}</p>
                <span className="mt-3 flex items-center gap-1 text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
                  ابدأ الطلب
                  <ArrowLeft className="size-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong className="font-bold">ملاحظة:</strong> هذه نسخة عرض توضيحية منفصلة تمامًا عن النظام الفعلي —
          لا تتصل بمنصة نفاذ الحقيقية، ولا تُنشئ حسابات مستخدمين، والبيانات المُدخلة هنا تُحفظ في جدول عرض
          تجريبي مستقل لا علاقة له ببيانات المنصة الحقيقية.
        </div>
      </section>

      <DemoFooter />
    </div>
  )
}
