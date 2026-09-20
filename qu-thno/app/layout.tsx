import type { Metadata, Viewport } from "next"
import { Inter, Noto_Sans_Arabic } from "next/font/google"
import { getLocale, getMessages } from "next-intl/server"
import { Providers } from "@/shared/components/providers"
import { PLATFORM_NAME_AR, PLATFORM_NAME_FULL_AR } from "@/shared/lib/brand"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

// Arabic UI font — globals.css already references var(--font-noto-arabic);
// it previously had no source and silently fell back to system fonts.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${PLATFORM_NAME_AR}`,
    default: PLATFORM_NAME_FULL_AR,
  },
  description: "منصة الشراكة المجتمعية لجامعة القصيم — إدارة المبادرات والمشاريع والشراكات والاستشارات",
  keywords: ["جامعة القصيم", "شراكة مجتمعية", "مسؤولية مجتمعية", "مبادرات"],
  authors: [{ name: "جامعة القصيم" }],
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PLATFORM_NAME_AR,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00529a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1a2e" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = (await getLocale()) as "ar" | "en"
  const messages = await getMessages()
  const isRTL = locale === "ar"

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${inter.variable} ${notoArabic.variable} h-full`}
    >
      <body className="h-full antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          انتقل إلى المحتوى الرئيسي
        </a>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
