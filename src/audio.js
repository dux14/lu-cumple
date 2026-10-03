// Música: desbloqueo en el primer gesto (no cuenta el giro en iOS), botón
// de mute con estado recordado, pausa cuando la pestaña queda oculta.
//
// El volumen se enruta por Web Audio (AudioContext + MediaElementSourceNode
// + GainNode) porque en Safari de iOS `HTMLMediaElement.volume` es de solo
// lectura: sin esto el fade-in y el duck no hacen nada ahí. El AudioContext
// se crea/reanuda dentro del mismo gesto que desbloquea la música. Si Web
// Audio no está disponible o falla al crearse, se cae al comportamiento
// anterior (tween de `audio.volume` con GSAP, sin efecto en iOS pero
// inofensivo).
import { gsap } from 'gsap'
import { mixVolume } from './core/audio-mix.js'
import { buildPlan, tapeStopPlan, valueAt, MIN_RAMP_SECONDS } from './core/audio-ramp.js'
import { songCues, shouldJump, VERSE_2_START } from './data/song-cues.js'

const NOTE_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17V5l10-2v12M9 17a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 15a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/></svg>'

const STORAGE_KEY = 'lu-cumple-muted'
const UNLOCK_DURATION = 2.5
const TARGET_VOLUME = 0.6
const DUCK_DEFAULT_SECONDS = 0.4
const TAPE_STOP_DEFAULT_SECONDS = 1.2
const RESUME_DEFAULT_SECONDS = 0.6
const JUMP_CROSSFADE_HALF_SECONDS = 0.6 // fade-out + fade-in ≈ 1,2 s de crossfade
const SEEK_TIMEOUT_MS = 700 // tope de espera al evento 'seeked' (iOS puede tardar)
const QUICK_FADE_SECONDS = 0.15
const LOOP_RESTART_FADE_SECONDS = 2

function readStoredMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function storeMuted(muted) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
  } catch {
    // sin storage disponible: se ignora, no es crítico
  }
}

