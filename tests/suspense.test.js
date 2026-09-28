import { describe, expect, it } from 'vitest'
import { actStep, isWarpTransition, suspenseLevel } from '../src/core/suspense.js'

// Actos de las 23 slides (0-22) en el orden real de src/slides/index.js,
// solo con lo que esta lógica necesita: la secuencia de `act`.
const ACTS = [
  'apertura', // 0 (slide00, sin acto real, pero no participa del cálculo)
  'apertura',
  'apertura',
  'nosotros',
  'nosotros',
  'risas',
  'risas',
  'fe',
  'fe',
  'falso',
  'falso',
  'apagado',
  'falso',
  'falso',
  'suspenso', // 14
  'suspenso', // 15
  'suspenso', // 16
  'suspenso', // 17
  'sorpresa', // 18
  'sorpresa', // 19
  'cierre',
  'cierre',
  'cierre',
]

describe('actStep', () => {
  it('es 1 en la primera slide de una corrida', () => {
    expect(actStep(ACTS, 14)).toBe(1)
  })

  it('cuenta hacia arriba dentro de la misma corrida', () => {
    expect(actStep(ACTS, 15)).toBe(2)
    expect(actStep(ACTS, 16)).toBe(3)
    expect(actStep(ACTS, 17)).toBe(4)
  })

  it('reinicia al cambiar de acto', () => {
    expect(actStep(ACTS, 18)).toBe(1)
  })

  it('reinicia también cuando el mismo acto reaparece después de otro', () => {
    // 9-10 'falso', 11 'apagado', 12-13 'falso' de nuevo: no se suma a la
    // corrida anterior.
    expect(actStep(ACTS, 12)).toBe(1)
    expect(actStep(ACTS, 13)).toBe(2)
  })
})

describe('suspenseLevel', () => {
  it('mapea 14..17 a los niveles 1..4', () => {
    expect(suspenseLevel(ACTS, 14)).toBe(1)
    expect(suspenseLevel(ACTS, 15)).toBe(2)
    expect(suspenseLevel(ACTS, 16)).toBe(3)
    expect(suspenseLevel(ACTS, 17)).toBe(4)
  })
})

describe('isWarpTransition', () => {
  it('es true solo al avanzar de suspenso a otro acto', () => {
    expect(isWarpTransition({ fromAct: 'suspenso', toAct: 'sorpresa', direction: 'forward' })).toBe(true)
  })

  it('es false al retroceder de sorpresa a suspenso', () => {
    expect(isWarpTransition({ fromAct: 'sorpresa', toAct: 'suspenso', direction: 'backward' })).toBe(false)
  })

  it('es false dentro del mismo acto', () => {
    expect(isWarpTransition({ fromAct: 'suspenso', toAct: 'suspenso', direction: 'forward' })).toBe(false)
  })

  it('es false al avanzar entre actos que no son suspenso', () => {
    expect(isWarpTransition({ fromAct: 'falso', toAct: 'apagado', direction: 'forward' })).toBe(false)
  })
})
