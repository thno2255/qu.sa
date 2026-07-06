# ADR-001: Technology Stack Selection

**Date:** 2026-07-02  
**Status:** Accepted  
**Deciders:** Platform Architecture Team

---

## Context

We need to select a technology stack for the Community Responsibility Platform that:
- Supports Arabic-first RTL from day one
- Is suitable for enterprise university deployment
- Can be deployed on Vercel now and moved to VPS later
- Has strong TypeScript support for a large, long-lived codebase
- Supports AI integration natively

---

## Decision

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.x |
| UI Runtime | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | Latest |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | 16.x |
| Authentication | NextAuth | 5.x (beta) |
| Cache/Queue | Redis + BullMQ | Latest |
| AI | Anthropic Claude API | Latest |
| i18n | next-intl | 4.x |
| Storage | Cloudflare R2 | — |

---

## Consequences

**Positive:**
- Next.js App Router + Server Components reduce client-side JavaScript
- Prisma provides type-safe DB access that prevents SQL injection by design
- Tailwind v4 logical properties (`ps-*`, `pe-*`) make RTL natural
- next-intl is the most mature App Router i18n solution
- Anthropic Claude has the best Arabic language capabilities of any current LLM

**Negative:**
- NextAuth v5 is in beta — risk of breaking changes. Mitigated by: it's used widely in production by the Next.js community and the API is stable.
- Tailwind v4 is a major version change from v3 — some shadcn/ui components need adjustment.

**Neutral:**
- Modular monolith chosen over microservices — appropriate for this scale. Migration path to microservices exists via module boundary design.
