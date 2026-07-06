<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# منصة المسؤولية المجتمعية — Developer Reference

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation (Next.js, Prisma, Auth, i18n, Module System) | ✅ Complete |
| 1 | IAM — Identity & Access Management | ✅ Complete |
| 2 | Workflow Engine + Notifications | ✅ Complete |
| 3 | Core Modules (Initiatives, Projects, Partnerships, Volunteering) | ✅ Complete |
| 4 | AI Assistant + Smart Search | ✅ Complete |
| 5 | Impact Measurement + Reporting | ✅ Complete |
| 6 | Community Portfolio + Gamification | ✅ Complete |
| 7 | CMS + Public Portal | ✅ Complete |
| 8 | Analytics + Executive Dashboard | ✅ Complete |
| 9 | Mobile + PWA + Accessibility Polish | ✅ Complete |

---

## Critical Conventions

### Next.js 16 Breaking Changes
- Middleware file is `proxy.ts` (NOT `middleware.ts`) — renamed in Next.js 16
- `proxy.ts` uses `auth(async (req) => {...})` — Pattern 2 (custom handler). The `authorized` callback in `authConfig` is NOT called with this pattern and must not be used for route protection.
- Route protection is handled exclusively in `proxy.ts`
- Read `node_modules/next/dist/docs/` guides before using any Next.js API

### Prisma 7
- `prisma.config.ts` holds the `datasource.url` — NOT in `schema.prisma`
- `schema.prisma` datasource block has NO `url` field
- Client uses `PrismaPg` adapter from `@prisma/adapter-pg`
- After any schema change: `DATABASE_URL=postgresql://... npx prisma generate`
- Seed: `npx prisma db seed`

### Tailwind CSS v4
- Config is CSS-only — `@import "tailwindcss"` in `globals.css`, NO `tailwind.config.ts`
- Use logical properties for RTL: `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`
- RTL layout: `flex-direction: row` with `dir="rtl"` on `<html>` puts first DOM child on the RIGHT
- Never use `mr-`/`ml-` for spacing that must flip in RTL

### next-intl v4
- Default locale: `ar` (no `/ar/` URL prefix)
- English: `/en/...` prefix
- `defineRouting({ locales: ["ar", "en"], defaultLocale: "ar", localePrefix: "as-needed" })`

### NextAuth v5 (beta)
- JWT strategy — sessions are NOT stored in the database
- PrismaAdapter is present for OAuth provider support (future)
- Credentials provider handles email/password for external entities
- Internal university users will use SSO (Phase 4)
- Type augmentation: `types/next-auth.d.ts`

---

## User Types (10 — per SRS)

| Enum Value | Arabic | Access Level |
|---|---|---|
| `SYSTEM_ADMIN` | مدير النظام | Full system |
| `COMMUNITY_MANAGER` | مدير المسؤولية المجتمعية | Full platform |
| `COMMUNITY_EMPLOYEE` | موظف المسؤولية المجتمعية | Daily operations |
| `COLLEGE_DEAN` | عميد الكلية | College oversight |
| `DEPARTMENT_HEAD` | رئيس القسم | Department management |
| `FACULTY_MEMBER` | عضو هيئة التدريس | Create & supervise |
| `STUDENT` | الطالب | Participate & volunteer |
| `EXTERNAL_ENTITY` | الجهة الخارجية | Browse & partner |
| `VOLUNTEER` | المتطوع | Volunteer only |
| `VISITOR` | الزائر | Public read-only |

---

## Authentication Flow

```
External entity → /register → PENDING status → Admin approves → ACTIVE
University user → /login → SSO button (Phase 4)
External entity → /login → email + password
Forgot password → OTP (6 digits, 15 min TTL) → new password
Account lockout → 5 failed attempts → 30-minute lock → auto-resets on expiry
```

### Demo Users (development only — password: `Demo@2026!`)

| Email | Role |
|---|---|
| admin@qu.edu.sa | SYSTEM_ADMIN |
| manager@qu.edu.sa | COMMUNITY_MANAGER |
| employee@qu.edu.sa | COMMUNITY_EMPLOYEE |
| dean@qu.edu.sa | COLLEGE_DEAN |
| faculty@qu.edu.sa | FACULTY_MEMBER |
| student@qu.edu.sa | STUDENT |
| external@example.com | EXTERNAL_ENTITY |

