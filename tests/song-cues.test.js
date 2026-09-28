import { describe, expect, it } from 'vitest'
import { shouldJump } from '../src/data/song-cues.js'

describe('shouldJump', () => {
  it('salta si la posición está antes de la ventana y se avanza', () => {
    expect(shouldJump({ position: 10, window: [50, 60], direction: 'next' })).toBe(true)
  })

  it('salta si la posición está después de la ventana y se avanza', () => {
    expect(shouldJump({ position: 65, window: [50, 60], direction: 'next' })).toBe(true)
  })

  it('no salta si la posición ya está dentro de la ventana', () => {
    expect(shouldJump({ position: 55, window: [50, 60], direction: 'next' })).toBe(false)
  })

  it('no salta en los bordes exactos de la ventana', () => {
    expect(shouldJump({ position: 50, window: [50, 60], direction: 'next' })).toBe(false)
    expect(shouldJump({ position: 60, window: [50, 60], direction: 'next' })).toBe(false)
  })

  it('nunca salta al retroceder, aunque esté fuera de la ventana', () => {
    expect(shouldJump({ position: 10, window: [50, 60], direction: 'prev' })).toBe(false)
  })
})
