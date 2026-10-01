// Slide 6 (antes 5): el programador defectuoso. Terminal en CSS que
// "compila al novio": las líneas se escriben solas y la barra avanza a
// saltos —literalmente "de a pasos"— hasta quedarse en 67%.
// Referencia visual: docs/superpowers/mockups/propuestas-fuertes.html
// (sección "Terminal de la 5", función terminal()).
import { gsap } from 'gsap'

const TITLE_HTML = [
  'El programador <span class="accent alt">defectuoso</span>',
  'se está <span class="accent">arreglando</span> <span class="wiggle">de a pasos</span>',
]

// Placeholder: las líneas de abajo son borrador. El usuario las reemplaza
// por sus «fix:» reales (máx. ~55 caracteres cada una para que quepan).
const FIX_LINES = [
  { ok: true, text: 'fix: dormir cuando estemos juntos' },
  { ok: true, text: 'fix: dejar de decir «ya casi» cuando no es ya casi' },
  { ok: false, text: "sigue haciendo chistes malos (won't fix)" },
]

const COMMAND = 'pnpm run arreglar-novio'
// Puntos [valor%, retardo en s desde que arranca la barra] — avance a
// saltos, sin interpolar entre ellos.
const BAR_STEPS = [
  [17, 0.4],
  [33, 1.0],
  [42, 1.7],
  [58, 2.3],
  [67, 3.1],
]

// Crea y arranca el tween de tipeo ya (como en el mockup): se añade al
// timeline padre con `tl.add(tween, posición)` en vez de encolarlo con
// `tl.call`, que insertaría el tween mientras el timeline ya está
// reproduciéndose y no lo mostraría.
function typeTween(node, text, cps) {
  const state = { n: 0 }
  return gsap.to(state, {
    n: text.length,
    duration: text.length / cps,
    ease: 'none',
    onUpdate() {
      node.textContent = text.slice(0, Math.round(state.n))
    },
  })
}

function buildLine(container, prefixHtml, prefixClass) {
  const line = document.createElement('div')
  line.className = 'term-line'
  if (prefixHtml) {
    const prefix = document.createElement('span')
    prefix.className = prefixClass
    prefix.innerHTML = prefixHtml
    line.appendChild(prefix)
  }
  const text = document.createElement('span')
  line.appendChild(text)
  container.appendChild(line)
  return text
}

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function playTerminal(el) {
  const o = el._term
  o.tl?.kill()
  o.lines.replaceChildren()
  o.bar.style.width = '0%'
  o.pct.textContent = '0%'
  o.barRow.hidden = true

  const lastBar = BAR_STEPS[BAR_STEPS.length - 1][0]

  if (REDUCED) {
    // Sin animación: se muestra el estado final directo (comando, líneas
    // completas, barra en 67%).
    buildLine(o.lines, '$ ', 'term-pr').textContent = COMMAND
    FIX_LINES.forEach((line) => {
      const prefixHtml = line.ok ? '✔' : '⚠'
      const prefixClass = line.ok ? 'term-ok' : 'term-warn'
      buildLine(o.lines, prefixHtml, prefixClass).textContent = ' ' + line.text
    })
    o.barRow.hidden = false
    o.bar.style.width = lastBar + '%'
    o.pct.textContent = lastBar + '%'
    return
  }

  const tl = gsap.timeline()
  o.tl = tl

  const cmdText = buildLine(o.lines, '$ ', 'term-pr')
  tl.add(typeTween(cmdText, COMMAND, 26), 0.15)

  FIX_LINES.forEach((line) => {
    const prefixHtml = line.ok ? '✔' : '⚠'
    const prefixClass = line.ok ? 'term-ok' : 'term-warn'
    const text = buildLine(o.lines, prefixHtml, prefixClass)
    tl.add(typeTween(text, ' ' + line.text, 60), '+=0.25')
  })

  tl.call(() => {
    o.barRow.hidden = false
  }, null, '+=0.3')
  tl.addLabel('bar')
  // Los retardos son desde la misma etiqueta "bar" (no acumulados entre
  // sí): así el avance a saltos respeta los tiempos del mockup.
  BAR_STEPS.forEach(([value, delay]) => {
    tl.call(
      () => {
        o.bar.style.width = value + '%'
        o.pct.textContent = value + '%'
      },
      null,
      `bar+=${delay}`,
    )
  })
}

export const slide06 = {
  id: '06-programador',
  act: 'risas',
  render() {
    const el = document.createElement('div')
    el.className = 'slide-programador'

    const title = document.createElement('h1')
    title.className = 'display display-sm term-title'
    title.innerHTML = TITLE_HTML.join('<br />')
    el.appendChild(title)

    const term = document.createElement('div')
    term.className = 'term'

    const head = document.createElement('div')
    head.className = 'term-head'
    head.innerHTML = '<i></i><i></i><i></i><span>arreglar-novio — zsh</span>'
    term.appendChild(head)

    const body = document.createElement('div')
    body.className = 'term-body'
    term.appendChild(body)

    // Las líneas escritas viven en su propio contenedor: playTerminal() lo
    // vacía en cada replay sin tocar `barRow`, que se arma una sola vez.
    const lines = document.createElement('div')
    body.appendChild(lines)

    const barRow = document.createElement('div')
    barRow.className = 'term-line term-bar-row'
    barRow.hidden = true
    barRow.innerHTML =
      '<span class="term-dim">arreglando…</span><span class="term-bar"><b></b></span><span class="term-ok term-pct">0%</span> <span class="term-dim">· de a pasos</span>'
    body.appendChild(barRow)

    // Hueco del sticker del muchacho: la clase queda lista, oculta hasta
    // que llegue la imagen (ver comentario en term-sticker.css). Se activa
    // agregando `.term-sticker--ready` y un <img> adentro.
    const sticker = document.createElement('div')
    sticker.className = 'term-sticker'
    term.appendChild(sticker)

    el.appendChild(term)

    el._term = {
      lines,
      barRow,
      bar: barRow.querySelector('.term-bar b'),
      pct: barRow.querySelector('.term-pct'),
      tl: null,
    }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set(el.querySelector('.term'), { opacity: 0, y: 14, scale: 0.97 })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    ctx.tl.to(el.querySelector('.term'), { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }, '-=0.15')
    ctx.tl.call(() => playTerminal(el))
  },
  leave(el) {
    el._term.tl?.kill()
  },
}