---

## DB Schema Domains (24 total)

1. IAM (User, Role, Permission, OtpCode, UserDevice, UserRole, RolePermission)
2. Organizations
3. Workflow Engine
4. Forms Builder
5. Rules Engine
6. Activity Timeline
7. Enterprise Search
8. Notifications
9. Dashboard Builder
10. Community Initiatives
11. Community Projects
12. Partnerships
13. Volunteering
14. Impact Measurement
15. CMS
16. Documents
17. Surveys & Feedback
18. Certificates
19. Budget & Finance
20. Audit Log
21. Security Audit
22. Knowledge Base
23. Compliance
24. Community Points & Gamification

---

## File Structure (Phase 1)

```
app/
  (auth)/
    layout.tsx          — minimal HTML/body wrapper (no centered card)
    login/
      page.tsx          — full-screen split 40%/60% server component
      login-form.tsx    — "use client" — credentials form
      stats-slider.tsx  — "use client" — rotating stats
    register/
      page.tsx          — external entity registration
      register-form.tsx — "use client" — multi-section form with password strength
    forgot-password/
      page.tsx
      forgot-form.tsx   — "use client" — step-driven (email → OTP → done)
  (platform)/
    layout.tsx          — PlatformShell with sidebar
    dashboard/
      page.tsx          — server component, role-aware KPIs and quick links

core/
  auth/
    auth.ts             — NextAuth v5 config + CredentialsProvider
    actions.ts          — "use server" — loginAndRedirect, registerExternal, OTP
    utils.ts            — hashPassword, verifyPassword (Node.js crypto/scrypt), generateOtp

prisma/
  schema.prisma         — 24 domains, 1200+ lines
  config.ts             — datasource URL
  seed/index.ts         — 10 roles + 40 permissions + 7 demo users + badges

proxy.ts                — Next.js 16 middleware (auth + i18n)
```

---

---

## Phase 2: Workflow Engine + Notifications

### Workflow Engine

The workflow engine is a generic state machine stored in `core/workflow/`.

**Core concepts:**
- `WorkflowDefinition` — a template (config JSON with steps, transitions, SLA rules)
- `WorkflowInstance` — one running workflow for a specific entity (e.g. an Organization)
- `ApprovalTask` — an action required from a specific assignee in one step
- `WorkflowHistory` — immutable audit trail of all transitions
- `EscalationLog` — recorded escalation events (SLA breach or manual)

**Step types:** `approval` | `notification` | `auto`

**Assignee types:** `role` (UserType string) | `user` (userId)

**Allowed decisions:** `APPROVE` | `REJECT` | `RETURN` | `DELEGATE`

**SLA tracking:**
- Each step has optional `sla: { durationHours, warningHours, escalateTo }`
- `ApprovalTask.dueAt` is set from `durationHours` at task creation time
- `checkAndEscalateOverdueTasks()` runs on page load (no cron required)
- SLA status: `ok` / `warning` (< warningHours left) / `breached` / `none`

**Built-in templates (seeded):**
- `wf-org-registration` — 2-step: Employee Review → Manager Approval
- `wf-initiative-approval` — 3-step: Dept Head → Dean → Manager
- `wf-partnership-approval` — 2-step: Employee Review → Manager Approval

**Key functions:**
```typescript
createWorkflowInstance({ definitionId, entityType, entityId, initiatorId })
submitApprovalDecision({ taskId, decision, comment }, actorId)
checkAndEscalateOverdueTasks()  // call on page load
getMyPendingTasks(userType, userId)
getWorkflowInstance(id)
getWorkflowInstances({ entityType?, status?, limit? })
```

### Notification Service

Notification service in `core/notifications/`.

**Notification types:**
- `WORKFLOW_TASK_ASSIGNED` — new approval task for you
- `WORKFLOW_APPROVED` — your request was approved
- `WORKFLOW_REJECTED` — your request was rejected
- `WORKFLOW_RETURNED` — returned for revision
- `WORKFLOW_ESCALATED` — escalated to you
- `WORKFLOW_SLA_WARNING` — SLA deadline approaching
- `REGISTRATION_APPROVED` / `REGISTRATION_REJECTED` — registration outcome
- `GENERAL` — general platform notifications

