// Fase de scroll real en la slide 0 (táctil + horizontal, primera vez):
// Safari iOS solo colapsa su barra de URL/pestañas con un scroll del
// documento iniciado por el usuario (scrollTo programático no sirve). Se
// habilita scroll real (ver html.scroll-phase en base.css), se detecta el
// gesto y se llama deck.start(); luego se vuelve a bloquear el scroll SIN
// resetear la posición (scrollTo(0,0) puede reabrir la barra), por eso el
// alto extra del body se deja puesto y solo se apaga overflow/touch-action.
import { renderSwipeContent } from './slides/00-rotate.js'

const SCROLL_TRIGGER = 30
const TAP_FALLBACK_DELAY = 6000

export function initScrollStart({ deck, slideEl, onDone }) {
  let done = false
  let touchStartY = null

  slideEl.replaceChildren(renderSwipeContent())
  document.documentElement.classList.add('scroll-phase')

  function finish() {
    if (done) return
    done = true
    cleanup()
    deck.start()
    // Bloquea de nuevo el scroll sin tocar la posición ni el alto del body.
    document.documentElement.classList.add('scroll-locked')
    onDone?.()
  }

  function onScroll() {
    if (window.scrollY > SCROLL_TRIGGER) finish()
  }

  function onTouchStart(e) {
    touchStartY = e.touches[0]?.clientY ?? null
  }

  function onTouchMove(e) {
    if (touchStartY == null) return
    const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY)
    if (dy > SCROLL_TRIGGER) finish()
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })

  const fallbackTimer = setTimeout(() => {
    slideEl.querySelector('.swipe-fallback')?.classList.add('is-visible')
    window.addEventListener('pointerdown', finish, { once: true })
  }, TAP_FALLBACK_DELAY)

  function cleanup() {
    clearTimeout(fallbackTimer)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('pointerdown', finish)
  }

  return { destroy: cleanup }
}
