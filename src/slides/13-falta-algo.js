// Slide 13: "¿Será que falta algo?" — chiste meta. Tras la frase, una
// flecha a mano en SVG se dibuja y sube hacia la barra de progreso,
// señalando los segmentos nuevos vacíos, con una nota en Caveat lila.
import { gsap } from 'gsap'

const TITLE_HTML = ['¿Será que', '<span class="accent">falta algo?</span>']
const NOTE_TEXT = 'como 11 slides, más o menos'

// Trazo a mano hecho a ojo: sube y se curva levemente hacia la izquierda,
// como señalando la barra de progreso arriba de la pantalla.
const ARROW_PATH = 'M8 90 C 4 60, 20 40, 14 8'
const ARROWHEAD_PATH = 'M14 8 L 6 16 M14 8 L 20 18'

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const slide13 = {
  id: '13-falta-algo',
  act: 'falso',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-falta-algo'

    const title = document.createElement('h1')
    title.className = 'display display-md'
    title.innerHTML = TITLE_HTML.join('<br />')
    el.appendChild(title)

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'meta-arrow')
    svg.setAttribute('viewBox', '0 0 28 96')
    svg.innerHTML = `
      <path class="meta-arrow-line" d="${ARROW_PATH}" fill="none" stroke="var(--lilac)" stroke-width="2.5" stroke-linecap="round" />
      <path class="meta-arrow-head" d="${ARROWHEAD_PATH}" fill="none" stroke="var(--lilac)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    `
    el.appendChild(svg)

    const note = document.createElement('p')
    note.className = 'meta-note'
    note.textContent = NOTE_TEXT
    el.appendChild(note)

    el._falta = { svg, line: svg.querySelector('.meta-arrow-line'), head: svg.querySelector('.meta-arrow-head'), note }
    return el
  },
  prepareEnter(el) {
    const o = el._falta
    gsap.set(el, { opacity: 0 })
    gsap.set(el.querySelector('.display'), { opacity: 0, y: 10 })
    gsap.set(o.note, { opacity: 0 })
    if (!REDUCED) {
      const length = o.line.getTotalLength()
      gsap.set(o.line, { strokeDasharray: length, strokeDashoffset: length })
      gsap.set(o.head, { opacity: 0 })
    }
  },
  enter(el, ctx) {
    const o = el._falta
    ctx.tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    ctx.tl.to(el.querySelector('.display'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    if (REDUCED) {
      ctx.tl.to(o.note, { opacity: 0.85, duration: 0.3 })
      return
    }
    ctx.tl.to(o.line, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.3')
    ctx.tl.to(o.head, { opacity: 1, duration: 0.2 }, '-=0.1')
    ctx.tl.to(o.note, { opacity: 0.85, duration: 0.4, ease: 'power2.out' }, '-=0.1')
  },
}
