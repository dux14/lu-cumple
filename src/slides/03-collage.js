// Slide 3: collage de fotos. Polaroids dispersas en arco, unidas por
// constelación dorada en orden cronológico. La primera late para invitar al
// toque; cualquier polaroid abre un lightbox a pantalla completa (foto
// izquierda, texto derecha) animado con Flip. Fotos y leyendas son
// placeholders hasta que lleguen los datos reales.
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

// Posiciones en % del área de la slide (852×393), en arco, lejos de la
// barra de progreso (arriba) y de las flechas (esquinas inferiores).
const LAYOUT = [
  { x: 10, y: 58, rot: -6 },
  { x: 23, y: 28, rot: 5 },
  { x: 37, y: 62, rot: -4 },
  { x: 50, y: 24, rot: 6 },
  { x: 64, y: 60, rot: -5 },
  { x: 78, y: 30, rot: 4 },
  { x: 90, y: 56, rot: -6 },
]

const photos = [
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 1]', text: '[texto 1]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 2]', text: '[texto 2]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 3]', text: '[texto 3]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 4]', text: '[texto 4]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 5]', text: '[texto 5]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 6]', text: '[texto 6]' },
  { src: null, date: '[fecha]', place: '[lugar]', caption: '[leyenda 7]', text: '[texto 7]' },
]

export const slide03 = {
  id: '03-collage',
  act: 'nosotros',
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-collage')

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.classList.add('collage-lines')
    svg.setAttribute('viewBox', '0 0 100 46.1') // proporción 852×393
    svg.setAttribute('preserveAspectRatio', 'none')
    let d = ''
    LAYOUT.forEach((p, i) => {
      const px = p.x
      const py = (p.y * 393) / 852 // reescala y a la misma unidad que x (viewBox custom)
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`
    })
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('class', 'collage-path')
    svg.appendChild(path)
    el.appendChild(svg)

    const slots = LAYOUT.map((pos, i) => {
      const slot = document.createElement('div')
      slot.className = 'polaroid-slot'
      slot.style.left = `${pos.x}%`
      slot.style.top = `${pos.y}%`

      const photo = document.createElement('button')
      photo.className = 'polaroid'
      photo.style.transform = `rotate(${pos.rot}deg)`
      photo.dataset.noNav = ''
      photo.setAttribute('aria-label', `Ver foto ${i + 1}`)
      if (i === 0) photo.classList.add('polaroid-pulse')

      slot.appendChild(photo)
      el.appendChild(slot)
      return { slot, photo }
    })

    const lightbox = document.createElement('div')
    lightbox.className = 'lightbox'
    lightbox.dataset.noNav = ''

    const photoSlotFull = document.createElement('div')
    photoSlotFull.className = 'lightbox-photo-slot'
    lightbox.appendChild(photoSlotFull)

    const textPane = document.createElement('div')
    textPane.className = 'lightbox-text'
    const eyebrow = document.createElement('p')
    eyebrow.className = 'eyebrow'
    const caption = document.createElement('h2')
    caption.className = 'display lightbox-caption'
    const body = document.createElement('p')
    body.className = 'body'
    textPane.append(eyebrow, caption, body)
    lightbox.appendChild(textPane)

    el.appendChild(lightbox)

    el._collage = { svg, path, slots, lightbox, photoSlotFull, eyebrow, caption, body }
    return el
  },
  enter(el, ctx) {
    const { svg, path, slots } = el._collage
    ctx.tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })

    const len = path.getTotalLength()
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)
    ctx.tl.to(path, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.1)

    ctx.tl.fromTo(
      slots.map((s) => s.photo),
      { opacity: 0, scale: 0.85, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      0.2,
    )

    let opened = false
    let pulseTween = gsap.to(slots[0].photo, {
      scale: 1.06,
      boxShadow: '0 0 18px rgba(212, 175, 55, 0.6)',
      duration: 1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    function stopPulse() {
      if (!pulseTween) return
      pulseTween.kill()
      pulseTween = null
      gsap.set(slots[0].photo, { boxShadow: 'none' })
    }

    function openLightbox(index) {
      stopPulse()
      if (opened) return
      opened = true
      const { lightbox, photoSlotFull, eyebrow, caption, body } = el._collage
      const photoEl = slots[index].photo
      const data = photos[index]

      const state = Flip.getState(photoEl)
      // La rotación fija es un inline style: pisa el `transform: none` de
      // `.polaroid-full` si no se limpia antes de mover la foto.
      photoEl.dataset.rot = photoEl.style.transform
      photoEl.style.transform = ''
      photoEl.classList.add('polaroid-full')
      photoSlotFull.appendChild(photoEl)
      eyebrow.textContent = `${data.date} · ${data.place}`
      caption.textContent = data.caption
      body.textContent = data.text

      lightbox.classList.add('is-open')
      gsap.set([eyebrow, caption, body], { opacity: 0, y: 8 })
      Flip.from(state, { duration: 0.5, ease: 'power3.out', absolute: true })
      gsap.to([eyebrow, caption, body], { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.25, ease: 'power2.out' })
      ctx.lockNav(true)
    }

    function closeLightbox() {
      if (!opened) return
      const openIndex = slots.findIndex((s) => s.photo.classList.contains('polaroid-full'))
      if (openIndex === -1) return
      const { lightbox, slots: allSlots } = el._collage
      const photoEl = allSlots[openIndex].photo
      const state = Flip.getState(photoEl)
      photoEl.classList.remove('polaroid-full')
      photoEl.style.transform = photoEl.dataset.rot || ''
      allSlots[openIndex].slot.appendChild(photoEl)
      Flip.from(state, {
        duration: 0.4,
        ease: 'power2.inOut',
        absolute: true,
        onComplete() {
          lightbox.classList.remove('is-open')
          opened = false
        },
      })
      ctx.lockNav(false)
    }

    slots.forEach((s, i) => {
      s.photo.addEventListener('pointerdown', () => openLightbox(i))
    })

    // Dentro del lightbox, cualquier tap o un swipe hacia abajo cierra.
    el._collage.lightbox.addEventListener('pointerup', () => {
      if (opened) closeLightbox()
    })

    el._collage.stopPulse = stopPulse
  },
}
