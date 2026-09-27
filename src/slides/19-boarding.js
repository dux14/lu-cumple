// Slide 19: revelación. 4 pasos dentro de la misma slide (steps: 4):
// 1) tarjeta de embarque de ida, con anotaciones a mano; 2) entra la de
// regreso; 3) calendario doble oct/nov 2026 con el rango pintado;
// 4) texto final + cuenta regresiva en vivo + confeti suave.
// Cada `.step-scene` ocupa toda la slide y se cruza con la anterior por
// opacidad: showStep() anima ese cruce en cualquier dirección (funciona
// igual hacia atrás), así que las escenas no comparten DOM entre sí.
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { outbound, inbound, passenger, reservation, airline } from '../data/trip.js'
import { countdownText } from '../core/countdown.js'

const CONFETTI_COLORS = ['#FF5C7A', '#C9B6FF', '#8C1D40', '#ffffff']
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function field(eyebrow, value) {
  const wrap = document.createElement('div')
  wrap.className = 'pass-field'
  const e = document.createElement('p')
  e.className = 'pass-eyebrow'
  e.textContent = eyebrow
  const v = document.createElement('p')
  v.className = 'pass-value'
  v.textContent = value
  wrap.append(e, v)
  return wrap
}

// Tarjeta de embarque. `compact`: sin anotaciones, más chica (para la de
// regreso en el paso 2).
function renderBoardingPass(trip, { compact = false } = {}) {
  const card = document.createElement('div')
  card.className = `boarding-pass${compact ? ' boarding-pass-compact' : ''}`

  const main = document.createElement('div')
  main.className = 'pass-main'

  const header = document.createElement('div')
  header.className = 'pass-header'
  const airlineEl = document.createElement('span')
  airlineEl.className = 'pass-airline'
  airlineEl.textContent = airline
  const passengerEl = document.createElement('span')
  passengerEl.className = 'pass-passenger'
  passengerEl.textContent = passenger
  header.append(airlineEl, passengerEl)
  main.appendChild(header)

  const route = document.createElement('div')
  route.className = 'pass-route'
  const from = document.createElement('span')
  from.className = 'pass-code'
  from.textContent = trip.from.code
  const arrow = document.createElement('span')
  arrow.className = 'pass-route-arrow'
  arrow.textContent = '✈'
  const to = document.createElement('span')
  to.className = 'pass-code'
  to.textContent = trip.to.code
  route.append(from, arrow, to)
  main.appendChild(route)

  const grid = document.createElement('div')
  grid.className = 'pass-grid'
  grid.append(
    field('Vuelo', trip.flight),
    field('Fecha', trip.date),
    field('Salida', trip.departure),
    field('Llegada', trip.arrival),
  )
  if (!compact) {
    grid.append(field('Asiento', trip.seat), field('Reserva', reservation))
  }
  main.appendChild(grid)
  card.appendChild(main)

  const stub = document.createElement('div')
  stub.className = 'pass-stub'
  stub.append(field('Asiento', trip.seat), field('Vuelo', trip.flight))
  card.appendChild(stub)

  return { card, main, stub }
}

function renderAnnotation(text, extra) {
  const wrap = document.createElement('div')
  wrap.className = 'hand-note'
  const p = document.createElement('p')
  p.textContent = text
  wrap.appendChild(p)
  if (extra) {
    const p2 = document.createElement('p')
    p2.textContent = extra
    wrap.appendChild(p2)
  }
  return wrap
}

function noteArrow() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('hand-arrow')
  svg.setAttribute('viewBox', '0 0 60 40')
  svg.innerHTML =
    '<path d="M2 4 C 20 2, 35 20, 55 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /><path d="M46 24 L56 31 L47 36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />'
  return svg
}

function buildMonthGrid(year, monthIndex) {
  const first = new Date(Date.UTC(year, monthIndex, 1))
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const startOffset = (first.getUTCDay() + 6) % 7 // lunes = 0
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return { name: MONTH_NAMES[monthIndex], year, cells }
}

function inRange(year, monthIndex, day) {
  if (day === null) return false
  const date = Date.UTC(year, monthIndex, day)
  return date >= Date.UTC(2026, 9, 30) && date <= Date.UTC(2026, 10, 10)
}

function isEdge(year, monthIndex, day) {
  if (day === null) return false
  const date = Date.UTC(year, monthIndex, day)
  return date === Date.UTC(2026, 9, 30) || date === Date.UTC(2026, 10, 10)
}

function renderCalendar(year, monthIndex) {
  const { name, cells } = buildMonthGrid(year, monthIndex)
  const box = document.createElement('div')
  box.className = 'cal-month'
  const title = document.createElement('p')
  title.className = 'cal-title'
  title.textContent = `${name} ${year}`
  box.appendChild(title)

  const grid = document.createElement('div')
  grid.className = 'cal-grid'
  WEEKDAYS.forEach((w) => {
    const h = document.createElement('span')
    h.className = 'cal-weekday'
    h.textContent = w
    grid.appendChild(h)
  })
  cells.forEach((day) => {
    const cell = document.createElement('span')
    cell.className = 'cal-day'
    if (day === null) {
      cell.classList.add('cal-day-empty')
    } else {
      cell.textContent = String(day)
      if (inRange(year, monthIndex, day)) cell.classList.add('cal-day-range')
      if (isEdge(year, monthIndex, day)) {
        cell.classList.add('cal-day-edge')
        cell.textContent = '✈'
      }
    }
    grid.appendChild(cell)
  })
  box.appendChild(grid)
  return box
}

