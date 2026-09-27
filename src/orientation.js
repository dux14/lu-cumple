// Detecta vertical/horizontal y arranca o muestra el overlay de "gira tu
// teléfono" según corresponda. matchMedia('orientation: landscape') en vez
// de screen.orientation: Safari iOS es inconsistente con la segunda.
import { gsap } from 'gsap'
import { renderRotateContent } from './slides/00-rotate.js'
import { initScrollStart } from './scroll-start.js'

const START_DELAY = 1200

export function initOrientation({ deck, uiRoot }) {
  const orientationQuery = window.matchMedia('(orientation: landscape)')
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  // En standalone (pantalla de inicio) no hay barra de Safari que colapsar:
  // se salta la fase de scroll y se arranca como en desktop.
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  const useScrollPhase = isCoarse && !isStandalone
  let overlay = null
  let started = false
  let scrollStart = null

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

  // Primera vez en horizontal (táctil): en vez de arrancar solo, deja la
  // slide 0 con el prompt de swipe y espera el gesto del usuario para que
  // Safari pueda colapsar su barra. Ver scroll-start.js.
  function beginScrollPhase() {
    const slideEl = document.querySelector('#deck .slide')
    if (!slideEl) {
      deck.start() // no debería pasar, pero no deja la app colgada
      return
    }
    scrollStart = initScrollStart({
      deck,
      slideEl,
      onDone: () => {
        scrollStart = null
      },
    })
  }

  function startDeck() {
    if (started) return
    started = true
    if (useScrollPhase) beginScrollPhase()
    else deck.start()
  }

  function handleChange() {
    if (orientationQuery.matches) {
      removeOverlay()
      if (started) deck.start() // ya arrancó una vez: no repite la fase
      else startDeck()
    } else {
      addOverlay()
    }
  }

  orientationQuery.addEventListener('change', handleChange)

  if (orientationQuery.matches) {
    if (useScrollPhase) {
      startDeck()
    } else {
      setTimeout(() => {
        started = true
        deck.start()
      }, START_DELAY)
    }
  }

  // Desktop (sin puntero táctil): sin overlay; la slide 0 se prueba con →.
  function onKeyDown(e) {
    if (!isCoarse && e.key === 'ArrowRight' && deck.getIndex() === 0) {
      started = true
      deck.start()
    }
  }
  if (!isCoarse) window.addEventListener('keydown', onKeyDown)

  return {
    destroy() {
      orientationQuery.removeEventListener('change', handleChange)
      if (!isCoarse) window.removeEventListener('keydown', onKeyDown)
      scrollStart?.destroy()
    },
  }
}
