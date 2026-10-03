// Lógica pura de rampas de volumen: sin Web Audio ni DOM, para poder testear
// la planificación sin mockear un GainNode.
//
// Por qué existe: en Safari de iOS `AudioParam.value` no siempre refleja el
// valor automatizado en curso. Si al encadenar rampas (navegación rápida,
// cues que se pisan) se lee ese valor después de `cancelScheduledValues`,
// la ganancia "salta" al último valor fijo y se oye un clic. Por eso se
// modela la rampa en JS y se calcula el valor actual con `valueAt`.

// Duración mínima de cualquier tramo: una rampa de 0 s es un escalón y
// suena como clic.
export const MIN_RAMP_SECONDS = 0.01

// Plan de ganancia: puntos {t, v} unidos por rectas, empezando en el valor
// de partida. `segments` = [{ to, seconds }], se encadenan en orden.
export function buildPlan(startValue, startTime, segments) {
  const points = [{ t: startTime, v: startValue }]
  let t = startTime
  for (const { to, seconds } of segments) {
    t += Math.max(MIN_RAMP_SECONDS, seconds)
    points.push({ t, v: to })
  }
  return { points }
}

// Valor del plan en el instante `t` (interpolación lineal; fuera de rango
// se queda en el extremo).
export function valueAt(plan, t) {
  const { points } = plan
  if (t <= points[0].t) return points[0].v
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (t <= b.t) return a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t)
  }
  return points[points.length - 1].v
}

// Curva de "cinta que se detiene": velocidad en pasos discretos (cada
// `playbackRate` asignado en iOS reconfigura el pipeline de medios en el
// hilo principal, así que se evita asignarlo en cada frame) y volumen que
// se mantiene casi pleno mientras baja el tono y solo se apaga al final.
// Devuelve { steps: [{ t, rate }], gain: [{ to, seconds }] }, con `t` en
// segundos desde el inicio.
export function tapeStopPlan({
  seconds,
  stepSeconds = 0.07,
  minRate = 0.08,
  holdFraction = 0.55,
  startGain = 1,
}) {
  const n = Math.max(1, Math.ceil(seconds / stepSeconds))
  const steps = []
  for (let i = 1; i <= n; i++) {
    const u = i / n
    // Desaceleración fuerte al inicio y cola larga: (1-u)^1.5.
    const rate = Math.max(minRate, Math.pow(1 - u, 1.5))
    steps.push({ t: u * seconds, rate })
    if (rate === minRate) break // el resto sería asignar el mismo valor
  }
  const hold = seconds * holdFraction
  const gain = [
    { to: startGain, seconds: hold },
    { to: 0, seconds: seconds - hold },
  ]
  return { steps, gain }
}
