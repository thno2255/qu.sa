# ADR-003: Arabic-First RTL Design

**Date:** 2026-07-02  
**Status:** Accepted  
**Deciders:** Platform Architecture Team

---

## Context

The platform serves Qassim University — an Arabic-speaking institution. Arabic is the primary language. The platform must be designed RTL-first, not LTR with RTL retrofitted.

Past experience shows: RTL as an afterthought fails. Elements flip incorrectly, spacing breaks, icons face the wrong direction, and forms feel wrong.

---

## Decision

1. **`dir="rtl"` is set on `<html>` for Arabic (default)**
2. **All Tailwind classes use logical properties:**  
   - `ps-4` not `pl-4`  
   - `me-2` not `mr-2`  
   - `start-0` not `left-0`  
3. **Arabic locale is `routing.defaultLocale`** — no `/ar/` prefix in URLs
4. **English locale is `/en/`** — opted into explicitly  
5. **Font:** Noto Naskh Arabic for Arabic text, Inter for Latin
6. **Icons that imply direction** (arrows, chevrons) are flipped with `.rtl-flip` in RTL
7. **All string literals** that appear in UI live in `public/locales/ar.json`
8. **Hijri calendar** is displayed alongside Gregorian for date fields

---

## Consequences

**Positive:**
- Arabic users get a native-feeling experience, not a translated LTR app
- Logical properties work correctly in both RTL and LTR without conditionals
- Single codebase serves both directions

**Negative:**
- Developers unfamiliar with RTL need to learn logical properties
- Some third-party components (charts, complex editors) may need RTL wrappers

**Testing requirement:**
- Every UI component must be visually tested in both `dir="rtl"` and `dir="ltr"` before merge
