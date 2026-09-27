// Barra de progreso: segmentos finos, con el destello del falso final
// (11 → 12) al agregar los segmentos reales.
import { gsap } from 'gsap'

const STAGGER = 0.08

export function createProgressBar(container) {
  const el = document.createElement('div')
  el.className = 'progress'
  el.style.display = 'none'
  container.appendChild(el)

  function render(model) {
    if (!model.visible) {
      el.style.display = 'none'
      el.replaceChildren()
      return
    }
    el.style.display = 'flex'

    const current = el.children.length
    if (model.segments > current) {
      const added = []
      for (let i = current; i < model.segments; i++) {
        const seg = document.createElement('div')
        seg.className = 'segment'
        el.appendChild(seg)
        added.push(seg)
      }
      gsap.set(added, { opacity: 0, boxShadow: '0 0 0px rgba(212, 175, 55, 0)' })
      gsap.to(added, {
        opacity: 1,
        boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)',
        duration: 0.25,
        stagger: STAGGER,
        ease: 'power1.out',
        onComplete() {
          gsap.to(added, { boxShadow: '0 0 0px rgba(212, 175, 55, 0)', duration: 0.4 })
        },
      })
    } else if (model.segments < current) {
      // se quitan sin animación (retroceso)
      while (el.children.length > model.segments) {
        el.lastElementChild.remove()
      }
    }

    Array.from(el.children).forEach((seg, i) => {
      seg.classList.toggle('filled', i < model.filled)
    })
  }

  return { render }
}
