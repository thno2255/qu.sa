import Link from "next/link"
import { DemoHeader } from "@/shared/components/layout/demo-header"
import { DemoFooter } from "@/shared/components/layout/demo-footer"
import { DemoApplyForm } from "@/shared/components/demo/demo-apply-form"
import { getDemoService } from "@/core/demo/services"
import { BRAND_PRIMARY_DARK, GRAD_WHITE_TO_SOFT } from "@/shared/lib/brand"

export default async function DemoApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>
  searchParams: Promise<{ nationalId?: string }>
}) {
  const { service: serviceSlug } = await params
  const { nationalId } = await searchParams
  const service = getDemoService(serviceSlug)

  if (!service || !nationalId) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <DemoHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-gray-600">يجب تسجيل الدخول أولًا قبل تقديم الطلب.</p>
          <Link href="/demo" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_PRIMARY_DARK }}>
            العودة للصفحة الرئيسية ←
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-900">
      <DemoHeader />
      <section className="py-12" style={{ background: GRAD_WHITE_TO_SOFT }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl">{service.titleAr}</h1>
            <p className="mt-1 text-sm text-gray-500">{service.descAr}</p>
          </div>
          <DemoApplyForm serviceSlug={service.slug} serviceLabelAr={service.titleAr} nationalId={nationalId} />
        </div>
      </section>
      <DemoFooter />
    </div>
  )
}
