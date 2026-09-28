// Slide 12: "¿O no????" — la vuelta del falso final. El cielo se reenciende
// solo (cambio de acto 'apagado' → 'falso' en applyScene, src/deck.js) y la
// música vuelve por el cue 'resume' de song-cues.js (enganchado en
// deck.js). Acá solo entran los signos de interrogación uno a uno con
// rebote, y un scratch de vinilo sintetizado (sin archivo) que abre la
// vuelta del sonido.
import { gsap } from 'gsap'

const SCRATCH = true // apaga fácil si el efecto sintetizado molesta
const SCRATCH_DURATION = 0.35
const Q_COUNT = 4
const Q_STAGGER = 0.22

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Scratch de vinilo corto: ruido blanco con un barrido de filtro
// pasabanda (agudo → grave → agudo), sin archivo de audio. Respeta el mute
// vía `ctx.audio.isMuted()` y se cierra solo al terminar.
function playScratch(ctx) {
  if (!SCRATCH || reduced()) return
  if (ctx?.audio?.isMuted?.()) return
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return
  try {
    const actx = new Ctx()
    const bufferSize = Math.floor(actx.sampleRate * SCRATCH_DURATION)
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const noise = actx.createBufferSource()
    noise.buffer = buffer

    const filter = actx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 6
    filter.frequency.setValueAtTime(3200, actx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(400, actx.currentTime + 0.18)
    filter.frequency.exponentialRampToValueAtTime(2000, actx.currentTime + SCRATCH_DURATION)

    const gain = actx.createGain()
    gain.gain.setValueAtTime(0, actx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, actx.currentTime + 0.03)
    gain.gain.linearRampToValueAtTime(0, actx.currentTime + SCRATCH_DURATION)

    noise.connect(filter).connect(gain).connect(actx.destination)
    noise.start()
    noise.stop(actx.currentTime + SCRATCH_DURATION + 0.02)
    noise.onended = () => actx.close().catch(() => {})
  } catch {
    // Web Audio no disponible o falla al crearse: sin scratch, no es crítico.
  }
}

export const slide12 = {
  id: '12-o-no',
  act: 'falso',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-o-no'

    const h1 = document.createElement('h1')
    h1.className = 'display display-lg o-no-title'
    const marks = Array.from({ length: Q_COUNT }, () => '<span class="o-no-q">?</span>').join('')
    h1.innerHTML = `<span class="accent"><span class="o-no-w">¿O no</span>${marks}</span>`
    el.appendChild(h1)

    el._oNo = { h1 }
    return el
  },
  prepareEnter(el) {
    const { h1 } = el._oNo
    gsap.set(el, { opacity: 0 })
    gsap.set(h1.querySelector('.o-no-w'), { opacity: 0, scale: 0.7 })
    gsap.set(h1.querySelectorAll('.o-no-q'), { opacity: 0, y: -30, scale: 0.3, rotation: 0 })
  },
  enter(el, ctx) {
    const { h1 } = el._oNo
    const w = h1.querySelector('.o-no-w')
    const qs = h1.querySelectorAll('.o-no-q')
    const tl = ctx.tl

    tl.to(el, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0)
    tl.call(() => playScratch(ctx), null, 0)
    tl.to(w, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 0.15)

    if (reduced()) {
      tl.to(qs, { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 0.3)
      return
    }
    qs.forEach((q, i) => {
      tl.to(
        q,
        { opacity: 1, y: 0, scale: 1, rotation: gsap.utils.random(-6, 6), duration: 0.9, ease: 'elastic.out(1, 0.4)' },
        0.35 + i * Q_STAGGER,
      )
    })
  },
}
