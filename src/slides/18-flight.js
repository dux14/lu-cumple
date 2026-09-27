// Slide 18: intro épica. Automática (~4 s) y bloquea navegación con
// ctx.lockNav mientras corre; al terminar aparece la flecha de siguiente.
// El cielo ya acelera solo: `sorpresa` es el aura más rápida (ver
// src/sky-auras.js) y deck.js la aplica al entrar a la slide.
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import confetti from 'canvas-confetti'

gsap.registerPlugin(MotionPathPlugin)

const SVG_NS = 'http://www.w3.org/2000/svg'
// viewBox con la proporción real de la slide (852×393 ≈ 100×46.1), igual
// que en 03-collage.js: así preserveAspectRatio="none" no distorsiona.
const ARC_PATH = 'M 7 36 Q 50 6 93 36'
const FLIGHT_DURATION = 2.4
const CONFETTI_COLORS = ['#FCD116', '#003893', '#CE1126', '#AA151B', '#F1BF00', '#ffffff']

export const slide18 = {
  id: '18-flight',
  act: 'sorpresa',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-flight'

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.classList.add('flight-svg')
    svg.setAttribute('viewBox', '0 0 100 46.1')
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.innerHTML = `
      <defs>
        <mask id="flight-trail-mask">
          <path d="${ARC_PATH}" class="flight-mask-path" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
        </mask>
      </defs>
      <path d="${ARC_PATH}" class="flight-trail" fill="none" mask="url(#flight-trail-mask)" />
      <g class="flight-plane">
        <path transform="scale(0.24) rotate(90) translate(-12 -12)" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </g>
    `
    el.appendChild(svg)

    const flagStart = document.createElement('span')
    flagStart.className = 'flight-flag flight-flag-start'
    flagStart.textContent = '🇨🇴'
    el.appendChild(flagStart)

    const flagEnd = document.createElement('span')
    flagEnd.className = 'flight-flag flight-flag-end'
    flagEnd.textContent = '🇪🇸'
    el.appendChild(flagEnd)

    const text = document.createElement('h1')
    text.className = 'display display-md flight-teaser'
    text.innerHTML = '¿Lista para <span class="accent">lo que viene</span>?'
    el.appendChild(text)

    el._flight = {
      plane: svg.querySelector('.flight-plane'),
      maskPath: svg.querySelector('.flight-mask-path'),
      flagStart,
      flagEnd,
      text,
    }
    return el
  },
  // Ver la nota en text-slide.js: el estado oculto se aplica acá, antes de
  // que el contenedor sea visible.
  prepareEnter(el) {
    const { plane, flagStart, flagEnd, text } = el._flight
    gsap.set(el, { opacity: 0 })
    gsap.set(plane, { opacity: 0 })
    gsap.set([flagStart, flagEnd], { opacity: 0, scale: 0.5 })
    gsap.set(text, { opacity: 0, y: 10, filter: 'blur(4px)' })
  },
  enter(el, ctx) {
    const { plane, maskPath, flagStart, flagEnd, text } = el._flight
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

    if (reduced) {
      tl.to([flagStart, flagEnd], { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
      tl.to(text, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0.4)
      tl.call(revealArrow, null, 1.4)
      return
    }

    const len = maskPath.getTotalLength()
    gsap.set(maskPath, { strokeDasharray: len, strokeDashoffset: len })

    tl.to(flagStart, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 0.4)
    tl.to(plane, { opacity: 1, duration: 0.3 }, 0.3)
    tl.to(
      plane,
      {
        motionPath: { path: ARC_PATH, autoRotate: true, alignOrigin: [0.5, 0.5] },
        duration: FLIGHT_DURATION,
        ease: 'power1.inOut',
      },
      0.3,
    )
    tl.to(maskPath, { strokeDashoffset: 0, duration: FLIGHT_DURATION, ease: 'power1.inOut' }, 0.3)
    tl.to(flagEnd, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 0.3 + FLIGHT_DURATION - 0.35)
    tl.call(
      () => {
        confetti({
          particleCount: 140,
          spread: 80,
          startVelocity: 45,
          colors: CONFETTI_COLORS,
          origin: { x: 0.5, y: 0.55 },
        })
      },
      null,
      0.3 + FLIGHT_DURATION,
    )
    // El avión "aterriza": se achica y se desvanece junto a la bandera.
    tl.to(plane, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.5, ease: 'power2.in' }, 0.3 + FLIGHT_DURATION - 0.1)
    tl.to(text, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0.3 + FLIGHT_DURATION + 0.2)
    tl.call(revealArrow, null, 0.3 + FLIGHT_DURATION + 0.9)
  },
  leave(el) {
    const nextBtn = document.querySelector('.nav-next')
    if (nextBtn) gsap.set(nextBtn, { opacity: '' })
  },
}
