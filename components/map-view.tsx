"use client"

import dynamic from "next/dynamic"
import type { Place } from "@/lib/places"
import type { MapInnerProps } from "./map-inner"

// Passamos <MapInnerProps> para a função dynamic para o TypeScript reconhecer as props
const MapInner = dynamic<MapInnerProps>(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm font-medium">
      Carregando mapa interativo...
    </div>
  ),
})

interface MapViewProps {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function MapView({ places, selectedId, onSelect }: MapViewProps) {
  return (
    <div className="w-full h-full">
      <MapInner places={places} selectedId={selectedId} onSelect={onSelect} />
    </div>
  )
}