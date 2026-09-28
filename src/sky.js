// Cielo persistente en canvas: tres capas de estrellas con parallax, titileo
// y transición suave entre auras (ver src/sky-auras.js). Además: el
// suspenso 14→17 (estrellas en trazos + dos estrellas que se acercan), el
// warp 17→18 y una estrella fugaz por cambio de acto.
import { gsap } from 'gsap'
import { AURAS, SUSPENSE_LEVELS } from './sky-auras.js'

const LAYERS = [
  { size: 0.6, speedFactor: 0.3 },
  { size: 1, speedFactor: 0.6 },
  { size: 1.6, speedFactor: 1 },
]

const MAX_STARS_PER_LAYER = 320
const SEED = 20260927 // fija: el cielo es el mismo en cada visita
const WHITE = [255, 255, 255]
const LILAC = [201, 182, 255]
const ROSE = [255, 92, 122]
const FADE_RATE = 0.06 // por frame: qué tan rápido una estrella aparece/desaparece

// Las dos estrellas especiales del suspenso (rosa y lila, ver drawPair) solo
// viven en este canvas: no son las mismas que dibuja src/slides/22-cierre.js
// en su constelación SVG. Si se quisiera conectarlas —punto 3 del encargo—
// la ruta más simple sería exponer aquí algo como `getPairColors()` →
// `['rose', 'lilac']` y que la 22, en vez de fijar blanco para las
// estrellas `data-special` (el último punto de cada «2» en `colorFor`),
// lea esos colores. No se implementa: la 22 la edita otro agente.

// PRNG determinista (mulberry32) para que el layout de estrellas no cambie.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(array, rand) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function makeLayerStars(rand) {
  const stars = []
  for (let i = 0; i < MAX_STARS_PER_LAYER; i++) {
    stars.push({
      x: rand(),
      y: rand(),
      phase: rand() * Math.PI * 2,
      alpha: 0,
      order: 0, // se asigna abajo con shuffle
    })
  }
  const order = shuffle(
    Array.from({ length: MAX_STARS_PER_LAYER }, (_, i) => i),
    rand,
  )
  order.forEach((starIndex, priority) => {
    stars[starIndex].order = priority
  })
  return stars
}

