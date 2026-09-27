// Música: desbloqueo en el primer gesto (no cuenta el giro en iOS), botón
// de mute con estado recordado, pausa cuando la pestaña queda oculta.
import { gsap } from 'gsap'

const NOTE_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17V5l10-2v12M9 17a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 15a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/></svg>'

const STORAGE_KEY = 'lu-cumple-muted'
const UNLOCK_DURATION = 2.5
const TARGET_VOLUME = 0.6

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
  audio.loop = true
  audio.preload = 'auto'
  audio.src = `${import.meta.env.BASE_URL}audio/song.mp3`
  audio.volume = 0
  document.body.appendChild(audio)

  let muted = readStoredMuted()
  audio.muted = muted
  let unlocked = false

  const btn = document.createElement('button')
  btn.className = 'mute'
  btn.dataset.noNav = ''
  btn.setAttribute('aria-label', 'Silenciar música')
  btn.innerHTML = NOTE_ICON
  btn.classList.toggle('is-muted', muted)
  uiRoot.appendChild(btn)

  function unlock() {
    if (unlocked) return
    unlocked = true
    gsap.to(audio, { volume: TARGET_VOLUME, duration: UNLOCK_DURATION })
    audio.play().catch(() => {})
  }
  window.addEventListener('pointerdown', unlock, { once: true })

  function onError() {
    btn.style.display = 'none'
  }
  audio.addEventListener('error', onError)

  function onClick() {
    muted = !muted
    audio.muted = muted
    btn.classList.toggle('is-muted', muted)
    storeMuted(muted)
  }
  btn.addEventListener('click', onClick)

  function onVisibility() {
    if (document.hidden) {
      audio.pause()
    } else if (unlocked && !muted) {
      audio.play().catch(() => {})
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  return {
    destroy() {
      window.removeEventListener('pointerdown', unlock)
      audio.removeEventListener('error', onError)
      btn.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
      btn.remove()
      audio.remove()
    },
  }
}