function stopCountdown(el) {
  if (el._countdownInterval) {
    clearInterval(el._countdownInterval)
    el._countdownInterval = null
  }
}

function startCountdown(el, textEl) {
  stopCountdown(el)
  const update = () => {
    textEl.textContent = countdownText(new Date())
  }
  update()
  el._countdownInterval = setInterval(update, 1000)
}

export const slide19 = {
  id: '19-boarding',
  act: 'sorpresa',
  steps: 4,
  render() {
    const el = document.createElement('div')
    el.className = 'slide-boarding'

    // Escena 0: tarjeta de ida + anotaciones.
    const scene0 = document.createElement('div')
    scene0.className = 'step-scene scene-outbound'
    scene0.dataset.scene = '0'
    const { card: outCard, stub: outStub } = renderBoardingPass(outbound)
    const seatNote = renderAnnotation('pasillo: baño fácil', 'y nadie te molesta')
    seatNote.classList.add('note-seat')
    seatNote.appendChild(noteArrow())
    const arrivalNote = renderAnnotation('te recojo a las 23:25 🌙')
    arrivalNote.classList.add('note-arrival')
    scene0.append(outCard, seatNote, arrivalNote)

    // Escena 1: recap de ida (chico) + tarjeta de regreso.
    const scene1 = document.createElement('div')
    scene1.className = 'step-scene scene-inbound'
    scene1.dataset.scene = '1'
    const recap = document.createElement('div')
    recap.className = 'pass-recap'
    recap.innerHTML = `<span class="pass-code">${outbound.from.code}</span><span class="pass-route-arrow">✈</span><span class="pass-code">${outbound.to.code}</span><span class="pass-recap-label">ida · ${outbound.date}</span>`
    const { card: inCard } = renderBoardingPass(inbound, { compact: true })
    scene1.append(recap, inCard)

    // Escena 2: calendario doble.
    const scene2 = document.createElement('div')
    scene2.className = 'step-scene scene-calendar'
    scene2.dataset.scene = '2'
    const calWrap = document.createElement('div')
    calWrap.className = 'cal-wrap'
    calWrap.append(renderCalendar(2026, 9), renderCalendar(2026, 10))
    const calNote = document.createElement('p')
    calNote.className = 'display display-sm cal-caption'
    calNote.innerHTML = '<span class="accent">12 días juntos</span>'
    scene2.append(calWrap, calNote)

    // Escena 3: cierre + cuenta regresiva.
    const scene3 = document.createElement('div')
    scene3.className = 'step-scene scene-final'
    scene3.dataset.scene = '3'
    const finalTitle = document.createElement('h1')
    finalTitle.className = 'display display-lg'
    finalTitle.textContent = 'Esto es para ti'
    const countdownEl = document.createElement('p')
    countdownEl.className = 'countdown-text'
    scene3.append(finalTitle, countdownEl)

    el.append(scene0, scene1, scene2, scene3)
    el._boarding = { scenes: [scene0, scene1, scene2, scene3], outCard, outStub, seatNote, arrivalNote, countdownEl }
    return el
  },
  prepareEnter(el) {
    const { scenes, outCard, outStub, seatNote, arrivalNote } = el._boarding
    gsap.set(scenes, { opacity: 0 })
    gsap.set(scenes.slice(1), { display: 'none' })
    gsap.set(outCard, { opacity: 0, y: 24 })
    gsap.set(outStub, { rotate: 0, x: 0, y: 0 })
    gsap.set([seatNote, arrivalNote], { opacity: 0, y: 8 })
  },
  enter(el, ctx) {
    const { scenes, outCard, outStub, seatNote, arrivalNote } = el._boarding
    const scene0 = scenes[0]
    gsap.set(scene0, { display: 'flex' })

    const tl = ctx.tl
    tl.to(scene0, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
    tl.to(outCard, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1)
    // El talón se "arranca": rota levemente y se separa por la línea punteada.
    tl.to(outStub, { rotate: 4, x: 6, y: -2, duration: 0.35, ease: 'power2.out' }, 0.75)
    tl.to([seatNote, arrivalNote], { opacity: 1, y: 0, duration: 0.4, stagger: 0.15, ease: 'power2.out' }, 1.05)
  },
  // ctx.tl es la MISMA timeline del enter() de la slide, reusada en cada
  // paso: hay que encolar con posiciones relativas ('<', sin argumento) en
  // vez de números absolutos, porque el playhead ya avanzó de largo y un
  // número absoluto quedaría detrás (nunca se ejecutaría).
  showStep(el, i, ctx) {
    const { scenes, countdownEl } = el._boarding
    const target = scenes[i]
    const others = scenes.filter((s) => s !== target)

    gsap.set(target, { display: 'flex' })
    ctx.tl.to(others, { opacity: 0, duration: 0.35, ease: 'power2.in' })
    ctx.tl.to(target, { opacity: 1, duration: 0.45, ease: 'power2.out' }, '<0.15')
    ctx.tl.call(() => {
      others.forEach((s) => gsap.set(s, { display: 'none' }))
    })

    if (i === 3) {
      ctx.tl.call(
        () => {
          startCountdown(el, countdownEl)
          confetti({
            particleCount: 70,
            spread: 65,
            startVelocity: 22,
            gravity: 0.6,
            colors: CONFETTI_COLORS,
            origin: { x: 0.5, y: 0.4 },
          })
        },
        null,
        '+=0.15',
      )
    } else {
      stopCountdown(el)
    }
  },
  leave(el) {
    stopCountdown(el)
  },
}
