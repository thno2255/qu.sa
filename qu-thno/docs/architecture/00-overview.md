# Architecture Overview
## Community Responsibility Platform — جامعة القصيم

**Version:** 3.0  
**Last Updated:** 2026-07-02  
**Status:** Phase 0 Complete

---

## System Purpose

The Community Responsibility Platform (CRP) is an enterprise platform for Qassim University to manage, track, and report on all community responsibility activities including:

- Community Initiatives and Projects
- External Partnerships (companies, NGOs, government entities)
- Volunteer Programs
- Community Impact Measurement
- Accreditation Reporting (NCAAA, Vision 2030, SDG)

---

## Architecture Style

**Modular Monolith** using Clean Architecture principles, built on Next.js 16 App Router.

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│    Next.js App Router + React 19 + RTL       │
├─────────────────────────────────────────────┤
│           Application Layer                  │
│    Server Actions + Zod Validation           │
├─────────────────────────────────────────────┤
│              Domain Layer                    │
│    Module Services + Business Rules          │
├─────────────────────────────────────────────┤
│           Infrastructure Layer               │
│  Prisma + PostgreSQL + Redis + R2 + AI       │
└─────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | RSC, Server Actions, file-based routing |
| Database | PostgreSQL + Prisma | Type-safe, relational, mature |
| Vector search | pgvector extension | Semantic search without separate infrastructure |
| Auth | NextAuth v5 | App Router compatible, SSO support |
| Cache | Redis (Upstash/self-hosted) | Sessions, rate limiting, job queues |
| Jobs | BullMQ + Redis | Report gen, emails, certificates |
| Storage | Cloudflare R2 | Cost-effective, S3-compatible |
| AI | Anthropic Claude | Best Arabic language support |
| i18n | next-intl | App Router native, type-safe |
| Styling | Tailwind v4 + shadcn/ui | RTL-friendly logical properties |

---

## Module System

Every feature is a **self-registering module** with a `manifest.ts`:

```
Module Manifest declares:
├── id, version, name (Arabic + English)
├── navigation[]       → contributes sidebar items
├── permissions[]      → defines RBAC permissions
├── events             → emits/listens to platform events
├── apiRoutes[]        → REST API endpoints
├── searchAdapter      → how this module is indexed/searched
├── widgets[]          → dashboard builder contributions
└── aiContext          → AI assistant context provider
```

At startup, all manifests register into `moduleRegistry`. The shell assembles navigation, the dashboard assembles widgets, the search engine assembles adapters — all dynamically from manifests.

---

## Data Flow

```
Browser
  │
  ├─ Page Request ──→ Server Component ──→ Server Action ──→ Prisma ──→ PostgreSQL
  │
  ├─ Form Submit  ──→ Server Action ──→ Business Logic ──→ Prisma ──→ PostgreSQL
  │                                          │
  │                                          ├──→ Event Bus ──→ Notification / Activity Log
  │                                          └──→ BullMQ ──→ Background Jobs
  │
  └─ API Request  ──→ /api/v1/[module]/ ──→ Same business logic above
```

---

## Platform Modules (38 total)

### Foundation
- IAM (Users, Roles, Permissions, RBAC+ABAC)
- Organizations (External entities)
- Audit Log + Security Audit

### Engines (No-Code capabilities)
- Workflow Engine (Visual designer + runtime)
- Forms Builder (JSON Schema, conditional logic)
- Business Rules Engine (Condition-Action evaluator)
- Enterprise Search (Federated + semantic)

### Core Community
- Community Initiatives
- Community Projects
- Community Partnerships
- Volunteering

### Intelligence
- Impact Measurement
- Analytics & Dashboards
- Reports (PDF + Excel)
- AI Assistant (Role-differentiated)
- Dashboard Builder

### Communication
- Notification Center (In-app, Email, SMS, WhatsApp)
- Activity Timeline
- CMS (News, Events, Pages)
- Communications Hub
- Calendar

### Utility
- Certificates & Recognition
- Surveys & Feedback
- Document Management
- Knowledge Base
- Compliance & Accreditation
- Budget & Finance Tracking
- External Onboarding
- Public Portal
- System Administration

---

## Database Domains (23)

1. Identity & Access (User, Role, Permission, Session)
2. Organizations (external entity profiles and documents)
3. Workflow Engine (definitions, instances, history)
4. Forms Builder (definitions, submissions)
5. Business Rules Engine (definitions, execution logs)
6. Activity Timeline (event log)
7. Enterprise Search (document index)
8. Notifications (messages, preferences, templates)
9. Dashboard Builder (definitions, widgets)
10. Community Initiatives
11. Community Projects (milestones, team)
12. Partnerships (partners, agreements)
13. Volunteering (profiles, opportunities, applications, logs)
14. Impact Measurement (frameworks, indicators, measurements)
15. CMS (news, events, pages)
16. Documents (versioned file management)
17. Surveys & Feedback
18. Certificates & Recognition
19. Budget & Finance
20. Audit Log
21. Security Events
22. Knowledge Base
23. Compliance & Accreditation

---

## Deployment Targets

| Target | Config | Notes |
|---|---|---|
| Vercel | Zero-config | Dev + staging. Uses Neon DB + Upstash Redis |
| VPS / Docker | `docker-compose.yml` | Production on university servers |
| On-premise | Self-hosted all infra | Uses MinIO instead of R2 |

Zero code changes between targets — only environment variables differ.

---

## Security Model

- **Authentication:** NextAuth v5 (JWT sessions) + SSO (Azure AD) + MFA
- **Authorization:** RBAC + ABAC (role + attribute-based)
- **Data:** PII field encryption, PDPL compliance (Saudi data law)
- **API:** Rate limiting, request validation (Zod), CORS
- **Headers:** CSP, HSTS, X-Frame-Options, etc.
- **Audit:** Immutable audit log for all mutations, security event log

---

## AI Architecture

```
Request from user
    │
    ▼
AI Context Builder
    ├── System context (platform rules, policies)
    ├── Role context (what this user type can do)
    ├── User context (personal history, current tasks)
    ├── Module context (current page/entity)
    ├── KB context (retrieved relevant articles)
    └── Live data context (via module AI tools)
    │
    ▼
Claude claude-sonnet-4-6 (default) / claude-opus-4-8 (complex)
    │
    ▼
Streamed Arabic/English response
```

AI capabilities vary by role:
- **Students/Volunteers:** Proposal writing, opportunity discovery
- **Staff/Coordinators:** Report drafting, data analysis
- **Managers:** Analytics, decision support, executive summaries  
- **External Organizations:** Partnership discovery, compliance guidance
- **Admins:** System insights, anomaly detection
