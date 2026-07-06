# ADR-002: Module Manifest System

**Date:** 2026-07-02  
**Status:** Accepted  
**Deciders:** Platform Architecture Team

---

## Context

The platform has 38 modules. Without a system, adding a module would require:
- Manually editing the sidebar navigation config
- Manually adding permissions to the IAM system
- Manually registering search adapters
- Manually adding widgets to the dashboard
- Manually providing AI context

This creates coupling and makes the platform hard to extend.

---

## Decision

Every module declares a **manifest** — a typed object describing its complete capabilities.

The `ModuleRegistry` collects all manifests at startup and provides:
- `getNavigation()` — assembles sidebar from all module navs
- `getAllPermissions()` — assembles DB seed data for IAM
- `getAllWidgets()` — assembles widget palette for dashboard builder
- `getSearchAdapters()` — assembles federated search engine
- `search()` — executes federated search across all adapters

**Adding a new module = create manifest + register. Zero other changes.**

---

## Consequences

**Positive:**
- Modules are truly self-contained — each module knows about itself
- Navigation, permissions, and search are assembled dynamically
- Easy to enable/disable modules per environment (feature flags)
- AI context is module-aware — each module provides its own context
- Strong TypeScript interface (`ModuleManifest`) prevents incomplete implementations

**Negative:**
- Startup cost: all manifests registered synchronously at boot
- `core/module-system/index.ts` must be updated when adding modules
- Import order matters (dependencies must be registered first)

**Mitigations:**
- Registration is fast (just object insertion into a Map)
- The index.ts has clear ordering comments
- Dependency validation throws at startup with clear error message
