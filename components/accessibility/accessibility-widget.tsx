"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Accessibility,
  AArrowUp,
  ArrowDown,
  Ban,
  CheckCircle2,
  Contrast,
  Droplet,
  Eye,
  Link2,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Sparkles,
  Type,
  Underline,
  Volume2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type A11yState = {
  fontScale: number
  spacing: boolean
  dyslexia: boolean
  contrast: boolean
  grayscale: boolean
  invert: boolean
  highlightLinks: boolean
  readingGuide: boolean
  bigCursor: boolean
  stopAnimations: boolean
  screenReader: boolean
}

const DEFAULT_STATE: A11yState = {
  fontScale: 100,
  spacing: false,
  dyslexia: false,
  contrast: false,
  grayscale: false,
  invert: false,
  highlightLinks: false,
  readingGuide: false,
  bigCursor: false,
  stopAnimations: false,
  screenReader: false,
}

const STORAGE_KEY = "acessirota-a11y"
const MIN_SCALE = 100
const MAX_SCALE = 200
const STEP = 10

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [tutorial, setTutorial] = useState(false)
  const [state, setState] = useState<A11yState>(DEFAULT_STATE)
  const guideRef = useRef<HTMLDivElement>(null)

  // Exibe o tutorial de boas-vindas ao carregar o site
  useEffect(() => {
    setTutorial(true)
  }, [])

  // Carrega preferências salvas
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) })
    } catch {
      /* ignore */
    }
  }, [])

  // Aplica as preferências ao conteúdo do site
  useEffect(() => {
    const root = document.documentElement
    const content = document.getElementById("a11y-content")
    if (!content) return

    root.style.fontSize = `${state.fontScale}%`

    content.classList.toggle("a11y-spacing", state.spacing)
    content.classList.toggle("a11y-dyslexia", state.dyslexia)
    content.classList.toggle("a11y-contrast", state.contrast)
    content.classList.toggle("a11y-highlight-links", state.highlightLinks)
    content.classList.toggle("a11y-big-cursor", state.bigCursor)
    content.classList.toggle("a11y-stop-animations", state.stopAnimations)

    const filters: string[] = []
    if (state.grayscale) filters.push("grayscale(1)")
    if (state.invert) filters.push("invert(1)")
    content.style.filter = filters.join(" ")

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }

    return () => {
      root.style.fontSize = ""
    }
  }, [state])

  // Guia de leitura que segue o mouse
  useEffect(() => {
    if (!state.readingGuide) return
    const el = guideRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      el.style.transform = `translateY(${e.clientY}px)`
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [state.readingGuide])

  // Leitor de tela por voz
  useEffect(() => {
    if (!state.screenReader) return
    const synth = window.speechSynthesis
    if (!synth) return

    let lastText = ""
    const speak = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return
      if (target.closest("[data-a11y-panel]")) return
      const text = (target.getAttribute("aria-label") || target.innerText || "").trim().replace(/\s+/g, " ")
      if (!text || text.length > 240 || text === lastText) return
      lastText = text
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = "pt-BR"
      u.rate = 1
      synth.speak(u)
    }

    const onOver = (e: Event) => speak(e.target)
    const onFocus = (e: Event) => speak(e.target)
    document.addEventListener("mouseover", onOver)
    document.addEventListener("focusin", onFocus)
    return () => {
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("focusin", onFocus)
      synth.cancel()
    }
  }, [state.screenReader])

  const set = useCallback(<K extends keyof A11yState>(key: K, value: A11yState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
  }, [])

  const toggle = useCallback((key: keyof A11yState) => {
    setState((s) => ({ ...s, [key]: !s[key] }))
  }, [])

  const changeScale = (dir: 1 | -1) =>
    setState((s) => ({
      ...s,
      fontScale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.fontScale + dir * STEP)),
    }))

  const reset = () => {
    window.speechSynthesis?.cancel()
    setState(DEFAULT_STATE)
  }

  const activeCount = Object.entries(state).filter(([k, v]) =>
    k === "fontScale" ? v !== 100 : v === true,
  ).length

  return (
    <>
      {/* Guia de leitura */}
      {state.readingGuide && (
        <div
          ref={guideRef}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-9 -translate-y-1/2 border-y-2 border-primary bg-primary/25 mix-blend-normal"
        />
      )}

      {/* Tela de Boas-Vindas */}
      {tutorial && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tutorial de boas-vindas"
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        >
          {/* Card Central Suave (Glassmorphism Arredondado) */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-card/90 to-card/95 p-7 md:p-8 text-card-foreground shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
            {/* Brilhos Ambientais em Degradê Suave */}
            <div className="absolute -top-32 -right-32 size-64 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 size-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            {/* Cabeçalho */}
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20 shadow-inner">
                <Accessibility className="size-6" strokeWidth={2.2} />
              </span>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-primary/90">
                  <Sparkles className="size-3" /> Guia de Acessibilidade
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  Bem-vindo ao AcessiRota!
                </h2>
              </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-muted-foreground/90 font-normal">
              Este site foi projetado com carinho para ser fácil e acessível para todos. Escolha as melhores opções para sua leitura:
            </p>

            {/* Grid com chips translúcidos e bordas finas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs md:text-sm font-semibold text-foreground/90 shadow-sm backdrop-blur-sm">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-base">🔤</span>
                Aumento de Fonte
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs md:text-sm font-semibold text-foreground/90 shadow-sm backdrop-blur-sm">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-base">🔊</span>
                Leitor de Voz
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs md:text-sm font-semibold text-foreground/90 shadow-sm backdrop-blur-sm">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-base">🌗</span>
                Alto Contraste
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs md:text-sm font-semibold text-foreground/90 shadow-sm backdrop-blur-sm">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-base">📖</span>
                Fonte p/ Dislexia
              </div>
            </div>

            {/* Caixa de instruções em tom orgânico */}
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-foreground/90 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Como ativar as ferramentas:
              </p>
              <p className="text-sm md:text-base font-medium leading-snug">
                Clique no <strong className="text-primary font-bold underline underline-offset-4">BOTÃO CIRCULAR</strong> no canto inferior esquerdo para personalizar sua navegação.
              </p>
            </div>

            {/* Botão Principal com toque suave e gradiente */}
            <button
              type="button"
              onClick={() => {
                setTutorial(false)
                setOpen(true)
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm md:text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <Accessibility className="size-5" />
              Abrir Painel de Acessibilidade
            </button>
          </div>

          {/* Anéis de Radar centralizados atrás do botão */}
          <div className="fixed bottom-5 left-5 z-[78] size-14 pointer-events-none flex items-center justify-center">
            <span className="absolute size-20 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute size-28 rounded-full bg-primary/15 animate-pulse" />
            <span className="absolute size-36 rounded-full border border-dashed border-primary/40 animate-[spin_10s_linear_infinite]" />
          </div>

          {/* Seta e Tag perfeitamente alinhadas no eixo do botão (width 14 = size 14) */}
          <div className="fixed bottom-24 left-5 w-14 z-[80] flex flex-col items-center justify-center gap-1.5 animate-bounce pointer-events-none">
            <div className="whitespace-nowrap rounded-full border border-primary/30 bg-primary px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-2xl shadow-primary/50">
              Clique Aqui
            </div>
            <ArrowDown className="size-8 text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) */}
      <button
        type="button"
        onClick={() => {
          setTutorial(false)
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-label="Abrir opções de acessibilidade"
        className={cn(
          "fixed bottom-5 left-5 z-[80] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary-foreground/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
          tutorial && "animate-pulse ring-4 ring-primary",
        )}
      >
        <Accessibility className="size-7" strokeWidth={2.4} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[0.7rem] font-bold text-accent-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Painel Lateral Deslizante */}
      <aside
        data-a11y-panel
        role="dialog"
        aria-label="Painel de acessibilidade"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-[90] flex w-[90%] max-w-sm flex-col border-r border-border bg-card text-card-foreground shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Accessibility className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-tight">Acessibilidade</h2>
              <p className="text-xs text-muted-foreground">Ajuste o site às suas necessidades</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar painel"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <Section title="Texto" icon={<Type className="size-4" />}>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <AArrowUp className="size-4 text-primary" /> Tamanho da fonte
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{state.fontScale}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeScale(-1)}
                  disabled={state.fontScale <= MIN_SCALE}
                  aria-label="Diminuir fonte"
                  className="flex size-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Minus className="size-4" />
                </button>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((state.fontScale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => changeScale(1)}
                  disabled={state.fontScale >= MAX_SCALE}
                  aria-label="Aumentar fonte"
                  className="flex size-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <ToggleRow
              icon={<Underline className="size-4" />}
              label="Espaçamento ampliado"
              desc="Aumenta o espaço entre linhas e letras"
              checked={state.spacing}
              onChange={() => toggle("spacing")}
            />
            <ToggleRow
              icon={<Type className="size-4" />}
              label="Fonte para dislexia"
              desc="Ativa uma fonte de alta legibilidade"
              checked={state.dyslexia}
              onChange={() => toggle("dyslexia")}
            />
          </Section>

          <Section title="Visual" icon={<Eye className="size-4" />}>
            <ToggleRow
              icon={<Contrast className="size-4" />}
              label="Alto contraste"
              desc="Fundo preto puro e texto amarelo"
              checked={state.contrast}
              onChange={() => toggle("contrast")}
            />
            <ToggleRow
              icon={<Droplet className="size-4" />}
              label="Escala de cinza"
              desc="Deixa o site monocromático"
              checked={state.grayscale}
              onChange={() => toggle("grayscale")}
            />
            <ToggleRow
              icon={<Eye className="size-4" />}
              label="Inverter cores"
              desc="Inverte todas as cores da tela"
              checked={state.invert}
              onChange={() => toggle("invert")}
            />
          </Section>

          <Section title="Navegação e foco" icon={<MousePointer2 className="size-4" />}>
            <ToggleRow
              icon={<Link2 className="size-4" />}
              label="Destacar links"
              desc="Sublinha e realça links e botões"
              checked={state.highlightLinks}
              onChange={() => toggle("highlightLinks")}
            />
            <ToggleRow
              icon={<Underline className="size-4" />}
              label="Guia de leitura"
              desc="Linha que acompanha o mouse"
              checked={state.readingGuide}
              onChange={() => toggle("readingGuide")}
            />
            <ToggleRow
              icon={<MousePointer2 className="size-4" />}
              label="Cursor gigante"
              desc="Amplia o ponteiro do mouse"
              checked={state.bigCursor}
              onChange={() => toggle("bigCursor")}
            />
          </Section>

          <Section title="Recursos extras" icon={<Volume2 className="size-4" />}>
            <ToggleRow
              icon={<Ban className="size-4" />}
              label="Bloquear animações"
              desc="Remove transições e efeitos"
              checked={state.stopAnimations}
              onChange={() => toggle("stopAnimations")}
            />
            <ToggleRow
              icon={<Volume2 className="size-4" />}
              label="Leitor de tela (voz)"
              desc="Lê o texto ao passar o mouse"
              checked={state.screenReader}
              onChange={() => toggle("screenReader")}
            />
          </Section>
        </div>

        <footer className="border-t border-border p-4">
          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/60 py-2.5 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" /> Restaurar padrões
          </button>
        </footer>
      </aside>
    </>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function ToggleRow({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-primary/60 bg-primary/10" : "border-border bg-secondary/40 hover:bg-secondary",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
          checked ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-card shadow transition-all",
            checked ? "left-[1.125rem]" : "left-0.5",
          )}
        />
      </span>
    </button>
  )
}