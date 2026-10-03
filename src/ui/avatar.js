// El muchacho: apariciones puntuales por slide (ver src/data/avatar-cues.js).
// Un solo nodo en uiRoot, fuera de las slides, con pointer-events:none. Se
// oculta limpio en cada cambio de slide: cada `onSlide` cancela los timers
// y tweens anteriores (navegación rápida) antes de programar los nuevos.
import { gsap } from 'gsap'
import { POSES, POSE_SIZE, cueSteps, parseAction, poseUrl } from '../data/avatar-cues.js'

const HIDDEN_Y = POSE_SIZE.h + 40 // fuera del recorte, con margen para la safe area
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function createAvatar(uiRoot) {
  const root = document.createElement('div')
  root.className = 'avatar'
  root.setAttribute('aria-hidden', 'true')
  const rig = document.createElement('div')
  rig.className = 'avatar-rig'
  const bob = document.createElement('div')
  bob.className = 'avatar-bob'
  const imgs = {}
  for (const name of Object.keys(POSES)) {
    const img = new Image()
    img.alt = ''
    img.decoding = 'async'
    img.src = poseUrl(name)
    imgs[name] = img
    bob.appendChild(img)
  }
  rig.appendChild(bob)
  root.appendChild(rig)
  uiRoot.appendChild(root)

  let currentId = null
  let timers = []
  let eventTimers = [] // los de un evento reemplazan a los del evento anterior
  let pose = null
  let peeking = false

  // El recorte llega hasta el borde del viewport; los pies quedan a `pad`.
  const pad = () => root.clientHeight - POSE_SIZE.h
  const hiddenY = () => HIDDEN_Y + pad()

  gsap.set(rig, { y: HIDDEN_Y, opacity: 0 })

  function setPose(name) {
    if (pose) imgs[pose].classList.remove('on')
    pose = name
    imgs[name].classList.add('on')
  }

  function stopMotion() {
    gsap.killTweensOf(rig)
    bob.classList.remove('bounce', 'walk')
  }

  // Aparece con opacity (reduced-motion: sin desplazamiento) o subiendo.
  function rise(y, { ease = 'back.out(1.4)', duration = 0.45, from } = {}) {
    stopMotion()
    root.style.visibility = 'visible'
    if (reduced()) {
      gsap.set(rig, { x: 0, y, opacity: 0 })
      gsap.to(rig, { opacity: 1, duration: 0.25 })
      return
    }
    gsap.set(rig, { x: 0, opacity: 1 })
    if (from !== undefined) gsap.set(rig, { y: from })
    gsap.to(rig, { y, duration, ease })
  }

  function hide({ fast = false } = {}) {
    peeking = false
    if (root.style.visibility !== 'visible') return
    stopMotion()
    const done = () => {
      root.style.visibility = 'hidden'
      bob.classList.remove('bounce', 'walk')
    }
    if (reduced()) {
      gsap.to(rig, { opacity: 0, duration: fast ? 0.1 : 0.25, onComplete: done })
      return
    }
    gsap.to(rig, { y: hiddenY(), duration: fast ? 0.18 : 0.4, ease: 'power2.in', onComplete: done })
  }

  const actions = {
    peek() {
      setPose('asoma')
      peeking = true
      // La base de 8-asoma queda justo en el borde del viewport.
      rise(pad(), { ease: 'power2.out', duration: 0.5, from: hiddenY() })
    },
    pose(name) {
      const wasPeeking = peeking
      setPose(name)
      peeking = false
      if (wasPeeking) rise(0, { duration: 0.5 })
      else if (reduced()) gsap.set(rig, { opacity: 1 })
    },
    enter(name) {
      setPose(name)
      peeking = false
      rise(0, { from: hiddenY(), duration: 0.5 })
    },
    walk(name) {
      setPose(name)
      peeking = false
      stopMotion()
      root.style.visibility = 'visible'
      if (reduced()) {
        gsap.set(rig, { x: 0, y: 0, opacity: 0 })
        gsap.to(rig, { opacity: 1, duration: 0.25 })
        timers.push(setTimeout(() => hide(), 2600))
        return
      }
      const offLeft = -(rig.offsetLeft + POSE_SIZE.w + 8)
      const travel = window.innerWidth - rig.offsetLeft + 8
      bob.classList.add('walk')
      gsap.set(rig, { x: offLeft, y: 0, opacity: 1 })
      gsap.to(rig, {
        x: travel,
        duration: 6.5,
        ease: 'none',
        onComplete: () => hide({ fast: true }),
      })
    },
    bounce() {
      if (!reduced()) bob.classList.add('bounce')
    },
    leave() {
      hide()
    },
  }

  function run(action) {
    const { verb, arg } = parseAction(action)
    actions[verb]?.(arg)
  }

  function schedule(steps, bucket) {
    for (const [ms, action] of steps) bucket.push(setTimeout(() => run(action), ms))
  }

  function clearTimers() {
    timers.concat(eventTimers).forEach(clearTimeout)
    timers = []
    eventTimers = []
  }

  return {
    // Cambio de slide: oculta lo anterior y programa el cue de entrada.
    onSlide(id) {
      currentId = id
      clearTimers()
      hide({ fast: true })
      schedule(cueSteps(id), timers)
    },
    // Evento de la slide vigente (ignorado si ya se cambió de slide).
    trigger(id, event) {
      if (id !== currentId) return
      const steps = cueSteps(id, event)
      if (!steps.length) return
      eventTimers.forEach(clearTimeout)
      eventTimers = []
      schedule(steps, eventTimers)
    },
    // Oculta ahora (p. ej. soltar el chiste antes de tiempo).
    dismiss() {
      clearTimers()
      hide()
    },
  }
}
