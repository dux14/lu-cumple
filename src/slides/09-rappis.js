// Slide 9: "puede que lleguen Rappis". Una notificación estilo iOS cae
// desde arriba (vidrio oscuro, sin logos de marca) y un repartidor cruza
// por abajo sobre una línea punteada. Genérico a propósito: repo público.
import { gsap } from 'gsap'

const TITLE_HTML = ['Y ya, mi princesa,', 'puede que lleguen <span class="accent">Rappis</span> 👀']

const NOTIFICATION_TEXT = 'Tu pedido va en camino · llega en 25 min 👀'

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const slide09 = {
  id: '09-rappis',
  act: 'falso',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-rappis'

    const title = document.createElement('h1')
    title.className = 'display display-md'
    title.innerHTML = TITLE_HTML.join('<br />')
    el.appendChild(title)

    const notif = document.createElement('div')
    notif.className = 'rappi-notif'
    notif.innerHTML = `<span class="rappi-notif-icon">🛵</span><span class="rappi-notif-text">${NOTIFICATION_TEXT}</span>`
    el.appendChild(notif)

    const track = document.createElement('div')
    track.className = 'rappi-track'
    const rider = document.createElement('span')
    rider.className = 'rappi-rider'
    rider.textContent = '🛵'
    track.appendChild(rider)
    el.appendChild(track)

    el._rappis = { title, notif, rider }
    return el
  },
  prepareEnter(el) {
    const o = el._rappis
    gsap.set(el, { opacity: 0 })
    gsap.set([o.title], { opacity: 0, y: 10, filter: 'blur(4px)' })
    gsap.set(o.notif, { opacity: 0, y: '-120%' })
    gsap.set(o.rider, { x: '-10vw' })
  },
  enter(el, ctx) {
    const o = el._rappis
    ctx.tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    ctx.tl.to(o.title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' })
    if (REDUCED) {
      ctx.tl.to(o.notif, { opacity: 1, y: '0%', duration: 0.3 })
      gsap.set(o.rider, { opacity: 0 })
      return
    }
    ctx.tl.to(o.notif, { opacity: 1, y: '0%', duration: 0.6, ease: 'back.out(1.4)' }, '+=0.3')
    ctx.tl.to(o.rider, { x: '110vw', duration: 4, ease: 'none' }, '-=0.2')
  },
}
