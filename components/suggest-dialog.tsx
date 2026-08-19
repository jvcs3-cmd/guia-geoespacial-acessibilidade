"use client"

import { useEffect, useRef, useState } from "react"
import { X, MapPinPlus, Check, Star } from "lucide-react"
import { ACCESS_TYPES, type AccessKey } from "@/lib/places"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

type Criterion = { id: string; label: string }
type Section = { title: string; items: Criterion[] }

const RATING_SECTIONS: Section[] = [
  {
    title: "Calçada e acesso externo",
    items: [
      { id: "calcada-largura", label: "Espaço livre e largura da calçada para pedestres" },
      { id: "calcada-piso", label: "Qualidade do piso da calçada (firme, regular e antiderrapante)" },
      { id: "calcada-obstaculos", label: "Ausência de obstáculos na passagem externa" },
      { id: "rebaixamento", label: "Presença de rebaixamento de calçada" },
    ],
  },
  {
    title: "Entrada do estabelecimento",
    items: [
      { id: "entrada-nivel", label: "Nível de acesso na entrada (ausência de degraus ou desníveis)" },
      { id: "entrada-rampa", label: "Presença de rampa ou recursos de acesso na entrada" },
      { id: "porta-largura", label: "Largura da porta de entrada para cadeirantes" },
    ],
  },
  {
    title: "Circulação e atendimento interno",
    items: [
      { id: "corredores", label: "Espaço dos corredores internos e circulação entre produtos" },
      { id: "obstaculos-internos", label: "Ausência de obstáculos internos para alcançar serviços/produtos" },
      { id: "balcao", label: "Balcão ou caixa de atendimento adaptado em altura" },
      { id: "atendimento", label: "Atendimento adaptado para pessoas com tratamento especial" },
    ],
  },
  {
    title: "Estruturas de apoio",
    items: [
      { id: "provador", label: "Provador acessível" },
      { id: "banheiro", label: "Banheiro adaptado para clientes" },
      { id: "autonomia", label: "Sensação geral de autonomia e segurança" },
      { id: "assentos", label: "Assentos para grávidas e pessoas com prioridade" },
    ],
  },
]

const ALL_CRITERIA = RATING_SECTIONS.flatMap((s) => s.items)

const RATING_LEGEND = [
  { range: "0", label: "Totalmente inacessível", dot: "bg-[oklch(0.63_0.22_25)]" },
  { range: "1–2", label: "Ruim / Com obstáculos", dot: "bg-[oklch(0.68_0.19_45)]" },
  { range: "3–4", label: "Parcialmente acessível", dot: "bg-[oklch(0.75_0.16_85)]" },
  { range: "5", label: "Excelente / Total autonomia", dot: "bg-[oklch(0.7_0.16_165)]" },
]

