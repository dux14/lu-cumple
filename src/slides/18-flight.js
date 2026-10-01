// Slide 18: apertura de la revelación. Automática (~7 s) y bloquea
// navegación con ctx.lockNav mientras corre; al terminar aparece la flecha
// de siguiente. Ventanilla en video → la cámara "entra" (blur + zoom) →
// tablero split-flap con los datos del vuelo → frase final.
// El cielo ya acelera solo: `sorpresa` es el aura más rápida (ver
// src/sky-auras.js) y deck.js la aplica al entrar a la slide.
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { createSplitFlap } from '../ui/split-flap.js'
import { outbound } from '../data/trip.js'

const FLAG_COLORS = ['#FCD116', '#003893', '#CE1126', '#AA151B', '#F1BF00', '#ffffff']
const DESTINO_ROW = 1 // índice en ROWS: dispara el confeti cuando termina de formar MADRID

// Los flaps solo tienen letras/números/espacio: sin tildes.
function stripAccents(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
}

// 'vie 30 oct 2026' → '30 OCT'
function shortDate(dateStr) {
  const [, day, month] = dateStr.split(' ')
  return `${day} ${month.toUpperCase()}`
}

const ROW_LENGTH = 7
const ROWS = [
  { label: 'ORIGEN', value: stripAccents(outbound.from.city) },
  { label: 'DESTINO', value: stripAccents(outbound.to.city), tone: 'rose' },
  { label: 'VUELO', value: outbound.flight, tone: 'lilac' },
  { label: 'FECHA', value: shortDate(outbound.date) },
]

export const slide18 = {
  id: '18-flight',
  act: 'sorpresa',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-flight'

    const video = document.createElement('video')
    video.className = 'flight-bg'
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'
    video.poster = `${import.meta.env.BASE_URL}video/ventanilla.jpg`
    video.src = `${import.meta.env.BASE_URL}video/ventanilla.mp4`
    el.appendChild(video)

    const caption = document.createElement('p')
    caption.className = 'flight-caption'
    caption.textContent = 'a 11.000 metros…'
    el.appendChild(caption)

    const board = document.createElement('div')
    board.className = 'flight-board'
    const rows = ROWS.map(({ label, value, tone }, i) => {
      const row = document.createElement('div')
      row.className = 'flight-row'
      const labelEl = document.createElement('span')
      labelEl.className = 'flight-row-label'
      labelEl.textContent = label
      const flap = createSplitFlap(' '.repeat(ROW_LENGTH), { length: ROW_LENGTH, tone, row: i })
      row.append(labelEl, flap.el)
      board.appendChild(row)
      return { flap, value }
    })
    el.appendChild(board)

    const teaser = document.createElement('h1')
    teaser.className = 'display display-md flight-teaser'
    teaser.innerHTML = '¿Lista para <span class="accent">lo que viene</span>?'
    el.appendChild(teaser)

    el._flight = { video, caption, board, rows, teaser }
    return el
  },
  // Ver la nota en text-slide.js: el estado oculto se aplica acá, antes de
  // que el contenedor sea visible.
  prepareEnter(el) {
    const { video, caption, board, teaser } = el._flight
    gsap.set(el, { opacity: 0 })
    gsap.set(video, { opacity: 0, scale: 1, filter: 'brightness(1)' })
    gsap.set(caption, { opacity: 0 })
    gsap.set(board, { opacity: 0, scale: 1.15 })
    gsap.set(teaser, { opacity: 0, y: 10 })
  },
  enter(el, ctx) {
    const { video, caption, board, rows, teaser } = el._flight
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nextBtn = document.querySelector('.nav-next')

    ctx.lockNav(true)
    if (nextBtn) gsap.set(nextBtn, { opacity: 0 })

    const tl = ctx.tl
    tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)

    function revealArrow() {
      ctx.lockNav(false)
      if (nextBtn) gsap.to(nextBtn, { opacity: 0.7, duration: 0.4 })
    }

    function resolveBoard() {
      rows.forEach(({ flap, value }, i) => {
        const done = flap.flipTo(value, { reduced })
        // Un solo disparo, cuando DESTINO termina de formar MADRID.
        if (i === DESTINO_ROW && !reduced) {
          done.then(() => {
            confetti({ particleCount: 140, spread: 80, startVelocity: 45, colors: FLAG_COLORS, origin: { x: 0.5, y: 0.5 } })
          })
        }
      })
    }

    if (reduced) {
      // Sin zoom ni ciclo de letras: ventanilla en póster estático (no se
      // reproduce el video) y el tablero aparece ya resuelto con fade.
      tl.to(caption, { opacity: 1, duration: 0.4 }, 0.1)
      tl.to(board, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
      tl.call(resolveBoard, null, 0.3)
      tl.to(teaser, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1)
      tl.call(revealArrow, null, 1.6)
      return
    }

    // Si el autoplay falla (política del navegador), queda el póster: la
    // secuencia sigue igual, solo sin movimiento en el fondo.
    video.play().catch(() => {})

    tl.to(video, { opacity: 1, duration: 1, ease: 'power2.out' }, 0)
    tl.to(caption, { opacity: 1, duration: 0.4 }, 0.3)
    // La cámara "entra": el video se acerca y se desenfoca. El hint se apaga
    // en el camino, antes de que aparezca el tablero.
    // Este blur sí se mantiene animado (a diferencia del resto de blurs de
    // entrada del encargo): es un solo elemento, no un loop de cientos de
    // estrellas o un cuadro grande en reflow, y quitarlo aplana el efecto
    // "la cámara se desenfoca al entrar" (confirmado con capturas antes/después:
    // sin blur se ve un simple zoom seco). El costo real en iPhone de animar
    // un filter:blur() sobre un único <video> es bajo comparado con los
    // puntos 1 y 3 del encargo.
    tl.to(video, { scale: 2.2, filter: 'blur(14px) brightness(.35)', duration: 1.3, ease: 'power3.in' }, 1.6)
    tl.to(caption, { opacity: 0, duration: 0.4 }, 2.1)
    tl.to(board, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 2.9)
    tl.call(resolveBoard, null, 2.9)
    // El tablero ya se resolvió: el video se relaja y aparece la frase.
    tl.to(video, { scale: 1.08, filter: 'blur(7px) brightness(.5)', duration: 1.4, ease: 'power2.out' }, 5)
    tl.to(teaser, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 5.3)
    tl.call(revealArrow, null, 6.4)
  },
  leave(el) {
    const { video } = el._flight
    video.pause()
    const nextBtn = document.querySelector('.nav-next')
    if (nextBtn) gsap.set(nextBtn, { opacity: '' })
  },
}
