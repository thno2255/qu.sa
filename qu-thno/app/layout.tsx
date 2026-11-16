import type { Metadata, Viewport } from "next"
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google"
import { getLocale, getMessages } from "next-intl/server"
import { Providers } from "@/shared/components/providers"
import { PLATFORM_NAME_AR, PLATFORM_NAME_FULL_AR } from "@/shared/lib/brand"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

// Arabic UI font — IBM Plex Sans Arabic, the same font Qassim University's
// own site (qu.edu.sa) self-hosts for both body text and headings
// (confirmed by reading its page's @font-face rules). Loaded via Google
// Fonts here instead of self-hosting the university's font files directly,
// since it's the same open, OFL-licensed family either way.
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
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
    { media: "(prefers-color-scheme: light)", color: "#1a3d26" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1f14" },
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
      className={`${inter.variable} ${plexArabic.variable} h-full`}
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
