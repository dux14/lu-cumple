// Orquesta el DOM y GSAP sobre el estado puro de src/core/nav.js.
import { gsap } from 'gsap'
import { next as navNext, prev as navPrev } from './core/nav.js'
import { progressModel } from './core/progress.js'
import { createProgressBar } from './ui/progress-bar.js'
import { createControls } from './ui/controls.js'

const OUT_DURATION = 0.3
const IN_DURATION = 0.6

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function createDeck({ root, uiRoot, slides, sky }) {
  const steps = slides.map((s) => s.steps ?? 1)

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
    }
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
    sky.setAura(slides[state.index].act, { duration: 0 })
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
    sky.setAura(slides[newState.index].act)

    const tl = gsap.timeline({
      onComplete() {
        outSlide.leave?.(outEl, ctxFor(state.index, outTl))
        outTl?.kill()
        outEl.remove()
        currentEl = inEl
        currentTl = gsap.timeline()
        state = newState
        const slide = slides[state.index]
        slide.enter(inEl, ctxFor(state.index, currentTl))
        // Si se entra directo en un paso > 0 (retroceso entre slides con
        // steps), revela los pasos previos sin esperar más navegación.
        for (let i = 1; i <= state.step; i++) {
          slide.showStep?.(inEl, i, ctxFor(state.index, currentTl))
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
    const newState = navNext(state, steps)
    if (newState === state) return
    if (newState.index === state.index) applyStepChange(newState)
    else applySlideTransition(newState, 'forward')
  }

  function retreat() {
    if (busy || locked) return
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
