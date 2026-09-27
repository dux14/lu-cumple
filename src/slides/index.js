// Índice provisional de slides, solo para poder probar el deck completo
// antes de la Task 8 (las 22 slides reales la van a reemplazar).
import { slide00 } from './00-rotate.js'

function makeTextSlide({ id, act, eyebrow, lines, steps }) {
  return {
    id,
    act,
    steps,
    render() {
      const el = document.createElement('div')
      if (eyebrow) {
        const p = document.createElement('p')
        p.className = 'eyebrow'
        p.textContent = eyebrow
        el.appendChild(p)
      }
      const h = document.createElement('h1')
      h.className = 'display'
      h.innerHTML = lines.join('<br />')
      el.appendChild(h)
      if (steps && steps > 1) {
        for (let i = 1; i < steps; i++) {
          const p = document.createElement('p')
          p.className = 'body'
          p.dataset.step = String(i)
          p.style.opacity = '0'
          p.textContent = `[Párrafo ${i + 1} — placeholder]`
          el.appendChild(p)
        }
      }
      return el
    },
    enter(el, ctx) {
      const targets = el.querySelectorAll('.eyebrow, .display')
      ctx.tl.fromTo(
        targets,
        { opacity: 0, y: 10, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.12, ease: 'power2.out' },
      )
    },
    showStep(el, i, ctx) {
      const p = el.querySelector(`[data-step="${i}"]`)
      if (!p) return
      ctx.tl.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    },
  }
}

export const slides = [
  slide00,
  makeTextSlide({
    id: '01-apertura',
    act: 'apertura',
    lines: ['Lu, hoy es tu día', '<span class="accent">especial</span>'],
  }),
  makeTextSlide({
    id: '07-fe',
    act: 'fe',
    eyebrow: 'Oración',
    lines: ['[Oración — placeholder]'],
    steps: 3,
  }),
  makeTextSlide({
    id: '14-suspenso',
    act: 'suspenso',
    lines: ['Sé lo mucho que hace falta', 'estar <span class="accent">pegaditos</span>'],
  }),
]
