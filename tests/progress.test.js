import { describe, expect, it } from 'vitest'
import { progressModel } from '../src/core/progress.js'

describe('progressModel', () => {
  it('slide 0 no muestra progreso', () => {
    expect(progressModel(0)).toEqual({ visible: false, segments: 0, filled: 0 })
  })

  it('slide 1 arranca el primer tramo (11 segmentos)', () => {
    expect(progressModel(1)).toEqual({ visible: true, segments: 11, filled: 1 })
  })

  it('slide 11 completa el primer tramo (falso final)', () => {
    expect(progressModel(11)).toEqual({ visible: true, segments: 11, filled: 11 })
  })

  it('slide 12 pasa al segundo tramo (22 segmentos)', () => {
    expect(progressModel(12)).toEqual({ visible: true, segments: 22, filled: 12 })
  })

  it('slide 22 completa el segundo tramo', () => {
    expect(progressModel(22)).toEqual({ visible: true, segments: 22, filled: 22 })
  })
})
