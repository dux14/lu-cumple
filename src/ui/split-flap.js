// Tablero split-flap: cada carácter cicla con un volteo (rotateX) hasta
// detenerse en el valor final, de izquierda a derecha. Lo usan la 18 (fila
// del tablero de vuelo) y la 19 (número de días del cierre). Sin
// dependencias del deck: solo GSAP y WebAudio para el clac.
import { gsap } from 'gsap'

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const FLIP_MS = 70
const MUTE_KEY = 'lu-cumple-muted'

let audioCtx = null

// Clac corto sintetizado: oscilador square, ~30 ms, ganancia baja. Respeta
// el mute y nunca lanza error (sin gesto del usuario, sin AudioContext, etc.
// simplemente no suena).
function clack() {
  try {
    if (localStorage.getItem(MUTE_KEY) === '1') return
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state !== 'running') return // no desbloqueado: no forzar resume acá
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'square'
    osc.frequency.value = 1800 + Math.random() * 600
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.03)
  } catch {
    // sin sonido, sin romper la secuencia
  }
}

function buildCell(tone) {
  const cell = document.createElement('div')
  cell.className = tone ? `flap flap-${tone}` : 'flap'
  cell.innerHTML =
    '<div class="flap-half flap-top"><span> </span></div>' +
    '<div class="flap-half flap-bot"><span> </span></div>' +
    '<div class="flap-leaf"><span> </span></div>'
  return cell
}

function setChar(cell, ch) {
  cell.querySelectorAll('span').forEach((s) => {
    s.textContent = ch
  })
}

// `length`: cantidad fija de caracteres (el texto se rellena con espacios).
// `tone`: 'rose' | 'lilac' o nada (blanco), colorea el flap completo.
// `row`: fila dentro de un tablero de varias filas (ver spec de la 18); las
// filas de más abajo empiezan a resolverse un poco más tarde.
// `size`: 'lg' para la variante grande de la cuenta regresiva del cierre.
export function createSplitFlap(text, { length = text.length, tone, row = 0, size } = {}) {
  const el = document.createElement('div')
  el.className = size ? `split-flap split-flap-${size}` : 'split-flap'
  const cells = []
  for (let i = 0; i < length; i++) {
    const cell = buildCell(tone)
    el.appendChild(cell)
    cells.push(cell)
  }

  function setInstant(nextText) {
    const padded = nextText.padEnd(length, ' ').slice(0, length)
    cells.forEach((cell, i) => setChar(cell, padded[i]))
  }

  setInstant(text)

  // Cicla cada carácter hasta el valor final y se detiene de izquierda a
  // derecha (spins crece por columna y por fila), como un tablero real
  // resolviéndose. Devuelve una promesa que se resuelve cuando termina el
  // último flap.
  function flipTo(nextText, { reduced = false } = {}) {
    const padded = nextText.padEnd(length, ' ').slice(0, length)
    if (reduced) {
      setInstant(nextText)
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      let pending = cells.length
      cells.forEach((cell, i) => {
        const target = padded[i]
        const spins = 8 + i * 3 + row * 2
        const leaf = cell.querySelector('.flap-leaf')
        let k = 0
        const id = setInterval(() => {
          k++
          const ch = k >= spins ? target : CHARS[Math.floor(Math.random() * CHARS.length)]
          setChar(cell, ch)
          gsap.fromTo(leaf, { rotationX: 0 }, { rotationX: -90, duration: 0.06, ease: 'none' })
          if (i % 3 === 0) clack()
          if (k >= spins) {
            clearInterval(id)
            gsap.set(leaf, { rotationX: 0 })
            pending--
            if (pending === 0) resolve()
          }
        }, FLIP_MS)
      })
    })
  }

  return { el, flipTo, setInstant }
}
