// Las 22 slides + slide 0. Simples se declaran como datos con `textSlide`;
// especiales (0, 3, 5, 6, 7, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22) viven en su propio
// archivo. Textos y actos según
// docs/superpowers/specs/2026-09-27-lu-cumple-base-design.md — tabla
// "Estructura". Placeholders entre corchetes: quedan para entregas
// posteriores (carta, dedicatoria). El orden 5/6 se invirtió a propósito
// (ver docs/plans/propuestas-por-slide.md, slide 6): el chiste hot pasa a
// ser la 5 y el programador la 6, justo antes de la oración.
import { slide00 } from './00-rotate.js'
import { slide03 } from './03-collage.js'
import { slide05 } from './05-chiste.js'
import { slide06 } from './06-programador.js'
import { slide07 } from './07-oracion.js'
import { slide09 } from './09-rappis.js'
import { slide10 } from './10-te-quiero.js'
import { slide11 } from './11-acabamos.js'
import { slide12 } from './12-o-no.js'
import { slide13 } from './13-falta-algo.js'
import { slide18 } from './18-flight.js'
import { slide19 } from './19-boarding.js'
import { slide20 } from './20-sorpresa.js'
import { slide21 } from './21-locuras.js'
import { slide22 } from './22-cierre.js'
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
    paragraphs: ['[Carta — párrafo 1]', '[Carta — párrafo 2]', '[Carta — párrafo 3]'],
  }),

  // 5–6 · Risas (orden invertido: chiste hot → programador, para que el
  // programador quede justo antes de la oración; ver revisión de la 6)
  slide05,
  slide06,

  // 7–8 · Fe
  slide07,
  textSlide({
    id: '08-dedicatoria',
    act: 'fe',
    paragraphs: ['[Dedicatoria — párrafo 1]', '[Dedicatoria — párrafo 2]', '[Dedicatoria — párrafo 3]'],
  }),

  // 9–10 · Falso final
  slide09,
  slide10,

  // 11 · Falso final — el cielo se apaga, la barra se ve completa
  slide11,

  // 12–13 · Falso final — el cielo se reenciende, la barra crece
  slide12,
  slide13,

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
  slide20,
  slide21,
  slide22,
]
