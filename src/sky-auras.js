// Parámetros del cielo por acto. `setAura` interpola linealmente entre estos.
// density: estrellas por cada 10 000 px². speed: drift horizontal en px/s.
// twinkle: intensidad del titileo (0..1). warmth: mezcla crema→dorado (0..1).
// brightness: multiplicador del alfa global.
export const AURAS = {
  apertura: { density: 1.1, speed: 2, twinkle: 0.3, warmth: 0.2, brightness: 0.8 },
  nosotros: { density: 1.4, speed: 4, twinkle: 0.5, warmth: 0.6, brightness: 1 },
  risas: { density: 1.4, speed: 10, twinkle: 0.8, warmth: 0.4, brightness: 1 },
  fe: { density: 1.0, speed: 1, twinkle: 0.2, warmth: 0.3, brightness: 0.6 },
  falso: { density: 1.4, speed: 5, twinkle: 0.5, warmth: 0.5, brightness: 1 },
  apagado: { density: 1.4, speed: 0, twinkle: 0, warmth: 0.2, brightness: 0.05 },
  suspenso: { density: 1.8, speed: 25, twinkle: 0.6, warmth: 0.3, brightness: 1 },
  sorpresa: { density: 2.2, speed: 40, twinkle: 1, warmth: 1, brightness: 1.2 },
  cierre: { density: 1.2, speed: 2, twinkle: 0.4, warmth: 0.7, brightness: 0.9 },
}

// Suspenso 14→17 (ver docs/plans/propuestas-por-slide.md, punto 2, y el
// mockup "Suspenso 14 → 17"): el cielo acelera slide a slide y las
// estrellas se estiran en trazos (`trail`, en px antes de multiplicar por
// el factor de paralaje de cada capa). `pairGap` es la separación entre las
// dos estrellas especiales como fracción del ancho: se acerca en cada paso.
// density/twinkle/warmth/brightness los toma `setSuspense` de `AURAS.suspenso`.
export const SUSPENSE_LEVELS = [
  { speed: 12, trail: 0, pairGap: 0.86 },
  { speed: 25, trail: 6, pairGap: 0.64 },
  { speed: 45, trail: 18, pairGap: 0.42 },
  { speed: 80, trail: 40, pairGap: 0.2 },
]
