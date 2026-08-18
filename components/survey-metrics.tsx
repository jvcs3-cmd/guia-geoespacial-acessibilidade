import { Store, Gauge, Star } from "lucide-react"
import { getSurveyMetrics, type Place } from "@/lib/places"

export function SurveyMetrics({ places }: { places: Place[] }) {
  const { total, accessibilityIndex, averageRating } = getSurveyMetrics(places)

  const items = [
    {
      icon: Store,
      value: String(total),
      label: "Lojas avaliadas",
      tone: "text-[oklch(0.72_0.15_258)]",
    },
    {
      icon: Gauge,
      value: `${accessibilityIndex}%`,
      label: "Índice de acessib.",
      tone: "text-[oklch(0.78_0.14_165)]",
    },
    {
      icon: Star,
      value: `${averageRating.toFixed(1)}`,
      label: "Média geral / 5.0",
      tone: "text-[oklch(0.82_0.14_85)]",
    },
  ]

  return (
    <section
      aria-label="Métricas gerais da pesquisa na Avenida do Comércio"
      className="border-b border-border bg-card/40 p-4"
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Panorama da Avenida do Comércio
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div
              key={it.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card px-2 py-3 text-center"
            >
              <Icon className={`size-4 ${it.tone}`} aria-hidden />
              <span className="text-lg font-bold leading-none text-card-foreground">{it.value}</span>
              <span className="text-[10px] leading-tight text-muted-foreground text-pretty">{it.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
