// Slide 11: "Y con esto acabamos" — el falso final. Opción A del mockup
// aprobado (docs/superpowers/mockups/propuestas-fuertes.html, sección
// "1 · Falso final 11 → 12 · A: apagón de TV"): el texto entra normal, se
// sostiene, y luego colapsa como una TV vieja (línea horizontal → punto →
// negro) mientras la música hace tape stop. El cielo ya se apaga solo por
// el acto 'apagado' (ver applyScene en src/deck.js): esta slide no lo toca,
// solo sincroniza el colapso del texto y el audio con ese apagón. La flecha
// se oculta durante el negro y vuelve tenue al final.
// Tras el negro, opción 11-B del mockup de feedback
// (docs/superpowers/mockups/feedback-11-21.html): una escena post-créditos
// con una sola estrella que titila irregular y, abajo, unos puntos
// suspensivos que se escriben y se borran en loop — sensación de "esto
// sigue encendido, algo va a pasar". Los loops se matan en leave() para no
// dejar timelines vivas corriendo fuera de la slide.
import { gsap } from 'gsap'

const TITLE_HOLD = 2 // s: el texto se sostiene normal antes del colapso
const LINE_COLLAPSE = 0.22
const POINT_COLLAPSE = 0.22
const DOT_FADE = 0.45
const BLACKOUT = 2.5
const ARROW_DIM = 0.2

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function nextArrow() {
  return document.querySelector('.nav-next')
}

// Escena post-créditos: estrella titilando + "…" escribiéndose en loop.
// Arranca justo cuando se desbloquea la navegación, al final del apagón.
function playPostCredits(el) {
  const { star, dots } = el._acabamos

  if (reduced()) {
    gsap.set(star, { opacity: 0.6 })
    gsap.set(dots, { opacity: 0.6 })
    dots.textContent = '...'
    return
  }

  gsap.to(star, { opacity: 1, duration: 0.5, delay: 0.3 })

  const starLoop = gsap.timeline({ repeat: -1 })
  starLoop
    .to(star, { opacity: 0.25, duration: 0.12 }, 0.9)
    .to(star, { opacity: 1, duration: 0.1 }, 1.05)
    .to(star, { opacity: 0.5, duration: 0.3 }, 1.6)
    .to(star, { opacity: 1, duration: 0.2 }, 2.1)
    .to(star, { opacity: 0.15, duration: 0.08 }, 2.9)
    .to(star, { opacity: 0.9, duration: 0.25 }, 3.05)
    .to({}, { duration: 1.1 })

  const dotsLoop = gsap.timeline({ repeat: -1, delay: 0.3 })
  dotsLoop.to(dots, { opacity: 1, duration: 0.2 })
  for (let n = 1; n <= 3; n++) {
    dotsLoop.call(() => { dots.textContent = '.'.repeat(n) }, null, n === 1 ? '+=0' : '+=0.35')
  }
  dotsLoop.to({}, { duration: 0.5 })
  dotsLoop.call(() => { dots.textContent = '..' })
  dotsLoop.to({}, { duration: 0.3 })
  dotsLoop.call(() => { dots.textContent = '.' })
  dotsLoop.to({}, { duration: 0.3 })
  dotsLoop.call(() => { dots.textContent = '' })
  dotsLoop.to(dots, { opacity: 0, duration: 0.3 })
  dotsLoop.to({}, { duration: 0.6 })

  el._acabamos.starLoop = starLoop
  el._acabamos.dotsLoop = dotsLoop
}

// Colapso de TV vieja + tape stop. Corre una sola vez por entrada a la
// slide (cada visita crea DOM nuevo vía render(), así que no hay estado que
// limpiar entre visitas).
function playApagon(el, ctx) {
  const { title, tv, dot } = el._acabamos
  const arrow = nextArrow()

  ctx.lockNav(true)
  if (arrow) gsap.to(arrow, { opacity: 0, duration: 0.3 })
  // El tapeStop de la música se dispara acá directamente (no por el cue de
  // song-cues.js, que solo documenta la intención): evita la doble llamada.
  ctx.audio?.tapeStop()

  const tl = gsap.timeline()
  el._acabamos.tl = tl

  if (reduced()) {
    tl.to(title, { opacity: 0, duration: 0.4 })
    tl.to({}, { duration: BLACKOUT })
  } else {
    tl.to(title, { scaleY: 0.02, filter: 'brightness(3)', duration: LINE_COLLAPSE, ease: 'power3.in' })
    tl.set(title, { opacity: 0 })
    tl.set(tv, { opacity: 1, scaleX: 1 })
    tl.to(tv, { scaleX: 0.011, duration: POINT_COLLAPSE, ease: 'power3.in' })
    tl.set(tv, { opacity: 0 })
    tl.set(dot, { opacity: 1, scale: 1.4 })
    tl.to(dot, { scale: 0.4, opacity: 0, duration: DOT_FADE, ease: 'power2.in' })
    tl.to({}, { duration: BLACKOUT })
  }

  tl.call(() => {
    ctx.lockNav(false)
    const arrowNow = nextArrow()
    if (arrowNow) gsap.to(arrowNow, { opacity: ARROW_DIM, duration: 0.5 })
    playPostCredits(el)
  })
}

export const slide11 = {
  id: '11-acabamos',
  act: 'apagado',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-acabamos'

    const title = document.createElement('h1')
    title.className = 'display display-lg acabamos-title'
    title.innerHTML = 'Y con esto<br /><span class="accent">acabamos</span>'
    el.appendChild(title)

    const tv = document.createElement('div')
    tv.className = 'acabamos-tv'
    el.appendChild(tv)

    const dot = document.createElement('div')
    dot.className = 'acabamos-tvdot'
    el.appendChild(dot)

    const star = document.createElement('div')
    star.className = 'acabamos-star'
    el.appendChild(star)

    const dots = document.createElement('div')
    dots.className = 'acabamos-dots'
    el.appendChild(dots)

    el._acabamos = { title, tv, dot, star, dots, tl: null, starLoop: null, dotsLoop: null }
    return el
  },
  prepareEnter(el) {
    const { title, tv, dot, star, dots } = el._acabamos
    gsap.set(el, { opacity: 0 })
    gsap.set(title, { opacity: 0, y: 10, filter: 'brightness(1)', scaleY: 1 })
    gsap.set([tv, dot], { opacity: 0, scaleX: 1, scale: 1 })
    gsap.set(star, { opacity: 0 })
    gsap.set(dots, { opacity: 0 })
    dots.textContent = ''
  },
  enter(el, ctx) {
    const { title } = el._acabamos
    const tl = ctx.tl
    tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
    tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.call(() => playApagon(el, ctx), null, `+=${TITLE_HOLD}`)
  },
  leave(el) {
    el._acabamos.tl?.kill()
    el._acabamos.starLoop?.kill()
    el._acabamos.dotsLoop?.kill()
    const arrow = nextArrow()
    if (arrow) gsap.set(arrow, { opacity: '' })
  },
}
