// Slide 19: revelación. 4 pasos dentro de la misma slide (steps: 4):
// 0) tiquete holográfico de ida, con anotaciones a mano y tilt interactivo;
// 1) tiquete holográfico de regreso (mismo diseño completo, sin notas);
// 2) calendario doble oct/nov 2026 con el rango pintado como banda continua
// y Halloween el 31; 3) cierre sobre Madrid de noche con la cuenta
// regresiva en flaps.
// Fondo de los pasos 0–2: el video de la ventanilla (mismo lenguaje visual
// que la 18), desenfocado. Paso 3: video de Madrid a pantalla completa.
// Solo un video reproduce a la vez; el otro queda en pausa.
// Cada `.step-scene` ocupa toda la slide y se cruza con la anterior por
// opacidad: showStep() anima ese cruce en cualquier dirección (funciona
// igual hacia atrás), así que las escenas no comparten DOM entre sí.
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { outbound, inbound, passenger } from '../data/trip.js'
import { countdownText, countdownDays } from '../core/countdown.js'
import { createSplitFlap } from '../ui/split-flap.js'
import { getMadridVideo } from '../core/madrid-bg.js'

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MAX_TILT_Y = 11
const MAX_TILT_X = 8
const CLOSE_CONFETTI_COLORS = ['#FF5C7A', '#C9B6FF', '#8C1D40', '#ffffff']

function field(eyebrow, value) {
  const wrap = document.createElement('div')
  wrap.className = 'holo-field'
  const e = document.createElement('p')
  e.className = 'holo-eyebrow'
  e.textContent = eyebrow
  const v = document.createElement('p')
  v.className = 'holo-value'
  v.textContent = value
  wrap.append(e, v)
  return wrap
}

// Tiquete holográfico: mismo diseño completo para ida y regreso (talón
// perforado, foil, glare). Las notas a mano y el tilt se agregan aparte,
// solo para el de ida.
function renderHolo(trip) {
  const card = document.createElement('div')
  card.className = 'holo'

  const main = document.createElement('div')
  main.className = 'holo-main'
  // `.holo-route` es una sola grilla de 3 columnas (origen / flecha /
  // destino): iata y cities son `display:contents`, así cada ciudad cae
  // justo debajo de su código sin tener que medir anchos a mano.
  const route = document.createElement('div')
  route.className = 'holo-route'
  const iata = document.createElement('div')
  iata.className = 'holo-row holo-iata'
  iata.innerHTML = `<span>${trip.from.code}</span><span class="holo-iata-arrow">✈</span><span>${trip.to.code}</span>`
  const cities = document.createElement('div')
  cities.className = 'holo-row holo-cities'
  cities.innerHTML = `<span>${trip.from.city} · ${trip.from.airport}</span><span></span><span>${trip.to.city} · ${trip.to.airport}</span>`
  route.append(iata, cities)
  const meta = document.createElement('div')
  meta.className = 'holo-meta'
  meta.append(field('VUELO', trip.flight), field('FECHA', trip.date), field('SALE', trip.departure), field('ASIENTO', trip.seat))
  main.append(route, meta)
  card.appendChild(main)

  const stub = document.createElement('div')
  stub.className = 'holo-stub'
  const label = document.createElement('p')
  label.className = 'holo-eyebrow'
  label.textContent = 'PASAJERA'
  const name = document.createElement('p')
  name.className = 'holo-passenger'
  name.textContent = passenger
  const bar = document.createElement('div')
  bar.className = 'holo-bar'
  stub.append(label, name, bar)
  card.appendChild(stub)

  const grain = document.createElement('div')
  grain.className = 'holo-grain'
  const foil = document.createElement('div')
  foil.className = 'holo-foil'
  const glare = document.createElement('div')
  glare.className = 'holo-glare'
  card.append(grain, foil, glare)

  return { card, main }
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

function isHalloween(year, monthIndex, day) {
  return year === 2026 && monthIndex === 9 && day === 31
}

// Dibuja un mes y devuelve además `rangeCells` (orden ascendente de día):
// quien arma el paso 2 las concatena entre los dos meses para animarlas en
// orden cronológico. El rango se pinta como banda continua: cada semana
// (7 celdas) cruza el rango en un solo tramo, así que alcanza con saber el
// primer y último índice en range de esa semana para redondear solo esos
// extremos (sin gap entre celdas intermedias, ver `.cal-grid` en el CSS).
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

  const rangeCells = []
  for (let w = 0; w < cells.length; w += 7) {
    const week = cells.slice(w, w + 7)
    const idxInRange = week.reduce((acc, day, i) => (inRange(year, monthIndex, day) ? [...acc, i] : acc), [])
    const startIdx = idxInRange[0]
    const endIdx = idxInRange[idxInRange.length - 1]
    week.forEach((day, i) => {
      const cell = document.createElement('span')
      cell.className = 'cal-day'
      if (day === null) {
        cell.classList.add('cal-day-empty')
      } else {
        cell.textContent = String(day)
        if (inRange(year, monthIndex, day)) {
          cell.classList.add('cal-day-range')
          if (i === startIdx) cell.classList.add('cal-range-start')
          if (i === endIdx) cell.classList.add('cal-range-end')
          rangeCells.push({ el: cell, halloween: isHalloween(year, monthIndex, day) })
        }
        if (isEdge(year, monthIndex, day)) {
          cell.classList.add('cal-day-edge')
          cell.textContent = '✈'
        }
      }
      grid.appendChild(cell)
    })
  }
  box.appendChild(grid)
  return { box, rangeCells }
}

