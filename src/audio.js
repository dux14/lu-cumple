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
  let crossfadeTimer = null

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

  // Rampa el volumen a `value` en `seconds`. Usa el GainNode si está listo;
  // si no, cae al tween de `audio.volume` (comportamiento anterior).
  function setGain(value, seconds) {
    if (gainNode) {
      const now = audioCtx.currentTime
      gainNode.gain.cancelScheduledValues(now)
      gainNode.gain.setValueAtTime(gainNode.gain.value, now)
      gainNode.gain.linearRampToValueAtTime(value, Math.max(now, now + seconds))
      return
    }
    gsap.to(audio, { volume: value, duration: seconds, overwrite: true })
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
    audio.currentTime = VERSE_2_START
    setGain(0, 0)
    audio.play().catch(() => {})
    applyVolume(LOOP_RESTART_FADE_SECONDS)
  }
  audio.addEventListener('ended', onEnded)

  // Salto con crossfade: baja el volumen, mueve `currentTime` y vuelve a
  // subir el volumen ya en la nueva posición. Cancela un crossfade anterior
  // si todavía estaba en curso (navegación rápida entre slides).
  function crossfadeToPosition(at) {
    if (crossfadeTimer) clearTimeout(crossfadeTimer)
    setGain(0, JUMP_CROSSFADE_HALF_SECONDS)
    crossfadeTimer = window.setTimeout(() => {
      crossfadeTimer = null
      audio.currentTime = at
      applyVolume(JUMP_CROSSFADE_HALF_SECONDS)
    }, JUMP_CROSSFADE_HALF_SECONDS * 1000)
  }

  function onVisibility() {
    if (document.hidden) {
      audio.pause()
    } else if (unlocked && !muted && !held && !tapeStopped) {
      audio.play().catch(() => {})
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
    // Baja el playbackRate y el volumen hasta pausar, efecto "cinta que se
    // detiene". playbackRate sí es escribible en iOS (a diferencia de
    // volume), así que funciona incluso en el fallback sin Web Audio.
    tapeStop(seconds = TAPE_STOP_DEFAULT_SECONDS) {
      tapeStopped = true
      gsap.to(audio, {
        // 0.0625 es el mínimo que acepta Chromium; más bajo lanza error.
        playbackRate: 0.07,
        duration: seconds,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => audio.pause(),
      })
      setGain(0, seconds)
    },
    resume(seconds = RESUME_DEFAULT_SECONDS, atSeconds) {
      // Mata un tapeStop en curso: si no, su onComplete pausa de nuevo.
      gsap.killTweensOf(audio, 'playbackRate')
      tapeStopped = false
      if (typeof atSeconds === 'number') audio.currentTime = atSeconds
      audio.playbackRate = 1
      if (!held) audio.play().catch(() => {})
      applyVolume(seconds)
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
      setGain(0, 0)
      audio.play().catch(() => {})
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
          if (shouldJump({ position: audio.currentTime, window: cue.window, direction })) {
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
      if (crossfadeTimer) clearTimeout(crossfadeTimer)
      btn.remove()
      audio.remove()
      audioCtx?.close().catch(() => {})
    },
  }
}
