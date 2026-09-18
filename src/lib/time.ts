const TZ = 'America/Los_Angeles'

/** Minutos desde medianoche en zona Anaheim */
export function getAnaheimMinutes(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  // hour12:false puede devolver 24 a medianoche en algunos motores
  const h = hour === 24 ? 0 : hour
  return h * 60 + minute
}

export function getAnaheimDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatAnaheimClock(date: Date = new Date()): string {
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
