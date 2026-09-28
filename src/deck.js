// Orquesta el DOM y GSAP sobre el estado puro de src/core/nav.js.
// Una slide puede definir `onNav(dir)` ('next' | 'prev') para capturar la
// navegación (p. ej. un modo lectura interno): si devuelve true, ni el
// estado del deck ni la animación se tocan.
import { gsap } from 'gsap'
import { next as navNext, prev as navPrev } from './core/nav.js'
import { progressModel } from './core/progress.js'
import { createProgressBar } from './ui/progress-bar.js'
import { createControls } from './ui/controls.js'
import { isWarpTransition, suspenseLevel } from './core/suspense.js'

const OUT_DURATION = 0.3
const IN_DURATION = 0.6

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function createDeck({ root, uiRoot, slides, sky, audio, nebula }) {
  const steps = slides.map((s) => s.steps ?? 1)
  const acts = slides.map((s) => s.act)

  const params = new URLSearchParams(window.location.search)
  const devStart = params.get('s')
  const initialIndex = devStart !== null ? clamp(Number(devStart), 0, slides.length - 1) : 0

  let state = { index: initialIndex, step: 0 }
  let busy = false
  let locked = false
  let currentEl = null
  let currentTl = null
  let orientationStarted = false

  const progressBar = createProgressBar(uiRoot)
  const controls = createControls({
    uiRoot,
    onNext: () => advance(),
    onPrev: () => retreat(),
  })

  function ctxFor(index, tl) {
    return {
      tl,
      lockNav: (value) => {
        locked = value
      },
      sky,
      nebula,
      progress: progressBar,
      audio,
    }
  }

  // Cielo + nebulosa según el acto de `index` (ver src/core/suspense.js):
  // 'suspenso' pasa por setSuspense/setSuspenseLevel con el nivel 1..4 de
  // la slide; el resto usa el aura/nebulosa plana del acto.
  function setSceneAt(index, opts) {
    const act = acts[index]
    if (act === 'suspenso') {
      const level = suspenseLevel(acts, index)
      sky.setSuspense(level, opts)
      nebula.setSuspenseLevel(level, opts)
    } else {
      sky.setAura(act, opts)
      nebula.setAct(act, opts)
    }
  }

  // Cambio de escena en una transición entre slides: warp si se sale de
  // 'suspenso' hacia adelante (17→18), si no la escena normal del acto que
  // entra, con una estrella fugaz cuando el acto cambia (puntuación entre
  // capítulos, no en cada slide).
  function applyScene(newState, direction) {
    const fromAct = acts[state.index]
    const toAct = acts[newState.index]
    if (isWarpTransition({ fromAct, toAct, direction })) {
      sky.warpTo(toAct)
      nebula.warpTo(toAct)
      return
    }
    setSceneAt(newState.index)
    if (toAct !== fromAct) gsap.delayedCall(0.25, () => sky.shootingStar())
  }

  function renderSlide(index) {
    const el = slides[index].render()
    el.classList.add('slide')
    return el
  }

  function updateUi() {
    progressBar.render(progressModel(state.index))
    controls.setVisible(state.index > 0, state.index < slides.length - 1)
  }

  function mount() {
    currentEl = renderSlide(state.index)
    root.appendChild(currentEl)
    slides[state.index].prepareEnter?.(currentEl)
    setSceneAt(state.index, { duration: 0 })
    // Sin dirección real (no es una navegación 'next'/'prev'): evita que un
    // cue de tipo 'jump' salte "raro" al entrar directo por `?s=N`.
    audio.onSlide?.(slides[state.index].id, null)
    currentTl = gsap.timeline()
    slides[state.index].enter(currentEl, ctxFor(state.index, currentTl))
    updateUi()
  }

  function applyStepChange(newState) {
    state = newState
    slides[state.index].showStep?.(currentEl, state.step, ctxFor(state.index, currentTl))
    updateUi()
  }

  function applySlideTransition(newState, direction) {
    busy = true
    const sign = direction === 'forward' ? 1 : -1
    const outEl = currentEl
    const outSlide = slides[state.index]
    const outTl = currentTl

    const inEl = renderSlide(newState.index)
    root.appendChild(inEl)
    // El estado oculto inicial de enter() se aplica ya, mientras inEl todavía
    // está en opacity:0 (fromTo de abajo): así no hay flash de texto visible
    // antes de que la animación de enter() lo revele.
    slides[newState.index].prepareEnter?.(inEl)
    applyScene(newState, direction)
    audio.onSlide?.(slides[newState.index].id, direction === 'forward' ? 'next' : 'prev')

    const tl = gsap.timeline({
      onComplete() {
        outSlide.leave?.(outEl, ctxFor(state.index, outTl))
        outTl?.kill()
        outEl.remove()
        currentEl = inEl
        currentTl = gsap.timeline()
        state = newState
        const slide = slides[state.index]
        if (state.step > 0 && slide.enterAtStep) {
          // Slides por escenas: saltan directo al paso sin repetir los anteriores.
          slide.enterAtStep(inEl, state.step, ctxFor(state.index, currentTl))
        } else {
          slide.enter(inEl, ctxFor(state.index, currentTl))
          // Si se entra directo en un paso > 0 (retroceso entre slides con
          // steps), revela los pasos previos sin esperar más navegación.
          for (let i = 1; i <= state.step; i++) {
            slide.showStep?.(inEl, i, ctxFor(state.index, currentTl))
          }
        }
        busy = false
        updateUi()
      },
    })
    tl.to(outEl, { opacity: 0, y: -12 * sign, duration: OUT_DURATION, ease: 'power2.in' }, 0)
    tl.fromTo(
      inEl,
      { opacity: 0, y: 12 * sign, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: IN_DURATION, ease: 'power3.out' },
      0,
    )
  }

  function advance() {
    if (busy || locked) return
    if (slides[state.index].onNav?.('next')) return
    const newState = navNext(state, steps)
    if (newState === state) return
    if (newState.index === state.index) applyStepChange(newState)
    else applySlideTransition(newState, 'forward')
  }

  function retreat() {
    if (busy || locked) return
    if (slides[state.index].onNav?.('prev')) return
    const newState = navPrev(state, steps)
    if (newState === state) return
    if (newState.index === state.index) applyStepChange(newState)
    else applySlideTransition(newState, 'backward')
  }

  function start() {
    if (orientationStarted) return
    orientationStarted = true
    if (state.index !== 0) return // ?s=N: ya arrancó en otra slide
    applySlideTransition({ index: 1, step: 0 }, 'forward')
  }

  mount()

  return { start, advance, retreat, getIndex: () => state.index }
}
