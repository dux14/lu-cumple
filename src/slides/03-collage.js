// Slide 3: collage. Rollo de cámara desechable en perspectiva 3D con las 22
// fotos de la historia, en orden cronológico. Cada fotograma muestra la
// vista previa reinterpretada con IA; tocar el fotograma del frente abre la
// vista grande (el original bien encuadrado, con fecha y estilo). El rollo
// avanza solo y se detiene en las dos fechas con flores (rosas el 16 sep,
// amarillas el 21 sep, última foto). Ver
// docs/superpowers/specs/2026-09-28-collage-rollo-flores-design.md y el
// mockup docs/superpowers/mockups/collage-f1-integrado.html (lógica de
// render/moment/travel portada aquí en vh en vez de px fijos).
import { gsap } from 'gsap'
import { photos } from '../data/photos.js'

const MESES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
]

const STEP1 = 190 // px @ 393 de alto: paso horizontal al primer vecino
const STEP_EXTRA = 120 // px por vecino adicional
const ROSE_INDEX = photos.findIndex((p) => p.moment === 'rosas')
const YELLOW_INDEX = photos.findIndex((p) => p.moment === 'amarillas') // última foto

// Convierte un px pensado para una slide de 393px de alto a vh: los tamaños
// del collage son relativos a la altura (852×393 y 852×320 se ven iguales).
function vh(px) {
  return (px / 393) * 100
}

function stamp(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number)
  const yy = dateStr.slice(2, 4)
  return `${m} ${d} '${yy}`
}

function monthLabel(dateStr) {
  const [y, m] = dateStr.split('-').map(Number)
  return `${MESES[m - 1]} ${y}`
}

