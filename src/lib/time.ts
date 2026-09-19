const TZ = 'America/Los_Angeles'

export type ClockSource = {
  /** Fecha YYYY-MM-DD en Anaheim simulada (solo dev) */
  date?: string
  /** Minutos desde medianoche Anaheim simulados (solo dev) */
  minutes?: number
}

let sim: ClockSource | null = null

export function setSimulatedClock(next: ClockSource | null): void {
  sim = next
}

export function getSimulatedClock(): ClockSource | null {
  return sim
}

function realAnaheimParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0'
  let hour = Number(get('hour'))
  if (hour === 24) hour = 0
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + Number(get('minute')),
  }
}

/** Minutos desde medianoche en zona Anaheim (o simulados en DEV) */
export function getAnaheimMinutes(date: Date = new Date()): number {
  if (import.meta.env.DEV && sim?.minutes != null) return sim.minutes
  return realAnaheimParts(date).minutes
}

export function getAnaheimDateString(date: Date = new Date()): string {
  if (import.meta.env.DEV && sim?.date) return sim.date
  return realAnaheimParts(date).date
}

export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutesToHhmm(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatAnaheimClock(date: Date = new Date()): string {
  if (import.meta.env.DEV && sim?.minutes != null) {
    return formatDisplayTime(minutesToHhmm(sim.minutes))
  }
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDisplayTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

export function minutesUntil(targetHhmm: string, nowMinutes: number): number {
  return parseTimeToMinutes(targetHhmm) - nowMinutes
}

export function formatCountdown(mins: number): string {
  if (mins <= 0) return 'Ahora'
  if (mins < 60) return `Faltan ${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `Faltan ${h} h`
  return `Faltan ${h} h ${m} min`
}

export function isPriorityCritical(p: unknown): boolean {
  return p === 'critical' || p === true
}

export function isPriorityHigh(p: unknown): boolean {
  return p === 'high' || p === 'critical' || p === true
}
