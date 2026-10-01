// Slide 21: "Toca hacer varias locuras…". Checklist de misión tocable
// (opción 21-B del mockup aprobado, docs/superpowers/mockups/feedback-11-21.html):
// dos columnas de 3 ítems, cada uno con una nota chistosa en Caveat.
// Al tocar una casilla se dibuja un check animado. Estado en localStorage
// (con try/catch: puede no estar disponible).
import { gsap } from 'gsap'

const TITLE_HTML = ['Toca hacer varias locuras', 'para que esto se pueda <span class="accent">dar</span>']

const LOCURAS = [
  { text: 'escaparte 2 veces del trabajo (el 30 y el 10)', note: 'el jefe no se entera' },
  { text: 'pedir remoto la semana del 2', note: 'nadie pregunta por qué el estado dice "en reunión"' },
  { text: 'tener el pasaporte listo', note: 'con sello y todo' },
  { text: 'muchas ganas de caminar', note: 'Madrid son 20 mil pasos al día' },
  { text: 'querernos mucho', note: 'esto ya lo tenemos' },
  { text: 'rezar mucho por el viaje', note: 'y una veladora extra' },
]

const STORAGE_KEY = 'lu-cumple-locuras'
const CHECK_PATH = 'M5 10.5l3.2 3.2L15 6.5'

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

function toggleItem(label, path, done, index) {
  done[index] = !done[index]
  const isDone = done[index]
  label.classList.toggle('done', isDone)
  gsap.to(path, { strokeDashoffset: isDone ? 0 : 20, duration: 0.35, ease: 'power2.out' })
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
    const grid = document.createElement('div')
    grid.className = 'locuras-grid'
    grid.dataset.noNav = ''

    LOCURAS.forEach(({ text, note }, i) => {
      const row = document.createElement('div')
      row.className = 'locuras-row'

      const box = document.createElement('span')
      box.className = 'locuras-box'
      box.innerHTML = `<svg viewBox="0 0 20 20"><path d="${CHECK_PATH}" /></svg>`
      row.appendChild(box)

      const textWrap = document.createElement('span')
      textWrap.className = 'locuras-text-wrap'

      const label = document.createElement('span')
      label.className = 'locuras-text'
      label.textContent = text
      if (done[i]) label.classList.add('done')
      textWrap.appendChild(label)

      const note_ = document.createElement('span')
      note_.className = 'locuras-note'
      note_.textContent = note
      textWrap.appendChild(note_)

      row.appendChild(textWrap)

      const path = box.querySelector('path')
      if (done[i]) gsap.set(path, { strokeDashoffset: 0 })

      row.addEventListener('pointerup', (e) => {
        e.stopPropagation()
        toggleItem(label, path, done, i)
      })

      grid.appendChild(row)
    })

    el.appendChild(grid)
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set([el.querySelector('.display'), ...el.querySelectorAll('.locuras-row')], {
      opacity: 0,
      y: 10,
    })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    ctx.tl.to(el.querySelector('.display'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    ctx.tl.to(
      el.querySelectorAll('.locuras-row'),
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2',
    )
  },
}
