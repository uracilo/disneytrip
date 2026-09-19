import type { Activity } from '../data/itinerary'

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
  check: svg(
    `<path fill="currentColor" d="M9.6 16.6 4.8 11.8l1.6-1.6 3.2 3.2 7.2-7.2 1.6 1.6-8.8 8.8z"/>`,
  ),
  show: svg(
    `<path fill="currentColor" d="M3 5h18v12H3V5zm2 2v8h14V7H5zm6 11h2v2h-2v-2z"/>`,
  ),
}

function emojiSpan(emoji: string): string {
  return `<span class="emoji-ico" aria-hidden="true">${emoji}</span>`
}

const EMOJI_BY_ID: Record<string, string> = {
  seguridad: '🛂',
  'entrada-dl': '🏰',
  'reserve-ll-runaway': '⚡',
  dumbo: '🐘',
  'alice-or-smallworld': '🐇',
  'walk-toontown': '🚶',
  mickey: '🌟',
  'walk-bayou': '🌳',
  'pooh-spot': '🍯',
  'pooh-meet': '🍯',
  'pooh-ride': '🍯',
  'watch-ll-toystory': '⚡',
  'runaway-railway': '🚂',
  'flex-morning': '✨',
  'comida-dl': '🍽️',
  'watch-ll-web': '⚡',
  'flex-pre-hopper': '🗺️',
  'prep-hopper': '🎟️',
  'park-hopper': '🎟️',
  'entrada-dca': '🎡',
  'anna-elsa': '❄️',
  'flex-hollywood': '✨',
  'trick-treat': '🎃',
  'toy-story': '🎯',
  'web-slingers': '🕷️',
  monsters: '👾',
  'little-mermaid': '🐚',
  'jessie-carousel': '🐴',
  'inside-out': '🧠',
  'pal-around': '🎡',
  'cena-dca': '🍿',
  'flex-evening': '🌙',
}

export function categoryIcon(type: string): string {
  switch (type) {
    case 'character':
    case 'personaje':
      return emojiSpan('😊')
    case 'ride':
    case 'atracción':
      return emojiSpan('🎢')
    case 'food':
    case 'comida':
      return emojiSpan('🍽️')
    case 'caminata':
    case 'transport':
      return emojiSpan('🚶')
    case 'park_hopper':
      return emojiSpan('🎟️')
    case 'entrada':
      return emojiSpan('🏰')
    case 'lightning-lane':
    case 'reminder':
      return emojiSpan('⚡')
    case 'show':
    case 'night-show':
      return emojiSpan('🎭')
    case 'flexible':
      return emojiSpan('✨')
    default:
      return emojiSpan('✨')
  }
}

export function activityIcon(activity: Activity): string {
  const byId = EMOJI_BY_ID[activity.id]
  if (byId) return emojiSpan(byId)

  const hay = `${activity.title} ${activity.subtitle ?? ''} ${(activity.keywords ?? []).join(' ')}`.toLowerCase()
  if (/elsa|anna|frozen/.test(hay)) return emojiSpan('❄️')
  if (/pooh|winnie/.test(hay)) return emojiSpan('🍯')
  if (/dumbo/.test(hay)) return emojiSpan('🐘')
  if (/spider|web|slinger/.test(hay)) return emojiSpan('🕷️')
  if (/mermaid|ariel/.test(hay)) return emojiSpan('🐚')
  if (/toy|story/.test(hay)) return emojiSpan('🎯')
  if (/train|railway/.test(hay)) return emojiSpan('🚂')
  if (/mickey/.test(hay)) return emojiSpan('🌟')
  if (/trick|treat|pumpkin/.test(hay)) return emojiSpan('🎃')
  if (/monster/.test(hay)) return emojiSpan('👾')
  if (/coco|familia/.test(hay)) return emojiSpan('🎸')
  if (/fantasmic/.test(hay)) return emojiSpan('🌙')
  if (/comida|food|cena|snack/.test(hay)) return emojiSpan('🍽️')

  return categoryIcon(activity.type)
}

export function activityDotIcon(activity: Activity, preferBolt = false): string {
  if (preferBolt) return emojiSpan('⚡')
  return activityIcon(activity)
}

export function iconLabel(icon: string, text: string, className = 'ico-label'): string {
  return `<span class="${className}">${icon}<span>${text}</span></span>`
}