function renderBats() {
  const layer = document.createElement('div')
  layer.className = 'cal-bats'
  for (let i = 0; i < 3; i++) {
    const bat = document.createElement('div')
    bat.className = 'cal-bat'
    layer.appendChild(bat)
  }
  return layer
}

// Cruce único de los murciélagos: de izquierda a derecha, con un aleteo
// vertical leve. `layer` ya está montado (necesitamos su ancho real).
function playBats(layer) {
  const width = layer.getBoundingClientRect().width
  layer.querySelectorAll('.cal-bat').forEach((bat, i) => {
    const y = 15 + i * 18
    gsap.set(bat, { left: -30, top: `${y}%`, opacity: 0 })
    gsap.to(bat, { left: width + 30, opacity: 1, duration: 1.1 + i * 0.15, delay: i * 0.12, ease: 'power1.inOut' })
    gsap.to(bat, { top: `${y - 6}%`, duration: 0.22, repeat: 5, yoyo: true, ease: 'sine.inOut', delay: i * 0.12 })
    gsap.to(bat, { opacity: 0, duration: 0.3, delay: i * 0.12 + 1.1 + i * 0.15 - 0.3 })
  })
}

// Posiciona la nota de Halloween centrada debajo de su celda. Van dos
// calendarios lado a lado en el mismo panel: a la izquierda o derecha de la
// celda casi siempre hay otro mes. El 31 de octubre siempre cae en la
// última fila del mes, así que "abajo" es el único lado libre.
function positionHalloweenNote(panel, cellEl, noteEl) {
  const panelRect = panel.getBoundingClientRect()
  const cellRect = cellEl.getBoundingClientRect()
  noteEl.style.left = `${cellRect.left - panelRect.left + cellRect.width / 2}px`
  noteEl.style.top = `${cellRect.bottom - panelRect.top}px`
}

