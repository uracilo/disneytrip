import type { Activity } from '../data/itinerary'

/** Iconos SVG propios estilo parque mágico (no marcas oficiales) */

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
  /** Temáticos por atracción */
  snowflake: svg(
    `<path fill="currentColor" d="M11.2 2h1.6v4.2l2.9-1.7.8 1.4-2.9 1.7 2.9 1.7-.8 1.4-2.9-1.7V14l2.9 1.7-.8 1.4-2.9-1.7V20h-1.6v-4.6l-2.9 1.7-.8-1.4 2.9-1.7-2.9-1.7.8-1.4 2.9 1.7V9l-2.9-1.7.8-1.4 2.9 1.7V2zm-6.4 6.2.8-1.4 2.1 1.2-.8 1.4-2.1-1.2zm14.4 0-2.1 1.2-.8-1.4 2.1-1.2.8 1.4zM4.8 17.2l2.1-1.2.8 1.4-2.1 1.2-.8-1.4zm14.4 0-.8 1.4-2.1-1.2.8-1.4 2.1 1.2z"/>`,
  ),
  elephant: svg(
    `<path fill="currentColor" d="M5 10c0-3.3 2.7-6 6-6h1c2.8 0 5.1 2 5.8 4.6L20 10v2.5h-1.8c-.4 1.7-1.5 3.1-3 3.9V20h-2.2v-3h-2.4v3H8.4v-3.8C6.4 15.3 5 12.9 5 10zm8.2-2.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM4 13.5c.8 0 1.5.7 1.5 1.5S4.8 16.5 4 16.5 2.5 15.8 2.5 15s.7-1.5 1.5-1.5z"/>`,
  ),
  honey: svg(
    `<path fill="currentColor" d="M8 4h8l1.5 3H6.5L8 4zm-1.2 5h10.4l.8 11H6l.8-11zm3.2 2v7h1.6v-7H10zm3.2 0v7h1.6v-7h-1.6z"/>`,
  ),
  bear: svg(
    `<path fill="currentColor" d="M7 5.5a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 7 5.5zm10 0a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6zM12 8.2a5 5 0 0 1 5 5v.6c0 2.8-2.2 5-5 5s-5-2.2-5-5v-.6a5 5 0 0 1 5-5zm-2.2 4.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm4.4 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm-3.5 3.4h2.6c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3z"/>`,
  ),
  train: svg(
    `<path fill="currentColor" d="M7 4h10a3 3 0 0 1 3 3v8H4V7a3 3 0 0 1 3-3zm1 3v2h8V7H8zm-1 9h2.2a2.2 2.2 0 1 1-2.2 0zm9.8 0H19a2.2 2.2 0 1 1-2.2 0zM6 20l-2 2h2.5l1.2-2H6zm12 0 1.2 2H22l-2-2h-2z"/>`,
  ),
  spider: svg(
    `<path fill="currentColor" d="M12 8.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zm0-5.3.7 3.2L12 8l-.7-1.6L12 3.2zM4.2 7.2l3.1 1.2L9 10 6.8 9.2 4.2 7.2zm15.6 0-2.6 2-2.2.8 1.7-1.6 3.1-1.2zM3.5 13.5l3.4-.4L9 12l-2.3 1.5-3.2.0zm17 0-.2 0-3.2-.0L15 12l2.1 1.1 3.4.4zM5.5 19l2.8-2.2L10 15.5 8 17.2 5.5 19zm13 0-2.5-1.8-2-1.7 1.7 1.3L18.5 19z"/>`,
  ),
  shell: svg(
    `<path fill="currentColor" d="M12 3c4.8 2.2 7.5 6.2 7.8 11.2H4.2C4.5 9.2 7.2 5.2 12 3zm0 2.4c-2.6 1.4-4.4 3.8-5 7.1h10c-.6-3.3-2.4-5.7-5-7.1zM5 16.5h14l-1.4 3.2c-.3.7-1 1.1-1.8 1.1H8.2c-.8 0-1.5-.4-1.8-1.1L5 16.5z"/>`,
  ),
  tree: svg(
    `<path fill="currentColor" d="M12 2.5 16.5 9H14l3.5 5H15l4 6H5l4-6H6.5L10 9H7.5L12 2.5zM11 18h2v3.5h-2V18z"/>`,
  ),
  moon: svg(
    `<path fill="currentColor" d="M13.2 2.4a9.5 9.5 0 1 0 8.4 14.3A8 8 0 0 1 13.2 2.4z"/>`,
  ),
  block: svg(
    `<path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7zm1.5 2.2 1.3 1.3 2.4-2.4.9.9-3.3 3.3-2.2-2.2.9-.9z"/>`,
  ),
  wave: svg(
    `<path fill="currentColor" d="M3 14.5c1.6-1.6 3.2-2.4 4.8-2.4s3.2.8 4.8 2.4c1.5 1.5 3 2.3 4.6 2.3.9 0 1.8-.2 2.8-.7v2.3c-1.2.6-2.4.9-3.6.9-2.2 0-4.2-1-5.9-2.6-1.4-1.4-2.7-2.1-3.9-2.1s-2.5.7-3.9 2.1c-.5.5-1 .9-1.7 1.2V14c.7-.3 1.3-.7 2-1.3zm0-5c1.6-1.6 3.2-2.4 4.8-2.4s3.2.8 4.8 2.4c1.5 1.5 3 2.3 4.6 2.3.9 0 1.8-.2 2.8-.7V13c-1.2.6-2.4.9-3.6.9-2.2 0-4.2-1-5.9-2.6-1.4-1.4-2.7-2.1-3.9-2.1s-2.5.7-3.9 2.1c-.5.5-1 .9-1.7 1.2V9c.7-.3 1.3-.7 2-1.3z"/>`,
  ),
}