**Channels:** `IN_APP` (always) | `EMAIL` (user preference) | `SMS` / `PUSH` (future)

**Email in development:**
- Emails are logged to terminal (no SMTP server needed)
- All outbound emails are recorded in `EmailQueue` table
- To add real SMTP: implement in `core/notifications/email.ts` under the `// Production` comment

**Key functions:**
```typescript
sendNotification(params)              // create in-app + optional email
markNotificationRead(id, userId)
markAllNotificationsRead(userId)
getUnreadCount(userId)
getNotifications(userId, { limit, status })
notifyRole(userType, params)          // broadcast to all users of a role
```

**Notification preferences:**
- Per-user, per-type, per-channel
- Stored in `NotificationPreference` table
- Managed via `/notifications/preferences`

### API Routes (Phase 2)

| Route | Method | Description |
|---|---|---|
| `/api/notifications/unread-count` | GET | Returns `{ count }` for bell badge |
| `/api/notifications/list` | GET | Returns notification list (`?status=unread&limit=30`) |
| `/api/notifications/mark-read` | POST | `{ id }` or `{ all: true }` |

### New Pages (Phase 2)

| Route | Description |
|---|---|
| `/workflows` | My pending tasks + all workflow instances |
| `/workflows/[id]` | Workflow detail: progress, approval card, history timeline |
| `/notifications` | Full notification history with filter tabs |
| `/notifications/preferences` | Per-type, per-channel preference toggles |
| `/settings/workflows` | Workflow Designer: template list + SLA reference table |

### File Structure (Phase 2 additions)

```
core/
  workflow/
    types.ts          — WorkflowConfig, WorkflowStep, SLA types, ApprovalTaskView
    templates.ts      — Built-in templates: org_registration, initiative, partnership
    engine.ts         — State machine: createInstance, submitDecision, escalate
    actions.ts        — Server actions: submitDecisionAction, startWorkflowAction
  notifications/
    types.ts          — NotificationType, SendNotificationParams
    service.ts        — sendNotification, markRead, getUnreadCount, notifyRole
    email.ts          — queueEmail, buildNotificationEmail (console in dev)
    actions.ts        — Server actions: markReadAction, updatePreferencesAction

shared/components/
  workflow/
    workflow-status-badge.tsx  — Status badge for WorkflowStatus / ApprovalTaskStatus
    approval-card.tsx          — Approval task card with decision form
    workflow-timeline.tsx      — History timeline component
  notifications/
    notification-bell.tsx      — Bell button with live count + panel toggle
    notification-panel.tsx     — Slide-over panel (fetch on open, mark-read)
    notification-item.tsx      — Single notification row

app/
  api/notifications/
    unread-count/route.ts
    list/route.ts
    mark-read/route.ts
  (platform)/
    workflows/
      page.tsx                 — My tasks + all instances
      [id]/page.tsx            — Detail + approval actions
    notifications/
      page.tsx                 — History list (server)
      notifications-client.tsx — Filter tabs + mark-read (client)
      preferences/
        page.tsx               — Preference form (server)
        preferences-form.tsx   — Upsert preferences (client)
    settings/workflows/
      page.tsx                 — Workflow Designer (admin only)
```

---

## Phase 3: Core Modules

### Architecture Pattern
Each module follows the same pattern:
- `core/<module>/actions.ts` — `"use server"` CRUD + workflow integration
- `app/(platform)/<module>/page.tsx` — Server component list page (stats + grid)
- `app/(platform)/<module>/new/page.tsx` — Auth-gated create form page
- `app/(platform)/<module>/[id]/page.tsx` — Detail page with workflow status
- `app/(platform)/<module>/[id]/edit/page.tsx` — Edit form (owner/admin only)
- `app/(platform)/<module>/<module>-form.tsx` — `"use client"` shared create/edit form

### Module Summary

| Module | Status on Submit | Workflow Template |
|---|---|---|
| Initiatives | draft → pending | `wf-initiative-approval` (3-step) |
| Projects | draft → pending | (uses initiative template wf-def) |
| Partnerships | draft → pending | `wf-partnership-approval` (2-step) |
| Volunteering | opportunities open/in_progress | No workflow — direct apply |