// Estado final del calendario (sin animar): todas las celdas del rango
// encendidas, Halloween resuelto y el contador en el total. Lo usan
// `prefers-reduced-motion`, una segunda visita al paso y `enterAtStep`.
function calendarFinalState(el) {
  const { rangeCells, counterEl, noteEl, panel } = el._boarding.calendar
  rangeCells.forEach(({ el: cell }) => cell.classList.add('cal-day-lit'))
  const halloweenCell = rangeCells.find((c) => c.halloween)
  if (halloweenCell) {
    halloweenCell.el.textContent = '🎃'
    halloweenCell.el.classList.add('cal-day-halloween')
    positionHalloweenNote(panel, halloweenCell.el, noteEl)
    gsap.set(noteEl, { opacity: 1 })
  }
  counterEl.textContent = `${rangeCells.length} días juntos`
  el._boarding.calendar.animated = true
}

// Entrada animada del calendario: las celdas del rango se encienden una a
// una (stagger ~0.12s) en orden cronológico, con el contador subiendo en
// paralelo. Al llegar a Halloween (31 oct), pausa y dispara la celda
// naranja + murciélagos + nota. Solo corre la primera vez que se ve el
// paso (o directo al final si hay `prefers-reduced-motion`).
function calendarIntro(el, ctx, isCurrent) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || el._boarding.calendar.animated) {
    calendarFinalState(el)
    return
  }
  el._boarding.calendar.animated = true
  const { rangeCells, counterEl, noteEl, batsLayer, panel } = el._boarding.calendar
  rangeCells.forEach((cell, idx) => {
    ctx.tl.call(
      () => {
        if (!isCurrent()) return
        gsap.fromTo(cell.el, { scale: 0.4 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
        cell.el.classList.add('cal-day-lit')
        counterEl.textContent = `${idx + 1} ${idx === 0 ? 'día' : 'días'} juntos`
        if (cell.halloween) {
          cell.el.textContent = '🎃'
          cell.el.classList.add('cal-day-halloween')
          positionHalloweenNote(panel, cell.el, noteEl)
          gsap.to(noteEl, { opacity: 1, duration: 0.3 })
          playBats(batsLayer)
        }
      },
      null,
      idx === 0 ? '+=0' : '+=0.12',
    )
    if (cell.halloween) ctx.tl.to({}, { duration: 0.6 }) // pausa sobre Halloween
  })
}

function stopCountdown(el) {
  if (el._boarding.countdownInterval) {
    clearInterval(el._boarding.countdownInterval)
    el._boarding.countdownInterval = null
  }
}

// Cuenta regresiva del cierre: texto plano en los estados sin días (hoy,
// volando, juntos, ya vivido) y flaps rosas cuando sí faltan días. El flap
// solo re-anima si el número cambió respecto del tick anterior.
function createCountdown() {
  const wrap = document.createElement('div')
  wrap.className = 'countdown-wrap'
  const plain = document.createElement('p')
  plain.className = 'countdown-text'
  const flapLine = document.createElement('p')
  flapLine.className = 'countdown-text countdown-flap-line'
  const verb = document.createElement('span')
  const rest = document.createElement('span')
  flapLine.append(verb, rest)
  wrap.append(plain, flapLine)

  let flap = null
  let flapLen = 0
  let lastDays = null

  // `firstReveal`: la primera vez, los flaps caen animados (arrancan en
  // blanco) en vez de aparecer resueltos; devuelve la promesa de ese
  // volteo para poder encadenar el confeti cuando termina.
  function render(now, { firstReveal = false, reduced = false } = {}) {
    const days = countdownDays(now)
    if (days === null) {
      flapLine.style.display = 'none'
      plain.style.display = ''
      plain.textContent = countdownText(now)
      return Promise.resolve()
    }
    plain.style.display = 'none'
    flapLine.style.display = ''
    verb.textContent = days === 1 ? 'Falta ' : 'Faltan '
    rest.textContent = days === 1 ? ' día para vernos' : ' días para vernos'
    const len = String(days).length
    const animateNow = firstReveal && !reduced
    if (!flap || len !== flapLen) {
      flap?.el.remove()
      flap = createSplitFlap(animateNow ? ' '.repeat(len) : String(days), { length: len, tone: 'rose', size: 'lg' })
      flapLen = len
      flapLine.insertBefore(flap.el, rest)
      lastDays = days
      return animateNow ? flap.flipTo(String(days), { reduced: false }) : Promise.resolve()
    }
    if (days !== lastDays) {
      lastDays = days
      return flap.flipTo(String(days), { reduced })
    }
    return Promise.resolve()
  }

  return { wrap, update: (now) => render(now), revealFirst: (now, reduced) => render(now, { firstReveal: true, reduced }) }
}

// `animateFirst`: solo al entrar al paso 3 avanzando (no en `enterAtStep`
// ni al repetir el tick del segundero): anima la caída de los flaps y, si
// termina mientras seguimos en el paso 3, dispara el confeti suave.
function startCountdown(el, { animateFirst = false } = {}) {
  stopCountdown(el)
  const { countdown } = el._boarding
  if (animateFirst) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    countdown.revealFirst(new Date(), reduced).then(() => {
      if (el._boarding.step !== 3) return
      confetti({
        particleCount: 60,
        spread: 65,
        startVelocity: 22,
        gravity: 0.6,
        colors: CLOSE_CONFETTI_COLORS,
        origin: { x: 0.5, y: 0.55 },
        disableForReducedMotion: true,
      })
    })
  } else {
    countdown.update(new Date())
  }
  el._boarding.countdownInterval = setInterval(() => countdown.update(new Date()), 1000)
}

