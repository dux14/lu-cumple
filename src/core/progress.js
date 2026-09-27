// Progreso con falso final: el primer tramo (1..11) se muestra como si
// fueran las 22 slides completas; en 12 se revela el tramo real (1..22).
export const TOTAL = 22
export const FAKE_END = 11

export function progressModel(index) {
  if (index === 0) return { visible: false, segments: 0, filled: 0 }
  const segments = index <= FAKE_END ? FAKE_END : TOTAL
  return { visible: true, segments, filled: index }
}
