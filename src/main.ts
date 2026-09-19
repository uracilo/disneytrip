import {
  DAILY_GOAL_IDS,
  PARK_NAMES,
  trip,
  type Activity,
  type Park,
} from './data/itinerary'
import { shows as showsData } from './data/shows'
import {
  buildSnapshot,
  countdownLabel,
  formatCountdown,
  type DaySnapshot,
} from './lib/activity'
import {
  getSelectedShowtime,
  getShowTimes,
  resolveActivities,
  resolveShows,
  type EffectiveActivity,
} from './lib/effective'
import { searchAll } from './lib/search'
import {
  clearLlWindow,
  loadCompleted,
  loadCustomParades,
  loadGoalsDone,
  loadPinnedNow,
  saveCustomParades,
  saveGoalsDone,
  saveLlWindow,
  savePinnedNow,
  saveShowCustomTimes,
  saveShowSelected,
  saveTimeOverride,
  toggleCompleted,
  toggleGoal,
  type CustomParade,
} from './lib/storage'
import {
  formatAnaheimClock,
  formatDisplayTime,
  getSimulatedClock,
  isPriorityCritical,
  minutesUntil,
  setSimulatedClock,
} from './lib/time'
import { activityDotIcon, activityIcon, iconLabel, icons } from './ui/icons'
import './style.css'

type View = 'ahora' | 'itinerario' | 'shows' | 'buscar'

let view: View = 'ahora'
let completed = loadCompleted()
let goalsDone = loadGoalsDone()
let pinnedNow = loadPinnedNow()
let searchQuery = ''
let highlightId: string | null = null
let highlightTimer: number | null = null
let clockTimer: number | null = null
let editor: null | {
  mode: 'time' | 'll' | 'show-pick' | 'show-times' | 'parade'
  id: string
  title: string
} = null

const app = document.querySelector<HTMLDivElement>('#app')!

function parkClass(park: Park | null): string {
  if (park === 'dca') return 'park-dca'
  if (park === 'disneyland') return 'park-dl'
  if (park === 'transition') return 'park-transition'
  return 'park-dl'
}

function statusLabel(status: string): string {
  switch (status) {
    case 'pasada':
      return 'Pasada'
    case 'ahora':
      return 'Ahora'
    case 'sigue':
      return 'Sigue'
    case 'futura':
      return 'Futura'
    case 'completada':
      return 'Hecha'
    default:
      return ''
  }
}

function scheduleBadge(kind: string): string {
  if (kind === 'fijo') return '<span class="sch-badge sch-fijo">Fijo</span>'
  if (kind === 'll-real') return '<span class="sch-badge sch-ll">LL real</span>'
  return '<span class="sch-badge sch-est">Estimado</span>'
}

function timeRange(a: Activity): string {
  if (a.end) return `${formatDisplayTime(a.start)} – ${formatDisplayTime(a.end)}`
  return formatDisplayTime(a.start)
}

function riskLabel(r?: string): string {
  if (r === 'high' || r === 'alto') return 'ALTO'
  if (r === 'medium' || r === 'medio') return 'MEDIO'
  if (r === 'low' || r === 'bajo') return 'BAJO'
  return ''
}

function badges(a: EffectiveActivity, status?: string): string {
  const parts: string[] = []
  if (isPriorityCritical(a.priority) || a.isDailyGoal) {
    parts.push(`<span class="badge badge-priority">${icons.star}<span>Prioridad</span></span>`)
  } else if (a.priority === 'high') {
    parts.push(`<span class="badge badge-priority"><span>Alta</span></span>`)
  }
  if (a.lightningLane?.watch || a.lightningLane?.risk === 'high') {
    parts.push(
      `<span class="badge badge-ll badge-ll-pulse">${icons.bolt}<span>Lightning Lane · Vigilar</span></span>`,
    )
  } else if (a.lightningLane) {
    parts.push(`<span class="badge badge-ll-soft">${icons.bolt}<span>Lightning Lane</span></span>`)
  }
  if (a.anyHeight) parts.push(`<span class="badge badge-done"><span>Any Height</span></span>`)
  if (a.verifySchedule) {
    parts.push(`<span class="badge badge-verify"><span>Verificar horario hoy</span></span>`)
  }
  if (status === 'completada' || completed.has(a.id)) {
    parts.push(`<span class="badge badge-done">${icons.check}<span>Hecho</span></span>`)
  }
  parts.push(scheduleBadge(a.scheduleKind))
  return parts.length ? `<div class="badges">${parts.join('')}</div>` : ''
}

