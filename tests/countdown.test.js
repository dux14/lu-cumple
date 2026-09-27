import { describe, expect, it } from 'vitest'
import { countdownText } from '../src/core/countdown.js'

// Ida: 2026-10-30T12:50:00Z (07:50 Bogotá), llega 2026-10-30T22:25:00Z (23:25 Madrid).
// Regreso: 2026-11-10T07:10:00Z (08:10 Madrid). Los días se cuentan en calendario de Bogotá (UTC−5).
describe('countdownText', () => {
  it('cuenta días calendario de Bogotá', () => {
    expect(countdownText(new Date('2026-10-20T12:00:00Z'))).toBe('Faltan 10 días para verte')
  })

  it('no suma un día de más por la hora', () => {
    // 28 oct 06:00 Bogotá: faltan 2 días calendario, aunque sean 2 días y 1 h 50 min.
    expect(countdownText(new Date('2026-10-28T11:00:00Z'))).toBe('Faltan 2 días para verte')
  })

  it('la noche anterior en Bogotá sigue siendo "falta 1 día" aunque en UTC ya sea el 30', () => {
    // 29 oct 20:00 Bogotá = 30 oct 01:00Z
    expect(countdownText(new Date('2026-10-30T01:00:00Z'))).toBe('Falta 1 día para verte')
  })

  it('mismo día en Bogotá, antes de la salida', () => {
    expect(countdownText(new Date('2026-10-30T05:00:00Z'))).toBe('Hoy vuelas hacia mí')
  })

  it('en el aire, entre la salida y la llegada', () => {
    expect(countdownText(new Date('2026-10-30T12:50:00Z'))).toBe('Vas volando hacia mí')
    expect(countdownText(new Date('2026-10-30T20:00:00Z'))).toBe('Vas volando hacia mí')
  })

  it('desde la llegada hasta el regreso', () => {
    expect(countdownText(new Date('2026-10-30T22:25:00Z'))).toBe('Estamos juntos')
    expect(countdownText(new Date('2026-11-05T00:00:00Z'))).toBe('Estamos juntos')
  })

  it('justo en el regreso ya cuenta como vivido', () => {
    expect(countdownText(new Date('2026-11-10T07:10:00Z'))).toBe('Ya vivimos 12 días juntos')
  })

  it('después del regreso', () => {
    expect(countdownText(new Date('2026-12-01T00:00:00Z'))).toBe('Ya vivimos 12 días juntos')
  })
})
