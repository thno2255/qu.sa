// ─────────────────────────────────────────────────────────────────────────
// Unified brand tokens for public-facing pages (homepage, programs, events,
// partners, terms, login, register).
//
// Source of truth: public/qu-logo.svg — the only two active fill colors in
// the official QU logo are #00529A (blue) and #00A8AB (teal); everything
// here derives from that. The platform previously had two disconnected
// palettes — an invented green (#1a3d26) used only on public pages, and a
// separate blue (hsl(218 79% 33%)) used everywhere else via the
// --primary CSS variable. This file — plus the recalibrated tokens in
// app/globals.css — is the single place both now read from.
//
// NEEDS SIGN-OFF: no formal brand guideline document exists in this repo.
// These are the official logo's own colors, not an invented palette, but
// should still be confirmed against the university's identity guide if one
// becomes available. Change the hex values below to update the entire
// public site + platform shell centrally.
// ─────────────────────────────────────────────────────────────────────────

export const BRAND_PRIMARY_DARK = "#013b6e"
export const BRAND_PRIMARY = "#00529a"
export const BRAND_PRIMARY_LIGHT = "#1f6fb8"
export const BRAND_ACCENT = "#00a8ab"
export const BRAND_ACCENT_LIGHT = "#4dd0d2"

// Section wash gradients — each section's start color matches the previous
// section's end color, so scrolling reads as one continuous wave instead of
// flat, visually-identical white blocks stacked on each other.
const STOP_WHITE = "#ffffff"
const STOP_SOFT = "#f4f8fb"
const STOP_TINT = "#e6f1f8"

export const GRAD_HERO = `linear-gradient(160deg, ${BRAND_PRIMARY_DARK} 0%, ${BRAND_PRIMARY} 100%)`
export const GRAD_WHITE_TO_SOFT = `linear-gradient(180deg, ${STOP_WHITE} 0%, ${STOP_SOFT} 100%)`
export const GRAD_SOFT_TO_TINT = `linear-gradient(180deg, ${STOP_SOFT} 0%, ${STOP_TINT} 100%)`
export const GRAD_TINT_TO_WHITE = `linear-gradient(180deg, ${STOP_TINT} 0%, ${STOP_WHITE} 100%)`
export const GRAD_CTA = `linear-gradient(150deg, ${BRAND_PRIMARY} 0%, ${BRAND_PRIMARY_DARK} 100%)`
export const GRAD_FOOTER = "linear-gradient(180deg, #0f1b2b 0%, #030712 100%)"

// ─────────────────────────────────────────────────────────────────────────
// Platform name — RESOLVED, NEEDS PRODUCT-OWNER CONFIRMATION.
//
// The codebase had two names in active use: "منصة المسؤولية المجتمعية"
// (Community Responsibility Platform — used in layout.tsx metadata,
// manifest.json, login/register pages, terms page) and "منصة الشراكة
// المجتمعية" (Community Partnership Platform — used throughout the
// homepage's own copy: hero badge, nav framing, footer, CTAs).
//
// This redesign standardizes on the PARTNERSHIP name, because it was the
// one already fully committed to on the platform's newest and most
// public-facing surface (the homepage rebuild), including its footer,
// section copy, and CTAs — reverting that would touch more surface than
// aligning the older pages to it. This is an editorial call, not a
// confirmed decision — needs sign-off from the product owner.
// ─────────────────────────────────────────────────────────────────────────
export const PLATFORM_NAME_AR = "منصة الشراكة المجتمعية"
export const PLATFORM_NAME_EN = "Community Partnership Platform"
export const PLATFORM_NAME_FULL_AR = "منصة الشراكة المجتمعية — جامعة القصيم"
export const PLATFORM_NAME_FULL_EN = "Community Partnership Platform — Qassim University"
export const UNIVERSITY_NAME_AR = "جامعة القصيم"
export const UNIVERSITY_NAME_EN = "Qassim University"
