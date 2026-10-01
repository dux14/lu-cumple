// Slide 10: "Te quierooooooo…". Las "o" se agregan una a una, cada vez
// más rápido y con más separación entre letras, hasta empujar el texto
// fuera del borde derecho. La slide dura lo que tarda en irse la última "o".
import { gsap } from 'gsap'

const BASE_HTML = 'Te quier'
// Cuántas "o" se agregan en el recorrido completo (además de la primera,
// que ya viene en el copy original "Te quiero").
const EXTRA_OS = 22

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const slide10 = {
  id: '10-te-quiero',
  act: 'falso',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-te-quiero'

    const h1 = document.createElement('h1')
    h1.className = 'display display-lg tq-line'

    const base = document.createElement('span')
    base.className = 'accent tq-base'
    base.textContent = BASE_HTML
    h1.appendChild(base)

    const os = document.createElement('span')
    os.className = 'accent tq-os'
    h1.appendChild(os)

    const dots = document.createElement('span')
    dots.className = 'accent tq-dots'
    dots.textContent = '…'
    h1.appendChild(dots)

    el.appendChild(h1)
    el._tq = { os, dots }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set(el.querySelector('.tq-line'), { opacity: 0, y: 10 })
  },
  enter(el, ctx) {
    const o = el._tq
    const line = el.querySelector('.tq-line')
    ctx.tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    ctx.tl.to(line, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })

    if (REDUCED) {
      o.os.textContent = 'o'.repeat(EXTRA_OS)
      return
    }

    // Antes de empezar a agregar "o": ancla el título en su posición
    // centrada actual y lo saca del flujo (flex ya no lo recentra). Así el
    // crecimiento empuja solo hacia la derecha, no hacia ambos lados.
    ctx.tl.call(() => {
      const lineRect = line.getBoundingClientRect()
      const parentRect = el.getBoundingClientRect()
      line.style.position = 'absolute'
      line.style.left = lineRect.left - parentRect.left + 'px'
      line.style.top = lineRect.top - parentRect.top + 'px'
    })

    let spacing = 0
    for (let i = 0; i < EXTRA_OS; i++) {
      const delay = 0.22 - i * 0.008 // cada "o" tarda menos que la anterior
      spacing += 0.02
      ctx.tl.call(
        () => {
          o.os.textContent += 'o'
          o.os.style.letterSpacing = spacing.toFixed(3) + 'em'
        },
        null,
        `+=${Math.max(0.02, delay)}`,
      )
    }
  },
}
