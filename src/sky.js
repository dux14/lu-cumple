// Cielo persistente en canvas: tres capas de estrellas con parallax, titileo
// y transición suave entre auras (ver src/sky-auras.js).
import { gsap } from 'gsap'
import { AURAS } from './sky-auras.js'

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
  const rand = mulberry32(SEED)
  const layers = LAYERS.map(() => makeLayerStars(rand))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let width = 0
  let height = 0

  const params = {
    density: AURAS.apertura.density,
    speed: reduced ? 0 : AURAS.apertura.speed,
    twinkle: reduced ? 0 : AURAS.apertura.twinkle,
    warmth: AURAS.apertura.warmth,
    brightness: AURAS.apertura.brightness,
  }

  let tween = null

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      ctx.fillStyle = `rgba(${mix[0]}, ${mix[1]}, ${mix[2]}, ${alpha})`
      ctx.fillRect(px, py, size, size)
    }
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    ctx.clearRect(0, 0, width, height)
    const time = now / 1000
    layers.forEach((stars, i) => drawLayer(stars, LAYERS[i].size, LAYERS[i].speedFactor, time, dt))
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
      duration,
      ease: 'power1.inOut',
    })
  }

  function destroy() {
    stop()
    if (tween) tween.kill()
    resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  }

  return { setAura, destroy }
}
