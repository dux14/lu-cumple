// Slide 20: "Espero que te haya gustado la sorpresa". El video de Madrid de
// la slide 19 (paso 3) no se corta: sigue de fondo, desenfocándose y
// apagándose poco a poco mientras el cielo del cierre vuelve a tomar la
// pantalla (ver docs/plans/propuestas-por-slide.md, slide 20, y
// src/core/madrid-bg.js para el elemento <video> compartido). La nota entra
// después, como un aparte.
import { gsap } from 'gsap'
import { getMadridVideo } from '../core/madrid-bg.js'

const NOTE_DELAY = 1 // s: aparece 1s después del texto, como un aparte
const FADE_DELAY = 0.6
const FADE_DURATION = 2.6

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const slide20 = {
  id: '20-sorpresa',
  act: 'cierre',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-sorpresa'

    const bg = getMadridVideo()
    bg.className = 'sorpresa-bg'
    el.appendChild(bg)

    const shade = document.createElement('div')
    shade.className = 'sorpresa-shade'
    el.appendChild(shade)

    const title = document.createElement('h1')
    title.className = 'display display-md sorpresa-title'
    title.innerHTML = 'Espero que te haya<br />gustado la <span class="accent">sorpresa</span>'
    el.appendChild(title)

    const note = document.createElement('p')
    note.className = 'body note sorpresa-note'
    note.textContent = '(me impacienta no poder contarte antes, jajaja)'
    el.appendChild(note)

    el._sorpresa = { bg, shade, title, note }
    return el
  },
  prepareEnter(el) {
    const { bg, title, note } = el._sorpresa
    gsap.set(el, { opacity: 0 })
    // El video es compartido con la slide 19 (ver src/core/madrid-bg.js): si
    // se llega aquí antes de que termine la entrada del paso 3 de la 19
    // (misma slide, ~2s de fundido), esa animación sigue viva y le disputa
    // la opacidad/escala al `gsap.set` de abajo. Se mata antes de fijarlo.
    gsap.killTweensOf(bg)
    gsap.set(bg, { opacity: 1, scale: 1, filter: 'blur(0px) brightness(0.5)' })
    gsap.set(title, { opacity: 0, y: 10, filter: 'blur(4px)' })
    gsap.set(note, { opacity: 0, y: 8 })
  },
  enter(el, ctx) {
    const { bg, title, note } = el._sorpresa
    bg.play().catch(() => {})

    const tl = ctx.tl
    tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
    tl.to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, 0.1)
    tl.to(note, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.6 + NOTE_DELAY)

    if (reduced()) {
      tl.set(bg, { opacity: 0 }, 0.1)
      bg.pause()
      return
    }
    tl.to(
      bg,
      { opacity: 0, scale: 1.08, filter: 'blur(12px) brightness(0.3)', duration: FADE_DURATION, ease: 'power2.in' },
      FADE_DELAY,
    )
    tl.call(() => bg.pause(), null, FADE_DELAY + FADE_DURATION)
  },
  leave(el) {
    const { bg } = el._sorpresa
    bg.pause()
  },
}
