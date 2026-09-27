// Fábrica de slides de texto: cubre la mayoría de las 22 slides.
// `lines` es la frase principal en `.display` (acepta HTML para el `.accent`
// en itálica dorada). `paragraphs`, si viene, define `steps` y se revela
// uno por uno con `showStep`.
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
      const h = document.createElement('h1')
      h.className = 'display'
      h.innerHTML = lines.join('<br />')
      el.appendChild(h)
      if (note) {
        const n = document.createElement('p')
        n.className = 'body note'
        n.textContent = note
        el.appendChild(n)
      }
      if (paragraphs) {
        paragraphs.forEach((text, i) => {
          const p = document.createElement('p')
          p.className = 'body'
          p.dataset.step = String(i)
          if (i > 0) p.style.opacity = '0'
          p.textContent = text
          el.appendChild(p)
        })
      }
      return el
    },
    enter(el, ctx) {
      const targets = el.querySelectorAll('.eyebrow, .display, .note, [data-step="0"]')
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
