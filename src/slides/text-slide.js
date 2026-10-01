// Fábrica de slides de texto: cubre la mayoría de las 22 slides.
// `lines` es la frase principal en `.display` (acepta HTML para el `.accent`
// en rosa manuscrito) y, junto con `eyebrow`, es opcional: si no vienen, no
// se renderiza título (uso: slides largas que abren directo con el texto).
// `paragraphs` (acepta HTML) define `steps`: cada paso reemplaza al
// anterior en vez de acumularse, apilados en la misma celda de grid
// (`.steps-stack`) para que el layout no salte entre pasos de alto distinto.

import { gsap } from 'gsap'

// Tamaño automático según el largo del título (texto plano, sin markup):
// ≤ 30 caracteres → grande, ≤ 70 → medio, más → chico. Evita desborde en
// 852×393 y 844×390 con títulos largos.
function sizeClassFor(lines) {
  const plainLength = lines.join(' ').replace(/<[^>]+>/g, '').length
  if (plainLength <= 30) return 'display-lg'
  if (plainLength <= 70) return 'display-md'
  return 'display-sm'
}

export function textSlide({ id, act, eyebrow, lines, note, paragraphs }) {
  const steps = paragraphs ? paragraphs.length : 1

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
      if (lines) {
        const h = document.createElement('h1')
        h.className = `display ${sizeClassFor(lines)}`
        h.innerHTML = lines.join('<br />')
        el.appendChild(h)
      }
      if (note) {
        const n = document.createElement('p')
        n.className = 'body note'
        n.textContent = note
        el.appendChild(n)
      }
      if (paragraphs) {
        const stack = document.createElement('div')
        stack.className = 'steps-stack'
        paragraphs.forEach((html, i) => {
          const p = document.createElement('p')
          p.className = 'body'
          p.dataset.step = String(i)
          if (i > 0) p.style.opacity = '0'
          p.innerHTML = html
          stack.appendChild(p)
        })
        el.appendChild(stack)
      }
      return el
    },
    // El estado oculto se aplica en prepareEnter, antes de que el contenedor
    // de la slide sea visible (ver deck.js). Si se aplicara acá, con
    // `fromTo`, el texto ya visible por default parpadearía: aparece con el
    // fade-in del contenedor y recién después enter() lo oculta para
    // volverlo a animar.
    prepareEnter(el) {
      const targets = el.querySelectorAll('.eyebrow, .display, .note, [data-step="0"]')
      gsap.set(targets, { opacity: 0, y: 10 })
    },
    enter(el, ctx) {
      const targets = el.querySelectorAll('.eyebrow, .display, .note, [data-step="0"]')
      ctx.tl.to(targets, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' })
    },
    showStep(el, i, ctx) {
      const curr = el.querySelector(`[data-step="${i}"]`)
      if (!curr) return
      const prev = el.querySelector(`[data-step="${i - 1}"]`)
      if (prev) {
        ctx.tl.to(prev, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' })
      }
      ctx.tl.fromTo(
        curr,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        prev ? '-=0.1' : undefined,
      )
    },
  }
}
