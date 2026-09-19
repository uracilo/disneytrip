export type Park = 'disneyland' | 'dca' | 'transition'

/** Alias legacy para no romper imports internos */
export type ParkId = Park

export type ActivityType =
  | 'ride'
  | 'character'
  | 'food'
  | 'transport'
  | 'show'
  | 'parade'
  | 'night-show'
  | 'lightning-lane'
  | 'flexible'
  | 'entrada'
  | 'caminata'
  | 'park_hopper'
  | 'reminder'
  | 'otro'

export type Priority = 'critical' | 'high' | 'recommended' | 'optional'

export type ScheduleType = 'fixed' | 'estimated' | 'dynamic'

export type LlRisk = 'high' | 'medium' | 'low'

export interface LightningLaneInfo {
  watch: boolean
  estimatedTime?: string
  risk?: LlRisk
  /** Ventana real ingresada por el usuario */
  returnStart?: string
  returnEnd?: string
}

export interface Activity {
  id: string
  title: string
  subtitle?: string
  park: Park
  /** Tipo de actividad */
  type: ActivityType
  /** @deprecated usar type — se mantiene para compat */
  category?: ActivityType
  land?: string
  /** Hora local Anaheim HH:mm */
  start: string
  end?: string
  priority?: Priority | boolean
  scheduleType?: ScheduleType
  lightningLane?: LightningLaneInfo
  anyHeight?: boolean
  notes?: string
  keywords?: string[]
  isParkChange?: boolean
  /** Objetivo principal del día (Mickey / Pooh / Anna) */
  isDailyGoal?: boolean
  /** Show vinculado (para Trick & Treat etc.) */
  showId?: string
  verifySchedule?: boolean
  options?: string[]
}

export interface TripDay {
  id: string
  date: string
  title: string
  activities: Activity[]
}

export const PARK_NAMES: Record<Park, string> = {
  disneyland: 'Disneyland Park',
  dca: 'Disney California Adventure',
  transition: 'Cambio de parque',
}

export const TYPE_LABELS: Record<ActivityType, string> = {
  ride: 'Atracción',
  character: 'Personaje',
  food: 'Comida',
  transport: 'Traslado',
  show: 'Show',
  parade: 'Desfile',
  'night-show': 'Espectáculo nocturno',
  'lightning-lane': 'Lightning Lane',
  flexible: 'Flexible',
  entrada: 'Entrada',
  caminata: 'Caminata',
  park_hopper: 'Park Hopper',
  reminder: 'Recordatorio',
  otro: 'Otro',
}

/** Compat con UI anterior */
export const CATEGORY_LABELS = TYPE_LABELS

export const DAILY_GOAL_IDS = ['mickey', 'pooh-meet', 'anna-elsa'] as const

