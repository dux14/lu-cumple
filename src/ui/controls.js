// Entradas de navegación: flechas, swipe horizontal y teclado.
const ARROW_RIGHT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
const ARROW_LEFT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>'

const SWIPE_THRESHOLD = 40

export function createControls({ uiRoot, onNext, onPrev }) {
  const nextBtn = document.createElement('button')
  nextBtn.className = 'nav-next'
  nextBtn.setAttribute('aria-label', 'Siguiente')
  nextBtn.dataset.noNav = ''
  nextBtn.innerHTML = ARROW_RIGHT

  const prevBtn = document.createElement('button')
  prevBtn.className = 'nav-prev'
  prevBtn.setAttribute('aria-label', 'Anterior')
  prevBtn.dataset.noNav = ''
  prevBtn.innerHTML = ARROW_LEFT

  uiRoot.appendChild(prevBtn)
  uiRoot.appendChild(nextBtn)

  nextBtn.addEventListener('click', () => onNext())
  prevBtn.addEventListener('click', () => onPrev())

  let tracking = false
  let startX = 0
  let startY = 0

  function onPointerDown(e) {
    if (e.target.closest?.('[data-no-nav]')) return
    tracking = true
    startX = e.clientX
    startY = e.clientY
  }

  function onPointerUp(e) {
    if (!tracking) return
    tracking = false
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dy) > Math.abs(dx)) return // movimiento vertical: no navega
    if (dx <= -SWIPE_THRESHOLD) onNext()
    else if (dx >= SWIPE_THRESHOLD) onPrev()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      onNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onPrev()
    }
  }

  window.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('keydown', onKeyDown)

  function setVisible(visible, hasNext = true) {
    nextBtn.style.display = visible && hasNext ? 'flex' : 'none'
    prevBtn.style.display = visible ? 'flex' : 'none'
  }

  function destroy() {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('keydown', onKeyDown)
    nextBtn.remove()
    prevBtn.remove()
  }

  return { setVisible, destroy }
}
