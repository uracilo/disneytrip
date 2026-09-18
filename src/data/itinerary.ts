export type ParkId = 'disneyland' | 'california_adventure' | 'transition'

export type ActivityCategory =
  | 'entrada'
  | 'atracción'
  | 'personaje'
  | 'comida'
  | 'caminata'
  | 'show'
  | 'park_hopper'
  | 'lightning_lane'
  | 'otro'

export interface LightningLaneInfo {
  watch: boolean
  estimatedTime?: string
  risk?: 'alto' | 'medio' | 'bajo'
}

export interface Activity {
  id: string
  title: string
  subtitle?: string
  park: ParkId
  category: ActivityCategory
  /** Hora local Anaheim HH:mm */
  start: string
  /** Hora local Anaheim HH:mm (opcional) */
  end?: string
  priority?: boolean
  lightningLane?: LightningLaneInfo
  notes?: string
  keywords?: string[]
  /** Separador visual grande de cambio de parque */
  isParkChange?: boolean
}

export interface TripDay {
  id: string
  date: string
  title: string
  activities: Activity[]
}

export const PARK_NAMES: Record<ParkId, string> = {
  disneyland: 'Disneyland Park',
  california_adventure: 'Disney California Adventure',
  transition: 'Cambio de parque',
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  entrada: 'Entrada',
  atracción: 'Atracción',
  personaje: 'Personaje',
  comida: 'Comida',
  caminata: 'Caminata',
  show: 'Show',
  park_hopper: 'Park Hopper',
  lightning_lane: 'Lightning Lane',
  otro: 'Otro',
}

/** Día del viaje — ajusta la fecha al día real del parque */
export const trip: TripDay = {
  id: 'day-1',
  date: '2026-09-18',
  title: 'Día en Disneyland',
  activities: [
    {
      id: 'entrada-dl',
      title: 'Entrada Disneyland',
      subtitle: 'Main Street, U.S.A.',
      park: 'disneyland',
      category: 'entrada',
      start: '08:00',
      end: '08:05',
      keywords: ['gate', 'entrada', 'main street'],
    },
    {
      id: 'dumbo',
      title: 'Dumbo the Flying Elephant',
      subtitle: 'Fantasyland',
      park: 'disneyland',
      category: 'atracción',
      start: '08:05',
      end: '08:20',
      keywords: ['dumbo', 'elefante', 'fantasyland'],
    },
    {
      id: 'mickey',
      title: 'Mickey Mouse',
      subtitle: "Mickey's House · Disneyland Park",
      park: 'disneyland',
      category: 'personaje',
      start: '09:00',
      end: '09:30',
      priority: true,
      notes: 'Prioridad del día — foto con Mickey',
      keywords: ['mickey', 'mouse', 'casa', 'toontown', 'foto'],
    },
    {
      id: 'walk-bayou',
      title: 'Caminar hacia Bayou Country',
      subtitle: 'Desde Toontown',
      park: 'disneyland',
      category: 'caminata',
      start: '09:30',
      end: '09:55',
      keywords: ['caminar', 'bayou', 'camino', 'walk'],
    },
    {
      id: 'pooh-meet',
      title: 'Winnie the Pooh',
      subtitle: "Pooh's Thotful Spot",
      park: 'disneyland',
      category: 'personaje',
      start: '10:00',
      end: '10:15',
      priority: true,
      notes: 'Encuentro con Pooh',
      keywords: ['pooh', 'winnie', 'oso', 'thotful', 'bayou'],
    },
    {
      id: 'pooh-ride',
      title: 'The Many Adventures of Winnie the Pooh',
      subtitle: 'Critter Country',
      park: 'disneyland',
      category: 'atracción',
      start: '10:15',
      end: '10:35',
      keywords: ['pooh', 'winnie', 'many adventures', 'critter'],
    },
    {
      id: 'runaway-railway',
      title: "Mickey & Minnie's Runaway Railway",
      subtitle: 'Mickey\'s Toontown',
      park: 'disneyland',
      category: 'atracción',
      start: '10:40',
      end: '11:05',
      lightningLane: { watch: false },
      keywords: ['runaway', 'railway', 'mickey', 'minnie', 'toontown'],
    },
    {
      id: 'comida-dl',
      title: 'Comida',
      subtitle: 'Almuerzo en el parque',
      park: 'disneyland',
      category: 'comida',
      start: '12:00',
      end: '12:45',
      keywords: ['comida', 'almuerzo', 'lunch', 'food', 'comer'],
    },
    {
      id: 'park-hopper',
      title: 'Cambio de parque',
      subtitle: 'Disneyland Park → Disney California Adventure',
      park: 'transition',
      category: 'park_hopper',
      start: '13:00',
      end: '13:15',
      isParkChange: true,
      notes: 'Park Hopper · salir de DL e ingresar a DCA',
      keywords: ['park hopper', 'cambio', 'hopper', 'transición'],
    },
    {
      id: 'anna-elsa',
      title: 'Anna & Elsa',
      subtitle: 'Hollywood Land',
      park: 'california_adventure',
      category: 'personaje',
      start: '13:25',
      end: '13:50',
      priority: true,
      notes: 'Prioridad del día',
      keywords: ['anna', 'elsa', 'frozen', 'reinas', 'princess', 'princesa'],
    },
    {
      id: 'toy-story',
      title: 'Toy Story Midway Mania!',
      subtitle: 'Pixar Pier',
      park: 'california_adventure',
      category: 'atracción',
      start: '14:20',
      end: '14:45',
      lightningLane: {
        watch: true,
        estimatedTime: '14:20',
        risk: 'alto',
      },
      notes: 'Vigilar Lightning Lane',
      keywords: ['toy', 'story', 'midway', 'mania', 'buzz', 'woody', 'pixar'],
    },
    {
      id: 'web-slingers',
      title: 'WEB SLINGERS: A Spider-Man Adventure',
      subtitle: 'Avengers Campus',
      park: 'california_adventure',
      category: 'atracción',
      start: '15:00',
      end: '15:30',
      lightningLane: {
        watch: true,
        estimatedTime: '15:00',
        risk: 'alto',
      },
      notes: 'Vigilar Lightning Lane',
      keywords: ['web', 'slingers', 'spider', 'spiderman', 'spider-man', 'avengers'],
    },
    {
      id: 'little-mermaid',
      title: 'The Little Mermaid — Ariel\'s Undersea Adventure',
      subtitle: 'Paradise Gardens Park',
      park: 'california_adventure',
      category: 'atracción',
      start: '15:45',
      end: '16:10',
      keywords: ['little', 'mermaid', 'ariel', 'sirenita', 'undersea'],
    },
    {
      id: 'comida-dca',
      title: 'Snack o cena ligera',
      subtitle: 'Pixar Pier / Paradise Gardens',
      park: 'california_adventure',
      category: 'comida',
      start: '17:00',
      end: '17:40',
      keywords: ['comida', 'cena', 'snack', 'food', 'comer'],
    },
    {
      id: 'fin-dia',
      title: 'Cierre del día',
      subtitle: 'Salida del parque',
      park: 'california_adventure',
      category: 'otro',
      start: '19:00',
      end: '19:30',
      keywords: ['salida', 'fin', 'cierre', 'exit'],
    },
  ],
}