### Shared UI Components (Phase 3)

- `shared/components/ui/entity-status-badge.tsx` — status → colored badge
- `shared/components/ui/sdg-chip.tsx` — SDGChip (single) + SDGChipsRow (list)
- `shared/components/ui/empty-state.tsx` — Centered empty content placeholder
- `shared/components/ui/page-header.tsx` — Breadcrumb + title + action slot

### File Structure (Phase 3 additions)

```
shared/components/ui/
  entity-status-badge.tsx
  sdg-chip.tsx
  empty-state.tsx
  page-header.tsx

core/
  initiatives/actions.ts   — CRUD + submitForApproval + createWorkflowInstance
  projects/actions.ts      — CRUD + milestones + submitForApproval
  partnerships/actions.ts  — CRUD + partner upsert + submitForApproval
  volunteering/actions.ts  — opportunities CRUD + apply + logHours

app/(platform)/
  initiatives/
    page.tsx                   — Stats row + grid
    initiative-form.tsx        — Shared create/edit form (client)
    new/page.tsx
    [id]/page.tsx              — Detail + SDG chips + workflow status
    [id]/initiative-detail-actions.tsx — Submit / delete (client)
    [id]/edit/page.tsx
  projects/
    page.tsx                   — Stats row + progress bars grid
    project-form.tsx
    new/page.tsx
    [id]/page.tsx              — Detail + milestones + team
    [id]/project-detail-actions.tsx — Submit / delete / complete milestone (client)
    [id]/edit/page.tsx
  partnerships/
    page.tsx                   — Stats row + partner cards grid
    partnership-form.tsx       — Includes new-partner fields on create
    new/page.tsx
    [id]/page.tsx              — Detail + partner info box
    [id]/partnership-detail-actions.tsx
    [id]/edit/page.tsx
  volunteering/
    page.tsx                   — Open opportunities + spots progress bars
    opportunity-form.tsx
    new/page.tsx
    opportunities/[id]/page.tsx — Detail + apply button
    opportunities/[id]/apply-button.tsx — Client apply action
    my-applications/page.tsx   — My applications list + hour logs
    log-hours/page.tsx
    log-hours/log-hours-form.tsx
```

### Seed (Phase 3)
Step 11 in `prisma/seed/index.ts` adds:
- 3 sample initiatives (active / pending / draft)
- 2 sample projects with milestones (active / pending)
- 1 partner (Saudi Aramco) + 1 active partnership
- 1 volunteer opportunity (open, 10 spots)

---

## Phase 4: AI Assistant + Smart Search

### Enterprise Search (`/search`)
- `core/search/actions.ts` — `searchAll(query)` queries all tables with `contains + insensitive`; `getRecentItems()` for empty state
- Searches across: Initiative, Project, Partnership, VolunteerOpportunity, KBArticle
- Results grouped by entity type with type badges
- Server-rendered on initial load (URL `?q=` param); client-side debounced live search thereafter
- `SearchDocument` table in schema reserved for future full-text indexing

### Global Search Modal (Cmd+K / Ctrl+K)
- `shared/components/search/search-modal.tsx` — keyboard shortcut opens overlay modal
- Integrated into `shared/components/layout/header.tsx` (desktop shows pill button; mobile shows icon link)
- Returns up to 8 results; Enter navigates to `/search?q=...` for full results

### AI Assistant (`/ai-assistant`)
- `core/ai/client.ts` — Anthropic SDK wrapper with `streamAIResponse()` (async generator) and `generateAIResponse()`
- `core/ai/system-prompt.ts` — `getPlatformContext()` fetches live DB stats; `buildSystemPrompt()` builds bilingual system prompt with user role + live stats
- `app/api/ai/chat/route.ts` — POST endpoint streams text via `ReadableStream` (no extra AI SDK needed)
- `app/(platform)/ai-assistant/chat-client.tsx` — Full chat UI: suggested prompts, streaming display, multi-turn history, clear conversation
- `app/(platform)/ai-assistant/page.tsx` — Server shell; shows API key config notice when `ANTHROPIC_API_KEY` not set

