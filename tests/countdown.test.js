import { describe, expect, it } from 'vitest'
import { countdownText } from '../src/core/countdown.js'

// Ida: 2026-10-30T12:50:00Z (07:50 Bogotá). Regreso: 2026-11-10T07:10:00Z (08:10 Madrid).
describe('countdownText', () => {
  it('más de un día antes: cuenta días calendario redondeando hacia arriba', () => {
    expect(countdownText(new Date('2026-10-20T12:00:00Z'))).toBe('Faltan 11 días para verte')
  })

  it('redondea hacia arriba aunque falten horas de más de un día', () => {
    expect(countdownText(new Date('2026-10-28T20:00:00Z'))).toBe('Faltan 2 días para verte')
  })

  it('exactamente 1 día antes usa singular', () => {
    expect(countdownText(new Date('2026-10-29T12:50:00Z'))).toBe('Falta 1 día para verte')
  })

  it('mismo día, antes de la salida', () => {
    expect(countdownText(new Date('2026-10-30T05:00:00Z'))).toBe('Hoy vuelas hacia mí')
  })

  it('justo en el instante de salida ya está en vuelo/junto', () => {
    expect(countdownText(new Date('2026-10-30T12:50:00Z'))).toBe('Estamos juntos')
  })

  it('entre salida y regreso', () => {
    expect(countdownText(new Date('2026-11-05T00:00:00Z'))).toBe('Estamos juntos')
  })

  it('justo en el regreso ya cuenta como vivido', () => {
    expect(countdownText(new Date('2026-11-10T07:10:00Z'))).toBe('Ya vivimos 12 días juntos')
  })

  it('después del regreso', () => {
    expect(countdownText(new Date('2026-12-01T00:00:00Z'))).toBe('Ya vivimos 12 días juntos')
  })
})
