import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EventRequestForm } from "./event-request-form"

export const metadata = { title: "تقديم طلب فعالية" }

export default function NewEventRequestPage() {
  return (
    <div dir="rtl" className="min-h-screen text-gray-900" style={{ background: "#f0fdf4" }}>
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/events" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="size-4 rotate-180" />
            العودة للفعاليات
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">تقديم طلب إقامة فعالية</h1>
          <p className="mt-2 text-sm text-gray-500">
            مخصص للجهات الخارجية الراغبة في إقامة فعالية بالتعاون مع جامعة القصيم — لا حاجة لتسجيل الدخول.
          </p>
        </div>
        <EventRequestForm />
      </section>
    </div>
  )
}
