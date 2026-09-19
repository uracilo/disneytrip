import type { Park, Priority } from './itinerary'

export type ScheduleStatus = 'published' | 'verify-day-of'

export type ShowKind = 'show' | 'night-show' | 'parade' | 'seasonal'

export interface ShowItem {
  id: string
  park: Exclude<Park, 'transition'>
  title: string
  land?: string
  showtimes: string[]
  recommendedShowtime?: string
  durationMinutes?: number
  priority: Priority
  scheduleStatus: ScheduleStatus
  kind?: ShowKind
  notes?: string
  keywords?: string[]
  /** Integrar función elegida en timeline principal */
  inTimeline?: boolean
  timelineActivityId?: string
}

export const shows: ShowItem[] = [
  {
    id: 'show-trick-treat',
    park: 'dca',
    title: "Mickey's Trick & Treat",
    land: 'Hollywood Land',
    showtimes: ['10:45', '11:45', '12:45', '14:30', '15:30', '16:30'],
    recommendedShowtime: '14:30',
    durationMinutes: 25,
    priority: 'high',
    scheduleStatus: 'published',
    kind: 'show',
    inTimeline: true,
    timelineActivityId: 'trick-treat',
    notes:
      'Apto para toda la familia · Mickey, Minnie, Goofy, Donald · música, baile, burbujas',
    keywords: ['trick', 'treat', 'mickey', 'show', 'halloween'],
  },
  {
    id: 'show-royal-theatre',
    park: 'disneyland',
    title: 'Storytelling at Royal Theatre',
    land: 'Fantasyland',
    showtimes: ['10:15', '11:25', '12:40', '14:15', '15:25', '16:35'],
    recommendedShowtime: '14:15',
    durationMinutes: 25,
    priority: 'optional',
    scheduleStatus: 'published',
    kind: 'show',
    notes: 'Solo si coincide · No desplazar Mickey, Pooh, Anna+Elsa ni Trick & Treat',
    keywords: ['royal', 'theatre', 'storytelling', 'fantasyland'],
  },
  {
    id: 'show-tapestry',
    park: 'disneyland',
    title: 'Tapestry of Happiness',
    land: "It's a Small World",
    showtimes: ['20:55', '21:55', '22:55'],
    recommendedShowtime: '20:55',
    durationMinutes: 15,
    priority: 'optional',
    scheduleStatus: 'published',
    kind: 'night-show',
    notes: 'Proyecciones sobre Small World · Solo si regresamos a DL por la noche',
    keywords: ['tapestry', 'happiness', 'small world', 'noche'],
  },
  {
    id: 'show-fantasmic',
    park: 'disneyland',
    title: 'Fantasmic!',
    land: 'Rivers of America',
    showtimes: ['21:00', '22:30'],
    recommendedShowtime: '21:00',
    durationMinutes: 25,
    priority: 'optional',
    scheduleStatus: 'published',
    kind: 'night-show',
    notes:
      'Espectáculo nocturno · Puede incluir oscuridad, villanos, fuego, efectos y música fuerte · Puede resultar intenso para niños pequeños',
    keywords: ['fantasmic', 'noche', 'rivers'],
  },
  {
    id: 'show-halloween-screams',
    park: 'disneyland',
    title: 'Halloween Screams',
    land: 'Disneyland',
    showtimes: ['21:30'],
    recommendedShowtime: '21:30',
    durationMinutes: 10,
    priority: 'optional',
    scheduleStatus: 'published',
    kind: 'night-show',
    notes:
      'Puede ser ruidoso para niños pequeños · Fuegos artificiales solo en ciertas noches (verificar Disneyland App)',
    keywords: ['halloween', 'screams', 'noche'],
  },
  {
    id: 'show-turtle-talk',
    park: 'dca',
    title: 'Turtle Talk with Crush',
    land: 'Hollywood Land · Disney Animation Building',
    showtimes: [],
    priority: 'optional',
    scheduleStatus: 'verify-day-of',
    kind: 'show',
    notes:
      'Sesiones ≈ cada 30 min (≈09:00–20:30) · Cerca de Anna + Elsa · Verificar horario hoy',
    keywords: ['turtle', 'crush', 'talk', 'animation', 'hollywood'],
  },
  {
    id: 'show-animation-academy',
    park: 'dca',
    title: 'Animation Academy',
    land: 'Hollywood Land',
    showtimes: [],
    priority: 'optional',
    scheduleStatus: 'verify-day-of',
    kind: 'show',
    notes: 'Sesiones ≈ cada 30 min · Menos prioritario para 2 años y medio',
    keywords: ['animation', 'academy', 'dibujar'],
  },
  {
    id: 'show-coco',
    park: 'dca',
    title: 'The Storytellers of Plaza de la Familia',
    land: 'Paradise Gardens Park',
    showtimes: [],
    priority: 'recommended',
    scheduleStatus: 'verify-day-of',
    kind: 'seasonal',
    notes:
      'Celebrate The Musical World of Coco! · Temporada 21 ago – 2 nov 2026 · Verificar horario hoy · Agregar funciones manualmente',
    keywords: ['coco', 'plaza', 'familia', 'storytellers', 'música'],
  },
  {
    id: 'show-world-of-color',
    park: 'dca',
    title: 'World of Color',
    land: 'Paradise Bay',
    showtimes: ['21:00'],
    recommendedShowtime: '21:00',
    durationMinutes: 30,
    priority: 'optional',
    scheduleStatus: 'published',
    kind: 'night-show',
    notes: 'Si Anto todavía tiene energía · No es objetivo obligatorio',
    keywords: ['world', 'color', 'noche', 'agua'],
  },
]