export const trip: TripDay = {
  id: 'day-1',
  date: '2026-09-26',
  title: 'Sábado 26 de septiembre · Disneyland Resort',
  activities: [
    {
      id: 'seguridad',
      title: 'Llegar a seguridad',
      subtitle: 'Listos antes de la apertura',
      park: 'disneyland',
      type: 'transport',
      land: 'Esplanade',
      start: '07:15',
      end: '07:30',
      scheduleType: 'estimated',
      notes: 'Queremos estar listos antes de la apertura.',
      keywords: ['seguridad', 'llegada', 'entrada', 'security'],
    },
    {
      id: 'entrada-dl',
      title: 'Entrar a Disneyland',
      subtitle: 'Apertura ≈ 8:00',
      park: 'disneyland',
      type: 'entrada',
      land: 'Main Street, U.S.A.',
      start: '08:00',
      end: '08:05',
      scheduleType: 'estimated',
      keywords: ['gate', 'entrada', 'main street', 'abrir'],
    },
    {
      id: 'reserve-ll-runaway',
      title: 'Reservar Lightning Lane',
      subtitle: "Mickey & Minnie's Runaway Railway",
      park: 'disneyland',
      type: 'lightning-lane',
      start: '08:01',
      end: '08:05',
      scheduleType: 'estimated',
      lightningLane: { watch: true, risk: 'medium' },
      notes: 'Reservar LL de Runaway Railway al entrar.',
      keywords: ['ll', 'lightning', 'runaway', 'railway', 'reservar'],
    },
    {
      id: 'dumbo',
      title: 'Dumbo the Flying Elephant',
      subtitle: 'Fantasyland',
      park: 'disneyland',
      type: 'ride',
      land: 'Fantasyland',
      start: '08:05',
      end: '08:35',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      notes: 'Standby · Any Height',
      keywords: ['dumbo', 'elefante', 'fantasyland'],
    },
    {
      id: 'alice-or-smallworld',
      title: 'Alice in Wonderland o It\'s a Small World',
      subtitle: 'Elegir según fila',
      park: 'disneyland',
      type: 'flexible',
      land: 'Fantasyland',
      start: '08:35',
      end: '08:55',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      options: ['Alice in Wonderland', "It's a Small World"],
      notes: 'No es obligatorio hacer ambas.',
      keywords: ['alice', 'wonderland', 'small world', 'fantasyland'],
    },
    {
      id: 'walk-toontown',
      title: 'Caminar hacia Toontown',
      park: 'disneyland',
      type: 'caminata',
      land: 'Toontown',
      start: '08:55',
      end: '09:00',
      scheduleType: 'estimated',
      keywords: ['caminar', 'toontown', 'walk'],
    },
    {
      id: 'mickey',
      title: 'Mickey Mouse',
      subtitle: "Mickey's House · Toontown",
      park: 'disneyland',
      type: 'character',
      land: 'Toontown',
      start: '09:00',
      end: '09:30',
      priority: 'critical',
      scheduleType: 'estimated',
      isDailyGoal: true,
      verifySchedule: true,
      notes: 'Objetivo principal #1 · Verificar horario hoy',
      keywords: ['mickey', 'mouse', 'casa', 'toontown', 'foto', 'objetivo'],
    },
    {
      id: 'walk-bayou',
      title: 'Caminar hacia Bayou Country',
      park: 'disneyland',
      type: 'caminata',
      land: 'Bayou Country',
      start: '09:30',
      end: '09:45',
      scheduleType: 'estimated',
      keywords: ['caminar', 'bayou', 'walk'],
    },
    {
      id: 'pooh-spot',
      title: "Pooh's Thotful Spot",
      subtitle: 'Llegar con anticipación',
      park: 'disneyland',
      type: 'caminata',
      land: 'Bayou Country',
      start: '09:45',
      end: '10:00',
      scheduleType: 'estimated',
      keywords: ['pooh', 'thotful', 'spot', 'bayou'],
    },
    {
      id: 'pooh-meet',
      title: 'Winnie the Pooh',
      subtitle: "Pooh's Thotful Spot",
      park: 'disneyland',
      type: 'character',
      land: 'Bayou Country',
      start: '10:00',
      end: '10:15',
      priority: 'critical',
      scheduleType: 'estimated',
      isDailyGoal: true,
      verifySchedule: true,
      notes: 'Objetivo principal #2 · Verificar horario hoy',
      keywords: ['pooh', 'winnie', 'oso', 'objetivo'],
    },
    {
      id: 'pooh-ride',
      title: 'The Many Adventures of Winnie the Pooh',
      subtitle: 'Critter Country / Bayou',
      park: 'disneyland',
      type: 'ride',
      land: 'Bayou Country',
      start: '10:15',
      end: '10:35',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      keywords: ['pooh', 'winnie', 'many adventures', 'ride'],
    },
    {
      id: 'watch-ll-toystory',
      title: 'Revisar LL · Toy Story Midway Mania',
      subtitle: 'DCA · Riesgo HIGH',
      park: 'disneyland',
      type: 'reminder',
      start: '10:00',
      end: '10:10',
      scheduleType: 'estimated',
      lightningLane: { watch: true, risk: 'high', estimatedTime: '14:45' },
      notes: 'Vigilar LL — la ventana puede alejarse varias horas.',
      keywords: ['ll', 'toy', 'story', 'midway', 'vigilar', 'lightning'],
    },
    {
      id: 'runaway-railway',
      title: "Mickey & Minnie's Runaway Railway",
      subtitle: "Mickey's Toontown",
      park: 'disneyland',
      type: 'ride',
      land: "Mickey's Toontown",
      start: '10:40',
      end: '11:20',
      priority: 'high',
      scheduleType: 'dynamic',
      anyHeight: true,
      lightningLane: { watch: false, risk: 'medium' },
      notes: 'Lightning Lane · Actualizar hora real de LL cuando la tengas.',
      keywords: ['runaway', 'railway', 'mickey', 'minnie', 'll', 'lightning'],
    },
    {
      id: 'flex-morning',
      title: 'Bloque flexible',
      subtitle: 'Roger Rabbit · Buzz · snack · baño',
      park: 'disneyland',
      type: 'flexible',
      start: '11:20',
      end: '11:50',
      scheduleType: 'estimated',
      options: ["Roger Rabbit's Car Toon Spin", 'Buzz Lightyear Astro Blasters', 'Descanso', 'Snack', 'Baño'],
      notes: 'No es obligación.',
      keywords: ['flexible', 'roger', 'rabbit', 'buzz', 'descanso', 'snack'],
    },
    {
      id: 'comida-dl',
      title: 'Comida / Descanso',
      park: 'disneyland',
      type: 'food',
      start: '11:50',
      end: '12:30',
      scheduleType: 'estimated',
      notes: 'Priorizar descanso.',
      keywords: ['comida', 'almuerzo', 'lunch', 'descanso', 'food'],
    },
    {
      id: 'watch-ll-web',
      title: 'Revisar LL · WEB SLINGERS',
      subtitle: 'DCA · Riesgo HIGH',
      park: 'disneyland',
      type: 'reminder',
      start: '12:00',
      end: '12:10',
      scheduleType: 'estimated',
      lightningLane: { watch: true, risk: 'high' },
      notes: 'Vigilar LL — la ventana puede recorrerse varias horas.',
      keywords: ['ll', 'web', 'slingers', 'spider', 'vigilar', 'lightning'],
    },
    {
      id: 'flex-pre-hopper',
      title: 'Atracción flexible',
      subtitle: 'Solo si da tiempo',
      park: 'disneyland',
      type: 'flexible',
      start: '12:30',
      end: '12:50',
      scheduleType: 'estimated',
      anyHeight: true,
      options: ['Pirates of the Caribbean', "It's a Small World", 'Buzz Lightyear', 'Otra pendiente'],
      keywords: ['pirates', 'small world', 'buzz', 'flexible'],
    },
    {
      id: 'prep-hopper',
      title: 'Prepararnos para Park Hopper',
      park: 'disneyland',
      type: 'transport',
      start: '12:50',
      end: '13:00',
      scheduleType: 'estimated',
      keywords: ['hopper', 'preparar', 'cambio'],
    },
    {
      id: 'park-hopper',
      title: 'Cambio de parque',
      subtitle: 'Disneyland Park → Disney California Adventure',
      park: 'transition',
      type: 'park_hopper',
      start: '13:00',
      end: '13:15',
      scheduleType: 'estimated',
      isParkChange: true,
      notes: '≈13:00 salir de DL · ≈13:15 entrar a DCA',
      keywords: ['park hopper', 'cambio', 'hopper', 'transición'],
    },
    {
      id: 'entrada-dca',
      title: 'Entrar a DCA',
      park: 'dca',
      type: 'entrada',
      land: 'Buena Vista Street',
      start: '13:15',
      end: '13:20',
      scheduleType: 'estimated',
      keywords: ['entrada', 'dca', 'california'],
    },
    {
      id: 'anna-elsa',
      title: "Anna + Elsa's Royal Welcome",
      subtitle: 'Hollywood Land',
      park: 'dca',
      type: 'character',
      land: 'Hollywood Land',
      start: '13:20',
      end: '13:50',
      priority: 'critical',
      scheduleType: 'estimated',
      isDailyGoal: true,
      verifySchedule: true,
      notes: 'Objetivo principal #3 · Verificar horario hoy',
      keywords: ['anna', 'elsa', 'frozen', 'reinas', 'objetivo', 'hollywood'],
    },
    {
      id: 'flex-hollywood',
      title: 'Bloque flexible · Hollywood Land',
      park: 'dca',
      type: 'flexible',
      land: 'Hollywood Land',
      start: '13:50',
      end: '14:15',
      scheduleType: 'estimated',
      options: ['Descanso', 'Snack', 'Monsters, Inc.', 'Turtle Talk with Crush', 'Caminar'],
      keywords: ['flexible', 'monsters', 'turtle', 'crush', 'descanso'],
    },
    {
      id: 'trick-treat',
      title: "Mickey's Trick & Treat",
      subtitle: 'Hollywood Land · Función elegida',
      park: 'dca',
      type: 'show',
      land: 'Hollywood Land',
      start: '14:30',
      end: '14:55',
      priority: 'high',
      scheduleType: 'fixed',
      showId: 'show-trick-treat',
      notes: 'Show fijo · Apto para toda la familia',
      keywords: ['trick', 'treat', 'mickey', 'show', 'halloween', 'hollywood'],
    },
    {
      id: 'toy-story',
      title: 'Toy Story Midway Mania!',
      subtitle: 'Pixar Pier',
      park: 'dca',
      type: 'ride',
      land: 'Pixar Pier',
      start: '15:10',
      end: '15:40',
      priority: 'high',
      scheduleType: 'dynamic',
      anyHeight: true,
      lightningLane: { watch: true, risk: 'high', estimatedTime: '15:10' },
      notes: 'Vigilar LL · Agregar horario LL real cuando lo tengas',
      keywords: ['toy', 'story', 'midway', 'mania', 'll', 'lightning', 'pixar'],
    },
    {
      id: 'web-slingers',
      title: 'WEB SLINGERS: A Spider-Man Adventure',
      subtitle: 'Avengers Campus',
      park: 'dca',
      type: 'ride',
      land: 'Avengers Campus',
      start: '15:50',
      end: '16:20',
      priority: 'recommended',
      scheduleType: 'dynamic',
      anyHeight: true,
      lightningLane: { watch: true, risk: 'high' },
      notes: 'Vigilar LL · Guardar ventana real',
      keywords: ['web', 'slingers', 'spider', 'spiderman', 'avengers', 'll'],
    },
    {
      id: 'monsters',
      title: 'Monsters, Inc. Mike & Sulley to the Rescue!',
      subtitle: 'Hollywood Land',
      park: 'dca',
      type: 'ride',
      land: 'Hollywood Land',
      start: '16:30',
      end: '16:55',
      priority: 'high',
      scheduleType: 'estimated',
      anyHeight: true,
      lightningLane: { watch: false, risk: 'medium' },
      notes: 'LL o standby',
      keywords: ['monsters', 'mike', 'sulley', 'rescue'],
    },
    {
      id: 'little-mermaid',
      title: "The Little Mermaid — Ariel's Undersea Adventure",
      subtitle: 'Paradise Gardens Park',
      park: 'dca',
      type: 'ride',
      land: 'Paradise Gardens Park',
      start: '17:00',
      end: '17:25',
      priority: 'high',
      scheduleType: 'estimated',
      anyHeight: true,
      lightningLane: { watch: false, risk: 'low' },
      notes: 'No gastar LL importante si la fila normal es corta.',
      keywords: ['little', 'mermaid', 'ariel', 'sirenita'],
    },
    {
      id: 'jessie-carousel',
      title: "Jessie's Critter Carousel",
      subtitle: 'Pixar Pier',
      park: 'dca',
      type: 'ride',
      land: 'Pixar Pier',
      start: '17:30',
      end: '17:45',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      keywords: ['jessie', 'critter', 'carousel', 'carrusel'],
    },
    {
      id: 'inside-out',
      title: 'Inside Out Emotional Whirlwind',
      subtitle: 'Pixar Pier',
      park: 'dca',
      type: 'ride',
      land: 'Pixar Pier',
      start: '17:45',
      end: '18:00',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      keywords: ['inside', 'out', 'emotional', 'whirlwind'],
    },
    {
      id: 'pal-around',
      title: 'Pixar Pal-A-Round · Non-Swinging',
      subtitle: 'Pixar Pier · NON-SWINGING',
      park: 'dca',
      type: 'ride',
      land: 'Pixar Pier',
      start: '18:00',
      end: '18:20',
      priority: 'recommended',
      scheduleType: 'estimated',
      anyHeight: true,
      notes: 'Elegir NON-SWINGING',
      keywords: ['pixar', 'pal', 'around', 'rueda', 'non-swinging', 'nonswinging'],
    },
    {
      id: 'cena-dca',
      title: 'Cena / Descanso',
      park: 'dca',
      type: 'food',
      start: '18:30',
      end: '19:30',
      scheduleType: 'estimated',
      keywords: ['cena', 'comida', 'descanso', 'dinner', 'food'],
    },
    {
      id: 'flex-evening',
      title: 'Bloque flexible nocturno',
      subtitle: 'Pendientes · paseo · show · hotel',
      park: 'dca',
      type: 'flexible',
      start: '19:30',
      end: '20:30',
      scheduleType: 'estimated',
      options: ['Pendientes', 'Repetir favorita', 'Paseo', 'Descanso', 'Show', 'Comida', 'Regresar al hotel'],
      keywords: ['flexible', 'noche', 'hotel', 'paseo'],
    },
  ],
}
