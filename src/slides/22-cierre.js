// Slide 22: cierre. El título entra primero; debajo se arma un «22» hecho de
// 22 estrellas exactas (11 por dígito) que llegan desde posiciones al azar
// del cielo, titilan al llegar y luego se conectan con líneas dibujadas
// (stroke-dashoffset). Al terminar, la barra de progreso hace un último
// destello y se desvanece (ver src/ui/progress-bar.js). Tocar la
// constelación la hace latir y suelta una estrella fugaz; «ver otra vez»
// repite el armado. Ninguno de los dos toques avanza el deck (data-no-nav,
// igual que las flechas de src/ui/controls.js).
import { gsap } from 'gsap'

const NS = 'http://www.w3.org/2000/svg'
const VIEWBOX = '0 0 130 96'
const STAR_STAGGER = 0.09
const STAR_TRAVEL = 1.5

// Forma de un «2»: 11 puntos, del trazo superior a la diagonal y la base.
// `digitPoints(0)` es el primer dígito; el segundo se arma con offsetX.
function digitPoints(offsetX) {
  return [
    [10, 25],
    [18, 11],
    [34, 7],
    [48, 15],
    [50, 31],
    [40, 47],
    [30, 59],
    [20, 71],
    [10, 85],
    [32, 89],
    [52, 89], // último del dígito: data-special
  ].map(([x, y]) => [x + offsetX, y])
}

const DIGITS = [digitPoints(0), digitPoints(68)]

// Toques de color: mayormente blanco, con un par de estrellas lila y una
// rosa por dígito (nunca las especiales, que van en blanco brillante).
function colorFor(i) {
  if (i === 2 || i === 6) return 'lilac'
  if (i === 5) return 'rose'
  return 'white'
}

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

function randomSkyPoint() {
  // Puntos de partida fuera del área de los dígitos, como si vinieran del
  // resto del cielo (viewBox 0 0 130 96, con margen).
  return [Math.random() * 150 - 10, Math.random() * 116 - 10]
}

function buildStars(starsGroup) {
  // Orden de llegada intercalado por dígito: dígito1[0], dígito2[0],
  // dígito1[1], dígito2[1]… así las dos últimas en encenderse son
  // justo los dos puntos finales de cada «2» (las especiales).
  const arrival = []
  for (let i = 0; i < 11; i++) {
    DIGITS.forEach((points, digit) => {
      arrival.push({ digit, i, x: points[i][0], y: points[i][1] })
    })
  }

  return arrival.map((star) => {
    const special = star.i === 10
    const r = special ? 1.9 : 1.3
    const circle = svgEl('circle', { cx: star.x, cy: star.y, r, opacity: 0 })
    circle.classList.add('cierre-star', `is-${colorFor(star.i)}`)
    if (special) circle.dataset.special = ''
    starsGroup.appendChild(circle)
    return { el: circle, x: star.x, y: star.y, r }
  })
}

function pathFor(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
}

function buildLines(linesGroup) {
  return DIGITS.map((points) => {
    const path = svgEl('path', { d: pathFor(points), class: 'cierre-line' })
    linesGroup.appendChild(path)
    return path
  })
}

function shootingStar(svg) {
  const line = svgEl('line', { class: 'cierre-shoot', x1: -15, y1: -10, x2: -3, y2: 2, opacity: 0 })
  svg.appendChild(line)
  gsap.timeline({ onComplete: () => line.remove() }).to(line, {
    opacity: 1,
    attr: { x1: 133, y1: 100, x2: 145, y2: 112 },
    duration: 0.65,
    ease: 'power1.in',
  }, 0).to(line, { opacity: 0, duration: 0.2 }, 0.45)
}

