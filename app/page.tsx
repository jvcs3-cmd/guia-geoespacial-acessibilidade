"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { PLACES, type AccessKey } from "@/lib/places"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MapView } from "@/components/map-view"
import { SuggestDialog } from "@/components/suggest-dialog"
import { cn } from "@/lib/utils"

export default function Page() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<AccessKey[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filtra as lojas por texto de busca e por filtros de acessibilidade
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PLACES.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      const matchesFilters = filters.every((f) => p.access.includes(f))
      return matchesQuery && matchesFilters
    })
  }, [query, filters])

  const toggleFilter = (key: AccessKey) =>
    setFilters((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]))

  const handleSelect = (id: string | null) => {
    setSelectedId(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header
        query={query}
        onQueryChange={setQuery}
        onSuggest={() => setSuggestOpen(true)}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar — fixa no desktop, drawer no mobile */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-40 w-[85%] max-w-sm transition-transform duration-300 md:static md:z-auto md:w-80 md:max-w-none md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar lista"
              className="absolute right-3 top-3 z-10 rounded-md border border-border bg-card p-1 text-muted-foreground md:hidden"
            >
              <X className="size-4" />
            </button>
            <Sidebar
              filters={filters}
              onToggleFilter={toggleFilter}
              onClearFilters={() => setFilters([])}
              places={filtered}
              allPlaces={PLACES}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Overlay do drawer no mobile */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 z-30 bg-[oklch(0.1_0.02_264)]/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Mapa com transição e seleção integrada */}
        <main className="min-w-0 flex-1">
          <MapView 
            places={filtered} 
            selectedId={selectedId} 
            onSelect={handleSelect} 
          />
        </main>
      </div>

      <SuggestDialog open={suggestOpen} onClose={() => setSuggestOpen(false)} />
    </div>
  )
}