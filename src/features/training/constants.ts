import {
  ArrowsClockwiseIcon,
  ClockCountdownIcon,
  ClipboardTextIcon,
  ForkKnifeIcon,
} from "@phosphor-icons/react"
import type {
  IntensificationTechnique,
  PplWorkoutType,
  UpperLowerWorkoutType,
} from "@/lib/training-types"
import type { PlannedType, TipItem, WeekMode } from "@/features/training/types"

export const THEME_STORAGE_KEY = "treinos-theme-preference"

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]

export const WEEK_MODE_LABELS: Record<WeekMode, string> = {
  "ppl-6": "PPL 6x",
  "ppl-3": "PPL 3x",
  "upper-lower-4": "Upper/Lower 4x",
}

export const TYPE_LABELS: Record<PlannedType, string> = {
  push: "Push",
  pull: "Pull",
  leg: "Legs",
  "upper-a": "Upper A",
  "upper-b": "Upper B",
  "lower-a": "Lower A",
  "lower-b": "Lower B",
  rest: "Descanso",
}

export const PPL_TYPES: PplWorkoutType[] = ["push", "pull", "leg"]
export const UPPER_LOWER_TYPES: UpperLowerWorkoutType[] = ["upper-a", "lower-a", "upper-b", "lower-b"]

export const WEEK_PATTERNS: Record<WeekMode, PlannedType[]> = {
  "ppl-6": ["push", "pull", "leg", "push", "pull", "leg", "rest"],
  "ppl-3": ["push", "rest", "pull", "rest", "leg", "rest", "rest"],
  "upper-lower-4": ["upper-a", "lower-a", "rest", "upper-b", "lower-b", "rest", "rest"],
}

export const TECHNIQUE_LABELS: Record<IntensificationTechnique, string> = {
  dropset: "Dropset",
  "rest-pause": "Rest-Pause",
  superset: "Superset",
  "myo-reps": "Myo-reps",
}

export const RPE_OPTIONS = [6, 7, 8, 9, 10] as const

export const INFO_CARDS = [
  { label: "Modelo", value: "PPL + Upper/Lower" },
  { label: "Objetivo", value: "Progressão sustentável" },
  { label: "Rastreamento", value: "Por série (RPE/RIR)" },
  { label: "Recuperação", value: "Sono + Readiness" },
]

export const TIPS: TipItem[] = [
  {
    title: "Progressão Conservadora",
    icon: ArrowsClockwiseIcon,
    items: [
      "Suba carga apenas quando desempenho e RPE confirmarem evolução.",
      "Use step loading: consolide repetições antes de aumentar peso.",
      "Não persiga PR em toda sessão.",
    ],
  },
  {
    title: "Frequência e Volume",
    icon: ClockCountdownIcon,
    items: [
      "Distribua o volume semanal em 2-3 estímulos por músculo.",
      "Evite junk volume em sessões longas.",
      "Se a recuperação cair, reduza volume antes de cortar frequência.",
    ],
  },
  {
    title: "Readiness",
    icon: ClipboardTextIcon,
    items: [
      "Durma 7-9h para preservar performance.",
      "Sono ruim por vários dias pede ajuste de intensidade.",
      "Use deload de forma reativa quando a fadiga acumular.",
    ],
  },
  {
    title: "Suporte Básico",
    icon: ForkKnifeIcon,
    items: [
      "Hidratação diária consistente.",
      "Proteína adequada para recuperação.",
      "Treino com técnica > ego load.",
    ],
  },
]
