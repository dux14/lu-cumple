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
