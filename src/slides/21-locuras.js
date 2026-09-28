// Slide 21: "Toca hacer varias locuras…". Lista de pendientes tocable:
// al marcar un ítem se tacha con trazo a mano y se enciende una estrella.
// Estado en localStorage (con try/catch: puede no estar disponible).
import { gsap } from 'gsap'

const TITLE_HTML = ['Toca hacer varias locuras', 'para que esto se pueda <span class="accent">dar</span>']

// Placeholder: reemplaza por las locuras reales.
const LOCURAS = [
  'pedir permiso en el trabajo nuevo',
  'pasaporte vigente',
  'maleta para el frío de Madrid',
  'sobrevivir 9 h 35 min de vuelo',
]

const STORAGE_KEY = 'lu-cumple-locuras'

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeState(done) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done))
  } catch {
    // sin storage disponible: se ignora, no es crítico
  }
}

function toggleItem(item, done, index) {
  done[index] = !done[index]
  item.classList.toggle('is-done', done[index])
  writeState(done)
}

export const slide21 = {
  id: '21-locuras',
  act: 'cierre',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-locuras'

    const title = document.createElement('h1')
    title.className = 'display display-md'
    title.innerHTML = TITLE_HTML.join('<br />')
    el.appendChild(title)

    const done = readState()
    const list = document.createElement('ul')
    list.className = 'locuras-list'
    list.dataset.noNav = ''

    LOCURAS.forEach((text, i) => {
      const item = document.createElement('li')
      item.className = 'locuras-item'
      if (done[i]) item.classList.add('is-done')

      const star = document.createElement('span')
      star.className = 'locuras-star'
      star.textContent = '✦'
      item.appendChild(star)

      const label = document.createElement('span')
      label.className = 'locuras-text'
      label.textContent = text
      item.appendChild(label)

      function onTap(e) {
        e.stopPropagation()
        toggleItem(item, done, i)
      }
      item.addEventListener('pointerup', onTap)

      list.appendChild(item)
    })

    el.appendChild(list)
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set([el.querySelector('.display'), ...el.querySelectorAll('.locuras-item')], {
      opacity: 0,
      y: 10,
      filter: 'blur(4px)',
    })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    ctx.tl.to(el.querySelector('.display'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' })
    ctx.tl.to(
      el.querySelectorAll('.locuras-item'),
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2',
    )
  },
}
