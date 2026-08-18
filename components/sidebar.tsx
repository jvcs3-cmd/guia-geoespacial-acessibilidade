"use client"

import { SlidersHorizontal, MapPinned, FilterX } from "lucide-react"
import { ACCESS_TYPES, type AccessKey, type Place } from "@/lib/places"
import { PlaceCard } from "@/components/place-card"
import { SurveyMetrics } from "@/components/survey-metrics"
import { cn } from "@/lib/utils"

export function Sidebar({
  filters,
  onToggleFilter,
  onClearFilters,
  places,
  allPlaces,
  selectedId,
  onSelect,
}: {
  filters: AccessKey[]
  onToggleFilter: (key: AccessKey) => void
  onClearFilters: () => void
  places: Place[]
  allPlaces: Place[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-border bg-sidebar md:border-r">
      {/* Métricas gerais da pesquisa */}
      <SurveyMetrics places={allPlaces} />

      {/* Filtros */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden />
            Filtrar por acessibilidade
          </h2>
          {filters.length > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FilterX className="size-3.5" aria-hidden />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ACCESS_TYPES.map((t) => {
            const active = filters.includes(t.key)
            const Icon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onToggleFilter(t.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {t.short}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de locais */}
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <MapPinned className="size-4 text-primary" aria-hidden />
          Locais em destaque
        </h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {places.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-6">
        {places.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum estabelecimento encontrado com os filtros atuais.
          </p>
        ) : (
          places.map((p) => (
            <PlaceCard key={p.id} place={p} active={p.id === selectedId} onSelect={onSelect} />
          ))
        )}
      </div>
    </aside>
  )
}