export function initAudio({ uiRoot }) {
  const audio = document.createElement('audio')
  // Sin loop nativo: el reinicio en loop se maneja a mano en `onEnded` para
  // que arranque desde el verso 2 (no desde el principio) y con fundido,
  // salvo que la canción termine en el cierre (ver más abajo).
  audio.loop = false
  audio.preload = 'auto'
  audio.src = `${import.meta.env.BASE_URL}audio/song.m4a`
  audio.volume = 0
  // Tono variable al cambiar la velocidad: con la corrección de tono activa
  // (el valor por defecto) WebKit silencia el audio por debajo de ~0,5x, y el
  // tape stop se oía como un corte en vez de frenar. Sin corrección baja el
  // tono como una cinta real y no se silencia.
  audio.preservesPitch = false
  audio.webkitPreservesPitch = false
  document.body.appendChild(audio)

  let muted = readStoredMuted()
  audio.muted = muted
  let unlocked = false
  let tapeStopped = false
  let cueDucked = false
  let duckLevel = 1 // 1 = sin duck
  // Silencio total (lector de la oración, slide 7): la canción queda en
  // pausa y ningún play() la reanuda hasta release().
  let held = false
  let holdTimer = null
  let currentSlideId = null
  // Generación de la última transición (salto, tape stop, resume): toda
  // continuación asíncrona (timers, 'seeked') compara contra ella y se
  // descarta si otra transición la pisó (navegación rápida).
  let gen = 0
  let timers = []
  let pendingAt = null // destino de un salto en curso (null si no hay)
  let gainPlan = null // modelo JS de la rampa vigente (ver core/audio-ramp.js)

  // Estado de Web Audio: si `gainNode` queda en null (no soportado o falla
  // la creación), todo cae al fallback de `audio.volume` con GSAP.
  let audioCtx = null
  let gainNode = null

  function currentVolume() {
    return mixVolume({ base: TARGET_VOLUME, duck: duckLevel, muted })
  }

  // Crea el grafo de Web Audio. Debe llamarse dentro del gesto del usuario
  // que desbloquea el audio, si no iOS ignora el resume(). Si el grafo ya
  // existe pero el contexto no está 'running' (p. ej. 'interrupted' tras
  // una llamada o el switch de silencio), reintenta el resume en este
  // mismo gesto en lugar de asumir que ya quedó desbloqueado.
  function ensureWebAudio() {
    if (gainNode) {
      if (audioCtx && audioCtx.state !== 'running') audioCtx.resume().catch(() => {})
      return true
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return false
      audioCtx = new Ctx()
      const source = audioCtx.createMediaElementSource(audio)
      gainNode = audioCtx.createGain()
      gainNode.gain.value = 0
      source.connect(gainNode).connect(audioCtx.destination)
      // Con Web Audio de por medio, el interruptor de silencio físico del
      // iPhone corta el audio salvo que se declare como reproducción.
      if (navigator.audioSession) {
        try {
          navigator.audioSession.type = 'playback'
        } catch {
          // API presente pero rechaza el valor: se ignora, no es crítico
        }
      }
      // El nodo de ganancia pasa a controlar el volumen real: el elemento
      // se deja siempre al máximo.
      audio.volume = 1
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
      return true
    } catch {
      audioCtx = null
      gainNode = null
      return false
    }
  }

  // Volumen actual estimado. `AudioParam.value` no es fiable durante una
  // automatización en iOS, así que se usa el modelo propio de la rampa.
  function currentGain() {
    if (gainNode) {
      return gainPlan ? valueAt(gainPlan, audioCtx.currentTime) : gainNode.gain.value
    }
    return audio.volume
  }

  // Encadena rampas lineales [{ to, seconds }] desde el valor ACTUAL (sin
  // saltos). Se lee el valor antes de cancelar lo programado y se ancla con
  // setValueAtTime; así una rampa que pisa a otra continúa desde donde iba.
  // Con GainNode usa su automatización; si no, cae al tween de
  // `audio.volume` (comportamiento anterior).
  function rampGain(segments) {
    if (gainNode) {
      const now = audioCtx.currentTime
      const cur = currentGain()
      const param = gainNode.gain
      param.cancelScheduledValues(now)
      param.setValueAtTime(cur, now)
      gainPlan = buildPlan(cur, now, segments)
      for (const { t, v } of gainPlan.points.slice(1)) param.linearRampToValueAtTime(v, t)
      return
    }
    gsap.killTweensOf(audio, 'volume')
    const tl = gsap.timeline()
    for (const { to, seconds } of segments) {
      tl.to(audio, { volume: to, duration: Math.max(MIN_RAMP_SECONDS, seconds), ease: 'none' })
    }
  }

  function setGain(value, seconds) {
    rampGain([{ to: value, seconds }])
  }

  function applyVolume(seconds) {
    setGain(currentVolume(), seconds)
  }

  const btn = document.createElement('button')
  btn.className = 'mute'
  btn.dataset.noNav = ''
  btn.setAttribute('aria-label', 'Silenciar música')
  btn.innerHTML = NOTE_ICON
  btn.classList.toggle('is-muted', muted)
  uiRoot.appendChild(btn)

  // Eventos que WebKit de iOS reconoce como activación del usuario para
  // permitir audio. `touchstart`/`pointerdown` NO cuentan ahí: si el
  // desbloqueo corriera en esos, resume()/play() quedan silenciosamente
  // ignorados. Tampoco se puede asumir que el primer toque sea un tap: si
  // el usuario entra deslizando (scroll-start.js), ese gesto también
  // dispara estos eventos pero puede no bastar para desbloquear Web Audio
  // (el contexto puede no quedar 'running' todavía), así que no se usa
  // `once` y se reintenta en cada gesto válido hasta confirmar que el
  // contexto está 'running' y la canción realmente está sonando.
  const UNLOCK_EVENTS = ['touchend', 'pointerup', 'click', 'keydown']

  function unlock() {
    if (unlocked) return
    ensureWebAudio()
    if (!held) applyVolume(UNLOCK_DURATION)
    audio
      .play()
      .then(() => {
        // Con hold activo el gesto igual desbloquea (play dentro del gesto),
        // pero la canción no debe sonar: se pausa de inmediato.
        if (held) audio.pause()
        // Confirma el desbloqueo real antes de dejar de escuchar: un
        // `play()` resuelto con el contexto todavía 'suspended' (o
        // 'interrupted') no es un desbloqueo válido en iOS.
        if (!audioCtx || audioCtx.state === 'running') {
          unlocked = true
          removeUnlockListeners()
        }
      })
      .catch(() => {})
  }
  // En captura: así un stopPropagation local (lector de la 7, chiste de la
  // 5) no impide que el gesto desbloquee el audio.
  function removeUnlockListeners() {
    UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, unlock, { capture: true }))
  }
  UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, unlock, { capture: true }))

  function onError() {
    btn.style.display = 'none'
  }
  audio.addEventListener('error', onError)

  function onClick() {
    muted = !muted
    audio.muted = muted
    btn.classList.toggle('is-muted', muted)
    storeMuted(muted)
    applyVolume(0.15)
  }
  btn.addEventListener('click', onClick)

  // La canción terminó sola. En cualquier slide salvo el cierre, reinicia
  // en loop desde el verso 2 con fundido; en el cierre se deja el fade
  // final suave que ya trae el archivo exportado (sin volver a arrancar).
  function onEnded() {
    if (currentSlideId === '22-cierre' || held) return
    // Ya terminó: está en silencio, no hay nada que fundir hacia afuera.
    transitionTo({ at: VERSE_2_START, outSeconds: 0, inSeconds: LOOP_RESTART_FADE_SECONDS })
  }
  audio.addEventListener('ended', onEnded)

  function clearTimers() {
    timers.forEach((t) => clearTimeout(t))
    timers = []
  }

  // Mueve `currentTime` y avisa cuando el navegador terminó de buscar. Subir
  // el volumen antes de 'seeked' dejaría oír el buffer viejo o un hueco.
  function seekTo(at, done) {
    let finished = false
    let timer = null
    const end = () => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      audio.removeEventListener('seeked', end)
      done()
    }
    audio.addEventListener('seeked', end)
    timer = window.setTimeout(end, SEEK_TIMEOUT_MS)
    audio.currentTime = at
  }

  // Transición limpia: fade-out → (seek) → fade-in. Una segunda transición
  // pisa a la primera (`gen`): cancela sus timers y continúa el fade desde el
  // volumen en curso, sin saltos. Con una sola fuente de audio no hay
  // crossfade simultáneo posible; el fade-out/in corto es el equivalente.
  function transitionTo({ at, outSeconds, inSeconds }) {
    const myGen = ++gen
    clearTimers()
    cancelTape()
    if (typeof at === 'number') pendingAt = at

    const finish = () => {
      if (myGen !== gen) return
      const land = () => {
        if (myGen !== gen) return
        pendingAt = null
        audio.playbackRate = 1
        if (!unlocked || held || tapeStopped) return
        if (audio.paused) audio.play().catch(() => {})
        applyVolume(inSeconds)
      }
      if (typeof at === 'number') seekTo(at, land)
      else land()
    }

    const sounding = !audio.paused && currentGain() > 0.01
    if (sounding && outSeconds > 0) {
      setGain(0, outSeconds)
      timers.push(window.setTimeout(finish, outSeconds * 1000 + 20))
    } else {
      setGain(0, 0)
      finish()
    }
  }

  // Salto con crossfade (cues 'jump').
  function crossfadeToPosition(at) {
    transitionTo({
      at,
      outSeconds: JUMP_CROSSFADE_HALF_SECONDS,
      inSeconds: JUMP_CROSSFADE_HALF_SECONDS,
    })
  }

  // Cancela un tape stop en curso (pasos de velocidad pendientes).
  let tapeTimers = []
  function cancelTape() {
    tapeTimers.forEach((t) => clearTimeout(t))
    tapeTimers = []
  }

  function onVisibility() {
    if (document.hidden) {
      audio.pause()
    } else if (unlocked && !muted && !held && !tapeStopped) {
      // Vuelve con fundido: el pause() del ocultado dejó la ganancia donde
      // estaba y reanudar de golpe da un chasquido.
      setGain(0, 0)
      audio.play().catch(() => {})
      applyVolume(QUICK_FADE_SECONDS * 3)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  // API expuesta a las slides vía ctx.audio (ver ctxFor en src/deck.js).
  // El mute tiene prioridad siempre: currentVolume() ya lo resuelve.
  const api = {
    duck(level, seconds = DUCK_DEFAULT_SECONDS) {
      duckLevel = level
      applyVolume(seconds)
    },
    restore(seconds = DUCK_DEFAULT_SECONDS) {
      duckLevel = 1
      applyVolume(seconds)
    },
    // Efecto "cinta que se detiene": baja el tono (playbackRate sin
    // corrección de tono) mientras el volumen se mantiene y solo se apaga al
    // final, y pausa. La velocidad se asigna en pasos de ~70 ms (no por
    // frame) para no reconfigurar el pipeline de medios en cada tick del
    // hilo principal. playbackRate sí es escribible en iOS (a diferencia de
    // volume).
    tapeStop(seconds = TAPE_STOP_DEFAULT_SECONDS) {
      gen++
      clearTimers()
      cancelTape()
      pendingAt = null
      tapeStopped = true
      const plan = tapeStopPlan({ seconds, startGain: currentVolume() })
      rampGain(plan.gain)
      for (const { t, rate } of plan.steps) {
        // 0.08 queda por encima del mínimo que acepta Chromium (0.0625).
        tapeTimers.push(
          window.setTimeout(() => {
            audio.playbackRate = rate
          }, t * 1000),
        )
      }
      tapeTimers.push(
        window.setTimeout(() => {
          tapeTimers = []
          audio.pause()
        }, seconds * 1000 + 30),
      )
    },
    resume(seconds = RESUME_DEFAULT_SECONDS, atSeconds) {
      // Mata un tapeStop en curso: si no, su pausa final corta lo que arranca.
      tapeStopped = false
      transitionTo({ at: atSeconds, outSeconds: QUICK_FADE_SECONDS, inSeconds: seconds })
    },
    // Aplica el cue musical del slide `slideId` (ver src/data/song-cues.js).
    // Enganche desde deck.js: `audio.onSlide(newState.id, dir)` en
    // applySlideTransition (src/deck.js), traduciendo su `direction`
    // ('forward'/'backward') a 'next'/'prev' antes de pasarlo. El mute
    // siempre tiene prioridad (currentVolume ya lo resuelve en cada
    // setGain/applyVolume).
    // Silencio total con pausa real (no solo volumen en 0): lo usa el lector
    // de la oración. release() reanuda donde iba, con fundido, salvo que la
    // canción esté detenida por el tapeStop de la 11.
    hold(seconds = 0.5) {
      if (held) return
      held = true
      setGain(0, seconds)
      if (holdTimer) clearTimeout(holdTimer)
      holdTimer = window.setTimeout(() => {
        holdTimer = null
        if (held) audio.pause()
      }, seconds * 1000)
    },
    release(seconds = 0.8) {
      if (!held) return
      held = false
      if (holdTimer) clearTimeout(holdTimer)
      holdTimer = null
      if (!unlocked || tapeStopped) return
      // Solo se fuerza silencio si realmente había pausa: si aún sonaba
      // (hold/release rápidos), el fade-in continúa desde el volumen actual.
      if (audio.paused) {
        setGain(0, 0)
        audio.play().catch(() => {})
      }
      applyVolume(seconds)
    },
    isMuted() {
      return muted
    },
    onSlide(slideId, direction) {
      currentSlideId = slideId
      const cue = songCues[slideId]
      // Salir de la 11 hacia atrás deja la cinta detenida: se reanuda donde
      // quedó. Hacia adelante lo resuelve el cue `resume` de la 12.
      if (tapeStopped && slideId !== '11-acabamos' && cue?.action !== 'resume') {
        api.resume()
      }
      // Un duck puesto por cue (17) dura solo esa slide.
      if (cueDucked && cue?.action !== 'duck') {
        cueDucked = false
        api.restore()
      }
      if (!cue) return
      switch (cue.action) {
        case 'jump':
          if (shouldJump({ position: pendingAt ?? audio.currentTime, window: cue.window, direction })) {
            crossfadeToPosition(cue.at)
          }
          break
        case 'resume':
          // Al volver desde la 13 no se repite el salto al verso 2.
          if (direction === 'prev') {
            if (tapeStopped) api.resume()
          } else {
            api.resume(RESUME_DEFAULT_SECONDS, cue.at)
          }
          break
        case 'duck':
          cueDucked = true
          api.duck(cue.level)
          break
        case 'tapeStop':
          // La propia slide llama a audio.tapeStop() directamente; este
          // cue solo documenta la intención (ver 11-acabamos.js).
          break
        default:
          break
      }
    },
  }

  return {
    api,
    destroy() {
      removeUnlockListeners()
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
      btn.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimers()
      cancelTape()
      if (holdTimer) clearTimeout(holdTimer)
      btn.remove()
      audio.remove()
      audioCtx?.close().catch(() => {})
    },
  }
}
