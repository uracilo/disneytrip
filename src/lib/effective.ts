import type { Activity } from '../data/itinerary'
import { shows, type ShowItem } from '../data/shows'
import {
  loadLlWindows,
  loadShowCustomTimes,
  loadShowSelected,
  loadTimeOverrides,
  type LlWindow,
  type TimeOverride,
} from './storage'
import { parseTimeToMinutes } from './time'

export type ScheduleKind = 'fijo' | 'll-real' | 'estimado'

export interface EffectiveActivity extends Activity {
  effectiveStart: string
  effectiveEnd?: string
  scheduleKind: ScheduleKind
  llWindow?: LlWindow
}

export function getSelectedShowtime(show: ShowItem): string | undefined {
  const selected = loadShowSelected()[show.id]
  if (selected) return selected
  return show.recommendedShowtime ?? show.showtimes[0]
}

export function getShowTimes(show: ShowItem): string[] {
  const custom = loadShowCustomTimes()[show.id]
  if (custom && custom.length) return custom
  return show.showtimes
}

export function resolveActivities(base: Activity[]): EffectiveActivity[] {
  const overrides = loadTimeOverrides()
  const llWindows = loadLlWindows()
  const showSel = loadShowSelected()

  return base.map((a) => {
    let start = a.start
    let end = a.end
    let scheduleKind: ScheduleKind =
      a.scheduleType === 'fixed'
        ? 'fijo'
        : a.scheduleType === 'dynamic'
          ? 'estimado'
          : 'estimado'

    // Show vinculado: usar función seleccionada
    if (a.showId) {
      const show = shows.find((s) => s.id === a.showId)
      if (show) {
        const t = showSel[show.id] ?? show.recommendedShowtime ?? show.showtimes[0]
        if (t) {
          start = t
          const dur = show.durationMinutes ?? 25
          end = minutesAdd(t, dur)
          scheduleKind = 'fijo'
        }
      }
    }

    // Override manual de hora
    const ov: TimeOverride | undefined = overrides[a.id]
    if (ov) {
      start = ov.start
      end = ov.end ?? end
      if (a.scheduleType === 'fixed' || a.showId) scheduleKind = 'fijo'
      else scheduleKind = 'estimado'
    }

    // LL real tiene prioridad sobre estimado
    const ll: LlWindow | undefined = llWindows[a.id]
    if (ll?.returnStart) {
      start = ll.returnStart
      end = ll.returnEnd ?? minutesAdd(ll.returnStart, 60)
      scheduleKind = 'll-real'
    }

    return {
      ...a,
      start,
      end,
      effectiveStart: start,
      effectiveEnd: end,
      scheduleKind,
      llWindow: ll,
      lightningLane: a.lightningLane
        ? {
            ...a.lightningLane,
            returnStart: ll?.returnStart ?? a.lightningLane.returnStart,
            returnEnd: ll?.returnEnd ?? a.lightningLane.returnEnd,
          }
        : a.lightningLane,
    }
  })
}

function minutesAdd(hhmm: string, add: number): string {
  const total = parseTimeToMinutes(hhmm) + add
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function resolveShows(): ShowItem[] {
  const custom = loadShowCustomTimes()
  const selected = loadShowSelected()
  return shows.map((s) => ({
    ...s,
    showtimes: custom[s.id]?.length ? custom[s.id] : s.showtimes,
    recommendedShowtime: selected[s.id] ?? s.recommendedShowtime,
  }))
}
