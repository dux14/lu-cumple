import { describe, expect, it } from 'vitest'
import { clamp01, mixVolume } from '../src/core/audio-mix.js'

describe('clamp01', () => {
  it('deja pasar valores dentro de rango', () => {
    expect(clamp01(0.35)).toBe(0.35)
  })

  it('recorta por debajo de 0', () => {
    expect(clamp01(-0.4)).toBe(0)
  })

  it('recorta por encima de 1', () => {
    expect(clamp01(1.5)).toBe(1)
  })
})

describe('mixVolume', () => {
  it('multiplica base por el nivel de duck', () => {
    expect(mixVolume({ base: 0.6, duck: 0.5, muted: false })).toBe(0.3)
  })

  it('el mute siempre gana, sin importar el duck', () => {
    expect(mixVolume({ base: 0.6, duck: 1, muted: true })).toBe(0)
  })

  it('recorta un duck fuera de rango antes de multiplicar', () => {
    expect(mixVolume({ base: 0.6, duck: 2, muted: false })).toBe(0.6)
  })

  it('recorta una base fuera de rango en el resultado', () => {
    expect(mixVolume({ base: 1.4, duck: 1, muted: false })).toBe(1)
  })
})
