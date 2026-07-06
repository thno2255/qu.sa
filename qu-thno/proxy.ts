import { NextResponse } from "next/server"
import { auth } from "@/core/auth/auth"
import type { NextRequest } from "next/server"

// next-intl reads this header in server components via getLocale()
const INTL_LOCALE_HEADER = "X-NEXT-INTL-LOCALE"

const LOCALES = ["ar", "en"] as const
type Locale = (typeof LOCALES)[number]
const DEFAULT_LOCALE: Locale = "ar"

const protectedRoutes = [
  "/dashboard",
  "/initiatives",
  "/projects",
  "/partnerships",
  "/volunteering",
  "/workflows",
  "/impact",
  "/analytics",
  "/reports",
  "/ai-assistant",
  "/search",
  "/notifications",
  "/timeline",
  "/cms",
  "/settings",
  "/profile",
]

const authRoutes = ["/login", "/register", "/forgot-password"]

// Detect locale from cookie → Accept-Language → default
function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) {
    return cookie as Locale
  }
  const accept = req.headers.get("accept-language") ?? ""
  if (/\ben\b/.test(accept)) return "en"
  return DEFAULT_LOCALE
}

// Build a NextResponse.next() that injects the locale header into the request
// so that next-intl's getLocale() / getMessages() resolve correctly on the server.
function passThrough(req: NextRequest, locale: Locale): NextResponse {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(INTL_LOCALE_HEADER, locale)
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" })
  return res
}

export default auth(async (req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!(req as { auth?: { user?: unknown } }).auth?.user

  // ── Locale-prefix paths: /en[/...] and /ar[/...] ─────────────────────────
  // These are used by the language toggle in the header to switch locale.
  // Strip the prefix, set the cookie, and redirect to the actual path.
  const enMatch = pathname === "/en" || pathname.startsWith("/en/")
  const arMatch = pathname === "/ar" || pathname.startsWith("/ar/")
  if (enMatch || arMatch) {
    const newLocale: Locale = enMatch ? "en" : "ar"
    const stripped =
      pathname === "/en" || pathname === "/ar"
        ? "/"
        : pathname.slice(3) // remove "/en" or "/ar" prefix
    const destination = new URL(stripped || "/", req.nextUrl.origin)
    // Preserve query string
    req.nextUrl.searchParams.forEach((v, k) => destination.searchParams.set(k, v))
    const res = NextResponse.redirect(destination)
    res.cookies.set("NEXT_LOCALE", newLocale, { path: "/", sameSite: "lax" })
    return res
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
  const isOnAuth = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  if (isOnAuth && isAuthenticated) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  // ── Redirect unauthenticated users away from protected pages ─────────────
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }

  // ── Pass through: set locale header only, no URL rewriting ───────────────
  const locale = detectLocale(req)
  return passThrough(req, locale)
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|images|manifest.json).*)",
  ],
}
