import { describe, expect, it } from 'vitest'
import { avatarCues, cueSteps, parseAction, POSES, VERBS } from '../src/data/avatar-cues.js'

const allCues = Object.entries(avatarCues).flatMap(([id, cue]) => [
  [id, 'enter', cue.enter ?? []],
  ...Object.entries(cue.on ?? {}).map(([ev, steps]) => [id, ev, steps]),
])

describe('avatarCues', () => {
  it('cada paso usa un verbo conocido y una pose existente', () => {
    for (const [, , steps] of allCues) {
      for (const [, action] of steps) {
        const { verb, arg } = parseAction(action)
        expect(VERBS).toContain(verb)
        if (['pose', 'enter', 'walk'].includes(verb)) expect(POSES).toHaveProperty(arg)
      }
    }
  })

  it('los tiempos de cada cue van en orden creciente', () => {
    for (const [, , steps] of allCues) {
      const times = steps.map(([ms]) => ms)
      expect([...times].sort((a, b) => a - b)).toEqual(times)
    }
  })

  it('no hay cue en las slides donde debe estar oculto', () => {
    for (const id of ['03-collage', '04-carta', '07-oracion', '08-dedicatoria', '17-bueno', '18-flight', '21-locuras']) {
      expect(cueSteps(id)).toEqual([])
      expect(cueSteps(id, 'madrid')).toEqual([])
    }
  })
})

describe('parseAction', () => {
  it('separa verbo y argumento', () => {
    expect(parseAction('pose:saluda')).toEqual({ verb: 'pose', arg: 'saluda' })
    expect(parseAction('leave')).toEqual({ verb: 'leave', arg: null })
  })
})

describe('cueSteps', () => {
  it('devuelve los pasos de entrada o del evento pedido', () => {
    expect(cueSteps('02-apertura')[0][1]).toBe('peek')
    expect(cueSteps('19-boarding')).toEqual([])
    expect(cueSteps('19-boarding', 'madrid')[0][1]).toBe('walk:maleta')
  })
})
