// Slide 9: barra de "créditos finales" que avanza a saltos irregulares,
// retrocede un punto una sola vez (el chiste) y se queda titilando en 97%,
// sin llegar nunca al 100%. Mockup aprobado:
// docs/superpowers/mockups/slide-09-creditos.html.
import { gsap } from 'gsap'

const TITLE_HTML = ['Y ya, mi princesa,', 'esto ya va <span class="accent">terminando</span>…']

// Saltos irregulares a propósito: nunca lineales, como créditos reales.
const STEPS = [14, 34, 58, 76, 89, 97]
const RETREAT_PCT = 96 // el chiste: retrocede un punto antes de asentarse
const FINAL_PCT = 97

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const slide09 = {
  id: '09-creditos',
  act: 'falso',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-creditos'

    const title = document.createElement('h1')
    title.className = 'display display-md'
    title.innerHTML = TITLE_HTML.join('<br />')
    el.appendChild(title)

    const bar = document.createElement('div')
    bar.className = 'creditos-bar'
    bar.innerHTML = `
      <div class="creditos-head">
        <span class="creditos-label">créditos finales</span>
        <span class="creditos-pct">0%</span>
      </div>
      <div class="creditos-track"><div class="creditos-fill"></div></div>
    `
    el.appendChild(bar)

    const pct = bar.querySelector('.creditos-pct')
    const fill = bar.querySelector('.creditos-fill')
    el._creditos = { title, bar, pct, fill, blinkLoop: null }
    return el
  },
  prepareEnter(el) {
    const { title, bar, fill, pct } = el._creditos
    gsap.set(el, { opacity: 0 })
    gsap.set(title, { opacity: 0, y: 10 })
    gsap.set(bar, { opacity: 1 })
    gsap.set(fill, { scaleX: reduced() ? FINAL_PCT / 100 : 0 })
    pct.textContent = reduced() ? `${FINAL_PCT}%` : '0%'
  },
  enter(el, ctx) {
    const { title, fill, pct } = el._creditos
    const tl = ctx.tl
    tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })

    if (reduced()) return

    STEPS.forEach((p, i) => {
      tl.to(fill, { scaleX: p / 100, duration: 0.35, ease: 'power1.out' }, i === 0 ? '+=0.6' : '+=0.2')
      tl.call(() => { pct.textContent = `${p}%` }, null, '<')
    })
    // retroceso de un punto, una sola vez, antes de asentarse en 97%
    tl.to(fill, { scaleX: RETREAT_PCT / 100, duration: 0.25, ease: 'power1.inOut' }, '+=0.5')
    tl.call(() => { pct.textContent = `${RETREAT_PCT}%` }, null, '<')
    tl.to(fill, { scaleX: FINAL_PCT / 100, duration: 0.25, ease: 'power1.inOut' }, '+=0.35')
    tl.call(() => { pct.textContent = `${FINAL_PCT}%` }, null, '<')
    tl.call(() => {
      el._creditos.blinkLoop = gsap.to(el._creditos.bar, {
        opacity: 0.45,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })
  },
  leave(el) {
    el._creditos.blinkLoop?.kill()
    el._creditos.blinkLoop = null
  },
}