// Arma la constelación desde cero: estrellas dispersas al azar → viajan a su
// lugar y titilan → las líneas se dibujan. Se usa tanto en la entrada como
// en el replay de «ver otra vez».
function playConstellation(el, { onDone } = {}) {
  const o = el._cierre
  const stars = buildStars(o.starsGroup)
  const lines = buildLines(o.linesGroup)

  if (reduced()) {
    stars.forEach((s) => gsap.set(s.el, { opacity: 1 }))
    lines.forEach((path) => gsap.set(path, { strokeDasharray: 0, strokeDashoffset: 0 }))
    o.built = true
    onDone?.()
    return
  }

  const tl = gsap.timeline({
    onComplete() {
      o.built = true
      onDone?.()
    },
  })

  stars.forEach((star, i) => {
    const [sx, sy] = randomSkyPoint()
    gsap.set(star.el, { attr: { cx: sx, cy: sy } })
    const at = i * STAR_STAGGER
    tl.to(star.el, { opacity: 1, attr: { cx: star.x, cy: star.y }, duration: STAR_TRAVEL, ease: 'expo.inOut' }, at)
    // Titileo al llegar: la estrella crece un poco y vuelve a su tamaño.
    tl.to(star.el, { attr: { r: star.r * 1.9 }, duration: 0.16, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at + STAR_TRAVEL - 0.16)
  })

  const linesStart = (stars.length - 1) * STAR_STAGGER + STAR_TRAVEL + 0.1
  lines.forEach((path, i) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    tl.to(path, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, linesStart + i * 0.15)
  })
}

function clearConstellation(el) {
  const o = el._cierre
  o.starsGroup.replaceChildren()
  o.linesGroup.replaceChildren()
  o.built = false
}

function pulseAndShoot(el) {
  const o = el._cierre
  if (!o.built) return
  if (reduced()) return
  gsap.to(o.svg, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '50% 50%' })
  shootingStar(o.svg)
}

function replay(el) {
  const o = el._cierre
  if (!o.built) return // ya está armando: no se pisa
  clearConstellation(el)
  // El muchacho vuelve a mirar de espaldas y saluda cuando termina de nuevo.
  o.avatar?.trigger('replay')
  playConstellation(el, { onDone: () => o.avatar?.trigger('done') })
}

export const slide22 = {
  id: '22-cierre',
  act: 'cierre',
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-cierre')

    const title = document.createElement('h1')
    title.className = 'display display-md cierre-title'
    title.innerHTML = 'Ahora sí, felices 22,<br /><span class="accent">mi niña, te quiero</span>'
    el.appendChild(title)

    const wrap = document.createElement('div')
    wrap.className = 'cierre-constellation-wrap'
    wrap.dataset.noNav = ''

    const svg = svgEl('svg', { class: 'cierre-svg', viewBox: VIEWBOX, 'preserve-aspect-ratio': 'xMidYMid meet' })
    const linesGroup = svgEl('g', { class: 'cierre-lines' })
    const starsGroup = svgEl('g', { class: 'cierre-stars' })
    svg.append(linesGroup, starsGroup)
    wrap.appendChild(svg)

    const replayBtn = document.createElement('button')
    replayBtn.type = 'button'
    replayBtn.className = 'cierre-replay'
    replayBtn.dataset.noNav = ''
    replayBtn.textContent = 'ver otra vez'

    el.append(wrap, replayBtn)

    el._cierre = { svg, linesGroup, starsGroup, built: false }
    wrap.addEventListener('click', () => pulseAndShoot(el))
    replayBtn.addEventListener('click', () => replay(el))

    return el
  },
  prepareEnter(el) {
    gsap.set(el.querySelector('.cierre-title'), { opacity: 0, y: 10 })
    gsap.set(el.querySelector('.cierre-replay'), { opacity: 0 })
  },
  enter(el, ctx) {
    const title = el.querySelector('.cierre-title')
    const replayBtn = el.querySelector('.cierre-replay')
    el._cierre.avatar = ctx.avatar
    ctx.tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    ctx.tl.call(() => {
      playConstellation(el, {
        onDone() {
          ctx.progress?.flashOut()
          gsap.to(replayBtn, { opacity: 0.3, duration: 0.4 })
          ctx.audio?.duck(0.5, 1.2)
          ctx.avatar?.trigger('done')
        },
      })
    })
  },
  leave(el, ctx) {
    ctx.progress?.show()
    ctx.audio?.restore(0.6)
  },
}