function eyebrow(icon: string, text: string): string {
  return `<p class="eyebrow">${iconLabel(icon, text)}</p>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

function getState() {
  completed = loadCompleted()
  goalsDone = loadGoalsDone()
  pinnedNow = loadPinnedNow()
  const effective = resolveActivities(trip.activities)
  const showList = resolveShows()
  const snap = buildSnapshot(
    effective,
    trip.date,
    completed,
    showList,
    pinnedNow,
  )
  return { effective, showList, snap }
}

function renderGoals(snap: DaySnapshot): string {
  const goals = snap.dailyGoals
  if (!goals.length) return ''
  return `
    <section class="card card-goals">
      ${eyebrow(icons.star, 'Objetivos del día')}
      <ul class="goals-list goals-day">
        ${goals
          .map((a) => {
            const done = goalsDone.has(a.id) || completed.has(a.id)
            const short =
              a.id === 'mickey'
                ? 'Mickey'
                : a.id === 'pooh-meet'
                  ? 'Pooh'
                  : 'Anna + Elsa'
            return `
              <li class="goal-row${done ? ' is-done' : ''}">
                <button type="button" class="goal-toggle" data-action="toggle-goal" data-id="${a.id}">
                  <span class="goal-check">${done ? '✓' : ''}</span>
                  <span class="goal-emoji">${activityIcon(a)}</span>
                  <span class="goal-name">${short}</span>
                </button>
                <span class="goal-time">${formatDisplayTime(a.start)}</span>
              </li>`
          })
          .join('')}
      </ul>
    </section>`
}

function renderNow(snap: DaySnapshot): string {
  const park = snap.currentPark
  const parkName = park ? PARK_NAMES[park] : '—'
  const clock = formatAnaheimClock()

  const currentBlock = snap.current
    ? `
      <section class="card card-now" data-id="${snap.current.id}">
        ${eyebrow(icons.sparkle, 'Ahora')}
        <div class="title-row">
          <span class="cat-ico">${activityIcon(snap.current)}</span>
          <h2 class="now-title">${escapeHtml(snap.current.title)}</h2>
        </div>
        ${snap.current.subtitle ? `<p class="now-sub">${escapeHtml(snap.current.subtitle)}</p>` : ''}
        <p class="now-time">${icons.clock}${timeRange(snap.current)}</p>
        ${badges(snap.current)}
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" data-action="toggle-done" data-id="${snap.current.id}">
            ${icons.check}
            ${completed.has(snap.current.id) ? 'Desmarcar' : 'Marcar como hecho'}
          </button>
          <button type="button" class="btn btn-tiny" data-action="pin-now" data-id="${snap.current.id}">
            ${pinnedNow === snap.current.id ? 'Quitar fijar' : 'Mantener como ahora'}
          </button>
          <button type="button" class="btn btn-tiny" data-action="edit-time" data-id="${snap.current.id}">
            Cambiar hora
          </button>
        </div>
      </section>`
    : snap.dayDone
      ? `
      <section class="card card-now card-now-empty">
        ${eyebrow(icons.sparkle, 'Ahora')}
        <h2 class="now-title">Día listo</h2>
        <p class="now-sub">No quedan actividades pendientes. ¡Buen trabajo!</p>
      </section>`
      : `
      <section class="card card-now card-now-empty">
        ${eyebrow(icons.sparkle, snap.isTripDay ? 'Ahora' : 'Plan del día')}
        <h2 class="now-title">${snap.isTripDay ? 'En camino' : 'Sábado 26 sep'}</h2>
        <p class="now-sub">${
          snap.next
            ? `Lo próximo: ${escapeHtml(snap.next.title)}`
            : 'No hay más actividades pendientes'
        }</p>
      </section>`

  const nextShowBlock =
    snap.nextShow && (snap.nextShow.soon || snap.nextShow.urgent || !snap.isTripDay)
      ? `
      <section class="card card-show-next${snap.nextShow.urgent ? ' is-urgent' : ''}">
        ${eyebrow(icons.show, snap.nextShow.urgent ? '¡Show pronto!' : 'Próximo show')}
        <h3 class="next-title">${escapeHtml(snap.nextShow.show.title)}</h3>
        <p class="next-meta">
          <span>${formatDisplayTime(snap.nextShow.time)}</span>
          <span class="countdown">${formatCountdown(snap.nextShow.minutesUntil)}</span>
        </p>
        <button type="button" class="btn btn-tiny" data-action="goto-shows">Ver shows</button>
      </section>`
      : snap.nextShow && snap.nextShow.minutesUntil <= 90
        ? `
      <section class="card card-show-next">
        ${eyebrow(icons.show, 'Próximo show')}
        <h3 class="next-title">${escapeHtml(snap.nextShow.show.title)}</h3>
        <p class="next-meta">
          <span>${formatDisplayTime(snap.nextShow.time)}</span>
          <span class="countdown">${formatCountdown(snap.nextShow.minutesUntil)}</span>
        </p>
      </section>`
        : ''

  const nextBlock = snap.next
    ? `
      <section class="card card-next" data-id="${snap.next.id}">
        ${eyebrow(icons.clock, 'Sigue')}
        <div class="title-row title-row-sm">
          <span class="cat-ico">${activityIcon(snap.next)}</span>
          <h3 class="next-title">${escapeHtml(snap.next.title)}</h3>
        </div>
        ${snap.next.subtitle ? `<p class="muted">${escapeHtml(snap.next.subtitle)}</p>` : ''}
        <p class="next-meta">
          <span>${formatDisplayTime(snap.next.start)}</span>
          <span class="countdown">${countdownLabel(snap.next, snap.nowMinutes)}</span>
        </p>
        ${badges(snap.next)}
      </section>`
    : ''

  const afterBlock = snap.afterNext
    ? `
      <section class="card card-after" data-id="${snap.afterNext.id}">
        ${eyebrow(icons.list, 'Después')}
        <p class="after-line">
          <strong>${escapeHtml(snap.afterNext.title)}</strong>
          <span>${formatDisplayTime(snap.afterNext.start)}</span>
        </p>
      </section>`
    : ''

  const llBlock =
    snap.watchLanes.length > 0
      ? `
      <section class="ll-panel">
        ${eyebrow(icons.bolt, 'Lightning Lane — ¡Vigilar!')}
        <div class="ll-buttons">
          ${snap.watchLanes
            .map(
              (a, i) => `
            <button type="button" class="ll-btn ll-bounce" style="animation-delay:${i * 0.15}s"
              data-action="jump" data-id="${a.id}">
              <span class="ll-btn-bolt">${activityIcon(a)}</span>
              <span class="ll-btn-body">
                <span class="ll-btn-title">${escapeHtml(a.title)}</span>
                <span class="ll-btn-meta">
                  ${
                    a.llWindow?.returnStart
                      ? `LL ${formatDisplayTime(a.llWindow.returnStart)}${a.llWindow.returnEnd ? ' – ' + formatDisplayTime(a.llWindow.returnEnd) : ''}`
                      : a.lightningLane?.estimatedTime
                        ? `Estimado ${formatDisplayTime(a.lightningLane.estimatedTime)}`
                        : formatDisplayTime(a.start)
                  }
                  ${a.lightningLane?.risk ? ` · Riesgo ${riskLabel(a.lightningLane.risk)}` : ''}
                </span>
                <span class="ll-btn-cta">Ver · Agregar horario LL</span>
              </span>
              <span class="ll-btn-watch">Vigilar</span>
            </button>`,
            )
            .join('')}
        </div>
      </section>`
      : ''

  const dateNote =
    snap.dateString !== trip.date
      ? `<p class="trip-date-note">Itinerario del <strong>sábado 26 sep 2026</strong> · Hoy en Anaheim: ${snap.dateString}</p>`
      : ''

  return `
    <header class="top-bar">
      <div class="clock-block" aria-live="polite">
        <span class="clock-label">${icons.castle} Anaheim</span>
        <span class="clock">${clock}</span>
      </div>
      <button type="button" class="btn btn-search-top" data-action="open-search" aria-label="Buscar">
        ${icons.search} Buscar
      </button>
    </header>
    <div class="brand-row">
      <p class="brand">${icons.sparkle} Guía Disney</p>
      <p class="park-name">${icons.castle} ${escapeHtml(parkName)}</p>
    </div>
    ${dateNote}
    <div class="now-stack">
      ${currentBlock}
      ${nextShowBlock}
      ${nextBlock}
      ${afterBlock}
      ${llBlock}
      ${renderGoals(snap)}
      <button type="button" class="btn btn-ghost" data-action="goto-itinerario">
        ${icons.list} Ver itinerario
      </button>
    </div>
    ${import.meta.env.DEV ? renderDevPanel() : ''}
  `
}

function renderDevPanel(): string {
  const sim = getSimulatedClock()
  const presets = [
    '08:00',
    '09:00',
    '09:55',
    '10:05',
    '13:20',
    '14:15',
    '14:25',
    '15:30',
    '20:50',
    '21:30',
  ]
  return `
    <section class="dev-panel">
      <p class="dev-title">DEV · Simular hora (Anaheim)</p>
      <div class="dev-presets">
        ${presets
          .map(
            (t) =>
              `<button type="button" class="btn btn-tiny" data-action="sim-time" data-time="${t}">${t}</button>`,
          )
          .join('')}
        <button type="button" class="btn btn-tiny" data-action="sim-clear">Real</button>
      </div>
      <p class="muted">Fecha fija simulada: 2026-09-26 ${sim?.minutes != null ? `· ${formatDisplayTime(String(Math.floor(sim.minutes / 60)).padStart(2, '0') + ':' + String(sim.minutes % 60).padStart(2, '0'))}` : ''}</p>
    </section>`
}

function renderTimeline(snap: DaySnapshot, effective: EffectiveActivity[]): string {
  let lastPark: Park | null = null
  const items = effective
    .map((a) => {
      let parkHeader = ''
      if (a.isParkChange) {
        lastPark = 'transition'
        return `
          <li class="tl-change" id="act-${a.id}" data-id="${a.id}">
            <div class="change-banner">
              <p class="change-label">${icons.sparkle} Park Hopper</p>
              <p class="change-from">${icons.castle} Disneyland Park · ${formatDisplayTime(a.start)}</p>
              <p class="change-arrow" aria-hidden="true">↓</p>
              <p class="change-to">${icons.sparkle} Disney California Adventure · ${formatDisplayTime(a.end ?? a.start)}</p>
            </div>
          </li>`
      }

      if (a.park !== lastPark && a.park !== 'transition') {
        lastPark = a.park
        parkHeader = `
          <li class="tl-park-header park-head-${a.park === 'dca' ? 'dca' : 'dl'}">
            <p>${PARK_NAMES[a.park]}</p>
          </li>`
      }

      const status = snap.statuses.get(a.id) ?? 'futura'
      const hl = highlightId === a.id ? ' is-highlight' : ''
      const done = completed.has(a.id)
      const isWatch =
        Boolean(a.lightningLane?.watch || a.lightningLane?.risk === 'high') &&
        !done &&
        status !== 'pasada'

      return `
        ${parkHeader}
        <li class="tl-item status-${status}${hl}${done ? ' is-done' : ''}${isWatch ? ' has-ll-watch' : ''} park-${a.park === 'dca' ? 'dca' : a.park === 'disneyland' ? 'dl' : 'tr'}"
            id="act-${a.id}" data-id="${a.id}">
          <div class="tl-time-col">
            <time datetime="${a.start}">${formatDisplayTime(a.start)}</time>
            <span class="tl-status-text">${statusLabel(done ? 'completada' : status)}</span>
          </div>
          <div class="tl-dot">${activityDotIcon(a, isWatch)}</div>
          <div class="tl-body${isWatch ? ' tl-body-ll' : ''}">
            <div class="title-row title-row-sm">
              <span class="cat-ico">${activityIcon(a)}</span>
              <h3 class="tl-title">${escapeHtml(a.title)}</h3>
            </div>
            ${a.subtitle ? `<p class="muted">${escapeHtml(a.subtitle)}</p>` : ''}
            ${a.land ? `<p class="muted">${escapeHtml(a.land)}</p>` : ''}
            <p class="tl-park">${PARK_NAMES[a.park]}</p>
            ${badges(a, done ? 'completada' : status)}
            ${
              a.verifySchedule
                ? `<p class="verify-note">Verificar horario hoy · Disneyland App</p>`
                : ''
            }
            ${
              isWatch
                ? `<div class="ll-btn ll-btn-inline ll-bounce" role="status">${icons.bolt}<span>Lightning Lane · Vigilar</span></div>`
                : ''
            }
            <div class="btn-row">
              ${
                !done
                  ? `<button type="button" class="btn btn-tiny" data-action="toggle-done" data-id="${a.id}">${icons.check} Marcar como hecho</button>`
                  : `<button type="button" class="btn btn-tiny" data-action="toggle-done" data-id="${a.id}">Desmarcar</button>`
              }
              <button type="button" class="btn btn-tiny" data-action="edit-time" data-id="${a.id}">Cambiar hora</button>
              ${
                a.lightningLane || a.type === 'ride'
                  ? `<button type="button" class="btn btn-tiny" data-action="edit-ll" data-id="${a.id}">Agregar horario LL</button>`
                  : ''
              }
              ${
                a.showId
                  ? `<button type="button" class="btn btn-tiny" data-action="change-show" data-id="${a.showId}">Cambiar función</button>`
                  : ''
              }
            </div>
          </div>
        </li>`
    })
    .join('')

  return `
    <header class="top-bar top-bar-compact">
      <div class="brand-row brand-row-compact">
        <p class="brand">Guía Disney</p>
        <p class="section-title">Itinerario</p>
      </div>
      <button type="button" class="btn btn-secondary btn-compact" data-action="goto-ahora">
        ${icons.sparkle} Volver a ahora
      </button>
    </header>
    <ol class="timeline">${items}</ol>
  `
}

function renderShows(): string {
  const showList = resolveShows()
  const parades = loadCustomParades()
  const nowMins = buildSnapshot(
    resolveActivities(trip.activities),
    trip.date,
    completed,
    showList,
    pinnedNow,
  ).nowMinutes

  const cards = showList
    .map((s) => {
      const times = getShowTimes(s)
      const selected = getSelectedShowtime(s)
      const nextT = times.find((t) => minutesUntil(t, nowMins) >= 0) ?? selected
      return `
        <article class="show-card priority-${s.priority}" id="show-${s.id}">
          <div class="show-head">
            <h3>${escapeHtml(s.title)}</h3>
            <span class="show-park">${PARK_NAMES[s.park]}</span>
          </div>
          ${s.land ? `<p class="muted">${escapeHtml(s.land)}</p>` : ''}
          <p class="show-meta">
            ${s.kind === 'night-show' ? '<span class="badge badge-ll-soft">Espectáculo nocturno</span>' : ''}
            ${s.priority === 'high' ? '<span class="badge badge-priority">Alta</span>' : ''}
            ${s.scheduleStatus === 'verify-day-of' ? '<span class="badge badge-verify">Verificar horario hoy</span>' : ''}
          </p>
          ${
            selected
              ? `<p class="show-selected"><strong>Función elegida:</strong> ${formatDisplayTime(selected)}</p>`
              : ''
          }
          ${
            nextT && times.length
              ? `<p class="muted">Próxima: ${formatDisplayTime(nextT)} · ${formatCountdown(minutesUntil(nextT, nowMins))}</p>`
              : ''
          }
          ${
            times.length
              ? `<div class="show-times">
                  <p class="eyebrow">Otras funciones</p>
                  <div class="time-chips">
                    ${times
                      .map(
                        (t) =>
                          `<button type="button" class="chip${t === selected ? ' is-on' : ''}" data-action="pick-showtime" data-show="${s.id}" data-time="${t}">${formatDisplayTime(t)}</button>`,
                      )
                      .join('')}
                  </div>
                </div>`
              : `<p class="verify-note">Sin horarios guardados · Verificar en Disneyland App el mismo día</p>
                 <button type="button" class="btn btn-secondary" data-action="edit-show-times" data-id="${s.id}">Agregar horarios</button>`
          }
          ${s.notes ? `<p class="muted show-notes">${escapeHtml(s.notes)}</p>` : ''}
          <p class="verify-note subtle">Verificar en Disneyland App el mismo día</p>
        </article>`
    })
    .join('')

  return `
    <header class="top-bar top-bar-compact">
      <div class="brand-row brand-row-compact">
        <p class="brand">Guía Disney</p>
        <p class="section-title">Shows</p>
      </div>
    </header>
    <div class="shows-stack">
      ${cards}
      <section class="card parade-card">
        <h3>Desfiles</h3>
        <p class="muted"><strong>No hay desfile confirmado actualmente</strong> para el sábado 26 sep 2026.</p>
        <p class="verify-note">Verificar Disneyland App el mismo día.</p>
        ${
          parades.length
            ? `<ul class="parade-list">${parades
                .map(
                  (p) =>
                    `<li><strong>${escapeHtml(p.name)}</strong> · ${PARK_NAMES[p.park]} · ${formatDisplayTime(p.time)}</li>`,
                )
                .join('')}</ul>`
            : ''
        }
        <button type="button" class="btn btn-secondary" data-action="add-parade">Agregar desfile</button>
      </section>
    </div>
  `
}

function renderSearch(snap: DaySnapshot, effective: EffectiveActivity[]): string {
  const showList = resolveShows()
  const results = searchAll(effective, showList, searchQuery)

  const list =
    searchQuery.trim().length === 0
      ? `<p class="search-hint">Pooh, Mickey, Anna, Toy, Spider, Mermaid, Coco, Fantasmic, LL…</p>`
      : results.length === 0
        ? `<p class="search-hint">Sin resultados para “${escapeHtml(searchQuery)}”</p>`
        : `<ul class="search-results">
            ${results
              .map((h) => {
                if (h.kind === 'show' && h.show) {
                  const t = getSelectedShowtime(h.show)
                  return `
                    <li>
                      <button type="button" class="search-hit" data-action="goto-show" data-id="${h.show.id}">
                        <span class="hit-title">🎭 ${escapeHtml(h.title)}</span>
                        <span class="hit-meta">${escapeHtml(h.meta)}</span>
                        ${t ? `<span class="hit-status">Función ${formatDisplayTime(t)}</span>` : ''}
                      </button>
                    </li>`
                }
                const a = h.activity!
                const mins = minutesUntil(a.start, snap.nowMinutes)
                return `
                  <li>
                    <button type="button" class="search-hit${a.lightningLane?.watch ? ' search-hit-ll' : ''}" data-action="jump" data-id="${a.id}">
                      <span class="hit-title">${activityIcon(a)} ${escapeHtml(a.title)}</span>
                      <span class="hit-meta">
                        ${formatDisplayTime(a.start)} · ${PARK_NAMES[a.park]}
                        ${a.lightningLane ? ' · Lightning Lane' : ''}
                        ${a.lightningLane?.risk ? ` · Riesgo ${riskLabel(a.lightningLane.risk)}` : ''}
                      </span>
                      <span class="hit-status">${formatCountdown(mins)}</span>
                    </button>
                  </li>`
              })
              .join('')}
          </ul>`

  return `
    <div class="search-page">
      <header class="search-header-page">
        <label class="search-label" for="search-input">${icons.search} Buscar</label>
      </header>
      <input
        id="search-input"
        class="search-input"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Pooh, Mickey, Spider-Man, LL…"
        value="${escapeAttr(searchQuery)}"
      />
      ${list}
    </div>
  `
}

function renderEditor(): string {
  if (!editor) return ''
  if (editor.mode === 'time') {
    const a = resolveActivities(trip.activities).find((x) => x.id === editor!.id)
    return `
      <div class="sheet-overlay" data-action="close-editor">
        <div class="sheet" role="dialog" aria-label="Cambiar hora" data-stop>
          <h3>${escapeHtml(editor.title)}</h3>
          <label class="field-label">Hora inicio
            <input id="edit-start" type="time" value="${a?.start ?? '10:00'}" />
          </label>
          <label class="field-label">Hora fin (opcional)
            <input id="edit-end" type="time" value="${a?.end ?? ''}" />
          </label>
          <button type="button" class="btn btn-secondary" data-action="save-time" data-id="${editor.id}">Guardar</button>
          <button type="button" class="btn btn-ghost" data-action="close-editor">Cerrar</button>
        </div>
      </div>`
  }
  if (editor.mode === 'll') {
    const a = resolveActivities(trip.activities).find((x) => x.id === editor!.id)
    return `
      <div class="sheet-overlay" data-action="close-editor">
        <div class="sheet" role="dialog" aria-label="Horario LL" data-stop>
          <h3>Lightning Lane</h3>
          <p class="muted">${escapeHtml(editor.title)}</p>
          <label class="field-label">Inicio ventana
            <input id="ll-start" type="time" value="${a?.llWindow?.returnStart ?? a?.start ?? '15:00'}" />
          </label>
          <label class="field-label">Fin ventana
            <input id="ll-end" type="time" value="${a?.llWindow?.returnEnd ?? ''}" />
          </label>
          <button type="button" class="btn btn-secondary" data-action="save-ll" data-id="${editor.id}">Guardar LL</button>
          <button type="button" class="btn btn-tiny" data-action="clear-ll" data-id="${editor.id}">Quitar LL real</button>
          <button type="button" class="btn btn-ghost" data-action="close-editor">Cerrar</button>
        </div>
      </div>`
  }
  if (editor.mode === 'show-pick') {
    const show = showsData.find((s) => s.id === editor!.id)
    const times = show ? getShowTimes(show) : []
    return `
      <div class="sheet-overlay" data-action="close-editor">
        <div class="sheet" role="dialog" aria-label="Cambiar función" data-stop>
          <h3>Cambiar función</h3>
          <p class="muted">${escapeHtml(editor.title)}</p>
          <div class="time-chips">
            ${times
              .map(
                (t) =>
                  `<button type="button" class="chip" data-action="pick-showtime" data-show="${editor!.id}" data-time="${t}">${formatDisplayTime(t)}</button>`,
              )
              .join('')}
          </div>
          <button type="button" class="btn btn-ghost" data-action="close-editor">Cerrar</button>
        </div>
      </div>`
  }
  if (editor.mode === 'show-times') {
    return `
      <div class="sheet-overlay" data-action="close-editor">
        <div class="sheet" role="dialog" aria-label="Agregar horarios" data-stop>
          <h3>Agregar horarios</h3>
          <p class="muted">${escapeHtml(editor.title)}</p>
          <label class="field-label">Horarios (HH:MM separados por coma)
            <input id="show-times-input" type="text" placeholder="13:55, 15:10, 16:15" />
          </label>
          <button type="button" class="btn btn-secondary" data-action="save-show-times" data-id="${editor.id}">Guardar</button>
          <button type="button" class="btn btn-ghost" data-action="close-editor">Cerrar</button>
        </div>
      </div>`
  }
  if (editor.mode === 'parade') {
    return `
      <div class="sheet-overlay" data-action="close-editor">
        <div class="sheet" role="dialog" aria-label="Agregar desfile" data-stop>
          <h3>Agregar desfile</h3>
          <label class="field-label">Nombre
            <input id="parade-name" type="text" placeholder="Nombre del desfile" />
          </label>
          <label class="field-label">Parque
            <select id="parade-park">
              <option value="disneyland">Disneyland Park</option>
              <option value="dca">Disney California Adventure</option>
            </select>
          </label>
          <label class="field-label">Hora
            <input id="parade-time" type="time" value="17:00" />
          </label>
          <button type="button" class="btn btn-secondary" data-action="save-parade">Guardar</button>
          <button type="button" class="btn btn-ghost" data-action="close-editor">Cerrar</button>
        </div>
      </div>`
  }
  return ''
}

function renderNav(): string {
  return `
    <nav class="bottom-nav" aria-label="Navegación principal">
      <button type="button" class="nav-btn${view === 'ahora' ? ' is-active' : ''}" data-action="goto-ahora">
        <span class="nav-ico">${icons.sparkle}</span>
        <span class="nav-label">Ahora</span>
      </button>
      <button type="button" class="nav-btn${view === 'itinerario' ? ' is-active' : ''}" data-action="goto-itinerario">
        <span class="nav-ico">${icons.list}</span>
        <span class="nav-label">Itinerario</span>
      </button>
      <button type="button" class="nav-btn${view === 'shows' ? ' is-active' : ''}" data-action="goto-shows">
        <span class="nav-ico">${icons.show}</span>
        <span class="nav-label">Shows</span>
      </button>
      <button type="button" class="nav-btn${view === 'buscar' ? ' is-active' : ''}" data-action="open-search">
        <span class="nav-ico">${icons.search}</span>
        <span class="nav-label">Buscar</span>
      </button>
    </nav>
  `
}

function render(): void {
  const { effective, snap } = getState()
  let main = ''
  if (view === 'ahora') main = renderNow(snap)
  else if (view === 'itinerario') main = renderTimeline(snap, effective)
  else if (view === 'shows') main = renderShows()
  else main = renderSearch(snap, effective)

  app.className = `app ${parkClass(snap.currentPark)}`
  app.innerHTML = `
    <main class="screen" id="main-screen">${main}</main>
    ${renderEditor()}
    ${renderNav()}
  `

  if (view === 'buscar') {
    const input = app.querySelector<HTMLInputElement>('#search-input')
    input?.focus()
    if (input) {
      const len = input.value.length
      input.setSelectionRange(len, len)
    }
  }

  if (highlightId && view === 'itinerario') {
    requestAnimationFrame(() => {
      document.getElementById(`act-${highlightId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }
}

