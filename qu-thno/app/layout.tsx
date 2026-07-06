import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { getLocale, getMessages } from "next-intl/server"
import { Providers } from "@/shared/components/providers"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | منصة المسؤولية المجتمعية",
    default: "منصة المسؤولية المجتمعية — جامعة القصيم",
  },
  description: "منصة المسؤولية المجتمعية لجامعة القصيم — إدارة المبادرات والمشاريع والشراكات والتطوع",
  keywords: ["جامعة القصيم", "مسؤولية مجتمعية", "تطوع", "مبادرات"],
  authors: [{ name: "جامعة القصيم" }],
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "منصة المسؤولية المجتمعية",
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a5f" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
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
      className={`${inter.variable} h-full`}
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
