// Las 22 slides + slide 0. Simples se declaran como datos con `textSlide`;
// especiales (0, 3, 18, 19) viven en su propio archivo. Textos y actos según
// docs/superpowers/specs/2026-09-27-lu-cumple-base-design.md — tabla
// "Estructura". Placeholders entre corchetes: quedan para entregas
// posteriores (chiste hot, oración, dedicatoria, carta).
import { slide00 } from './00-rotate.js'
import { slide03 } from './03-collage.js'
import { slide18 } from './18-flight.js'
import { slide19 } from './19-boarding.js'
import { textSlide } from './text-slide.js'

export const slides = [
  slide00,

  // 1–2 · Apertura
  textSlide({
    id: '01-apertura',
    act: 'apertura',
    lines: ['Lu, hoy es tu día', '<span class="accent">especial</span>'],
  }),
  textSlide({
    id: '02-apertura',
    act: 'apertura',
    lines: [
      'Y este muchacho que te gusta y que le gustas mucho',
      '<span class="accent">preparó esto para ti</span>',
    ],
  }),

  // 3–4 · Nosotros
  slide03,
  textSlide({
    id: '04-carta',
    act: 'nosotros',
    eyebrow: 'Carta',
    lines: ['Palabras sobre', '<span class="accent">nosotros</span>'],
    paragraphs: ['[Carta — párrafo 1]', '[Carta — párrafo 2]', '[Carta — párrafo 3]'],
  }),

  // 5–6 · Risas
  textSlide({
    id: '05-programador',
    act: 'risas',
    lines: [
      'El programador <span class="accent alt">defectuoso</span>',
      'se está <span class="accent">arreglando</span> <span class="wiggle">de a pasos</span>',
    ],
  }),
  textSlide({
    id: '06-chiste',
    act: 'risas',
    lines: ['[Chiste hot]'],
  }),

  // 7–8 · Fe
  textSlide({
    id: '07-oracion',
    act: 'fe',
    eyebrow: 'Oración',
    lines: ['Una oración', '<span class="accent">para nosotros</span>'],
    paragraphs: ['[Oración — párrafo 1]', '[Oración — párrafo 2]', '[Oración — párrafo 3]'],
  }),
  textSlide({
    id: '08-dedicatoria',
    act: 'fe',
    eyebrow: 'Dedicatoria',
    lines: ['Dedicatoria de', '<span class="accent">cumpleaños</span>'],
    paragraphs: ['[Dedicatoria — párrafo 1]', '[Dedicatoria — párrafo 2]', '[Dedicatoria — párrafo 3]'],
  }),

  // 9–10 · Falso final
  textSlide({
    id: '09-rappis',
    act: 'falso',
    lines: ['Y ya, mi princesa,', 'puede que lleguen <span class="accent">Rappis</span> 👀'],
  }),
  textSlide({
    id: '10-te-quiero',
    act: 'falso',
    lines: ['<span class="accent">Te quierooooooo…</span>'],
  }),

  // 11 · Falso final — el cielo se apaga, la barra se ve completa
  textSlide({
    id: '11-acabamos',
    act: 'apagado',
    lines: ['Y con esto', '<span class="accent">acabamos</span>'],
  }),

  // 12–13 · Falso final — el cielo se reenciende, la barra crece
  textSlide({
    id: '12-o-no',
    act: 'falso',
    lines: ['<span class="accent">¿O no????</span>'],
  }),
  textSlide({
    id: '13-falta-algo',
    act: 'falso',
    lines: ['¿Será que', '<span class="accent">falta algo?</span>'],
  }),

  // 14–17 · Suspenso
  textSlide({
    id: '14-suspenso',
    act: 'suspenso',
    lines: [
      'Sé lo mucho que hace falta',
      'que estemos juntos y poder',
      'estar <span class="accent">pegaditos</span>',
    ],
  }),
  textSlide({
    id: '15-prepare',
    act: 'suspenso',
    lines: ['Y por eso', '<span class="accent">preparé…</span>'],
  }),
  textSlide({
    id: '16-loco',
    act: 'suspenso',
    lines: ['Sabes que estoy loco,', '<span class="accent">¿no?</span>'],
  }),
  textSlide({
    id: '17-bueno',
    act: 'suspenso',
    lines: ['<span class="accent">Bueno…</span>'],
  }),

  // 18–19 · Sorpresa
  slide18,
  slide19,

  // 20–22 · Cierre
  textSlide({
    id: '20-sorpresa',
    act: 'cierre',
    lines: ['Espero que te haya', 'gustado la <span class="accent">sorpresa</span>'],
    note: '(me impacienta no poder contarte antes, jajaja)',
  }),
  textSlide({
    id: '21-locuras',
    act: 'cierre',
    lines: ['Toca hacer varias locuras', 'para que esto se pueda <span class="accent">dar</span>'],
  }),
  textSlide({
    id: '22-cierre',
    act: 'cierre',
    lines: ['Ahora sí, felices 22,', '<span class="accent">mi niña, te quiero</span>'],
  }),
]