export function categoryIcon(category: string): string {
  switch (category) {
    case 'personaje':
      return icons.character
    case 'atracción':
      return icons.ride
    case 'comida':
      return icons.food
    case 'caminata':
      return icons.walk
    case 'park_hopper':
      return icons.hopper
    case 'entrada':
      return icons.castle
    case 'lightning_lane':
      return icons.bolt
    default:
      return icons.sparkle
  }
}

/** Icono temático por atracción / personaje */
export function activityIcon(activity: Activity): string {
  switch (activity.id) {
    case 'entrada-dl':
      return icons.castle
    case 'dumbo':
      return icons.elephant
    case 'mickey':
      return icons.character
    case 'walk-bayou':
      return icons.tree
    case 'pooh-meet':
    case 'pooh-ride':
      return icons.honey
    case 'runaway-railway':
      return icons.train
    case 'comida-dl':
    case 'comida-dca':
      return icons.food
    case 'park-hopper':
      return icons.hopper
    case 'anna-elsa':
      return icons.snowflake
    case 'toy-story':
      return icons.block
    case 'web-slingers':
      return icons.spider
    case 'little-mermaid':
      return icons.shell
    case 'fin-dia':
      return icons.moon
    default:
      break
  }

  const hay = `${activity.title} ${activity.subtitle ?? ''} ${(activity.keywords ?? []).join(' ')}`.toLowerCase()

  if (/elsa|anna|frozen|nieve|snow/.test(hay)) return icons.snowflake
  if (/pooh|winnie|honey|miel/.test(hay)) return icons.honey
  if (/dumbo|elefante|elephant/.test(hay)) return icons.elephant
  if (/spider|web|slinger/.test(hay)) return icons.spider
  if (/mermaid|ariel|sirenita|shell/.test(hay)) return icons.shell
  if (/toy|story|buzz|woody/.test(hay)) return icons.block
  if (/train|railway|tren/.test(hay)) return icons.train
  if (/mickey|mouse/.test(hay)) return icons.character
  if (/bayou|critter|tree|bosque/.test(hay)) return icons.tree
  if (/comida|food|lunch|cena|snack/.test(hay)) return icons.food
  if (/hopper|cambio/.test(hay)) return icons.hopper

  return categoryIcon(activity.category)
}

export function iconLabel(icon: string, text: string, className = 'ico-label'): string {
  return `<span class="${className}">${icon}<span>${text}</span></span>`
}
