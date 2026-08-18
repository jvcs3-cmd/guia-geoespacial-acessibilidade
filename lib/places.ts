import type { LucideIcon } from "lucide-react"
import { Accessibility, Eye, Ear, Brain, HeartHandshake } from "lucide-react"

export type AccessKey = "fisica" | "visual" | "auditiva" | "neuro" | "idosos"

export type AccessType = {
  key: AccessKey
  label: string
  short: string
  description: string
  icon: LucideIcon
  /** classes utilitárias para as badges/pins */
  badge: string
  dot: string
}

export const ACCESS_TYPES: AccessType[] = [
  {
    key: "fisica",
    label: "PcD Física (cadeirante)",
    short: "Física",
    description: "Rampas, portas largas e banheiro adaptado",
    icon: Accessibility,
    badge: "bg-[oklch(0.62_0.19_258)]/15 text-[oklch(0.72_0.15_258)] border-[oklch(0.62_0.19_258)]/30",
    dot: "bg-[oklch(0.62_0.19_258)]",
  },
  {
    key: "visual",
    label: "PcD Visual (cego / baixa visão)",
    short: "Visual",
    description: "Piso tátil, braile e alto contraste",
    icon: Eye,
    badge: "bg-[oklch(0.75_0.16_85)]/15 text-[oklch(0.82_0.14_85)] border-[oklch(0.75_0.16_85)]/30",
    dot: "bg-[oklch(0.75_0.16_85)]",
  },
  {
    key: "auditiva",
    label: "PcD Auditiva / Sensorial",
    short: "Auditiva",
    description: "Atendimento em Libras e sinalização visual",
    icon: Ear,
    badge: "bg-[oklch(0.7_0.16_165)]/15 text-[oklch(0.78_0.14_165)] border-[oklch(0.7_0.16_165)]/30",
    dot: "bg-[oklch(0.7_0.16_165)]",
  },
  {
    key: "neuro",
    label: "Neurodivergente (TEA)",
    short: "Neuro",
    description: "Ambiente calmo, baixa estimulação sensorial",
    icon: Brain,
    badge: "bg-[oklch(0.58_0.21_292)]/15 text-[oklch(0.72_0.17_292)] border-[oklch(0.58_0.21_292)]/30",
    dot: "bg-[oklch(0.58_0.21_292)]",
  },
  {
    key: "idosos",
    label: "Idosos / Gestantes",
    short: "Prioritário",
    description: "Assentos prioritários e atendimento preferencial",
    icon: HeartHandshake,
    badge: "bg-[oklch(0.68_0.19_25)]/15 text-[oklch(0.76_0.16_25)] border-[oklch(0.68_0.19_25)]/30",
    dot: "bg-[oklch(0.68_0.19_25)]",
  },
]

export function getRatingTone(rating: number): {
  badge: string
  label: "Alta" | "Média" | "Baixa" | "Pendente"
} {
  if (rating === 0) {
    return {
      badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
      label: "Pendente",
    }
  }
  if (rating >= 4.0) {
    return {
      badge: "bg-[oklch(0.7_0.16_165)]/15 text-[oklch(0.8_0.14_165)] border-[oklch(0.7_0.16_165)]/35",
      label: "Alta",
    }
  }
  if (rating >= 2.5) {
    return {
      badge: "bg-[oklch(0.75_0.16_85)]/15 text-[oklch(0.84_0.14_85)] border-[oklch(0.75_0.16_85)]/35",
      label: "Média",
    }
  }
  return {
    badge: "bg-[oklch(0.63_0.22_25)]/15 text-[oklch(0.74_0.19_25)] border-[oklch(0.63_0.22_25)]/35",
    label: "Baixa",
  }
}

export type SurveyMetrics = {
  total: number
  accessibilityIndex: number
  averageRating: number
}

export function getSurveyMetrics(places: Place[]): SurveyMetrics {
  const total = places.length
  if (total === 0) {
    return { total: 0, accessibilityIndex: 0, averageRating: 0 }
  }
  const totalCriteria = ACCESS_TYPES.length
  const coverage =
    places.reduce((sum, p) => sum + p.access.length / totalCriteria, 0) / total
  const ratedPlaces = places.filter((p) => p.rating > 0)
  const averageRating =
    ratedPlaces.length > 0
      ? ratedPlaces.reduce((sum, p) => sum + p.rating, 0) / ratedPlaces.length
      : 0

  return {
    total,
    accessibilityIndex: Math.round(coverage * 100),
    averageRating,
  }
}

export function buildSurveyCsv(places: Place[]): string {
  const header = [
    "Estabelecimento",
    "Categoria",
    "Endereco",
    "Nota Media",
    "Avaliacoes",
    "Recursos de Acessibilidade",
  ]
  const rows = places.map((p) => [
    p.name,
    p.category,
    p.address,
    p.rating.toFixed(1),
    String(p.reviews),
    p.access.map((a) => ACCESS_MAP[a]?.short || a).join(" | "),
  ])
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\n")
}

export const ACCESS_MAP: Record<AccessKey, AccessType> = ACCESS_TYPES.reduce(
  (acc, t) => {
    acc[t.key] = t
    return acc
  },
  {} as Record<AccessKey, AccessType>,
)

export type Place = {
  id: string
  name: string
  category: string
  address: string
  rating: number
  reviews: number
  access: AccessKey[]
  lat: number
  lng: number
  x?: number
  y?: number
}

export const PLACES: Place[] = [
  {
    id: "zema-eletro",
    name: "Zema (Loja Eletro 61)",
    category: "Móveis e Eletrodomésticos",
    address: "Avenida do Comércio, 306 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica"],
    lat: -15.803091864953938,
    lng: -43.309077322698364,
  },
  {
    id: "caixa-economica",
    name: "Caixa Econômica Federal (Ag. Agro)",
    category: "Instituição Financeira",
    address: "Avenida do Comércio, 411 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica", "idosos"],
    lat: -15.804523712896682,
    lng: -43.30841778849695,
  },
  {
    id: "magalu",
    name: "Magazine Luiza (Magalu)",
    category: "Lojas de Departamentos",
    address: "Avenida do Comércio, 430 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica", "visual"],
    lat: -15.80498502216053,
    lng: -43.30875505586162,
  },
  {
    id: "banco-do-brasil",
    name: "Banco do Brasil",
    category: "Instituição Financeira",
    address: "Avenida do Comércio, 485 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica", "auditiva", "idosos"],
    lat: -15.805383499396331,
    lng: -43.3083005129584,
  },
  {
    id: "casas-bahia",
    name: "Casas Bahia",
    category: "Móveis e Eletrodomésticos",
    address: "Avenida do Comércio, 559 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica"],
    lat: -15.806088400457124,
    lng: -43.3080825007602,
  },
  {
    id: "bendicasa",
    name: "Bendicasa",
    category: "Móveis e Artigos para o Lar",
    address: "Avenida do Comércio, 568 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica", "neuro"],
    lat: -15.806193800421287,
    lng: -43.308295196156266,
  },
  {
    id: "americanas-express",
    name: "Lojas Americanas Express",
    category: "Lojas de Departamentos",
    address: "Avenida do Comércio, 597 — Centro",
    rating: 0.0,
    reviews: 0,
    access: ["fisica", "visual", "neuro"],
    lat: -15.806368533564228,
    lng: -43.307952814763674,
  },
]