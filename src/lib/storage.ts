/** Persistencia local — claves estables para no perder datos del usuario */

const KEYS = {
  completed: 'disneytrip-completed',
  timeOverrides: 'disneytrip-time-overrides',
  llWindows: 'disneytrip-ll-windows',
  showSelected: 'disneytrip-show-selected',
  showCustomTimes: 'disneytrip-show-custom-times',
  pinnedNow: 'disneytrip-pinned-now',
  customParades: 'disneytrip-custom-parades',
  goals: 'disneytrip-goals-done',
} as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export type TimeOverride = { start: string; end?: string }
export type LlWindow = { returnStart: string; returnEnd?: string }
export type CustomParade = {
  id: string
  name: string
  park: 'disneyland' | 'dca'
  time: string
}

export function loadCompleted(): Set<string> {
  return new Set(readJson<string[]>(KEYS.completed, []))
}

export function saveCompleted(ids: Set<string>): void {
  writeJson(KEYS.completed, [...ids])
}

export function toggleCompleted(id: string, completed: Set<string>): Set<string> {
  const next = new Set(completed)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  saveCompleted(next)
  return next
}

export function loadGoalsDone(): Set<string> {
  return new Set(readJson<string[]>(KEYS.goals, []))
}

export function saveGoalsDone(ids: Set<string>): void {
  writeJson(KEYS.goals, [...ids])
}

export function toggleGoal(id: string, goals: Set<string>): Set<string> {
  const next = new Set(goals)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  saveGoalsDone(next)
  // También marcar actividad como hecha
  const completed = loadCompleted()
  if (next.has(id)) {
    completed.add(id)
  } else {
    completed.delete(id)
  }
  saveCompleted(completed)
  return next
}

export function loadTimeOverrides(): Record<string, TimeOverride> {
  return readJson(KEYS.timeOverrides, {})
}

export function saveTimeOverride(id: string, override: TimeOverride): void {
  const all = loadTimeOverrides()
  all[id] = override
  writeJson(KEYS.timeOverrides, all)
}

export function loadLlWindows(): Record<string, LlWindow> {
  return readJson(KEYS.llWindows, {})
}

export function saveLlWindow(id: string, win: LlWindow): void {
  const all = loadLlWindows()
  all[id] = win
  writeJson(KEYS.llWindows, all)
}

export function clearLlWindow(id: string): void {
  const all = loadLlWindows()
  delete all[id]
  writeJson(KEYS.llWindows, all)
}

export function loadShowSelected(): Record<string, string> {
  return readJson(KEYS.showSelected, {})
}

export function saveShowSelected(showId: string, time: string): void {
  const all = loadShowSelected()
  all[showId] = time
  writeJson(KEYS.showSelected, all)
}

export function loadShowCustomTimes(): Record<string, string[]> {
  return readJson(KEYS.showCustomTimes, {})
}

export function saveShowCustomTimes(showId: string, times: string[]): void {
  const all = loadShowCustomTimes()
  all[showId] = times
  writeJson(KEYS.showCustomTimes, all)
}

export function loadPinnedNow(): string | null {
  return localStorage.getItem(KEYS.pinnedNow)
}

export function savePinnedNow(id: string | null): void {
  if (id) localStorage.setItem(KEYS.pinnedNow, id)
  else localStorage.removeItem(KEYS.pinnedNow)
}

export function loadCustomParades(): CustomParade[] {
  return readJson(KEYS.customParades, [])
}

export function saveCustomParades(parades: CustomParade[]): void {
  writeJson(KEYS.customParades, parades)
}
