import { describe, expect, it } from 'vitest'
import { next, prev } from '../src/core/nav.js'

// 23 entradas (slide 0..22); la slide 4 tiene 3 pasos, el resto 1.
const steps = [1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

describe('nav', () => {
  it('avanza paso dentro de una slide con varios steps', () => {
    expect(next({ index: 4, step: 0 }, steps)).toEqual({ index: 4, step: 1 })
  })

  it('avanza a la siguiente slide al agotar los steps', () => {
    expect(next({ index: 4, step: 2 }, steps)).toEqual({ index: 5, step: 0 })
  })

  it('retrocede de una slide nueva al último step de la anterior', () => {
    expect(prev({ index: 5, step: 0 }, steps)).toEqual({ index: 4, step: 2 })
  })

  it('retrocede paso dentro de la misma slide', () => {
    expect(prev({ index: 4, step: 1 }, steps)).toEqual({ index: 4, step: 0 })
  })

  it('next en la última slide no avanza', () => {
    expect(next({ index: 22, step: 0 }, steps)).toEqual({ index: 22, step: 0 })
  })

  it('prev en la slide 1 no vuelve a la slide 0', () => {
    expect(prev({ index: 1, step: 0 }, steps)).toEqual({ index: 1, step: 0 })
  })

  it('next desde la slide 0 no avanza (sale por orientación)', () => {
    expect(next({ index: 0, step: 0 }, steps)).toEqual({ index: 0, step: 0 })
  })
})
