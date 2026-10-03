import { describe, expect, it } from 'vitest'
import { MIN_RAMP_SECONDS, buildPlan, tapeStopPlan, valueAt } from '../src/core/audio-ramp.js'

describe('buildPlan / valueAt', () => {
  it('interpola linealmente dentro de un tramo', () => {
    const plan = buildPlan(0.6, 10, [{ to: 0, seconds: 1 }])
    expect(valueAt(plan, 10.5)).toBeCloseTo(0.3)
  })

  it('antes del inicio vale el valor de partida y después del final el último', () => {
    const plan = buildPlan(0.6, 10, [{ to: 0.2, seconds: 1 }])
    expect(valueAt(plan, 5)).toBe(0.6)
    expect(valueAt(plan, 99)).toBe(0.2)
  })

  it('encadena tramos en orden', () => {
    const plan = buildPlan(1, 0, [
      { to: 1, seconds: 1 },
      { to: 0, seconds: 1 },
    ])
    expect(valueAt(plan, 1)).toBe(1)
    expect(valueAt(plan, 1.5)).toBeCloseTo(0.5)
  })

  it('un tramo de 0 s se eleva al mínimo para no ser un escalón', () => {
    const plan = buildPlan(1, 0, [{ to: 0, seconds: 0 }])
    expect(plan.points[1].t).toBe(MIN_RAMP_SECONDS)
  })

  it('una rampa nueva arranca desde el valor en curso de la anterior (sin salto)', () => {
    const first = buildPlan(0.6, 0, [{ to: 0, seconds: 1 }])
    const mid = valueAt(first, 0.25)
    const second = buildPlan(mid, 0.25, [{ to: 0.6, seconds: 0.5 }])
    expect(valueAt(second, 0.25)).toBeCloseTo(mid)
  })
})

describe('tapeStopPlan', () => {
  const plan = tapeStopPlan({ seconds: 1.2 })

  it('la velocidad baja de forma monótona y termina en el mínimo', () => {
    const rates = plan.steps.map((s) => s.rate)
    for (let i = 1; i < rates.length; i++) expect(rates[i]).toBeLessThanOrEqual(rates[i - 1])
    expect(rates[rates.length - 1]).toBe(0.08)
  })

  it('usa pocos pasos (no uno por frame) y ninguno pasa de la duración total', () => {
    expect(plan.steps.length).toBeLessThanOrEqual(20)
    expect(plan.steps[plan.steps.length - 1].t).toBeLessThanOrEqual(1.2)
  })

  it('el volumen se mantiene mientras baja el tono y se apaga al final', () => {
    expect(plan.gain[0].to).toBe(1)
    expect(plan.gain[1].to).toBe(0)
    expect(plan.gain[0].seconds + plan.gain[1].seconds).toBeCloseTo(1.2)
  })
})
