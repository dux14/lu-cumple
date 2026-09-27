// Detecta vertical/horizontal y arranca o muestra el overlay de "gira tu
// teléfono" según corresponda. matchMedia('orientation: landscape') en vez
// de screen.orientation: Safari iOS es inconsistente con la segunda.
import { gsap } from 'gsap'
import { renderRotateContent } from './slides/00-rotate.js'

const START_DELAY = 1200

export function initOrientation({ deck, uiRoot }) {
  const orientationQuery = window.matchMedia('(orientation: landscape)')
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  let overlay = null

  function addOverlay() {
    if (overlay || deck.getIndex() < 1) return
    overlay = document.createElement('div')
    overlay.className = 'orientation-overlay'
    overlay.appendChild(renderRotateContent())
    gsap.set(overlay, { opacity: 0 })
    uiRoot.appendChild(overlay)
    gsap.to(overlay, { opacity: 1, duration: 0.3 })
  }

  function removeOverlay() {
    if (!overlay) return
    const el = overlay
    overlay = null
    gsap.to(el, { opacity: 0, duration: 0.3, onComplete: () => el.remove() })
  }

  function handleChange() {
    if (orientationQuery.matches) {
      removeOverlay()
      deck.start()
    } else {
      addOverlay()
    }
  }

  orientationQuery.addEventListener('change', handleChange)

  if (orientationQuery.matches) {
    setTimeout(() => deck.start(), START_DELAY)
  }

  // Desktop (sin puntero táctil): sin overlay; la slide 0 se prueba con →.
  function onKeyDown(e) {
    if (!isCoarse && e.key === 'ArrowRight' && deck.getIndex() === 0) {
      deck.start()
    }
  }
  if (!isCoarse) window.addEventListener('keydown', onKeyDown)

  return {
    destroy() {
      orientationQuery.removeEventListener('change', handleChange)
      if (!isCoarse) window.removeEventListener('keydown', onKeyDown)
    },
  }
}
