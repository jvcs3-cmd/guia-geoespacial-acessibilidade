"use client"

import { MapPin, Star } from "lucide-react"
import { getRatingTone, type Place } from "@/lib/places"
import { AccessBadge } from "@/components/access-badge"
import { cn } from "@/lib/utils"

export function PlaceCard({
  place,
  active,
  onSelect,
}: {
  place: Place
  active: boolean
  onSelect: (id: string) => void
}) {
  const tone = getRatingTone(place.rating)
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      aria-pressed={active}
      className={cn(
        "w-full rounded-xl border bg-card p-3 text-left transition-colors",
        "hover:border-primary/50 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-card-foreground">{place.name}</h3>
          <p className="text-xs text-muted-foreground">{place.category}</p>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold",
            tone.badge,
          )}
          title={`Nota média: ${place.rating.toFixed(1)} de 5 — acessibilidade ${tone.label.toLowerCase()}`}
        >
          <Star className="size-3 fill-current" aria-hidden />
          {place.rating.toFixed(1)}/5
        </span>
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span className="leading-snug">{place.address}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {place.access.map((a) => (
          <AccessBadge key={a} type={a} />
        ))}
      </div>
    </button>
  )
}