export function createSky(canvas) {
  const ctx = canvas.getContext('2d')
  ctx.lineCap = 'round'
  const rand = mulberry32(SEED)
  const layers = LAYERS.map(() => makeLayerStars(rand))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let width = 0
  let height = 0
  let shots = []

  const params = {
    density: AURAS.apertura.density,
    speed: reduced ? 0 : AURAS.apertura.speed,
    twinkle: reduced ? 0 : AURAS.apertura.twinkle,
    warmth: AURAS.apertura.warmth,
    brightness: AURAS.apertura.brightness,
    trail: 0, // estiramiento de las estrellas en trazos (px, antes del factor de paralaje)
    pairGap: 0.9, // separación de las dos estrellas especiales, fracción del ancho
    pairAlpha: 0, // 0 = ocultas fuera del suspenso
  }

  let tween = null

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  let rafId = null
  let lastTime = performance.now()

  function drawLayer(stars, size, speedFactor, time, dt) {
    const area = (width * height) / 10000
    const visibleCount = Math.round(params.density * area)
    const driftPx = (params.speed * speedFactor * dt) / Math.max(width, 1)
    const trailPx = params.trail * speedFactor

    // warmth 0..1: blanco → lila en la primera mitad, lila → rosa en la segunda.
    const [from, to, t] =
      params.warmth <= 0.5 ? [WHITE, LILAC, params.warmth * 2] : [LILAC, ROSE, (params.warmth - 0.5) * 2]
    const mix = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t]

    for (const star of stars) {
      // Drift hacia la izquierda, con wrap continuo.
      star.x -= driftPx
      if (star.x < -0.02) star.x += 1.04

      const target = star.order < visibleCount ? 1 : 0
      star.alpha += (target - star.alpha) * FADE_RATE

      if (star.alpha <= 0.001) continue

      const twinkleFactor = 1 - params.twinkle * 0.5 + params.twinkle * 0.5 * Math.sin(time * 2 + star.phase)
      const alpha = Math.max(0, Math.min(1, star.alpha * twinkleFactor * params.brightness))
      if (alpha <= 0.001) continue

      const px = star.x * width
      const py = star.y * height
      if (trailPx > 1.5) {
        const grad = ctx.createLinearGradient(px, py, px + trailPx, py)
        grad.addColorStop(0, `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${alpha})`)
        grad.addColorStop(1, `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, 0)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = size
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + trailPx, py)
        ctx.stroke()
      } else {
        ctx.fillStyle = `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${alpha})`
        ctx.fillRect(px, py, size, size)
      }
    }
  }

  // Dos estrellas especiales (rosa a la izquierda, lila a la derecha) que se
  // acercan al centro en cada paso del suspenso. Fuera de él, pairAlpha 0
  // las mantiene invisibles sin dejar de calcular nada caro.
  function drawPair(time) {
    if (params.pairAlpha <= 0.001) return
    const pulse = 0.85 + 0.15 * Math.sin(time * 2.2)
    const y = height * 0.18
    for (const side of [-1, 1]) {
      const x = width * (0.5 + (side * params.pairGap) / 2)
      const a = Math.max(0, Math.min(1, params.pairAlpha * pulse))
      const col = side < 0 ? ROSE : LILAC
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 16)
      glow.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.55 * a})`)
      glow.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`
      ctx.beginPath()
      ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Estrella fugaz: cruza en diagonal una vez y se apaga. Se dispara desde
  // fuera (deck.js, en cada cambio de acto), no en cada slide.
  function drawShots(time) {
    if (shots.length === 0) return
    shots = shots.filter((sh) => {
      const e = (time - sh.t0) / sh.dur
      if (e >= 1) return false
      const k = 1 - (1 - e) ** 3
      const hx = sh.x0 + sh.dx * k
      const hy = sh.y0 + sh.dy * k
      const len = 90
      const m = Math.hypot(sh.dx, sh.dy) || 1
      const tx = hx - (sh.dx / m) * len
      const ty = hy - (sh.dy / m) * len
      const a = Math.sin(Math.PI * e)
      const grad = ctx.createLinearGradient(hx, hy, tx, ty)
      grad.addColorStop(0, `rgba(255, 255, 255, ${a})`)
      grad.addColorStop(0.3, `rgba(201, 182, 255, ${a * 0.5})`)
      grad.addColorStop(1, 'rgba(201, 182, 255, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(hx, hy)
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`
      ctx.beginPath()
      ctx.arc(hx, hy, 1.6, 0, Math.PI * 2)
      ctx.fill()
      return true
    })
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    ctx.clearRect(0, 0, width, height)
    const time = now / 1000
    layers.forEach((stars, i) => drawLayer(stars, LAYERS[i].size, LAYERS[i].speedFactor, time, dt))
    drawPair(time)
    drawShots(time)
    rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (rafId === null) {
      lastTime = performance.now()
      rafId = requestAnimationFrame(tick)
    }
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function onVisibility() {
    if (document.hidden) stop()
    else start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  start()

  function setAura(name, { duration = 1.2 } = {}) {
    const target = AURAS[name]
    if (!target) return
    if (tween) tween.kill()
    tween = gsap.to(params, {
      density: target.density,
      speed: reduced ? 0 : target.speed,
      twinkle: reduced ? 0 : target.twinkle,
      warmth: target.warmth,
      brightness: target.brightness,
      trail: 0,
      pairAlpha: 0,
      duration: reduced ? 0 : duration,
      ease: 'power1.inOut',
    })
  }

  // Suspenso 14→17: `level` 1..4 (ver src/core/suspense.js). Reusa
  // density/twinkle/warmth/brightness de AURAS.suspenso y toma
  // speed/trail/pairGap de SUSPENSE_LEVELS.
  function setSuspense(level, { duration = 1 } = {}) {
    const base = AURAS.suspenso
    const lvl = SUSPENSE_LEVELS[Math.min(Math.max(level, 1), SUSPENSE_LEVELS.length) - 1]
    if (tween) tween.kill()
    tween = gsap.to(params, {
      density: base.density,
      speed: reduced ? 0 : lvl.speed,
      twinkle: reduced ? 0 : base.twinkle,
      warmth: base.warmth,
      brightness: base.brightness,
      trail: reduced ? 0 : lvl.trail,
      pairGap: lvl.pairGap,
      pairAlpha: 1,
      duration: reduced ? 0 : duration,
      ease: 'power2.inOut',
    })
  }

  // 17→18: el cielo se lanza a una velocidad extrema con trazos largos,
  // se apaga a negro (brightness 0, sin dibujar nada) y reaparece ya con
  // los valores del acto que entra. El destello blanco lo pone
  // src/nebula.js (su capa está detrás del texto; este solo maneja el
  // "vacío" de estrellas). Revertir (18→17) nunca pasa por acá: deck.js
  // solo llama a warpTo al avanzar (ver isWarpTransition).
  function warpTo(nextAuraName, { duration = 1.1 } = {}) {
    const target = AURAS[nextAuraName] ?? AURAS.apertura
    if (tween) tween.kill()
    if (reduced) {
      Object.assign(params, {
        density: target.density,
        speed: 0,
        twinkle: 0,
        warmth: target.warmth,
        brightness: target.brightness,
        trail: 0,
        pairGap: 0.9,
        pairAlpha: 0,
      })
      return
    }
    const tl = gsap.timeline()
    tl.to(params, { speed: 2600, trail: 420, brightness: 1.3, pairGap: 0, pairAlpha: 0, duration, ease: 'power3.in' }, 0)
    tl.call(
      () => {
        Object.assign(params, {
          density: target.density,
          speed: target.speed,
          twinkle: target.twinkle,
          warmth: target.warmth,
          brightness: 0,
          trail: 0,
          pairAlpha: 0,
        })
      },
      null,
      duration + 0.02,
    )
    tl.to(params, { brightness: target.brightness, duration: 0.6, ease: 'power2.out' }, duration + 0.06)
    tween = tl
  }

  function shootingStar() {
    if (reduced) return
    const l2r = Math.random() < 0.5
    shots.push({
      t0: performance.now() / 1000,
      dur: 0.65,
      x0: l2r ? width * (0.12 + Math.random() * 0.25) : width * (0.88 - Math.random() * 0.25),
      y0: height * (0.08 + Math.random() * 0.18),
      dx: (l2r ? 1 : -1) * width * 0.42,
      dy: height * 0.3,
    })
  }

  function destroy() {
    stop()
    if (tween) tween.kill()
    resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  }

  return { setAura, setSuspense, warpTo, shootingStar, destroy }
}
