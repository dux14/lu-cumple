// Barra de progreso: segmentos finos, con el destello del falso final
// (11 → 12) al agregar los segmentos reales.
import { gsap } from 'gsap'

const STAGGER = 0.08

export function createProgressBar(container) {
  const el = document.createElement('div')
  el.className = 'progress'
  el.style.display = 'none'
  container.appendChild(el)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      gsap.set(added, { opacity: 0, boxShadow: '0 0 0px rgba(255, 92, 122, 0)' })
      gsap.to(added, {
        opacity: 1,
        boxShadow: '0 0 6px rgba(255, 92, 122, 0.8)',
        duration: 0.25,
        stagger: STAGGER,
        ease: 'power1.out',
        onComplete() {
          gsap.to(added, { boxShadow: '0 0 0px rgba(255, 92, 122, 0)', duration: 0.4 })
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

  // Cierre (22): la barra, ya completa, hace un último destello y se
  // desvanece. `show` la restaura si se vuelve a la 21 (ver deck.js).
  function flashOut() {
    if (reduced) {
      gsap.set(el, { opacity: 0 })
      return
    }
    const segs = Array.from(el.children)
    gsap
      .timeline()
      .to(segs, { boxShadow: '0 0 10px rgba(255, 92, 122, 0.9)', duration: 0.3, ease: 'power1.out' })
      .to(el, { opacity: 0, duration: 0.6, ease: 'power1.in' }, '+=0.15')
  }

  function show() {
    if (reduced) {
      gsap.set(el, { opacity: 1 })
      return
    }
    gsap.to(el, { opacity: 1, duration: 0.3, ease: 'power1.out' })
  }

  return { render, flashOut, show }
}
