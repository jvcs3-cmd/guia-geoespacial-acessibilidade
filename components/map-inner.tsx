"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { PLACES, Place, ACCESS_MAP } from "@/lib/places"

const janaubaCoords: [number, number] = [-15.8047, -43.3084]

const avenidaBounds: L.LatLngBoundsExpression = [
  [-15.8140, -43.3130],
  [-15.7930, -43.3040]
]

const getCategoryClass = (category: string) => {
  if (category.includes("Financeira")) return "pin-financeiro"
  if (category.includes("Móveis e Eletrodomésticos")) return "pin-eletro"
  if (category.includes("Departamentos")) return "pin-departamentos"
  if (category.includes("Lar")) return "pin-lar"
  return "pin-eletro"
}

function MapController({ selectedId }: { selectedId: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedId) {
      const place = PLACES.find((p) => p.id === selectedId)
      if (place) {
        map.flyTo([place.lat, place.lng], 18, {
          duration: 1.2,
          easeLinearity: 0.25,
        })
      }
    }
  }, [selectedId, map])

  return null
}

export interface MapInnerProps {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function MapInner({ places, selectedId, onSelect }: MapInnerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId]?.openPopup()
    }
  }, [selectedId])

  if (!isMounted) return null

  const createCustomIcon = (name: string, category: string) => {
    const categoryClass = getCategoryClass(category)

    return L.divIcon({
      className: "custom-pin-wrapper",
      html: `
        <div class="pin-wrapper ${categoryClass}">
          <div class="pin-badge">
            <span class="pin-dot"></span>
            <span style="max-width: 135px; overflow: hidden; text-overflow: ellipsis; display: inline-block;">${name}</span>
          </div>
          <div class="pin-pointer"></div>
        </div>
      `,
      iconSize: [160, 38],
      iconAnchor: [80, 38],
    })
  }

  return (
    <MapContainer
      key="janauba-map-container"
      center={janaubaCoords}
      zoom={17}
      minZoom={15}
      maxZoom={19}
      maxBounds={avenidaBounds}
      maxBoundsViscosity={0.8}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController selectedId={selectedId} />

      {places.map((place: Place) => (
        <Marker 
          key={place.id} 
          position={[place.lat, place.lng]} 
          icon={createCustomIcon(place.name, place.category)}
          ref={(ref) => {
            if (ref) markerRefs.current[place.id] = ref
          }}
          eventHandlers={{
            click: () => onSelect(place.id)
          }}
        >
          <Popup>
            <div className="p-4 w-72 text-zinc-100 font-sans leading-relaxed">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {place.category}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  place.rating > 0 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}>
                  {place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : "Pendente"}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 tracking-tight leading-snug">
                {place.name}
              </h3>

              <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                <span>📍</span> {place.address}
              </p>

              <div className="pt-3 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                  Acessibilidade Mapeada:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {place.access.map((accKey) => {
                    const accInfo = ACCESS_MAP[accKey]
                    return accInfo ? (
                      <span 
                        key={accKey} 
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                      >
                        {accInfo.short}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}