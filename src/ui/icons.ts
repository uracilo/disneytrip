import type { Activity } from '../data/itinerary'

/** Iconos SVG de UI (nav, badges, sistema) */

function svg(body: string, className = 'ico'): string {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`
}

export const icons = {
  castle: svg(
    `<path fill="currentColor" d="M4 20V9l2-1.5V6l2 1.2L10 5l2 2.2L14 5l2 2.2L18 6v1.5L20 9v11H4zm3-2h2v-3H7v3zm4 0h2v-5h-2v5zm4 0h2v-3h-2v3zM11 9.5 12 8l1 1.5L12 11l-1-1.5z"/>`,
  ),
  sparkle: svg(
    `<path fill="currentColor" d="M12 2.5 13.8 8l5.7 1.2-4.3 3.9 1.3 5.7L12 16.2 7.5 18.8l1.3-5.7-4.3-3.9L10.2 8 12 2.5zm7.2 1.3.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/>`,
  ),
  bolt: svg(
    `<path fill="currentColor" d="M13 2 4.5 13.2h5.2L8.2 22 19.5 10.2h-5.4L13 2z"/>`,
  ),
  clock: svg(
    `<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-.8 2.5h1.6v5.1l3.4 2-.8 1.3-4.2-2.5V6.5z"/>`,
  ),
  list: svg(
    `<path fill="currentColor" d="M5 6h2v2H5V6zm4 0h10v2H9V6zM5 11h2v2H5v-2zm4 0h10v2H9v-2zM5 16h2v2H5v-2zm4 0h10v2H9v-2z"/>`,
  ),
  search: svg(
    `<path fill="currentColor" d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l3.7 3.8-1.4 1.4-3.8-3.7A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/>`,
  ),
  star: svg(
    `<path fill="currentColor" d="M12 2.8 14.7 9l6.6.6-5 4.3 1.5 6.4L12 17.2 6.2 20.3 7.7 14 2.7 9.6 9.3 9 12 2.8z"/>`,
  ),
  character: svg(
    `<path fill="currentColor" d="M8.2 6.2a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2zm7.6 0a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2zM12 7.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm-6.5 9.3c1.7-1.4 3.9-2.2 6.5-2.2s4.8.8 6.5 2.2c.9.7 1.5 2 1.5 3.2v1.3H4v-1.3c0-1.2.6-2.5 1.5-3.2z"/>`,
  ),
  ride: svg(
    `<path fill="currentColor" d="M4 17a3 3 0 1 0 6 0H4zm10 0a3 3 0 1 0 6 0h-6zM5.2 7h13.6l1.2 8H4l1.2-8zm2.3-3h9l1 2H6.5l1-2z"/>`,
  ),
  food: svg(
    `<path fill="currentColor" d="M7 3v8a2 2 0 0 0 2 2v8h2V3H7zm8.5 0c-1.4 0-2.5 2.2-2.5 5v5h2v8h2V3h-1.5z"/>`,
  ),
  walk: svg(
    `<path fill="currentColor" d="M13.5 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM9.2 8.2l2.3.4.8 2.6 2.2-1.4 1.2 1.8-3.2 2.1-.7 6.3H9.2l.6-5.2-1.8-1.3L6.2 17H4l2.6-6.2 2.6-2.6z"/>`,
  ),
  hopper: svg(
    `<path fill="currentColor" d="M5 7h6v2H7.4l7.2 7.2H19v2h-6v-2h3.6L9.4 9H5V7zm0 10h4v2H5v-2zm10-10h4v2h-4V7z"/>`,
  ),
  check: svg(
    `<path fill="currentColor" d="M9.6 16.6 4.8 11.8l1.6-1.6 3.2 3.2 7.2-7.2 1.6 1.6-8.8 8.8z"/>`,
  ),
}

/** Emoji temáticos — grandes, claros, se ven siempre */
const EMOJI_BY_ID: Record<string, string> = {
  'entrada-dl': '🏰',
  dumbo: '🐘',
  mickey: '🌟',
  'walk-bayou': '🌳',
  'pooh-meet': '🍯',
  'pooh-ride': '🍯',
  'runaway-railway': '🚂',
  'comida-dl': '🍽️',
  'park-hopper': '🎟️',
  'anna-elsa': '❄️',
  'toy-story': '🎯',
  'web-slingers': '🕷️',
  'little-mermaid': '🐚',
  'comida-dca': '🍿',
  'fin-dia': '🌙',
}

function emojiSpan(emoji: string): string {
  return `<span class="emoji-ico" aria-hidden="true">${emoji}</span>`
}

export function categoryIcon(category: string): string {
  switch (category) {
    case 'personaje':
      return emojiSpan('😊')
    case 'atracción':
      return emojiSpan('🎢')
    case 'comida':
      return emojiSpan('🍽️')
    case 'caminata':
      return emojiSpan('🚶')
    case 'park_hopper':
      return emojiSpan('🎟️')
    case 'entrada':
      return emojiSpan('🏰')
    case 'lightning_lane':
      return emojiSpan('⚡')
    default:
      return emojiSpan('✨')
  }
}

/** Icono temático grande por atracción / personaje */
export function activityIcon(activity: Activity): string {
  const byId = EMOJI_BY_ID[activity.id]
  if (byId) return emojiSpan(byId)

  const hay = `${activity.title} ${activity.subtitle ?? ''} ${(activity.keywords ?? []).join(' ')}`.toLowerCase()

  if (/elsa|anna|frozen|nieve|snow/.test(hay)) return emojiSpan('❄️')
  if (/pooh|winnie|honey|miel/.test(hay)) return emojiSpan('🍯')
  if (/dumbo|elefante|elephant/.test(hay)) return emojiSpan('🐘')
  if (/spider|web|slinger/.test(hay)) return emojiSpan('🕷️')
  if (/mermaid|ariel|sirenita|shell/.test(hay)) return emojiSpan('🐚')
  if (/toy|story|buzz|woody/.test(hay)) return emojiSpan('🎯')
  if (/train|railway|tren/.test(hay)) return emojiSpan('🚂')
  if (/mickey|mouse/.test(hay)) return emojiSpan('🌟')
  if (/bayou|critter|tree|bosque/.test(hay)) return emojiSpan('🌳')
  if (/comida|food|lunch|cena|snack/.test(hay)) return emojiSpan('🍽️')
  if (/hopper|cambio/.test(hay)) return emojiSpan('🎟️')

  return categoryIcon(activity.category)
}

/** Punto de timeline: mismo emoji, tamaño compacto */
export function activityDotIcon(activity: Activity, preferBolt = false): string {
  if (preferBolt) return emojiSpan('⚡')
  return activityIcon(activity)
}

export function iconLabel(icon: string, text: string, className = 'ico-label'): string {
  return `<span class="${className}">${icon}<span>${text}</span></span>`
}
