import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">الصفحة غير موجودة</h1>
        <p className="mt-2 text-muted-foreground">Page Not Found</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  )
}
