// Lógica pura del suspenso 14→17 (ver docs/plans/propuestas-por-slide.md,
// punto 2, y el mockup "Suspenso 14 → 17" en
// docs/superpowers/mockups/propuestas-fuertes.html). Sin DOM ni GSAP, para
// poder testear el cálculo de nivel y el gatillo del warp sin canvas.
const SUSPENSE_ACT = 'suspenso'
const LEVELS = 4

// Paso 1-based de `index` dentro de la corrida de slides consecutivas que
// comparten `acts[index]`. `acts` es `slides.map((s) => s.act)`.
export function actStep(acts, index) {
  const act = acts[index]
  let step = 1
  for (let i = index - 1; i >= 0 && acts[i] === act; i--) step++
  return step
}

// Nivel 1..4 del suspenso para una slide de la 14 a la 17. Slides más allá
// del cuarto paso (no debería pasar con solo 4 slides en el acto) se
// recortan al máximo.
export function suspenseLevel(acts, index) {
  return Math.min(actStep(acts, index), LEVELS)
}

// El warp solo ocurre al avanzar y solo al salir de 'suspenso' hacia otro
// acto (17 → 18). Nunca hacia atrás: retroceder de 18 a 17 vuelve al último
// nivel del suspenso sin el salto.
export function isWarpTransition({ fromAct, toAct, direction }) {
  return direction === 'forward' && fromAct === SUSPENSE_ACT && toAct !== SUSPENSE_ACT
}