### Models Used
- Default: `claude-sonnet-4-6` (fast, capable)
- Powerful: `claude-opus-4-8` (complex analysis — unused in Phase 4)
- Fast: `claude-haiku-4-5-20251001` (quick lookups — unused in Phase 4)

### File Structure (Phase 4 additions)

```
core/
  ai/
    client.ts          — Anthropic SDK wrapper + streamAIResponse + generateAIResponse
    system-prompt.ts   — getPlatformContext + buildSystemPrompt (AR/EN)
  search/
    actions.ts         — searchAll() + getRecentItems()

app/
  api/ai/
    chat/route.ts      — POST streaming endpoint (ReadableStream)
  (platform)/
    search/
      page.tsx          — Server page with SSR initial results from URL ?q=
      search-client.tsx — Live debounced search + grouped results display
    ai-assistant/
      page.tsx          — Server shell + API key gate
      chat-client.tsx   — Chat UI with streaming, history, suggested prompts

shared/components/
  search/
    search-modal.tsx   — Global Cmd+K search overlay modal
```

### KB Articles (Seed Step 12)
3 published KB articles added for search indexing + AI context.

### Environment Variables Required
```
ANTHROPIC_API_KEY=sk-ant-...   # Required for AI assistant
```
The AI assistant page shows a friendly setup notice when the key is missing.

---

## Phase 5: Impact Measurement + Reporting

### Core Actions (`core/impact/actions.ts`)
- `getImpactKPIs()` — aggregates: totalBeneficiaries (sum), totalVolunteerHours (sum), activePrograms (initiatives + projects), sdgCoverage (unique SDG count), budgetAllocated, partnershipsActive
- `getSDGCoverage()` — counts initiatives per SDG goal → returns sorted array with Arabic/English labels
- `getModuleImpactSummaries()` — per-module breakdown: Initiative / Project / Partnership / Volunteering with active/completed/total/beneficiaries

### Pages
- `/impact` — SDG bubble grid (17 goals, colored/dimmed based on coverage) + KPI cards + SDG progress bars + module impact table
- `/reports` — Executive summary card + programs breakdown table + 6 report shortcut cards (printable via `window.print()`)

### Prisma Models Used
`Initiative`, `Project`, `Partnership`, `VolunteerOpportunity`, `VolunteerProfile`

---

## Phase 6: Community Portfolio + Gamification

### Core Actions (`core/gamification/actions.ts`)
- `awardPoints(userId, type, sourceType?, sourceId?)` — creates `CommunityPointsTransaction`; calls `checkAndAwardBadges()` after every award
- `getUserTotalPoints(userId)` → sum of all points
- `getLeaderboard(limit)` → top users by total points with rank + role
- `getUserProfile(userId)` → full profile: user info, total points, volunteer hours, badges, recent transactions, initiative/project counts
- Badge auto-award logic: pointsRequired threshold, volunteering category (≥10 hrs), initiatives category (≥1 created)

### Points System
| Action | Points |
|---|---|
| INITIATIVE_CREATED | 20 |
| INITIATIVE_APPROVED | 50 |
| PROJECT_CREATED | 20 |
| PROJECT_COMPLETED | 100 |
| PARTNERSHIP_CREATED | 30 |
| VOLUNTEER_HOUR | 10 |
| VOLUNTEER_APPLICATION | 5 |

### Profile Levels
Beginner (0) → Active (50) → Advanced (150) → Expert (300) → Champion (600+)

### Pages
- `/profile` — Hero card with level badge, 4 stat cards (points/hours/initiatives/badges), badges grid, recent activity feed, leaderboard sidebar

### Seed (Step 13)
6 badges: مبادر / متطوع ناشئ / نشط (50pts) / مساهم متقدم (150pts) / خبير المجتمع (300pts) / بانٍ للشراكات

---

## Phase 7: CMS + Public Portal

### Core Actions (`core/cms/actions.ts`)
- News: `getNewsArticles()`, `getNewsArticle()`, `createNewsArticleAction()`, `updateNewsArticleAction()`, `deleteNewsArticleAction()`
- Events: `getCMSEvents()`, `getCMSEvent()`, `createCMSEventAction()`, `updateCMSEventAction()`, `deleteCMSEventAction()`
- Both use `"use server"` pattern with `revalidatePath()`

