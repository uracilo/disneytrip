import type { Activity } from '../data/itinerary'
import { CATEGORY_LABELS, PARK_NAMES } from '../data/itinerary'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function haystack(activity: Activity): string {
  const parts = [
    activity.title,
    activity.subtitle ?? '',
    PARK_NAMES[activity.park],
    CATEGORY_LABELS[activity.category],
    activity.notes ?? '',
    ...(activity.keywords ?? []),
    activity.lightningLane ? 'lightning lane' : '',
    activity.priority ? 'prioridad' : '',
  ]
  return normalize(parts.join(' '))
}

export interface SearchResult {
  activity: Activity
  score: number
}

export function searchActivities(
  activities: Activity[],
  query: string,
): SearchResult[] {
  const q = normalize(query)
  if (!q) return []

  const tokens = q.split(/\s+/).filter(Boolean)

  const results: SearchResult[] = []

  for (const activity of activities) {
    const hay = haystack(activity)
    let score = 0
    let allMatch = true

    for (const token of tokens) {
      if (!hay.includes(token)) {
        allMatch = false
        break
      }
      // Bonus si el título empieza o contiene el token
      const titleN = normalize(activity.title)
      if (titleN.startsWith(token)) score += 30
      else if (titleN.includes(token)) score += 20
      else score += 10

      if (activity.keywords?.some((k) => normalize(k).includes(token))) {
        score += 5
      }
    }

    if (allMatch) results.push({ activity, score })
  }

  return results.sort((a, b) => b.score - a.score)
}
