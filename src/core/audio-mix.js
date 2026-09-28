// Lógica pura de mezcla de audio: nada de Web Audio ni DOM acá, solo el
// cálculo del volumen efectivo. Así se puede testear sin mockear GainNode.
export function clamp01(n) {
  return Math.max(0, Math.min(1, n))
}

// Volumen final = base * nivel de duck, salvo mute (que siempre gana).
export function mixVolume({ base, duck, muted }) {
  if (muted) return 0
  return clamp01(base * clamp01(duck))
}
