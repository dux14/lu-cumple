// Mapa de cues musicales por id de slide (ver src/slides/index.js para los
// ids reales). Tiempos obtenidos transcribiendo el audio original con
// whisper.cpp (modelo small.en, timestamps por palabra) y confirmando que
// caen en inicio de frase con un análisis de energía de ffmpeg (astats)
// alrededor de cada punto candidato. Los comentarios citan solo las
// primeras palabras de cada frase, nunca la letra completa.
//
// Acciones soportadas (aplicadas por `onSlide` en src/audio.js):
//   - 'jump':   salta a `at` segundos con crossfade (~1,2 s), pero solo si
//               la posición actual está fuera de `window: [from, to]` (así
//               no corta si ya suena lo correcto) y solo al avanzar
//               (direction === 'next').
//   - 'resume': retoma la reproducción, opcionalmente desde `at` segundos.
//   - 'duck':   baja el volumen a `level` (0..1).
//   - 'tapeStop': solo documenta la intención; la propia slide llama a
//               audio.tapeStop() directamente (ver 11-acabamos.js).

// Inicio del verso 2: "So you can keep me..." — usado tanto por el cue de
// la 12 como por el reinicio en loop cuando la canción termina sola.
export const VERSE_2_START = 70.92

export const songCues = {
  // Collage de fotos: que suene el primer coro mientras se ven las fotos.
  '03-collage': {
    action: 'jump',
    at: 54.0,
    window: [53.9, 58.6], // "We keep this love in a photograph" (1er coro)
  },

  // 07-oracion: sin cue de salto a propósito — el duck del modo lectura ya
  // existe fuera de este sistema de cues (ver slide 07-oracion.js).

  // Falso final: la slide detiene la canción tipo "cinta que se frena".
  '11-acabamos': {
    action: 'tapeStop',
  },

  // El cielo se reenciende: retoma la canción desde el inicio del verso 2,
  // la frase más reconocible después del primer coro.
  '12-o-no': {
    action: 'resume',
    at: VERSE_2_START, // "So you can keep me..."
  },

  // Suspenso previo a la revelación: tensión con duck parcial.
  '17-bueno': {
    action: 'duck',
    level: 0.4,
  },

  // Intro épica del vuelo (~20 s de duración): salta al inicio de la frase
  // previa al estribillo, para que "wait for me to come home" llegue justo
  // al entrar a la revelación (slide 19).
  '18-flight': {
    action: 'jump',
    at: 158.5,
    window: [158.4, 162.3], // "You won't ever be alone"
  },

  // Revelación del tiquete: garantiza que suene el estribillo "wait for me
  // to come home" (se repite 4 veces) aunque la 18 haya llegado tarde.
  '19-boarding': {
    action: 'jump',
    at: 179.9,
    window: [179.9, 198.1], // "Wait for me to come home" (x4, clímax)
  },

  // Cierre: entra al outro/final de la canción. No vuelve a loop desde el
  // verso 2 — cuando la canción termina sola aquí, se deja el fade final
  // suave que ya trae el archivo exportado (ver onSlide en audio.js).
  '22-cierre': {
    action: 'jump',
    at: 234.5,
    window: [234.4, 253.9], // "Wait on the way I will remember..." → outro
    endsSong: true,
  },
}

// Lógica pura: decide si un cue de tipo 'jump' debe saltar dado la posición
// actual, su ventana y la dirección de navegación. Sin DOM ni audio real,
// para poder testear el criterio sin mockear el elemento <audio>.
export function shouldJump({ position, window: win, direction }) {
  if (direction !== 'next') return false
  const [from, to] = win
  return position < from || position > to
}
