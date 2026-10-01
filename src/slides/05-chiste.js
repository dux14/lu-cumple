// Slide 5 (antes 6): el chiste hot. Hold-to-reveal: el texto está tapado y
// borroso bajo un velo vino; mantener presionado lo destapa, soltar lo
// vuelve a tapar. El humor está en el gesto de "esconderlo", no en el
// texto en sí. `data-no-nav` + stopPropagation en el área para que el toque
// largo no dispare la navegación del deck (ver src/ui/controls.js).
import { gsap } from 'gsap'

// Placeholder: reemplaza por el chiste real. Puede llevar HTML simple
// (<span class="accent">…</span>) igual que `lines` en textSlide.
const JOKE_HTML = '[Chiste hot]'

const VEIL_LABEL = 'contenido sensible 🙈 · mantén presionado'

function bindHold(el) {
  const o = el._chiste
  let held = false

  function reveal() {
    if (held) return
    held = true
    o.wrap.classList.add('is-held')
    gsap.to(o.joke, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' })
    gsap.to(o.veil, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    gsap.to(o.blush, { opacity: 0.6, duration: 1, ease: 'power2.out' })
  }

  function hide() {
    if (!held) return
    held = false
    o.wrap.classList.remove('is-held')
    gsap.to(o.joke, { opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.in' })
    gsap.to(o.veil, { opacity: 1, duration: 0.3, ease: 'power2.in' })
    gsap.to(o.blush, { opacity: 0, duration: 0.5, ease: 'power2.in' })
  }

  function onDown(e) {
    e.stopPropagation()
    reveal()
  }
  function onUp(e) {
    e.stopPropagation()
    hide()
  }

  o.wrap.addEventListener('pointerdown', onDown)
  o.wrap.addEventListener('pointerup', onUp)
  o.wrap.addEventListener('pointerleave', onUp)
  o.wrap.addEventListener('pointercancel', onUp)

  o.unbind = () => {
    o.wrap.removeEventListener('pointerdown', onDown)
    o.wrap.removeEventListener('pointerup', onUp)
    o.wrap.removeEventListener('pointerleave', onUp)
    o.wrap.removeEventListener('pointercancel', onUp)
  }
}

export const slide05 = {
  id: '05-chiste',
  act: 'risas',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-chiste'

    const blush = document.createElement('div')
    blush.className = 'chiste-blush'
    el.appendChild(blush)

    const wrap = document.createElement('div')
    wrap.className = 'chiste-wrap'
    wrap.dataset.noNav = ''

    const joke = document.createElement('p')
    joke.className = 'display display-md chiste-text'
    joke.innerHTML = JOKE_HTML
    wrap.appendChild(joke)

    const veil = document.createElement('div')
    veil.className = 'chiste-veil'
    const label = document.createElement('span')
    label.className = 'chiste-veil-label'
    label.textContent = VEIL_LABEL
    veil.appendChild(label)
    wrap.appendChild(veil)

    el.appendChild(wrap)
    el._chiste = { wrap, joke, veil, blush }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set(el._chiste.joke, { opacity: 0, scale: 0.96 })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    bindHold(el)
  },
  leave(el) {
    el._chiste.unbind?.()
  },
}