export const slide03 = {
  id: '03-collage',
  act: 'nosotros',
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-collage')

    const ambA = document.createElement('div')
    ambA.className = 'collage-amb'
    const ambB = document.createElement('div')
    ambB.className = 'collage-amb'
    el.append(ambA, ambB)

    const tint = document.createElement('div')
    tint.className = 'collage-tint'
    el.appendChild(tint)

    const reel = document.createElement('div')
    reel.className = 'collage-reel'
    reel.dataset.noNav = ''
    const ribbon = document.createElement('div')
    ribbon.className = 'collage-ribbon'
    reel.appendChild(ribbon)

    const frames = photos.map((p, i) => {
      const f = document.createElement('div')
      f.className = 'cf'
      f.dataset.index = String(i)

      const photo = document.createElement('div')
      photo.className = 'cf-photo'
      photo.style.backgroundImage = `url(${p.preview})`

      const date = document.createElement('span')
      date.className = 'cf-date'
      date.textContent = stamp(p.date)

      const styleLabel = document.createElement('span')
      styleLabel.className = 'cf-style'
      styleLabel.textContent = p.style

      f.append(photo, date, styleLabel)

      if (p.moment) {
        const note = document.createElement('span')
        note.className = 'cf-note'
        note.innerHTML =
          p.moment === 'rosas'
            ? `16 sep · <span class="hand" style="color:var(--rose)">rosas rojas</span>`
            : `21 sep · <span class="hand" style="color:#FFD34D">flores amarillas</span>`
        f.appendChild(note)
      }

      reel.appendChild(f)
      return f
    })

    el.appendChild(reel)

    const hero = document.createElement('div')
    hero.className = 'collage-hero'
    el.appendChild(hero)

    const videoRose1 = document.createElement('video')
    videoRose1.className = 'collage-bloom side'
    videoRose1.muted = true
    videoRose1.playsInline = true
    videoRose1.preload = 'auto'
    videoRose1.src = `${import.meta.env.BASE_URL}video/rosas.mp4`

    const videoRose2 = videoRose1.cloneNode()
    videoRose2.classList.add('right')

    const videoYellow = document.createElement('video')
    videoYellow.className = 'collage-bloom'
    videoYellow.muted = true
    videoYellow.playsInline = true
    videoYellow.preload = 'auto'
    videoYellow.src = `${import.meta.env.BASE_URL}video/amarillas.mp4`

    el.append(videoYellow, videoRose1, videoRose2)

    const title = document.createElement('div')
    title.className = 'collage-title'
    title.innerHTML = `22 fotos, <span class="hand">22 años</span>`
    el.appendChild(title)

    const month = document.createElement('div')
    month.className = 'collage-month'
    month.textContent = monthLabel(photos[0].date)
    el.appendChild(month)

    const memo = document.createElement('div')
    memo.className = 'collage-memo'
    el.appendChild(memo)

    const lightbox = document.createElement('div')
    lightbox.className = 'collage-lightbox'
    lightbox.dataset.noNav = ''
    const lbPhoto = document.createElement('div')
    lbPhoto.className = 'collage-lightbox-photo'
    const lbText = document.createElement('div')
    lbText.className = 'collage-lightbox-text'
    const lbEyebrow = document.createElement('p')
    lbEyebrow.className = 'eyebrow'
    const lbStyle = document.createElement('p')
    lbStyle.className = 'collage-lightbox-style'
    const lbCaption = document.createElement('h2')
    lbCaption.className = 'display'
    const lbBody = document.createElement('p')
    lbBody.className = 'body'
    lbText.append(lbEyebrow, lbStyle, lbCaption, lbBody)
    lightbox.append(lbPhoto, lbText)
    el.appendChild(lightbox)

    el._collage = {
      ambA,
      ambB,
      reel,
      frames,
      hero,
      videoYellow,
      videoRose1,
      videoRose2,
      title,
      month,
      memo,
      lightbox,
      lbPhoto,
      lbEyebrow,
      lbStyle,
      lbCaption,
      lbBody,
    }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    const { frames } = el._collage
    gsap.set(frames, { xPercent: -50, yPercent: -50 })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const c = el._collage
    const { frames, reel, hero, videoYellow, videoRose1, videoRose2, ambA, ambB, title, month, memo, lightbox } = c

    if (reduced) {
      setupReducedMotion(c)
      setupLightbox(c, ctx)
      el._collage.destroy = () => {
        c.lightbox.classList.remove('is-open')
        ctx.lockNav(false)
      }
      return
    }

    // pos: posición fraccionaria del rollo (0..21). render() dibuja cada
    // fotograma según su distancia a esa posición.
    const S = { pos: 0 }
    let lastFrontIndex = -1
    let ambFlip = false
    let master = null
    let opened = false

    function render() {
      frames.forEach((f, i) => {
        const d = i - S.pos
        const a = Math.abs(d)
        if (a > 4) {
          gsap.set(f, { display: 'none' })
          return
        }
        const sign = Math.sign(d)
        const x = sign * Math.min(a, 1) * STEP1 + sign * Math.max(0, a - 1) * STEP_EXTRA
        const scale = 1.22 - Math.min(a, 1) * 0.34 - Math.max(0, a - 1) * 0.08
        const ry = -Math.max(-1, Math.min(1, d)) * 34 - sign * Math.max(0, a - 1) * 6
        gsap.set(f, {
          display: '',
          x: `${vh(x)}vh`,
          y: 0,
          scale,
          rotationY: ry,
          z: `${vh(-a * 60)}vh`,
          opacity: 1 - Math.max(0, a - 1) * 0.35,
          zIndex: 100 - Math.round(a * 10),
          filter: `brightness(${1 - Math.min(a, 2) * 0.28})`,
        })
      })
      const i = Math.round(S.pos)
      if (i !== lastFrontIndex) {
        lastFrontIndex = i
        const p = photos[i]
        ambFlip = !ambFlip
        const on = ambFlip ? ambB : ambA
        const off = ambFlip ? ambA : ambB
        on.style.backgroundImage = `url(${p.preview})`
        on.style.opacity = '1'
        off.style.opacity = '0'
        month.textContent = monthLabel(p.date)
      }
    }
    render()

    function petals(color, n) {
      for (let i = 0; i < n; i++) {
        const petal = document.createElement('div')
        petal.className = 'collage-petal'
        petal.style.background = color
        el.appendChild(petal)
        gsap.fromTo(
          petal,
          { x: Math.random() * el.clientWidth, y: -20, rotation: Math.random() * 360, opacity: 0.95 },
          {
            y: el.clientHeight + 40,
            x: `+=${Math.random() * 160 - 80}`,
            rotation: '+=420',
            duration: 3.2 + Math.random() * 2,
            delay: Math.random() * 1.4,
            ease: 'none',
            onComplete: () => petal.remove(),
          },
        )
      }
    }

    function moment(i, { final = false } = {}) {
      const p = photos[i]
      const videos = p.moment === 'amarillas' ? [videoYellow] : [videoRose1, videoRose2]
      const fr = frames[i]
      const w = vh(184 * 1.22)
      const h = vh(134 * 1.22)
      const cx = 50 // centro horizontal del fotograma del frente
      const cy = 54 // centro vertical: debe calzar con `.cf { top: 54% }` en collage.css
      const tl = gsap.timeline()
      // `playAll()` construye el timeline maestro llamando a moment(ROSE_INDEX)
      // y moment(YELLOW_INDEX) uno detrás del otro, de forma síncrona: si el
      // texto/la imagen se asignan aquí afuera (JS plano, no GSAP), la
      // segunda llamada pisa los valores de la primera antes de reproducirse.
      // Por eso quedan dentro de un `.add()`, diferidos a cuando el timeline
      // realmente llegue a este punto.
      tl.add(() => {
        memo.innerHTML =
          p.moment === 'amarillas'
            ? `21 sep · <span class="hand" style="color:#FFD34D">flores amarillas</span>`
            : `16 sep · <span class="hand" style="color:var(--rose)">rosas rojas</span>`
        hero.style.backgroundImage = `url(${p.full})`
      }, 0)
        .set(hero, { left: `calc(${cx}% - ${w / 2}vh)`, top: `calc(${cy}% - ${h / 2}vh)`, width: `${w}vh`, height: `${h}vh`, opacity: 1, filter: 'brightness(1)' })
        .set(fr, { opacity: 0 })
        .to(frames.filter((f) => f !== fr), { opacity: 0, duration: 0.5 }, 0)
        .to([title, month], { opacity: 0, duration: 0.4 }, 0)
        .to(hero, { left: 0, top: 0, width: '100%', height: '100%', borderRadius: 0, duration: 1.1, ease: 'expo.inOut' }, 0.1)
        .to(hero, { filter: 'brightness(.55) saturate(1.1)', duration: 0.9 }, '-=.2')
        .add(() => videos.forEach((v) => { v.currentTime = 0; v.play() }), '<')
        .fromTo(videos, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', overwrite: 'auto' }, '<')
        .to(memo, { opacity: 1, duration: 0.7 }, '<.6')
        .add(() => petals(p.moment === 'amarillas' ? '#FFD34D' : '#B3122E', 18), '<')
      if (!final) {
        tl.to([videos, memo], { opacity: 0, duration: 0.8 }, '+=3.2')
          .to(hero, { left: `calc(${cx}% - ${w / 2}vh)`, top: `calc(${cy}% - ${h / 2}vh)`, width: `${w}vh`, height: `${h}vh`, borderRadius: 4, filter: 'brightness(1)', duration: 1, ease: 'expo.inOut' }, '<.2')
          .add(() => {
            render()
            gsap.set(fr, { opacity: 1 })
            gsap.set(hero, { opacity: 0 })
          })
          .to([title, month], { opacity: 1, duration: 0.4 })
      }
      return tl
    }

    function stopAll() {
      if (master) master.kill()
      gsap.killTweensOf(S)
      ;[videoYellow, videoRose1, videoRose2].forEach((v) => {
        v.pause()
        gsap.set(v, { opacity: 0 })
      })
      gsap.set([hero, memo], { opacity: 0 })
      gsap.set([title, month], { opacity: 1 })
    }

    function travel(to, dur) {
      return gsap.to(S, { pos: to, duration: dur, ease: 'power1.inOut', onUpdate: render })
    }

    function playAll() {
      stopAll()
      S.pos = 0
      render()
      master = gsap
        .timeline()
        .add(travel(ROSE_INDEX, ROSE_INDEX * 0.55))
        .add(moment(ROSE_INDEX), '+=.3')
        .add(travel(YELLOW_INDEX, (YELLOW_INDEX - ROSE_INDEX) * 0.55), '+=.2')
        .add(moment(YELLOW_INDEX, { final: true }), '+=.3')
    }

    // Arrastre: toma el control del rollo (pausa el avance automático). Si
    // el movimiento fue mínimo, se trata como un toque: el fotograma del
    // frente abre la vista grande, una vecina se trae al frente.
    const TAP_THRESHOLD = 8
    let dragging = false
    let startX = 0
    let lastX = 0
    let moved = false

    function onPointerDown(e) {
      if (opened) return
      dragging = true
      moved = false
      startX = e.clientX
      lastX = e.clientX
      stopAll()
    }

    function onPointerMove(e) {
      if (!dragging) return
      const dx = e.clientX - lastX
      if (Math.abs(e.clientX - startX) > TAP_THRESHOLD) moved = true
      const stepPx = vh(STEP1) * (el.clientHeight / 100)
      S.pos = Math.max(0, Math.min(photos.length - 1, S.pos - dx / stepPx))
      lastX = e.clientX
      render()
    }

    function onPointerUp(e) {
      if (!dragging) return
      dragging = false
      if (!moved) {
        const target = e.target.closest?.('.cf')
        const index = target ? Number(target.dataset.index) : Math.round(S.pos)
        if (index === Math.round(S.pos)) {
          openLightbox(index)
          return
        }
        gsap.to(S, { pos: index, duration: 0.5, ease: 'power2.out', onUpdate: render })
        return
      }
      gsap.to(S, { pos: Math.round(S.pos), duration: 0.4, onUpdate: render })
    }

    function openLightbox(index) {
      opened = true
      const p = photos[index]
      const { lbPhoto, lbEyebrow, lbStyle, lbCaption, lbBody } = c
      lbPhoto.style.backgroundImage = `url(${p.full})`
      lbEyebrow.textContent = `${p.n} / ${photos.length} · ${p.dateLabel.toUpperCase()}`
      lbStyle.textContent = `versión ${p.style}`
      lbCaption.textContent = p.caption || ''
      lbCaption.style.display = p.caption ? '' : 'none'
      lbBody.textContent = p.text || ''
      lbBody.style.display = p.text ? '' : 'none'
      lightbox.classList.add('is-open')
      ctx.lockNav(true)
    }

    function closeLightbox() {
      if (!opened) return
      opened = false
      lightbox.classList.remove('is-open')
      ctx.lockNav(false)
    }

    reel.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    lightbox.addEventListener('pointerup', closeLightbox)

    playAll()

    el._collage.destroy = () => {
      stopAll()
      reel.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      lightbox.removeEventListener('pointerup', closeLightbox)
      closeLightbox()
    }
  },
  leave(el) {
    el._collage?.destroy?.()
  },
}

