// Apariciones del muchacho (propuesta C del mockup avatar-pixel.html): sale
// de abajo a la izquierda, hace su gesto y se va; el resto del tiempo está
// oculto. Mapa por id de slide (ver src/slides/index.js), en el estilo de
// song-cues.js. Lo ejecuta src/ui/avatar.js.
//
// Cada cue es una lista de pasos [ms, acción], con ms contados desde que
// la slide empieza a entrar (la transición dura ~0,6 s):
//   - 'peek':          se asoma con 8-asoma (cabeza y manos sobre el borde)
//   - 'pose:<nombre>': cambia a esa pose; si venía asomado, sube entero
//   - 'enter:<nombre>': sube desde abajo directo con esa pose
//   - 'walk:<nombre>': cruza la pantalla de izquierda a derecha caminando
//   - 'bounce':        saltitos (2 cuadros) mientras dura la pose
//   - 'leave':         baja y se oculta
// `enter` corre al entrar a la slide; `on.<evento>` lo dispara la slide con
// ctx.avatar.trigger('<evento>') (revelar el chiste, Madrid, etc.).
//
// La 6 no está aquí: su muchacho vive en el hueco `.term-sticker` de la
// propia slide (ver 06-programador.js).

const BASE = import.meta.env?.BASE_URL ?? '/'

export const POSES = {
  saluda: '1-saluda',
  rie: '2-rie',
  obrero: '3-obrero',
  salta: '4-salta',
  guino: '5-guino',
  maleta: '6-maleta',
  espaldas: '7-espaldas',
  asoma: '8-asoma',
}

export const POSE_SIZE = { w: 46, h: 67 } // px nativos de los sprites de cuerpo entero

export function poseUrl(name) {
  return `${BASE}avatar/${POSES[name]}.png`
}

export const VERBS = ['peek', 'pose', 'enter', 'walk', 'bounce', 'leave']

export const avatarCues = {
  // 2 · se asoma y saluda
  '02-apertura': {
    enter: [[1100, 'peek'], [1900, 'pose:saluda'], [4400, 'leave']],
  },

  // 5 · se asoma y se ríe cuando ella revela el chiste (mantener presionado)
  '05-chiste': {
    on: { reveal: [[0, 'peek'], [350, 'pose:rie'], [2600, 'leave']] },
  },

  // 9 · saluda, se despide y se va (créditos finales)
  '09-creditos': {
    enter: [[1300, 'peek'], [2000, 'pose:saluda'], [4600, 'leave']],
  },

  // 12 · salta y se ríe con el «¿O no????»
  '12-o-no': {
    enter: [[900, 'enter:salta'], [1300, 'bounce'], [3600, 'leave']],
  },

  // 16 · se asoma y guiña
  '16-loco': {
    enter: [[1000, 'peek'], [1800, 'pose:guino'], [4000, 'leave']],
  },

  // 19 · cruza con la maleta cuando aparece Madrid / la cuenta regresiva
  '19-boarding': {
    on: { madrid: [[900, 'walk:maleta']] },
  },

  // 22 · de espaldas mirando la constelación; al terminar se voltea y saluda
  '22-cierre': {
    enter: [[1200, 'enter:espaldas']],
    on: {
      done: [[1800, 'pose:saluda']],
      replay: [[0, 'pose:espaldas']],
    },
  },
}

export function parseAction(action) {
  const [verb, arg] = action.split(':')
  return { verb, arg: arg ?? null }
}

// Pasos de un cue: `event` null = el de entrada a la slide.
export function cueSteps(id, event = null) {
  const cue = avatarCues[id]
  if (!cue) return []
  return (event ? cue.on?.[event] : cue.enter) ?? []
}
