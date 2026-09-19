import type { Activity, Park } from '../data/itinerary'
import { DAILY_GOAL_IDS } from '../data/itinerary'
import type { ShowItem } from '../data/shows'
import { getSelectedShowtime, getShowTimes, type EffectiveActivity } from './effective'
import {
  formatCountdown,
  getAnaheimDateString,
  getAnaheimMinutes,
  isPriorityCritical,
  minutesUntil,
  parseTimeToMinutes,
} from './time'

export type ActivityStatus =
  | 'pasada'
  | 'ahora'
  | 'sigue'
  | 'futura'
  | 'completada'

export interface NextShowInfo {
  show: ShowItem
  time: string
  minutesUntil: number
  urgent: boolean
  soon: boolean
}

export interface DaySnapshot {
  nowMinutes: number
  dateString: string
  isTripDay: boolean
  current: EffectiveActivity | null
  next: EffectiveActivity | null
  afterNext: EffectiveActivity | null
  currentPark: Park | null
  watchLanes: EffectiveActivity[]
  priorities: EffectiveActivity[]
  dailyGoals: EffectiveActivity[]
  nextShow: NextShowInfo | null
  statuses: Map<string, ActivityStatus>
  dayDone: boolean
  pinnedId: string | null
}

function endMinutes(activity: Activity): number {
  return activity.end
    ? parseTimeToMinutes(activity.end)
    : parseTimeToMinutes(activity.start) + 20
}

export function buildSnapshot(
  activities: EffectiveActivity[],
  tripDate: string,
  completed: Set<string>,
  showList: ShowItem[],
  pinnedId: string | null,
  now: Date = new Date(),
): DaySnapshot {
  const nowMinutes = getAnaheimMinutes(now)
  const dateString = getAnaheimDateString(now)
  const isTripDay = dateString === tripDate

  const ordered = [...activities].sort(
    (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start),
  )

  const statuses = new Map<string, ActivityStatus>()
  let current: EffectiveActivity | null = null
  let next: EffectiveActivity | null = null

  const pending = ordered.filter((a) => !completed.has(a.id))

  // Pin "mantener como ahora"
  if (pinnedId && !completed.has(pinnedId)) {
    const pinned = ordered.find((a) => a.id === pinnedId) ?? null
    if (pinned) current = pinned
  }

  if (!isTripDay) {
    for (const a of ordered) {
      statuses.set(a.id, completed.has(a.id) ? 'completada' : 'futura')
    }
    if (!current) {
      next = pending[0] ?? null
    } else {
      const idx = ordered.findIndex((a) => a.id === current!.id)
      next = ordered.slice(idx + 1).find((a) => !completed.has(a.id)) ?? null
    }
    if (next) statuses.set(next.id, 'sigue')
    if (current) statuses.set(current.id, 'ahora')
  } else {
    for (const a of ordered) {
      if (completed.has(a.id)) {
        statuses.set(a.id, 'completada')
        continue
      }
      if (current && a.id === current.id) {
        statuses.set(a.id, 'ahora')
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
      // Si hay actividad "pasada" reciente no completada, mantenerla como ahora (retraso)
      const overdue = pending
        .filter((a) => {
          const end = endMinutes(a)
          const start = parseTimeToMinutes(a.start)
          return nowMinutes >= start && nowMinutes < end + 45
        })
        .sort((a, b) => parseTimeToMinutes(b.start) - parseTimeToMinutes(a.start))[0]

      if (overdue && nowMinutes < endMinutes(overdue) + 45 && nowMinutes >= parseTimeToMinutes(overdue.start)) {
        // Solo si aún está en ventana o hasta 45 min después del fin sin completar
        if (nowMinutes < endMinutes(overdue)) {
          current = overdue
          statuses.set(overdue.id, 'ahora')
        } else {
          // Retraso: seguir mostrando como ahora hasta marcar hecha
          current = overdue
          statuses.set(overdue.id, 'ahora')
        }
      }
    }

    if (!current) {
      next = pending.find((a) => parseTimeToMinutes(a.start) > nowMinutes) ?? null
    } else {
      const idx = ordered.findIndex((a) => a.id === current!.id)
      next = ordered.slice(idx + 1).find((a) => !completed.has(a.id)) ?? null
      statuses.set(current.id, 'ahora')
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
    if (!a.lightningLane?.watch && a.lightningLane?.risk !== 'high') return false
    if (a.lightningLane?.watch || a.lightningLane?.risk === 'high') {
      const st = statuses.get(a.id)
      return st !== 'pasada' && st !== 'completada'
    }
    return false
  })

  // Incluir también LL high risk rides
  const highLl = pending.filter(
    (a) =>
      a.lightningLane?.risk === 'high' &&
      !watchLanes.some((w) => w.id === a.id) &&
      statuses.get(a.id) !== 'pasada' &&
      statuses.get(a.id) !== 'completada',
  )
  const allWatch = [...watchLanes, ...highLl]

  const priorities = pending.filter((a) => {
    if (!isPriorityCritical(a.priority) && a.priority !== 'high') return false
    const st = statuses.get(a.id)
    return st !== 'pasada' && st !== 'completada'
  })

  const dailyGoals = ordered.filter((a) =>
    (DAILY_GOAL_IDS as readonly string[]).includes(a.id),
  )

  const nextShow = getNextShow(showList, nowMinutes, isTripDay)

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
    watchLanes: allWatch,
    priorities,
    dailyGoals,
    nextShow,
    statuses,
    dayDone,
    pinnedId,
  }
}

export function getNextShow(
  showList: ShowItem[],
  nowMinutes: number,
  isTripDay: boolean,
): NextShowInfo | null {
  const candidates: NextShowInfo[] = []

  for (const show of showList) {
    if (show.priority === 'optional' && show.kind === 'night-show') {
      // incluir solo si falta < 90 min
    }
    const times = getShowTimes(show)
    const selected = getSelectedShowtime(show)
    const pool = times.length ? times : selected ? [selected] : []

    for (const t of pool) {
      const mins = minutesUntil(t, nowMinutes)
      if (!isTripDay) {
        // Fuera del día: usar recommended/selected como referencia
        if (selected === t || show.recommendedShowtime === t) {
          candidates.push({
            show,
            time: t,
            minutesUntil: mins,
            urgent: false,
            soon: false,
          })
        }
        continue
      }
      if (mins < -5) continue
      const isSelected = selected === t
      const isHigh = show.priority === 'high' || show.priority === 'critical'
      if (!isSelected && !isHigh && mins > 30) continue
      candidates.push({
        show,
        time: t,
        minutesUntil: mins,
        urgent: mins <= 15 && mins >= 0,
        soon: mins <= 30 && mins >= 0,
      })
    }
  }

  if (!isTripDay) {
    // Preferir Trick & Treat recommended
    const preferred =
      candidates.find((c) => c.show.id === 'show-trick-treat') ?? candidates[0]
    return preferred
      ? { ...preferred, minutesUntil: minutesUntil(preferred.time, nowMinutes) }
      : null
  }

  const upcoming = candidates
    .filter((c) => c.minutesUntil >= 0)
    .sort((a, b) => {
      // Preferir high/selected y más cercanos
      const score = (c: NextShowInfo) => {
        let s = c.minutesUntil
        if (c.show.priority === 'high') s -= 5
        if (getSelectedShowtime(c.show) === c.time) s -= 10
        return s
      }
      return score(a) - score(b)
    })

  return upcoming[0] ?? null
}

export function countdownLabel(activity: Activity, nowMinutes: number): string {
  const mins = minutesUntil(activity.start, nowMinutes)
  return formatCountdown(mins)
}

export { formatCountdown }