export const slide19 = {
  id: '19-boarding',
  act: 'sorpresa',
  steps: 4,
  render() {
    const el = document.createElement('div')
    el.className = 'slide-boarding'

    const bgFlight = document.createElement('video')
    bgFlight.className = 'boarding-bg boarding-bg-flight'
    bgFlight.muted = true
    bgFlight.loop = true
    bgFlight.playsInline = true
    bgFlight.preload = 'auto'
    bgFlight.poster = `${import.meta.env.BASE_URL}video/ventanilla.jpg`
    bgFlight.src = `${import.meta.env.BASE_URL}video/ventanilla.mp4`
    el.appendChild(bgFlight)

    // Compartido con la slide 20 (ver src/core/madrid-bg.js): un solo
    // elemento <video>, reparentado en vez de recreado, para no descargar
    // el archivo dos veces cuando el fondo se queda al pasar de la 19 a la 20.
    const bgMadrid = getMadridVideo()
    bgMadrid.className = 'boarding-bg boarding-bg-madrid'
    el.appendChild(bgMadrid)

    const madridShade = document.createElement('div')
    madridShade.className = 'boarding-shade'
    el.appendChild(madridShade)

    // Escena 0: tiquete de ida + anotaciones + tilt.
    const scene0 = document.createElement('div')
    scene0.className = 'step-scene scene-outbound'
    scene0.dataset.scene = '0'
    const { card: outCard } = renderHolo(outbound)
    // Las notas van directo sobre la tarjeta (no dentro de `.holo-main`): así
    // quedan por encima del foil/glare sin importar dónde esté el brillo.
    const arrivalNote = renderAnnotation('te recojo a las 23:25 🌙')
    arrivalNote.classList.add('note-arrival')
    outCard.appendChild(arrivalNote)
    const seatNote = renderAnnotation('pasillo: baño fácil y nadie te molesta', '14, mi número favorito')
    seatNote.classList.add('note-seat')
    outCard.appendChild(seatNote)
    const tiltHint = document.createElement('p')
    tiltHint.className = 'holo-hint'
    tiltHint.textContent = 'mueve el dedo sobre el tiquete'
    scene0.append(outCard, tiltHint)

    // Escena 1: tiquete de regreso, mismo diseño completo, sin notas.
    const scene1 = document.createElement('div')
    scene1.className = 'step-scene scene-inbound'
    scene1.dataset.scene = '1'
    const recap = document.createElement('div')
    recap.className = 'holo-recap'
    recap.innerHTML = `<span class="holo-recap-code">${outbound.from.code}</span><span class="holo-recap-arrow">✈</span><span class="holo-recap-code">${outbound.to.code}</span><span class="holo-recap-label">ida · ${outbound.date}</span>`
    const { card: inCard } = renderHolo(inbound)
    scene1.append(recap, inCard)

    // Escena 2: calendario doble, banda continua + Halloween.
    const scene2 = document.createElement('div')
    scene2.className = 'step-scene scene-calendar'
    scene2.dataset.scene = '2'
    const calPanel = document.createElement('div')
    calPanel.className = 'cal-panel'
    const calWrap = document.createElement('div')
    calWrap.className = 'cal-wrap'
    const octCal = renderCalendar(2026, 9)
    const novCal = renderCalendar(2026, 10)
    calWrap.append(octCal.box, novCal.box)
    const calCounter = document.createElement('p')
    calCounter.className = 'display display-sm cal-caption'
    const counterEl = document.createElement('span')
    counterEl.className = 'accent'
    counterEl.textContent = '1 día juntos'
    calCounter.appendChild(counterEl)
    const halloweenNote = document.createElement('div')
    halloweenNote.className = 'cal-halloween-note'
    halloweenNote.textContent = 'Halloween juntos 🎃'
    const bats = renderBats()
    calPanel.append(calWrap, calCounter, halloweenNote, bats)
    scene2.append(calPanel)

    // Escena 3: cierre sobre Madrid + cuenta regresiva.
    const scene3 = document.createElement('div')
    scene3.className = 'step-scene scene-final'
    scene3.dataset.scene = '3'
    const finalTitle = document.createElement('h1')
    finalTitle.className = 'display display-lg'
    finalTitle.innerHTML = 'Esto es <span class="accent final-accent">para ti</span>'
    const countdown = createCountdown()
    const finalNote = document.createElement('p')
    finalNote.className = 'boarding-note'
    finalNote.textContent = 'te espero en Madrid · 30 OCT · 23:25'
    scene3.append(finalTitle, countdown.wrap, finalNote)

    el.append(scene0, scene1, scene2, scene3)
    el._boarding = {
      bgFlight,
      bgMadrid,
      madridShade,
      scenes: [scene0, scene1, scene2, scene3],
      outCard,
      inCard,
      arrivalNote,
      seatNote,
      tiltHint,
      countdown,
      calendar: { rangeCells: [...octCal.rangeCells, ...novCal.rangeCells], counterEl, noteEl: halloweenNote, batsLayer: bats, panel: calPanel, animated: false },
      inCardEntered: false,
      tilt: null,
      tiltCard: null,
    }
    return el
  },
  prepareEnter(el) {
    const { scenes, outCard, inCard, arrivalNote, seatNote, tiltHint, bgMadrid, madridShade } = el._boarding
    el._boarding.step = 0
    el._boarding.tiltCard = outCard
    gsap.set(scenes, { opacity: 0 })
    gsap.set(scenes.slice(1), { display: 'none' })
    gsap.set(outCard, { opacity: 0, rotationY: -110, rotationX: 18, scale: 0.6 })
    gsap.set(inCard, { opacity: 0, rotationY: -110, rotationX: 18, scale: 0.6 })
    gsap.set([arrivalNote, seatNote], { opacity: 0, y: 8 })
    gsap.set(tiltHint, { opacity: 0 })
    gsap.set([bgMadrid, madridShade], { opacity: 0, scale: 1.12 })
  },
  enter(el, ctx) {
    const { bgFlight, scenes, outCard, arrivalNote, seatNote, tiltHint } = el._boarding
    const scene0 = scenes[0]
    gsap.set(scene0, { display: 'flex' })
    bgFlight.play().catch(() => {})

    setupTilt(el)

    const tl = ctx.tl
    tl.to(scene0, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
    tl.to(outCard, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.1)
    // Barrido de brillo sobre el foil, ya con el tiquete de frente.
    tl.fromTo(outCard, { '--gx': '0%' }, { '--gx': '100%', duration: 1.2, ease: 'sine.inOut' }, 1.3)
    // Las notas aparecen recién cuando el tiquete terminó de entrar (1.5s).
    tl.to([arrivalNote, seatNote], { opacity: 1, y: 0, duration: 0.4, stagger: 0.15, ease: 'power2.out' }, 1.6)
    tl.to(tiltHint, { opacity: 0.8, duration: 0.4 }, 2.0)
  },
  // ctx.tl es la MISMA timeline del enter() de la slide, reusada en cada
  // paso: hay que encolar con posiciones relativas ('<', '+=', sin números
  // absolutos) porque el playhead ya avanzó de largo.
  showStep(el, i, ctx) {
    const { bgFlight, bgMadrid, madridShade, scenes, outCard, inCard } = el._boarding
    const target = scenes[i]
    const others = scenes.filter((s) => s !== target)
    // Paso vigente: si ella avanza rápido, las llamadas encoladas por pasos
    // anteriores corren después del gsap.set de este paso; cada llamada
    // consulta el paso vigente para no ocultar ni pausar lo que ya se muestra.
    el._boarding.step = i
    const isCurrent = () => el._boarding.step === i

    gsap.set(target, { display: 'flex' })
    ctx.tl.to(others, { opacity: 0, duration: 0.35, ease: 'power2.in' })
    ctx.tl.to(target, { opacity: 1, duration: 0.45, ease: 'power2.out' }, '<0.15')
    ctx.tl.call(() => {
      const current = scenes[el._boarding.step]
      scenes.forEach((s) => {
        if (s !== current) gsap.set(s, { display: 'none' })
      })
    })

    if (i === 3) {
      ctx.tl.call(() => {
        if (!isCurrent()) return
        bgFlight.pause()
        bgMadrid.currentTime = 0
        bgMadrid.play().catch(() => {})
        startCountdown(el, { animateFirst: true })
      })
      ctx.tl.fromTo(
        [bgMadrid, madridShade],
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' },
        '<',
      )
    } else {
      stopCountdown(el)
      ctx.tl.to([bgMadrid, madridShade], { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
      ctx.tl.call(() => {
        if (!isCurrent()) return
        bgMadrid.pause()
        bgFlight.play().catch(() => {})
      })
    }

    // Tilt: solo el tiquete del paso activo recibe el gesto del dedo.
    el._boarding.tiltCard = i === 0 ? outCard : i === 1 ? inCard : null

    if (i === 1) {
      if (!el._boarding.inCardEntered) {
        el._boarding.inCardEntered = true
        ctx.tl.fromTo(
          inCard,
          { opacity: 0, rotationY: -110, rotationX: 18, scale: 0.6 },
          { opacity: 1, rotationY: 0, rotationX: 0, scale: 1, duration: 1.4, ease: 'expo.out' },
          '<',
        )
        ctx.tl.fromTo(inCard, { '--gx': '0%' }, { '--gx': '100%', duration: 1.2, ease: 'sine.inOut' }, '<+=0.2')
      } else {
        gsap.set(inCard, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1 })
      }
    }

    if (i === 2) calendarIntro(el, ctx, isCurrent)
  },
  // Retroceso desde la slide 20: muestra directo la escena del paso sin
  // recorrer las anteriores ni repetir entradas/confeti.
  enterAtStep(el, step, ctx) {
    const { bgFlight, bgMadrid, madridShade, scenes, outCard, inCard, arrivalNote, seatNote, tiltHint } = el._boarding
    gsap.set(outCard, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1 })
    gsap.set(inCard, { opacity: 1, rotationY: 0, rotationX: 0, scale: 1 })
    el._boarding.inCardEntered = true
    gsap.set([arrivalNote, seatNote], { opacity: 1, y: 0 })
    gsap.set(tiltHint, { opacity: 0 })
    el._boarding.step = step
    el._boarding.tiltCard = step === 0 ? outCard : step === 1 ? inCard : null
    scenes.forEach((s, i) => gsap.set(s, { display: i === step ? 'flex' : 'none' }))
    ctx.tl.to(scenes[step], { opacity: 1, duration: 0.4, ease: 'power2.out' })
    setupTilt(el)
    if (step === 2) calendarFinalState(el)
    if (step === 3) {
      gsap.set([bgMadrid, madridShade], { opacity: 1, scale: 1 })
      bgMadrid.play().catch(() => {})
      startCountdown(el)
    } else {
      bgFlight.play().catch(() => {})
    }
  },
  leave(el) {
    stopCountdown(el)
    teardownTilt(el)
    el._boarding.bgFlight.pause()
    el._boarding.bgMadrid.pause()
  },
}

// Tilt de los tiquetes: sigue el dedo (pointermove) sobre el tiquete del
// paso activo (`el._boarding.tiltCard`) y, si el dispositivo lo permite
// (tras un tap sobre un tiquete), el giroscopio. Nunca llama
// preventDefault: no debe romper el swipe horizontal de navegación.
function setupTilt(el) {
  teardownTilt(el)
  const { tiltHint } = el._boarding
  let hinted = false
  let permissionAsked = false

  function hideHint() {
    if (hinted) return
    hinted = true
    gsap.to(tiltHint, { opacity: 0, duration: 0.3 })
  }

  function applyTilt(nx, ny) {
    const card = el._boarding.tiltCard
    if (!card) return
    gsap.to(card, { rotationY: nx * MAX_TILT_Y, rotationX: -ny * MAX_TILT_X, duration: 0.4, overwrite: 'auto' })
    card.style.setProperty('--mx', `${(nx * 0.5 + 0.5) * 100}%`)
    card.style.setProperty('--my', `${(ny * 0.5 + 0.5) * 100}%`)
    card.style.setProperty('--gx', `${(nx * 0.5 + 0.5) * 100}%`)
    card.style.setProperty('--gy', `${(ny * 0.5 + 0.5) * 100}%`)
  }

  function onPointerMove(e) {
    const card = el._boarding.tiltCard
    if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    applyTilt(clampUnit(x * 2 - 1), clampUnit(y * 2 - 1))
    hideHint()
  }

  function onOrientation(e) {
    if (e.beta === null || e.gamma === null) return
    applyTilt(clampUnit(e.gamma / 30), clampUnit((e.beta - 45) / 30))
    hideHint()
  }

  // Un tap sobre cualquiera de los dos tiquetes pide permiso de giroscopio
  // en iOS (solo una vez); si se niega o no existe, queda el tilt táctil.
  async function onTap(e) {
    if (!e.target.closest?.('.holo')) return
    hideHint()
    if (permissionAsked) return
    permissionAsked = true
    const DOE = window.DeviceOrientationEvent
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission()
        if (result === 'granted') window.addEventListener('deviceorientation', onOrientation)
      } catch {
        // se niega el permiso: queda el tilt táctil, sin romper nada
      }
    } else if (DOE) {
      window.addEventListener('deviceorientation', onOrientation)
    }
  }

  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('click', onTap)
  el._boarding.tilt = { onPointerMove, onOrientation, onTap }
}

function teardownTilt(el) {
  const { tilt } = el._boarding
  if (!tilt) return
  el.removeEventListener('pointermove', tilt.onPointerMove)
  el.removeEventListener('click', tilt.onTap)
  window.removeEventListener('deviceorientation', tilt.onOrientation)
  el._boarding.tilt = null
}

function clampUnit(n) {
  return Math.max(-1, Math.min(1, n))
}
