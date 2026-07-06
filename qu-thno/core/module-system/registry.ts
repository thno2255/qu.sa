import type {
  ModuleManifest,
  NavigationItem,
  PermissionDefinition,
  WidgetDefinition,
  SearchAdapter,
  SearchFilters,
  SearchResult,
} from "./types"

class ModuleRegistry {
  private modules = new Map<string, ModuleManifest>()

  register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.id)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[ModuleRegistry] Module "${manifest.id}" already registered — skipping`)
      }
      return
    }

    const unmet = (manifest.dependencies ?? []).filter((dep) => !this.modules.has(dep))
    if (unmet.length > 0) {
      throw new Error(
        `[ModuleRegistry] Module "${manifest.id}" has unmet dependencies: ${unmet.join(", ")}`
      )
    }

    this.modules.set(manifest.id, manifest)

    if (process.env.NODE_ENV === "development") {
      console.log(`[ModuleRegistry] Registered module: ${manifest.id} v${manifest.version}`)
    }
  }

  get(id: string): ModuleManifest | undefined {
    return this.modules.get(id)
  }

  getAll(includeDisabled = false): ModuleManifest[] {
    const all = Array.from(this.modules.values())
    return includeDisabled ? all : all.filter((m) => m.enabled !== false)
  }

  // Assembled navigation from all active modules (sorted by group)
  getNavigation(userPermissions: string[] = []): NavigationItem[] {
    return this.getAll()
      .flatMap((m) => m.navigation)
      .filter((item) => {
        if (!item.permissions?.length) return true
        return item.permissions.some((p) => userPermissions.includes(p))
      })
  }

  // All permissions across all modules (for seeding the DB)
  getAllPermissions(): PermissionDefinition[] {
    return this.getAll().flatMap((m) => m.permissions)
  }

  // All dashboard widgets from all modules
  getAllWidgets(userPermissions: string[] = []): WidgetDefinition[] {
    return this.getAll()
      .flatMap((m) => m.widgets ?? [])
      .filter((w) => {
        if (!w.permissions?.length) return true
        return w.permissions.some((p) => userPermissions.includes(p))
      })
  }

  // All active search adapters
  getSearchAdapters(): SearchAdapter[] {
    return this.getAll()
      .map((m) => m.searchAdapter)
      .filter((a): a is SearchAdapter => a !== undefined)
  }

  // Federated search across all module adapters
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    const adapters = this.getSearchAdapters()
    const results = await Promise.allSettled(adapters.map((a) => a.search(filters)))

    const allResults: SearchResult[] = []
    results.forEach((r) => {
      if (r.status === "fulfilled") allResults.push(...r.value)
    })

    return allResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }

  hasModule(id: string): boolean {
    return this.modules.has(id)
  }

  getStats(): { total: number; enabled: number; disabled: number } {
    const all = Array.from(this.modules.values())
    const enabled = all.filter((m) => m.enabled !== false).length
    return { total: all.length, enabled, disabled: all.length - enabled }
  }
}

const globalForRegistry = globalThis as unknown as {
  moduleRegistry: ModuleRegistry | undefined
}

export const moduleRegistry =
  globalForRegistry.moduleRegistry ?? new ModuleRegistry()

if (process.env.NODE_ENV !== "production") {
  globalForRegistry.moduleRegistry = moduleRegistry
}
