import {
  CATEGORY_LABELS,
  PARK_NAMES,
  trip,
  type Activity,
  type ParkId,
} from './data/itinerary'
import {
  buildSnapshot,
  countdownLabel,
  loadCompleted,
  toggleCompleted,
  type DaySnapshot,
} from './lib/activity'
import { searchActivities } from './lib/search'
import {
  formatAnaheimClock,
  formatDisplayTime,
} from './lib/time'
import { activityDotIcon, activityIcon, iconLabel, icons } from './ui/icons'
import './style.css'

type View = 'ahora' | 'itinerario'

let view: View = 'ahora'
let completed = loadCompleted()
let searchOpen = false
let searchQuery = ''
let highlightId: string | null = null
let highlightTimer: number | null = null
let clockTimer: number | null = null

const app = document.querySelector<HTMLDivElement>('#app')!

function parkClass(park: ParkId | null): string {
  if (park === 'california_adventure') return 'park-dca'
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

function timeRange(a: Activity): string {
  if (a.end) return `${formatDisplayTime(a.start)} – ${formatDisplayTime(a.end)}`
  return formatDisplayTime(a.start)
}

function badges(a: Activity, status?: string): string {
  const parts: string[] = []
  if (a.priority) {
    parts.push(
      `<span class="badge badge-priority">${icons.star}<span>Prioridad</span></span>`,
    )
  }
  if (a.lightningLane?.watch) {
    parts.push(
      `<span class="badge badge-ll badge-ll-pulse">${icons.bolt}<span>Lightning Lane · Vigilar</span></span>`,
    )
  } else if (a.lightningLane) {
    parts.push(
      `<span class="badge badge-ll-soft">${icons.bolt}<span>Lightning Lane</span></span>`,
    )
  }
  if (status === 'completada') {
    parts.push(
      `<span class="badge badge-done">${icons.check}<span>Hecha</span></span>`,
    )
  }
  return parts.length ? `<div class="badges">${parts.join('')}</div>` : ''
}

function eyebrow(icon: string, text: string): string {
  return `<p class="eyebrow">${iconLabel(icon, text)}</p>`
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
        <button type="button" class="btn btn-secondary" data-action="toggle-done" data-id="${snap.current.id}">
          ${icons.check}
          ${completed.has(snap.current.id) ? 'Desmarcar' : 'Marcar como hecho'}
        </button>
      </section>
    `
    : snap.dayDone
      ? `
      <section class="card card-now card-now-empty">
        ${eyebrow(icons.sparkle, 'Ahora')}
        <h2 class="now-title">Día listo</h2>
        <p class="now-sub">No quedan actividades pendientes. ¡Buen trabajo!</p>
      </section>
    `
      : `
      <section class="card card-now card-now-empty">
        ${eyebrow(icons.walk, 'Ahora')}
        <h2 class="now-title">${snap.isTripDay ? 'En camino' : 'Plan del día'}</h2>
        <p class="now-sub">${
          snap.next
            ? `Lo próximo: ${escapeHtml(snap.next.title)}`
            : 'No hay más actividades pendientes'
        }</p>
      </section>
    `

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
      </section>
    `
    : ''

  const afterBlock = snap.afterNext
    ? `
      <section class="card card-after" data-id="${snap.afterNext.id}">
        ${eyebrow(icons.list, 'Después')}
        <p class="after-line">
          <strong>${escapeHtml(snap.afterNext.title)}</strong>
          <span>${formatDisplayTime(snap.afterNext.start)}</span>
        </p>
      </section>
    `
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
            <button
              type="button"
              class="ll-btn ll-bounce"
              style="animation-delay: ${i * 0.18}s"
              data-action="jump"
              data-id="${a.id}"
            >
              <span class="ll-btn-bolt" aria-hidden="true">${activityIcon(a)}</span>
              <span class="ll-btn-body">
                <span class="ll-btn-title">${escapeHtml(a.title)}</span>
                <span class="ll-btn-meta">
                  ${
                    a.lightningLane?.estimatedTime
                      ? `Estimado ${formatDisplayTime(a.lightningLane.estimatedTime)}`
                      : formatDisplayTime(a.start)
                  }
                  ${a.lightningLane?.risk ? ` · Riesgo ${a.lightningLane.risk}` : ''}
                </span>
                <span class="ll-btn-cta">Ver en itinerario</span>
              </span>
              <span class="ll-btn-watch">Vigilar</span>
            </button>`,
            )
            .join('')}
        </div>
      </section>
    `
      : ''

  const goals =
    snap.priorities.length > 0
      ? `
      <section class="card card-goals">
        ${eyebrow(icons.star, 'Prioridad del día')}
        <ul class="goals-list">
          ${snap.priorities
            .map(
              (a) =>
                `<li><span class="goal-item">${activityIcon(a)}<span>${escapeHtml(a.title)}</span></span><span>${formatDisplayTime(a.start)}</span></li>`,
            )
            .join('')}
        </ul>
      </section>
    `
      : ''

  return `
    <header class="top-bar">
      <div class="clock-block" aria-live="polite">
        <span class="clock-label">${icons.castle} Anaheim</span>
        <span class="clock">${clock}</span>
      </div>
      <button type="button" class="btn btn-search-top" data-action="open-search" aria-label="Buscar">
        ${icons.search}
        Buscar
      </button>
    </header>

    <div class="brand-row">
      <p class="brand">${icons.sparkle} Guía Disney</p>
      <p class="park-name" data-park="${park ?? ''}">${icons.castle} ${escapeHtml(parkName)}</p>
    </div>

    <div class="now-stack">
      ${currentBlock}
      ${nextBlock}
      ${afterBlock}
      ${llBlock}
      ${goals}
      <button type="button" class="btn btn-ghost" data-action="goto-itinerario">
        ${icons.list}
        Ver itinerario
      </button>
    </div>
  `
}

function renderTimeline(snap: DaySnapshot): string {
  const items = trip.activities
    .map((a) => {
      if (a.isParkChange) {
        return `
          <li class="tl-change" id="act-${a.id}" data-id="${a.id}">
            <div class="change-banner">
              <p class="change-label">${icons.hopper} Cambio de parque</p>
              <p class="change-from">${icons.castle} Disneyland Park · ${formatDisplayTime(a.start)}</p>
              <p class="change-arrow" aria-hidden="true">↓</p>
              <p class="change-to">${icons.sparkle} Disney California Adventure · ${formatDisplayTime(a.end ?? a.start)}</p>
            </div>
          </li>
        `
      }

      const status = snap.statuses.get(a.id) ?? 'futura'
      const hl = highlightId === a.id ? ' is-highlight' : ''
      const done = completed.has(a.id)
      const isWatch = Boolean(a.lightningLane?.watch) && !done && status !== 'pasada'

      return `
        <li class="tl-item status-${status}${hl}${done ? ' is-done' : ''}${isWatch ? ' has-ll-watch' : ''} park-${a.park === 'california_adventure' ? 'dca' : a.park === 'disneyland' ? 'dl' : 'tr'}"
            id="act-${a.id}" data-id="${a.id}">
          <div class="tl-time-col">
            <time datetime="${a.start}">${formatDisplayTime(a.start)}</time>
            <span class="tl-status-text">${statusLabel(done ? 'completada' : status)}</span>
          </div>
          <div class="tl-dot" aria-hidden="true">${activityDotIcon(a, isWatch)}</div>
          <div class="tl-body${isWatch ? ' tl-body-ll' : ''}">
            <div class="title-row title-row-sm">
              <span class="cat-ico">${activityIcon(a)}</span>
              <h3 class="tl-title">${escapeHtml(a.title)}</h3>
            </div>
            ${a.subtitle ? `<p class="muted">${escapeHtml(a.subtitle)}</p>` : ''}
            <p class="tl-park">${PARK_NAMES[a.park]}</p>
            ${badges(a, done ? 'completada' : status)}
            ${
              isWatch
                ? `<div class="ll-btn ll-btn-inline ll-bounce" role="status">
                    ${icons.bolt}
                    <span>Lightning Lane · Vigilar</span>
                  </div>`
                : ''
            }
            ${
              status !== 'pasada' && !done
                ? `<button type="button" class="btn btn-tiny" data-action="toggle-done" data-id="${a.id}">${icons.check} Marcar como hecho</button>`
                : done
                  ? `<button type="button" class="btn btn-tiny" data-action="toggle-done" data-id="${a.id}">Desmarcar</button>`
                  : ''
            }
          </div>
        </li>
      `
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
    <ol class="timeline">
      ${items}
    </ol>
  `
}

function renderSearchOverlay(): string {
  if (!searchOpen) return ''

  const results = searchActivities(trip.activities, searchQuery)
  const snap = buildSnapshot(trip.activities, trip.date, completed)

  const list =
    searchQuery.trim().length === 0
      ? `<p class="search-hint">Escribe un nombre: Pooh, Mickey, Toy Story…</p>`
      : results.length === 0
        ? `<p class="search-hint">Sin resultados para “${escapeHtml(searchQuery)}”</p>`
        : `<ul class="search-results">
            ${results
              .map(({ activity: a }) => {
                const status = snap.statuses.get(a.id) ?? 'futura'
                return `
                <li>
                  <button type="button" class="search-hit${a.lightningLane?.watch ? ' search-hit-ll' : ''}" data-action="jump" data-id="${a.id}">
                    <span class="hit-title">${activityIcon(a)} ${escapeHtml(a.title)}</span>
                    <span class="hit-meta">
                      ${formatDisplayTime(a.start)}
                      · ${PARK_NAMES[a.park]}
                      · ${CATEGORY_LABELS[a.category]}
                    </span>
                    <span class="hit-status">
                      ${statusLabel(completed.has(a.id) ? 'completada' : status)}
                      ${a.lightningLane?.watch ? ` · ${icons.bolt} Lightning Lane` : ''}
                      ${a.lightningLane?.risk ? ` · Riesgo ${a.lightningLane.risk}` : ''}
                    </span>
                  </button>
                </li>`
              })
              .join('')}
          </ul>`

  return `
    <div class="search-overlay" role="dialog" aria-modal="true" aria-label="Buscar">
      <div class="search-sheet">
        <div class="search-header">
          <label class="search-label" for="search-input">${icons.search} Buscar</label>
          <button type="button" class="btn btn-secondary btn-compact" data-action="close-search">
            Cerrar
          </button>
        </div>
        <input
          id="search-input"
          class="search-input"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="Pooh, Mickey, Spider-Man…"
          value="${escapeAttr(searchQuery)}"
        />
        ${list}
      </div>
    </div>
  `
}

function renderNav(): string {
  return `
    <nav class="bottom-nav" aria-label="Navegación principal">
      <button type="button" class="nav-btn${view === 'ahora' && !searchOpen ? ' is-active' : ''}" data-action="goto-ahora">
        <span class="nav-ico">${icons.sparkle}</span>
        <span class="nav-label">Ahora</span>
      </button>
      <button type="button" class="nav-btn${view === 'itinerario' && !searchOpen ? ' is-active' : ''}" data-action="goto-itinerario">
        <span class="nav-ico">${icons.list}</span>
        <span class="nav-label">Itinerario</span>
      </button>
      <button type="button" class="nav-btn${searchOpen ? ' is-active' : ''}" data-action="open-search">
        <span class="nav-ico">${icons.search}</span>
        <span class="nav-label">Buscar</span>
      </button>
    </nav>
  `
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

function render(): void {
  const snap = buildSnapshot(trip.activities, trip.date, completed)
  const park = snap.currentPark

  const main =
    view === 'ahora' ? renderNow(snap) : renderTimeline(snap)

  app.className = `app ${parkClass(park)}`
  app.innerHTML = `
    <main class="screen" id="main-screen">
      ${main}
    </main>
    ${renderSearchOverlay()}
    ${renderNav()}
  `

  if (searchOpen) {
    const input = app.querySelector<HTMLInputElement>('#search-input')
    if (input) {
      input.focus()
      // Mantener cursor al final tras re-render
      const len = input.value.length
      input.setSelectionRange(len, len)
    }
  }

  if (highlightId && view === 'itinerario') {
    requestAnimationFrame(() => {
      const el = document.getElementById(`act-${highlightId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
}

function openSearch(): void {
  searchOpen = true
  searchQuery = ''
  render()
}

function closeSearch(): void {
  searchOpen = false
  searchQuery = ''
  render()
}

function jumpToActivity(id: string): void {
  searchOpen = false
  searchQuery = ''
  view = 'itinerario'
  highlightId = id
  if (highlightTimer) window.clearTimeout(highlightTimer)
  highlightTimer = window.setTimeout(() => {
    highlightId = null
    render()
  }, 2800)
  render()
}

function onClick(e: Event): void {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!t) return
  const action = t.dataset.action
  const id = t.dataset.id

  switch (action) {
    case 'goto-ahora':
      view = 'ahora'
      searchOpen = false
      highlightId = null
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'goto-itinerario':
      view = 'itinerario'
      searchOpen = false
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      break
    case 'open-search':
      openSearch()
      break
    case 'close-search':
      closeSearch()
      break
    case 'toggle-done':
      if (id) {
        completed = toggleCompleted(id, completed)
        render()
      }
      break
    case 'jump':
      if (id) jumpToActivity(id)
      break
  }
}

function onInput(e: Event): void {
  const target = e.target as HTMLInputElement
  if (target.id !== 'search-input') return
  searchQuery = target.value
  // Re-render solo la lista de resultados sin perder el input
  const snap = buildSnapshot(trip.activities, trip.date, completed)
  const results = searchActivities(trip.activities, searchQuery)
  const container = app.querySelector('.search-sheet')
  if (!container) return

  let listHtml: string
  if (searchQuery.trim().length === 0) {
    listHtml = `<p class="search-hint">Escribe un nombre: Pooh, Mickey, Toy Story…</p>`
  } else if (results.length === 0) {
    listHtml = `<p class="search-hint">Sin resultados para “${escapeHtml(searchQuery)}”</p>`
  } else {
    listHtml = `<ul class="search-results">
      ${results
        .map(({ activity: a }) => {
          const status = snap.statuses.get(a.id) ?? 'futura'
          return `
          <li>
            <button type="button" class="search-hit${a.lightningLane?.watch ? ' search-hit-ll' : ''}" data-action="jump" data-id="${a.id}">
              <span class="hit-title">${activityIcon(a)} ${escapeHtml(a.title)}</span>
              <span class="hit-meta">
                ${formatDisplayTime(a.start)}
                · ${PARK_NAMES[a.park]}
                · ${CATEGORY_LABELS[a.category]}
              </span>
              <span class="hit-status">
                ${statusLabel(completed.has(a.id) ? 'completada' : status)}
                ${a.lightningLane?.watch ? ` · ${icons.bolt} Lightning Lane` : ''}
                ${a.lightningLane?.risk ? ` · Riesgo ${a.lightningLane.risk}` : ''}
              </span>
            </button>
          </li>`
        })
        .join('')}
    </ul>`
  }

  const oldHint = container.querySelector('.search-hint, .search-results')
  if (oldHint) {
    oldHint.outerHTML = listHtml
  } else {
    container.insertAdjacentHTML('beforeend', listHtml)
  }
}

function startClock(): void {
  if (clockTimer) window.clearInterval(clockTimer)
  clockTimer = window.setInterval(() => {
    if (!searchOpen) render()
    else {
      // Solo actualizar reloj si está visible
      const clock = app.querySelector('.clock')
      if (clock) clock.textContent = formatAnaheimClock()
    }
  }, 30_000)
}

app.addEventListener('click', onClick)
app.addEventListener('input', onInput)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchOpen) closeSearch()
})

render()
startClock()

// Refresh al volver a la app (PWA)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') render()
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl).then((reg) => {
      reg.update().catch(() => {})
      // Si hay SW esperando, activarlo ya
      if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING')
      reg.addEventListener('updatefound', () => {
        const neu = reg.installing
        neu?.addEventListener('statechange', () => {
          if (neu.state === 'installed' && navigator.serviceWorker.controller) {
            neu.postMessage('SKIP_WAITING')
          }
        })
      })
    }).catch(() => {
      /* silencioso: la app sigue offline con datos embebidos */
    })
    // Recargar una vez cuando el nuevo SW tome control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
} else if ('serviceWorker' in navigator) {
  // En desarrollo, evitar SW que cachee módulos de Vite
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister()
  })
}
