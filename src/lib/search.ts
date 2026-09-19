import type { Activity } from '../data/itinerary'
import { PARK_NAMES, TYPE_LABELS } from '../data/itinerary'
import type { ShowItem } from '../data/shows'
import { getSelectedShowtime, getShowTimes } from './effective'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function activityHaystack(activity: Activity): string {
  const parts = [
    activity.title,
    activity.subtitle ?? '',
    activity.land ?? '',
    PARK_NAMES[activity.park],
    TYPE_LABELS[activity.type] ?? '',
    activity.notes ?? '',
    ...(activity.keywords ?? []),
    ...(activity.options ?? []),
    activity.lightningLane ? 'lightning lane ll' : '',
    activity.lightningLane?.watch ? 'vigilar' : '',
    activity.isDailyGoal ? 'objetivo prioridad critical' : '',
    activity.priority === 'critical' || activity.priority === true
      ? 'prioridad critical objetivo'
      : '',
  ]
  return normalize(parts.join(' '))
}

function showHaystack(show: ShowItem): string {
  return normalize(
    [
      show.title,
      show.land ?? '',
      PARK_NAMES[show.park],
      show.notes ?? '',
      ...(show.keywords ?? []),
      'show espectaculo',
      show.kind ?? '',
    ].join(' '),
  )
}

export interface SearchHit {
  kind: 'activity' | 'show'
  id: string
  title: string
  meta: string
  status?: string
  score: number
  activity?: Activity
  show?: ShowItem
}

export function searchAll(
  activities: Activity[],
  showList: ShowItem[],
  query: string,
): SearchHit[] {
  const q = normalize(query)
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const results: SearchHit[] = []

  for (const activity of activities) {
    const hay = activityHaystack(activity)
    let score = 0
    let all = true
    for (const token of tokens) {
      if (!hay.includes(token)) {
        all = false
        break
      }
      const titleN = normalize(activity.title)
      if (titleN.startsWith(token)) score += 30
      else if (titleN.includes(token)) score += 20
      else score += 10
    }
    if (all) {
      results.push({
        kind: 'activity',
        id: activity.id,
        title: activity.title,
        meta: [
          PARK_NAMES[activity.park],
          TYPE_LABELS[activity.type],
          activity.lightningLane?.watch ? 'Lightning Lane · Vigilar' : '',
          activity.lightningLane?.risk
            ? `Riesgo ${activity.lightningLane.risk}`
            : '',
        ]
          .filter(Boolean)
          .join(' · '),
        score,
        activity,
      })
    }
  }

  for (const show of showList) {
    const hay = showHaystack(show)
    let score = 0
    let all = true
    for (const token of tokens) {
      if (!hay.includes(token)) {
        all = false
        break
      }
      const titleN = normalize(show.title)
      if (titleN.startsWith(token)) score += 28
      else if (titleN.includes(token)) score += 18
      else score += 10
    }
    if (all) {
      const t = getSelectedShowtime(show)
      const times = getShowTimes(show)
      results.push({
        kind: 'show',
        id: show.id,
        title: show.title,
        meta: [
          PARK_NAMES[show.park],
          'Show',
          t ? `Función ${t}` : times.length ? `${times.length} funciones` : 'Verificar horario',
        ].join(' · '),
        score,
        show,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

/** Compat */
export function searchActivities(activities: Activity[], query: string) {
  return searchAll(activities, [], query)
    .filter((h) => h.activity)
    .map((h) => ({ activity: h.activity!, score: h.score }))
}
