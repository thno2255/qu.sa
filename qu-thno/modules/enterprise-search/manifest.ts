import type { ModuleManifest } from "@/core/module-system/types"

export const enterpriseSearchManifest: ModuleManifest = {
  id: "enterprise-search",
  version: "1.0.0",
  name: { ar: "البحث الموحد", en: "Enterprise Search" },
  description: {
    ar: "بحث موحد وذكي عبر جميع وحدات المنصة مع دعم البحث الدلالي",
    en: "Unified intelligent search across all platform modules with semantic search support",
  },
  icon: "Search",
  color: "#0891b2",

  navigation: [
    {
      id: "search",
      label: { ar: "البحث الموحد", en: "Enterprise Search" },
      href: "/search",
      icon: "Search",
      group: "overview",
    },
  ],

  permissions: [
    {
      id: "search:read",
      name: { ar: "استخدام البحث", en: "Use Search" },
      description: { ar: "البحث في محتوى المنصة", en: "Search platform content" },
      category: "enterprise-search",
    },
    {
      id: "search:admin",
      name: { ar: "إدارة البحث", en: "Manage Search" },
      description: { ar: "إدارة فهرس البحث وإعاداته", en: "Manage search index and settings" },
      category: "enterprise-search",
    },
  ],

  events: {
    emits: [
      {
        name: "search.queried",
        description: "A search was performed",
        schema: { query: "string", userId: "string", resultCount: "number" },
      },
    ],
    listens: [
      {
        event: "initiative.created",
        handlerPath: "@/modules/enterprise-search/indexers/on-initiative-created",
      },
      {
        event: "initiative.updated",
        handlerPath: "@/modules/enterprise-search/indexers/on-initiative-updated",
      },
      {
        event: "project.created",
        handlerPath: "@/modules/enterprise-search/indexers/on-project-created",
      },
      {
        event: "partnership.created",
        handlerPath: "@/modules/enterprise-search/indexers/on-partnership-created",
      },
    ],
  },

  apiPrefix: "/api/v1/search",
  apiRoutes: [
    { method: "GET", path: "/", description: "Search across all modules", permissions: ["search:read"] },
    { method: "POST", path: "/reindex", description: "Reindex a module", permissions: ["search:admin"] },
    { method: "GET", path: "/suggestions", description: "Get search suggestions", permissions: ["search:read"] },
  ],

  widgets: [
    {
      id: "search-bar",
      name: { ar: "شريط البحث", en: "Search Bar" },
      description: { ar: "شريط بحث موحد للوحة التحكم", en: "Unified search bar for dashboard" },
      category: "utility",
      defaultSize: { w: 12, h: 1, minW: 6, minH: 1 },
      componentPath: "@/modules/enterprise-search/components/global-search/search-bar",
      dataSourcePath: "@/modules/enterprise-search/actions/search",
    },
  ],

  enabled: true,
}
