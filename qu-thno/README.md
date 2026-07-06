# منصة المسؤولية المجتمعية
## Community Responsibility Platform — Qassim University

An enterprise platform for managing community initiatives, projects, partnerships, volunteering, impact measurement, and AI-powered community responsibility reporting.

---

## Tech Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **React 19** — Latest React with concurrent features
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — RTL-first with logical properties
- **Prisma** — Type-safe PostgreSQL ORM
- **NextAuth v5** — Authentication with SSO support
- **Redis + BullMQ** — Caching and background jobs
- **Anthropic Claude** — AI assistant (best Arabic support)
- **next-intl** — Arabic (default) + English i18n

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
qu-thno/
├── app/              # Routes (routing only)
├── modules/          # 30+ feature modules (self-contained)
├── core/             # Shared infrastructure
├── shared/           # Shared UI components
├── prisma/           # Database schema (23 domains)
├── public/locales/   # Arabic & English translations
└── docs/             # Architecture docs & ADRs
```

See [CLAUDE.md](./CLAUDE.md) for developer guide.  
See [docs/architecture/00-overview.md](./docs/architecture/00-overview.md) for architecture overview.

---

## Documentation

| Doc | Purpose |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Developer guide, conventions, quick reference |
| [docs/architecture/](docs/architecture/) | System design documentation |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/modules/](docs/modules/) | Per-module documentation |
| [docs/deployment/](docs/deployment/) | Deployment guides (Vercel, VPS, Docker) |

---

## Development Phases

- **Phase 0** ✅ Foundation (current) — infrastructure, module system, schema
- **Phase 1** 🔜 IAM — users, roles, permissions, authentication
- **Phase 2** → Workflow Engine, Forms Builder, Rules Engine
- **Phase 3** → Core modules (Initiatives, Projects, Partnerships)
- **Phase 4** → Volunteering, Impact, Budget
- **Phase 5** → Analytics, Reports, AI Assistant
- **Phase 6** → CMS, Notifications, Communications
- **Phase 7** → Enterprise Search, Dashboard Builder
- **Phase 8+** → Public Portal, Compliance, Integrations, Launch

---

*Built for جامعة القصيم — Qassim University*
