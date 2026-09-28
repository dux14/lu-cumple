// Nebulosa de fondo por acto: capa detrás del cielo (#nebula, insertado
// antes de #sky en index.html) con dos manchas radiales + una base
// nocturna, interpoladas con GSAP. Valores y lógica calcados del mockup
// aprobado docs/superpowers/mockups/propuestas-fuertes.html, sección
// "3 · Nebulosa por acto" (paleta y radios) y "2 · Suspenso 14 → 17" (mezcla
// progresiva y warp). Reemplaza el fondo estático de src/styles/base.css.
import { gsap } from 'gsap'

const PLUM = [58, 26, 79]
const WINE = [140, 29, 64]
const LILAC = [201, 182, 255]
const ROSE = [255, 92, 122]

// Estado plano (no anidado) para que GSAP pueda tweenearlo directo: dos
// manchas (a/b: color, posición, tamaño, alfa) + `n`, la opacidad de la
// base nocturna casi negra que las enmarca.
function neb(a, ax, ay, aw, ah, aa, b, bx, by, bw, bh, ba, n) {
  return {
    ar: a[0], ag: a[1], ab: a[2], ax, ay, aw, ah, aa,
    br: b[0], bg: b[1], bb: b[2], bx, by, bw, bh, ba,
    n,
  }
}

// Un target por acto (ver tabla "Nebulosa por acto" de
// docs/plans/propuestas-por-slide.md, punto 1). 'apagado' no está en el
// mockup: se compone aquí igual que 'falso' pero sin las manchas de color,
// para que el apagón de la 11 termine en negro casi puro.
export const NEBULAS = {
  apertura: neb(PLUM, 15, 6, 62, 55, 0.5, WINE, 92, 100, 40, 40, 0.08, 0.55),
  nosotros: neb(WINE, 50, 110, 85, 62, 0.55, PLUM, 12, 0, 55, 50, 0.35, 0.85),
  risas: neb(LILAC, 86, 40, 50, 70, 0.22, PLUM, 70, 95, 75, 60, 0.7, 0.95),
  fe: neb(ROSE, 50, 112, 30, 28, 0.24, WINE, 50, 116, 58, 42, 0.28, 0.2),
  falso: neb(PLUM, 15, 10, 65, 55, 0.5, WINE, 92, 95, 55, 50, 0.35, 1),
  apagado: neb(PLUM, 15, 10, 65, 55, 0, WINE, 92, 95, 55, 50, 0, 1),
  suspenso: neb(PLUM, 50, 50, 34, 40, 0.75, WINE, 50, 50, 14, 18, 0.32, 0.45),
  sorpresa: neb(WINE, 50, 60, 90, 78, 0.5, ROSE, 50, 55, 36, 30, 0.16, 1),
  cierre: neb(WINE, 18, 100, 88, 72, 0.45, PLUM, 85, 0, 88, 72, 0.6, 1),
}

// El túnel del warp 17→18: las manchas se cierran al centro, casi sin base
// nocturna (para que el flash blanco se note).
const WARP = neb(PLUM, 50, 50, 14, 18, 0.9, WINE, 50, 50, 6, 8, 0.5, 0.2)

function lerpNeb(a, b, t) {
  return Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]))
}

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// `el` es #nebula (ver index.html). El destello del warp es un div propio,
// añadido al final de <body> para quedar por encima de todo (texto y UI
// incluidos), como en el mockup.
export function createNebula(el) {
  const s = { ...NEBULAS.apertura }
  let tween = null

  const flash = document.createElement('div')
  flash.className = 'nebula-flash'
  document.body.appendChild(flash)

  function paint() {
    const r = Math.round
    el.style.background =
      `radial-gradient(ellipse ${s.aw}% ${s.ah}% at ${s.ax}% ${s.ay}%, rgba(${r(s.ar)}, ${r(s.ag)}, ${r(s.ab)}, ${s.aa}), transparent 70%), ` +
      `radial-gradient(ellipse ${s.bw}% ${s.bh}% at ${s.bx}% ${s.by}%, rgba(${r(s.br)}, ${r(s.bg)}, ${r(s.bb)}, ${s.ba}), transparent 70%), ` +
      `radial-gradient(ellipse at 50% 50%, rgba(20, 11, 34, ${s.n}), #08060d 75%)`
  }
  paint()

  function tweenTo(target, duration) {
    if (tween) tween.kill()
    if (reduced() || duration === 0) {
      Object.assign(s, target)
      paint()
      return
    }
    tween = gsap.to(s, { ...target, duration, ease: 'power2.inOut', onUpdate: paint })
  }

  // Acto completo: lo llama el deck en cada cambio de slide.
  function setAct(act, { duration = 1.2 } = {}) {
    tweenTo(NEBULAS[act] ?? NEBULAS.apertura, duration)
  }

  // 14→17: mezcla progresiva entre 'falso' y 'suspenso' según el nivel
  // (1..4), como en el mockup (`lerpNeb(NEB.falso, NEB.suspenso, s.tun)`).
  function setSuspenseLevel(level, { duration = 1 } = {}) {
    const t = Math.min(Math.max(level, 1), 4) / 4
    tweenTo(lerpNeb(NEBULAS.falso, NEBULAS.suspenso, t), duration)
  }

  // 17→18: la nebulosa se contrae al centro, un destello blanco cubre la
  // pantalla y detrás, ya oculto por el destello, se fija el target del
  // acto que entra (sin animación: sería visible aun bajo el flash).
  function warpTo(nextAct, { duration = 1.1 } = {}) {
    if (reduced()) {
      setAct(nextAct, { duration: 0 })
      return
    }
    if (tween) tween.kill()
    const target = NEBULAS[nextAct] ?? NEBULAS.apertura
    const tl = gsap.timeline()
    tl.to(s, { ...WARP, duration, ease: 'power3.in', onUpdate: paint }, 0)
    tl.to(flash, { opacity: 0.92, duration: 0.15 }, duration - 0.05)
    tl.call(
      () => {
        Object.assign(s, target)
        paint()
      },
      null,
      duration + 0.05,
    )
    tl.to(flash, { opacity: 0, duration: 0.4 }, duration + 0.1)
    tween = tl
  }

  function destroy() {
    if (tween) tween.kill()
    flash.remove()
  }

  return { setAct, setSuspenseLevel, warpTo, destroy }
}