function StarRating({
  value,
  onChange,
  labelId,
}: {
  value: number
  onChange: (v: number) => void
  labelId: string
}) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="flex items-center gap-1" role="group" aria-labelledby={labelId}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} de 5 estrelas`}
          aria-pressed={value === n}
          className="rounded p-0.5 text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              n <= active ? "fill-[oklch(0.75_0.16_85)] text-[oklch(0.75_0.16_85)]" : "text-muted-foreground/40",
            )}
            aria-hidden
          />
        </button>
      ))}
      <span className="ml-1.5 w-8 text-xs tabular-nums text-muted-foreground">{value ? `${value}/5` : "—"}</span>
    </div>
  )
}

export function SuggestDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [selected, setSelected] = useState<AccessKey[]>([])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [justification, setJustification] = useState("")
  const [justError, setJustError] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const justRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) {
      setSelected([])
      setRatings({})
      setJustification("")
      setJustError(false)
      setDone(false)
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const toggle = (k: AccessKey) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))

  const setRating = (id: string, v: number) => setRatings((r) => ({ ...r, [id]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (justification.trim().length < 10) {
      setJustError(true)
      justRef.current?.focus()
      return
    }

    setLoading(true)

    const form = e.currentTarget as HTMLFormElement
    const placeName = (form.elements.namedItem("place-name") as HTMLInputElement)?.value || "Estabelecimento Sem Nome"
    const observations = (form.elements.namedItem("observations") as HTMLTextAreaElement)?.value || ""

    const recursosFormatados = selected.length > 0 ? selected.join(", ") : "Nenhum"

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .insert([
          {
            nome_loja: placeName,
            comentario: justification,
            destaque_especifico: observations,
            recursos: recursosFormatados,

            // As 15 notas mapeadas diretamente para as colunas do banco
            calcada_largura: ratings["calcada-largura"] ?? 0,
            calcada_piso: ratings["calcada-piso"] ?? 0,
            calcada_obstaculos: ratings["calcada-obstaculos"] ?? 0,
            rebaixamento: ratings["rebaixamento"] ?? 0,
            entrada_nivel: ratings["entrada-nivel"] ?? 0,
            entrada_rampa: ratings["entrada-rampa"] ?? 0,
            porta_largura: ratings["porta-largura"] ?? 0,
            corredores: ratings["corredores"] ?? 0,
            obstaculos_internos: ratings["obstaculos-internos"] ?? 0,
            balcao: ratings["balcao"] ?? 0,
            atendimento: ratings["atendimento"] ?? 0,
            provador: ratings["provador"] ?? 0,
            banheiro: ratings["banheiro"] ?? 0,
            autonomia: ratings["autonomia"] ?? 0,
            assentos: ratings["assentos"] ?? 0,

            // Mantém suporte para resumo geral
            nota_calcada: ratings["calcada-piso"] || ratings["calcada-largura"] || 0,
            nota_entrada: ratings["entrada-nivel"] || ratings["entrada-rampa"] || 0
          }
        ])

      if (error) {
        console.error("Erro ao salvar no Supabase:", error)
        alert("Erro ao enviar avaliação para o banco de dados.")
      } else {
        setDone(true)
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      alert("Ocorreu um erro ao tentar se conectar ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  const ratedCount = ALL_CRITERIA.filter((c) => ratings[c.id]).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[oklch(0.1_0.02_264)]/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-title"
        className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPinPlus className="size-5" aria-hidden />
            </span>
            <div>
              <h2 id="suggest-title" className="font-semibold text-card-foreground">
                Sugerir / Avaliar local
              </h2>
              <p className="text-xs text-muted-foreground">Ajude a mapear a Av. do Comércio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[oklch(0.7_0.16_165)]/20 text-[oklch(0.78_0.14_165)]">
              <Check className="size-6" />
            </span>
            <p className="font-medium text-card-foreground">Avaliação enviada!</p>
            <p className="text-sm text-muted-foreground">
              Obrigado por contribuir com a acessibilidade da Av. do Comércio.
            </p>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <label htmlFor="place-name" className="text-sm font-medium text-card-foreground">
                  Nome do estabelecimento
                </label>
                <input
                  id="place-name"
                  name="place-name"
                  required
                  placeholder="Ex.: Supermercado Central"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="place-address" className="text-sm font-medium text-card-foreground">
                  Endereço
                </label>
                <input
                  id="place-address"
                  name="place-address"
                  required
                  placeholder="Av. do Comércio, nº — Centro"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-card-foreground">Recursos de acessibilidade</span>
                <div className="flex flex-wrap gap-2">
                  {ACCESS_TYPES.map((t) => {
                    const active = selected.includes(t.key)
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => toggle(t.key)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <t.icon className="size-3.5" aria-hidden />
                        {t.short}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-card-foreground">Avaliação detalhada de acessibilidade</h3>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {ratedCount}/{ALL_CRITERIA.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-lg border border-border bg-card/60 p-3 sm:grid-cols-4">
                  {RATING_LEGEND.map((l) => (
                    <div key={l.range} className="flex items-start gap-1.5">
                      <span className={cn("mt-1 size-2 shrink-0 rounded-full", l.dot)} aria-hidden />
                      <div className="leading-tight">
                        <span className="block text-xs font-semibold tabular-nums text-card-foreground">{l.range}</span>
                        <span className="block text-[11px] text-muted-foreground">{l.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {RATING_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {section.items.map((c) => (
                        <li
                          key={c.id}
                          className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                        >
                          <span id={`lbl-${c.id}`} className="text-sm text-card-foreground sm:flex-1">
                            {c.label}
                          </span>
                          <StarRating
                            value={ratings[c.id] || 0}
                            onChange={(v) => setRating(c.id, v)}
                            labelId={`lbl-${c.id}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="justification" className="text-sm font-medium text-card-foreground">
                  Justificativa das notas <span className="text-[oklch(0.7_0.2_25)]">*</span>
                </label>
                <textarea
                  id="justification"
                  name="justification"
                  ref={justRef}
                  rows={3}
                  value={justification}
                  aria-required="true"
                  aria-invalid={justError}
                  onChange={(e) => {
                    setJustification(e.target.value)
                    if (justError && e.target.value.trim().length >= 10) setJustError(false)
                  }}
                  placeholder="Explique as notas atribuídas ou sugira melhorias de acessibilidade para o local."
                  className={cn(
                    "w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    justError
                      ? "border-[oklch(0.63_0.22_25)] focus:border-[oklch(0.63_0.22_25)] focus:ring-[oklch(0.63_0.22_25)]"
                      : "border-input focus:border-primary focus:ring-ring",
                  )}
                />
                {justError && (
                  <p className="text-xs text-[oklch(0.7_0.2_25)]">
                    Por favor, escreva uma justificativa com pelo menos 10 caracteres.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="observations" className="text-sm font-medium text-card-foreground">
                  Pontos específicos ou destaques{" "}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <textarea
                  id="observations"
                  name="observations"
                  rows={3}
                  placeholder="Conte algo particular que você vivenciou neste estabelecimento."
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="border-t border-border p-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}