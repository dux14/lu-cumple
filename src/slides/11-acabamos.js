// Slide 11: "Y con esto acabamos" — el falso final. Opción A del mockup
// aprobado (docs/superpowers/mockups/propuestas-fuertes.html, sección
// "1 · Falso final 11 → 12 · A: apagón de TV"): el texto entra normal, se
// sostiene, y luego colapsa como una TV vieja (línea horizontal → punto →
// negro) mientras la música hace tape stop. El cielo ya se apaga solo por
// el acto 'apagado' (ver applyScene en src/deck.js): esta slide no lo toca,
// solo sincroniza el colapso del texto y el audio con ese apagón. La flecha
// se oculta durante el negro y vuelve tenue al final.
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

    el._acabamos = { title, tv, dot, tl: null }
    return el
  },
  prepareEnter(el) {
    const { title, tv, dot } = el._acabamos
    gsap.set(el, { opacity: 0 })
    gsap.set(title, { opacity: 0, y: 10, filter: 'blur(4px) brightness(1)', scaleY: 1 })
    gsap.set([tv, dot], { opacity: 0, scaleX: 1, scale: 1 })
  },
  enter(el, ctx) {
    const { title } = el._acabamos
    const tl = ctx.tl
    tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
    tl.to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.call(() => playApagon(el, ctx), null, `+=${TITLE_HOLD}`)
  },
  leave(el) {
    el._acabamos.tl?.kill()
    const arrow = nextArrow()
    if (arrow) gsap.set(arrow, { opacity: '' })
  },
}
