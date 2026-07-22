import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"

const GREEN_DARK = "#1a3d26"

export const metadata = { title: "الشروط والأحكام" }

export default function TermsPage() {
  return (
    <div dir="rtl" className="min-h-screen text-gray-900" style={{ background: "#f0fdf4" }}>
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="size-4 rotate-180" />
            العودة للرئيسية
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-black text-gray-900 mb-2">الشروط والأحكام</h1>
        <p className="text-sm text-gray-500 mb-8">
          يُرجى قراءة الشروط التالية بعناية قبل استخدام منصة المسؤولية المجتمعية بجامعة القصيم.
        </p>

        {/* Health disclaimer — highlighted */}
        <div className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-6 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h2 className="font-bold text-amber-900 mb-1">إخلاء المسؤولية عن الاستشارات الصحية</h2>
              <p className="text-sm text-amber-800 leading-relaxed">
                الاستشارات المقدَّمة عبر المنصة — بما في ذلك أي استشارة ذات طابع صحي أو طبي — هي
                لأغراض التوجيه العام فقط، وتُقدَّم على سبيل الاجتهاد من قِبل أعضاء هيئة التدريس
                المسجّلين، ولا تُعد بأي حال من الأحوال بديلاً عن التشخيص أو الاستشارة الطبية
                المتخصصة من جهة رعاية صحية مرخّصة. تتحمّل جامعة القصيم عدم المسؤولية عن أي قرار
                صحي يُتخذ بناءً على هذه الاستشارات، ويُنصح دائماً بمراجعة الطبيب المختص لأي حالة
                صحية أو طارئة.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h3 className="font-bold text-gray-900 mb-1.5">١. طبيعة الاستخدام</h3>
            <p>
              هذه المنصة مخصصة لإدارة برامج المسؤولية المجتمعية بجامعة القصيم — تشمل المبادرات
              والمشاريع والشراكات والفعاليات والتطوع والاستشارات. باستخدامك للمنصة فإنك توافق على
              الالتزام بالأنظمة المتّبعة في الجامعة وعدم إساءة استخدام أي من خدماتها.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-gray-900 mb-1.5">٢. دقة البيانات</h3>
            <p>
              يلتزم المستخدم بتقديم بيانات صحيحة ومحدّثة عند التسجيل أو تقديم أي طلب (فعالية،
              شراكة، استشارة)، وتحتفظ الجامعة بحق رفض أو إيقاف أي حساب أو طلب يتضح عدم صحة بياناته.
            </p>
          </section>
          <section>
            <h3 className="font-bold text-gray-900 mb-1.5">٣. الاستشارات</h3>
            <p>
              تُقدَّم الاستشارات عبر المنصة من أعضاء هيئة تدريس متخصصين على سبيل الإرشاد العام،
              وتخضع لتوفر المستشار وقبوله للطلب. راجع القسم المخصص لإخلاء المسؤولية عن الاستشارات
              الصحية أعلاه.
            </p>
          </section>
          <section id="privacy" className="scroll-mt-24">
            <h3 className="font-bold text-gray-900 mb-1.5">٤. الخصوصية</h3>
            <p>
              تُستخدم البيانات الشخصية المُقدَّمة للمنصة فقط لأغراض تشغيل الخدمات المطلوبة
              (التواصل، معالجة الطلبات، إصدار الشهادات) ولا تُشارَك مع جهات خارجية دون موجب نظامي.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          للاستفسار حول هذه الشروط، يُرجى التواصل عبر البريد الإلكتروني: cpd@qu.edu.sa
        </p>
      </section>
    </div>
  )
}