// Modo sin movimiento: rollo plano y desplazable (overflow-x en CSS), sin
// avance automático ni 3D. Los momentos se ven como el fotograma con su
// nota (`.cf-note`, mostrada solo en este modo vía CSS).
function setupReducedMotion(c) {
  const { ambA, month } = c
  ambA.style.backgroundImage = `url(${photos[0].preview})`
  ambA.style.opacity = '1'
  month.textContent = monthLabel(photos[0].date)
}

function setupLightbox(c, ctx) {
  const { reel, frames, lightbox, lbPhoto, lbEyebrow, lbStyle, lbCaption, lbBody, month } = c
  let opened = false

  function open(index) {
    opened = true
    const p = photos[index]
    lbPhoto.style.backgroundImage = `url(${p.full})`
    lbEyebrow.textContent = `${p.n} / ${photos.length} · ${p.dateLabel.toUpperCase()}`
    lbStyle.textContent = `versión ${p.style}`
    lbCaption.textContent = p.caption || ''
    lbCaption.style.display = p.caption ? '' : 'none'
    lbBody.textContent = p.text || ''
    lbBody.style.display = p.text ? '' : 'none'
    lightbox.classList.add('is-open')
    ctx.lockNav(true)
  }

  function close() {
    if (!opened) return
    opened = false
    lightbox.classList.remove('is-open')
    ctx.lockNav(false)
  }

  frames.forEach((f, i) => f.addEventListener('pointerup', () => open(i)))
  lightbox.addEventListener('pointerup', close)
  reel.addEventListener('scroll', () => {
    const i = Math.round(reel.scrollLeft / (frames[1]?.offsetLeft - frames[0]?.offsetLeft || 1))
    const p = photos[Math.max(0, Math.min(photos.length - 1, i))]
    if (p) month.textContent = monthLabel(p.date)
  })
}