function jumpToActivity(id: string): void {
  view = 'itinerario'
  searchQuery = ''
  highlightId = id
  editor = null
  if (highlightTimer) window.clearTimeout(highlightTimer)
  highlightTimer = window.setTimeout(() => {
    highlightId = null
    render()
  }, 2800)
  render()
}

function onClick(e: Event): void {
  const target = e.target as HTMLElement
  if (target.closest('[data-stop]')) {
    // allow buttons inside sheet
  } else if (target.matches('.sheet-overlay')) {
    editor = null
    render()
    return
  }

  const t = target.closest<HTMLElement>('[data-action]')
  if (!t) return
  const action = t.dataset.action
  const id = t.dataset.id

  switch (action) {
    case 'goto-ahora':
      view = 'ahora'
      editor = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'goto-itinerario':
      view = 'itinerario'
      editor = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'goto-shows':
      view = 'shows'
      editor = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'open-search':
      view = 'buscar'
      searchQuery = ''
      editor = null
      render()
      break
    case 'goto-show':
      view = 'shows'
      editor = null
      render()
      requestAnimationFrame(() => {
        document.getElementById(`show-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      break
    case 'toggle-done':
      if (id) {
        completed = toggleCompleted(id, completed)
        if (pinnedNow === id && completed.has(id)) {
          pinnedNow = null
          savePinnedNow(null)
        }
        if ((DAILY_GOAL_IDS as readonly string[]).includes(id)) {
          goalsDone = new Set(goalsDone)
          if (completed.has(id)) goalsDone.add(id)
          else goalsDone.delete(id)
          saveGoalsDone(goalsDone)
        }
        render()
      }
      break
    case 'toggle-goal':
      if (id) {
        goalsDone = toggleGoal(id, goalsDone)
        completed = loadCompleted()
        render()
      }
      break
    case 'pin-now':
      if (id) {
        pinnedNow = pinnedNow === id ? null : id
        savePinnedNow(pinnedNow)
        render()
      }
      break
    case 'jump':
      if (id) {
        // Si es LL, permitir también editar
        jumpToActivity(id)
      }
      break
    case 'edit-time':
      if (id) {
        const a = trip.activities.find((x) => x.id === id)
        editor = { mode: 'time', id, title: a?.title ?? 'Actividad' }
        render()
      }
      break
    case 'edit-ll':
      if (id) {
        const a = trip.activities.find((x) => x.id === id)
        editor = { mode: 'll', id, title: a?.title ?? 'LL' }
        render()
      }
      break
    case 'change-show':
      if (id) {
        const s = showsData.find((x) => x.id === id)
        editor = { mode: 'show-pick', id, title: s?.title ?? 'Show' }
        render()
      }
      break
    case 'edit-show-times':
      if (id) {
        const s = showsData.find((x) => x.id === id)
        editor = { mode: 'show-times', id, title: s?.title ?? 'Show' }
        render()
      }
      break
    case 'add-parade':
      editor = { mode: 'parade', id: 'parade', title: 'Desfile' }
      render()
      break
    case 'close-editor':
      editor = null
      render()
      break
    case 'save-time':
      if (id) {
        const start = (app.querySelector('#edit-start') as HTMLInputElement)?.value
        const end = (app.querySelector('#edit-end') as HTMLInputElement)?.value
        if (start) {
          saveTimeOverride(id, { start, end: end || undefined })
          editor = null
          render()
        }
      }
      break
    case 'save-ll':
      if (id) {
        const returnStart = (app.querySelector('#ll-start') as HTMLInputElement)?.value
        const returnEnd = (app.querySelector('#ll-end') as HTMLInputElement)?.value
        if (returnStart) {
          saveLlWindow(id, { returnStart, returnEnd: returnEnd || undefined })
          editor = null
          render()
        }
      }
      break
    case 'clear-ll':
      if (id) {
        clearLlWindow(id)
        editor = null
        render()
      }
      break
    case 'pick-showtime': {
      const showId = t.dataset.show
      const time = t.dataset.time
      if (showId && time) {
        saveShowSelected(showId, time)
        // sync timeline activity
        const show = showsData.find((s) => s.id === showId)
        if (show?.timelineActivityId) {
          const dur = show.durationMinutes ?? 25
          const [h, m] = time.split(':').map(Number)
          const endM = h * 60 + m + dur
          const end = `${String(Math.floor(endM / 60) % 24).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`
          saveTimeOverride(show.timelineActivityId, { start: time, end })
        }
        editor = null
        render()
      }
      break
    }
    case 'save-show-times':
      if (id) {
        const raw = (app.querySelector('#show-times-input') as HTMLInputElement)?.value ?? ''
        const times = raw
          .split(/[,;\s]+/)
          .map((x) => x.trim())
          .filter((x) => /^\d{1,2}:\d{2}$/.test(x))
          .map((x) => {
            const [h, m] = x.split(':')
            return `${h.padStart(2, '0')}:${m}`
          })
        if (times.length) {
          saveShowCustomTimes(id, times)
          saveShowSelected(id, times[0])
          editor = null
          render()
        }
      }
      break
    case 'save-parade': {
      const name = (app.querySelector('#parade-name') as HTMLInputElement)?.value?.trim()
      const park = (app.querySelector('#parade-park') as HTMLSelectElement)?.value as
        | 'disneyland'
        | 'dca'
      const time = (app.querySelector('#parade-time') as HTMLInputElement)?.value
      if (name && time) {
        const list = loadCustomParades()
        const item: CustomParade = {
          id: `parade-${Date.now()}`,
          name,
          park,
          time,
        }
        list.push(item)
        saveCustomParades(list)
        editor = null
        render()
      }
      break
    }
    case 'sim-time': {
      const time = t.dataset.time
      if (time) {
        const [h, m] = time.split(':').map(Number)
        setSimulatedClock({ date: trip.date, minutes: h * 60 + m })
        render()
      }
      break
    }
    case 'sim-clear':
      setSimulatedClock(null)
      render()
      break
  }
}

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement
  if (target.id !== 'search-input') return
  searchQuery = target.value
  render()
  const input = app.querySelector<HTMLInputElement>('#search-input')
  if (input) {
    input.focus()
    const len = input.value.length
    input.setSelectionRange(len, len)
  }
}

app.addEventListener('click', onClick)
app.addEventListener('input', onInput)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editor) {
    editor = null
    render()
  }
})

function startClock(): void {
  if (clockTimer) window.clearInterval(clockTimer)
  clockTimer = window.setInterval(() => {
    if (!editor) render()
    else {
      const clock = app.querySelector('.clock')
      if (clock) clock.textContent = formatAnaheimClock()
    }
  }, 30_000)
}

render()
startClock()

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') render()
})

// Guard against Bluey / Haunted Mansion appearing in data
const FORBIDDEN = [/bluey/i, /haunted\s*mansion/i]
for (const a of trip.activities) {
  const blob = `${a.title} ${a.notes ?? ''} ${(a.keywords ?? []).join(' ')}`
  if (FORBIDDEN.some((r) => r.test(blob))) {
    console.error('Forbidden content in itinerary', a.id)
  }
}
for (const s of showsData) {
  const blob = `${s.title} ${s.notes ?? ''}`
  if (FORBIDDEN.some((r) => r.test(blob))) {
    console.error('Forbidden content in shows', s.id)
  }
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        reg.update().catch(() => {})
        if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING')
        reg.addEventListener('updatefound', () => {
          const neu = reg.installing
          neu?.addEventListener('statechange', () => {
            if (neu.state === 'installed' && navigator.serviceWorker.controller) {
              neu.postMessage('SKIP_WAITING')
            }
          })
        })
      })
      .catch(() => {})
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister()
  })
}
