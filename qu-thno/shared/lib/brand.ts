// ─────────────────────────────────────────────────────────────────────────
// Unified brand tokens for public-facing pages (homepage, programs, events,
// partners, terms, login, register).
//
// Confirmed by the product owner: the university identity color is GREEN —
// restored here (and in the recalibrated tokens in app/globals.css) after a
// brief period where this file used the official logo's own blue/teal
// (public/qu-logo.svg only has those two fills active, no green — that
// earlier change was flagged as unconfirmed and needing sign-off; the
// sign-off came back green). This file — plus app/globals.css — is the
// single place both the public site and the platform shell read from, so
// changing the hex values below updates both centrally.
// ─────────────────────────────────────────────────────────────────────────

export const BRAND_PRIMARY_DARK = "#1a3d26"
export const BRAND_PRIMARY = "#245c3a"
export const BRAND_PRIMARY_LIGHT = "#2d7a4f"
export const BRAND_ACCENT = "#34d399"
export const BRAND_ACCENT_LIGHT = "#6ee7b7"

// Section wash gradients — each section's start color matches the previous
// section's end color, so scrolling reads as one continuous wave instead of
// flat, visually-identical white blocks stacked on each other.
const STOP_WHITE = "#ffffff"
const STOP_SOFT = "#f0f8f3"
const STOP_TINT = "#e2f1e7"

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
