"use client"

import { Search, Plus, Route, Menu } from "lucide-react"

export function Header({
  query,
  onQueryChange,
  onSuggest,
  onToggleSidebar,
}: {
  query: string
  onQueryChange: (v: string) => void
  onSuggest: () => void
  onToggleSidebar: () => void
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card/60 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Abrir lista de locais"
        className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Route className="size-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <h1 className="text-base font-semibold text-foreground">
            AcessiRota <span className="text-primary">Janaúba</span>
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Guia de Acessibilidade Comercial — Av. do Comércio (Janaúba-MG)
          </p>
        </div>
      </div>

      <div className="relative ml-auto max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar loja na Av. do Comércio..."
          aria-label="Buscar loja na Av. do Comércio"
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="button"
        onClick={onSuggest}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground shadow-md transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden />
        <span className="hidden sm:inline">Sugerir/Avaliar Local</span>
        <span className="sm:hidden">Sugerir</span>
      </button>
    </header>
  )
}
