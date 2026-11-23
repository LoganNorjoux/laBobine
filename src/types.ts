import { z } from 'zod'

const WDAYS = ['DIM.', 'LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.'] as const
const WDAYS_FULL = [
  'DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI',
] as const
export const MONTHS = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
] as const

export const AGE_RATINGS = ['TP', '3', '5', '8', '10', '12', '16', '18'] as const
export type AgeRating = (typeof AGE_RATINGS)[number]

export const VERSIONS = ['VF', 'VOST'] as const
export type Version = (typeof VERSIONS)[number]

export const sessionSchema = z.object({
  dayIndex: z.number().int().min(0),
  time: z.string().min(1),
})

export const filmSchema = z.object({
  id: z.string(),
  title: z.string(),
  ageRating: z.enum(AGE_RATINGS).default('TP'),
  version: z.enum(VERSIONS).default('VF'),
  tag: z.string().default(''),
  sessions: z.array(sessionSchema).default([]),
})

export const weekSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  films: z.array(filmSchema).default([]),
})

export const posterConfigSchema = z.object({
  tariffs: z.array(z.string()).default([]),
  notice: z.string().default(''),
})

export const DEFAULT_CONFIG = {
  tariffs: [
    'TARIFS : Adulte : 6,00 € • Réduit : 4,50 € • -14 ans : 4 €',
    '* Le dimanche à 11 h : 4 € • Carte 10 Entrées : 45 €',
  ],
  notice:
    'Le premier mardi soir de chaque mois, une place de cinéma à gagner par tirage au sort.',
}

export const posterSchema = z.object({
  version: z.literal(1),
  config: posterConfigSchema.default(DEFAULT_CONFIG),
  weeks: z.array(weekSchema).min(1).max(2),
})

export type Session = z.infer<typeof sessionSchema>
export type Film = z.infer<typeof filmSchema>
export type Week = z.infer<typeof weekSchema>
export type PosterConfig = z.infer<typeof posterConfigSchema>
export type Poster = z.infer<typeof posterSchema>

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// "18h" / "18h30" / "1830" / "18:30" → "18h30" ; retourne null si non parsable
export function normalizeTime(raw: string): string | null {
  const t = raw.trim().toLowerCase()
  const m = t.match(/^(\d{1,2})[h:.]?(\d{0,2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const mins = m[2] === '' ? 0 : parseInt(m[2], 10)
  if (h > 23 || mins > 59) return null
  return `${h}h${String(mins).padStart(2, '0')}`
}

// "18h30" → "18:30" (pour <input type="time">) ; null si non parsable
export function toTimeInput(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2})h(\d{2})$/)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

// "18h30" → minutes depuis minuit ; valeurs non parsables en fin de liste
export function timeToMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2})h(\d{2})$/)
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER
}

export function sortSessions(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) => a.dayIndex - b.dayIndex || timeToMinutes(a.time) - timeToMinutes(b.time),
  )
}

export function emptyFilm(): Film {
  return { id: uid(), title: '', ageRating: 'TP', version: 'VF', tag: '', sessions: [] }
}

function nextWednesdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7))
  return d.toISOString().slice(0, 10)
}

export function emptyWeek(startDate = nextWednesdayISO()): Week {
  const d = new Date(startDate + 'T00:00:00')
  d.setDate(d.getDate() + 6)
  return { startDate, endDate: d.toISOString().slice(0, 10), films: [] }
}

export function emptyPoster(): Poster {
  return { version: 1, config: { ...DEFAULT_CONFIG }, weeks: [emptyWeek(), emptyWeek()] }
}

export interface DayCol {
  index: number
  iso: string
  label: string // "MER."
  num: number
  month: string // "OCTO"
}

// Colonnes du tableau : chaque date entre start et end, max 7
export function weekDates(week: Week): DayCol[] {
  const start = new Date(week.startDate + 'T00:00:00')
  const end = new Date(week.endDate + 'T00:00:00')
  if (isNaN(start.getTime())) return []
  const last = isNaN(end.getTime()) || end < start ? start : end
  const cols: DayCol[] = []
  for (let i = 0; i < 366; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    if (d > last) break
    cols.push({
      index: i,
      iso: d.toISOString().slice(0, 10),
      label: WDAYS[d.getDay()],
      num: d.getDate(),
      month: MONTHS[d.getMonth()].slice(0, 4),
    })
  }
  return cols
}

// "29 octobre 2025"
export function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}

// "29/10/2025"
export function fmtDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// "MERCREDI 29 OCTOBRE AU MARDI 4 NOVEMBRE 2025"
export function fmtWeekTitle(week: Week): string {
  const cols = weekDates(week)
  if (cols.length === 0) return 'PÉRIODE DU … AU …'
  const first = new Date(cols[0].iso + 'T00:00:00')
  const last = new Date(cols[cols.length - 1].iso + 'T00:00:00')
  const f = (d: Date) =>
    `${WDAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
  return `${f(first)} AU ${f(last)} ${last.getFullYear()}`
}
