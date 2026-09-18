import type { Activity } from '../data/itinerary'
import {
  formatCountdown,
  getAnaheimDateString,
  getAnaheimMinutes,
  minutesUntil,
  parseTimeToMinutes,
} from './time'

export type ActivityStatus =
  | 'pasada'
  | 'ahora'
  | 'sigue'
  | 'futura'
  | 'completada'

export interface DaySnapshot {
  nowMinutes: number
  dateString: string
  isTripDay: boolean
  current: Activity | null
  next: Activity | null
  afterNext: Activity | null
  currentPark: Activity['park'] | null
  watchLanes: Activity[]
  priorities: Activity[]
  statuses: Map<string, ActivityStatus>
  dayDone: boolean
}

const STORAGE_KEY = 'disneytrip-completed'

export function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export function saveCompleted(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function toggleCompleted(id: string, completed: Set<string>): Set<string> {
  const next = new Set(completed)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  saveCompleted(next)
  return next
}

function endMinutes(activity: Activity): number {
  return activity.end
    ? parseTimeToMinutes(activity.end)
    : parseTimeToMinutes(activity.start) + 20
}

export function buildSnapshot(
  activities: Activity[],
  tripDate: string,
  completed: Set<string>,
  now: Date = new Date(),
): DaySnapshot {
  const nowMinutes = getAnaheimMinutes(now)
  const dateString = getAnaheimDateString(now)
  const isTripDay = dateString === tripDate

  const ordered = [...activities].sort(
    (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start),
  )

  const statuses = new Map<string, ActivityStatus>()
  let current: Activity | null = null
  let next: Activity | null = null

  const pending = ordered.filter((a) => !completed.has(a.id))

  if (!isTripDay) {
    for (const a of ordered) {
      statuses.set(a.id, completed.has(a.id) ? 'completada' : 'futura')
    }
    next = pending[0] ?? null
    if (next) statuses.set(next.id, 'sigue')
  } else {
    for (const a of ordered) {
      if (completed.has(a.id)) {
        statuses.set(a.id, 'completada')
        continue
      }
      const start = parseTimeToMinutes(a.start)
      const end = endMinutes(a)
      if (nowMinutes >= end) statuses.set(a.id, 'pasada')
      else if (nowMinutes >= start && nowMinutes < end) {
        statuses.set(a.id, 'ahora')
        if (!current) current = a
      } else statuses.set(a.id, 'futura')
    }

    if (!current) {
      // Hueco entre actividades o antes del día: no hay "ahora"
      next = pending.find((a) => parseTimeToMinutes(a.start) > nowMinutes) ?? null
    } else {
      const idx = ordered.findIndex((a) => a.id === current!.id)
      next = ordered.slice(idx + 1).find((a) => !completed.has(a.id)) ?? null
    }

    if (next) statuses.set(next.id, 'sigue')
  }

  const afterNext = (() => {
    if (!next) return null
    const idx = ordered.findIndex((a) => a.id === next!.id)
    return ordered.slice(idx + 1).find((a) => !completed.has(a.id)) ?? null
  })()

  const currentPark =
    current?.park ??
    next?.park ??
    pending[0]?.park ??
    ordered[ordered.length - 1]?.park ??
    null

  const watchLanes = pending.filter((a) => {
    if (!a.lightningLane?.watch) return false
    const st = statuses.get(a.id)
    return st !== 'pasada' && st !== 'completada'
  })

  const priorities = pending.filter((a) => {
    if (!a.priority) return false
    const st = statuses.get(a.id)
    return st !== 'pasada' && st !== 'completada'
  })

  const dayDone =
    isTripDay &&
    pending.every((a) => {
      const st = statuses.get(a.id)
      return st === 'pasada' || endMinutes(a) <= nowMinutes
    }) &&
    !current &&
    !next

  return {
    nowMinutes,
    dateString,
    isTripDay,
    current,
    next,
    afterNext,
    currentPark,
    watchLanes,
    priorities,
    statuses,
    dayDone,
  }
}

export function countdownLabel(activity: Activity, nowMinutes: number): string {
  const mins = minutesUntil(activity.start, nowMinutes)
  return formatCountdown(mins)
}