### Pages
- `/cms` — CMS dashboard: 4 stat cards + quick links + recent news & upcoming events panels
- `/cms/news` — Full article list table with status badges + "New Article" button
- `/cms/news/new` — Create form (AR/EN title, AR/EN content, excerpt, tags, status radio)
- `/cms/news/[id]` — Article detail + edit form + inline delete action (redirects to `/cms/news`)
- `/cms/events` — Events list table with dates, capacity, status
- `/cms/events/new` — Create form (AR/EN title/description/location, dates, capacity, status)
- `/cms/events/[id]` — Event detail + edit form + inline delete action (redirects to `/cms/events`)

### Shared Form Components
- `app/(platform)/cms/news/news-form.tsx` — reusable for create + edit (controlled by `isEdit` prop)
- `app/(platform)/cms/events/event-form.tsx` — same pattern

### Seed (Step 14)
2 news articles + 2 CMS events with bilingual content

---

## Phase 8: Analytics + Executive Dashboard

### Pure SVG Charts (no external library)
- `shared/components/charts/bar-chart.tsx` — vertical bars with SVG `<rect>` elements + legend + value labels
- `shared/components/charts/donut-chart.tsx` — donut/ring chart using SVG arc paths (polar-to-XY math) + center total + legend
- `shared/components/charts/line-chart.tsx` — line + area fill with grid lines, dots, axis labels

### Core Actions (`core/analytics/actions.ts`)
- `getAnalyticsSummary()` returns `AnalyticsSummary` with:
  - `initiativesByStatus` — `BarDataPoint[]`
  - `projectsByStatus` — `BarDataPoint[]`
  - `volunteerHoursByMonth` — `LineDataPoint[]` (last 6 months from `VolunteerLog`)
  - `sdgDistribution` — `DonutSegment[]` (top 8 SDGs by count)
  - `partnershipsByType` — `BarDataPoint[]`
  - `budgetAllocation` — `DonutSegment[]` (budget by status)
  - `totals` — raw counts for quick KPI chips

### Pages
- `/analytics` — 6 KPI chips + 4 chart panels (Initiatives bar, Projects bar, Vol Hours line, SDG donut, Budget donut, Partnerships bar)

---

## Phase 9: Mobile + PWA + Accessibility Polish

### PWA Manifest (`public/manifest.json`)
- App name: "منصة المسؤولية المجتمعية — جامعة القصيم"
- Short name: "مسؤولية QU"
- `dir: "rtl"`, `lang: "ar"`, `display: "standalone"`, `theme_color: "#1e3a5f"`
- 3 shortcuts: Initiatives, Volunteering, Dashboard
- Icon sizes: 96, 192, 512 (PNG placeholders — replace with real icons)

### Root Layout (`app/layout.tsx`)
- Added `manifest: "/manifest.json"` to metadata
- Added `appleWebApp` metadata for iOS PWA
- Added `viewportFit: "cover"` for notch support
- Skip-to-content link: `<a href="#main-content">` — sr-only, visible on focus

### Main Element
- `shared/components/layout/shell.tsx` — `<main id="main-content">` for skip-link target

### Settings Pages
- `/settings/users` — User table with stats (total/active/pending/suspended) + role column + last login
- `/settings/roles` — Role cards with permission count per module + full permissions-by-module table
- `/settings/general` — Platform identity card + system info table + DB stats + all 10 phases status

---

## Navigation (config/navigation.ts)
- Profile link added to "Overview" group: `/profile` with `Trophy` icon
- Content group: removed duplicate Notifications entry (already in Overview)
- `Trophy` icon imported and registered in `sidebar.tsx`

---

## Seed Steps Summary
| Step | Content |
|---|---|
| 1-10 | Roles, permissions, users, orgs, workflow templates, KB initial data |
| 11 | Phase 3: initiatives, projects, partnerships, volunteer opportunity |
| 12 | Phase 4: 3 KB articles |
| 13 | Phase 6: 6 badges |
| 14 | Phase 7: 2 news articles + 2 CMS events |

---

## SRS Source of Truth

The official SRS is a 121-page Arabic document titled "المشروع للشراكة المجتمعية". All features must be implemented strictly per the SRS. If there is any conflict between this file and the SRS, the SRS takes precedence.
