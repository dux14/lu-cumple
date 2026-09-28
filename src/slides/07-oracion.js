// Slide 7: la oración. Sin título — el texto abre la slide directo. En el
// flujo del deck van 4 pasos cortos (SHORT); el último ofrece un botón que
// abre un modo lectura aparte con el texto completo (FULL, 15 pasos), con
// su propio resplandor de vela y su propia navegación (no la del deck: ver
// `onNav` más abajo y el comentario en src/deck.js). Enlace directo
// `?s=7&leer`: entra a la slide con el lector ya abierto.
// Textos: docs/superpowers/mockups/oracion-voz-en-off.html (opción C).
import { gsap } from 'gsap'

const CTA_HTML = `<button type="button" class="oracion-cta" data-no-nav>Léela completa en tu <span class="accent">hora santa</span> ✦</button>`

const SHORT = [
  `<p class="oracion-p">Esta no es para leerla ahora.<br>Guárdala para tu <span class="accent">hora santa</span> de hoy y léela despacio, delante de Él.</p>`,
  `<p class="oracion-p">Jesús, hoy Lu cumple 22.</p><p class="oracion-big">Tú la hiciste por fuera y por dentro, y lo de dentro <span class="accent">nunca se te escapó.</span></p>`,
  `<p class="oracion-p">Gracias por su bondad, su firmeza, su empatía, su hambre de justicia y su ternura.</p><p class="oracion-p">Sana sus heridas y rompe sus muros: dile otra vez <span class="accent">«Effetá»</span>, ábrete.</p>`,
  `<p class="oracion-p">Y que sepa que hoy no ora sola. Yo también oro por ella.</p><p class="oracion-big"><span class="accent">Y por nosotros.</span></p>`,
]

const FULL = [
  { html: `<p class="oracion-small">Oración · 13 de octubre</p><p class="oracion-p">Esta es para tu hora santa.<br>Léela despacio, delante de Él.</p>` },
  { html: `<p class="oracion-p">Jesús, hoy es 13 de octubre. Hoy Lu cumple 22 años, y esta vez no vengo a hablarte de mí.</p><p class="oracion-big" style="margin-top:14px">Vengo a hablarte <span class="accent">de ella.</span></p>` },
  { html: `<p class="oracion-p">Te confieso que abrí el Evangelio de hoy esperando otra cosa. Una fiesta, un banquete, algo que sonara a cumpleaños.</p><p class="oracion-p">Y me encuentro con una comida incómoda: un fariseo que te invita a su casa y se queda mirando si te lavaste las manos.</p>` },
  { html: `<p class="oracion-big oracion-dim">Él mira lo de fuera.</p><p class="oracion-big" style="margin-top:8px">Tú miras lo de <span class="accent">dentro.</span></p>` },
  { html: `<p class="oracion-quote">«¿Acaso el que hizo lo exterior no hizo también lo interior?»</p><p class="oracion-p" style="margin-top:16px">Y esa pregunta me detiene. Porque hace 22 años tú la hiciste a ella. Por fuera y por dentro. Y lo de dentro nunca se te escapó.</p>` },
  { html: `<p class="oracion-p">Este año, visto desde fuera, fue un año de ir y venir. Aprender a vivir sola y luego volver a casa. Perder un trabajo y encontrar otro.</p><p class="oracion-p oracion-dim">Quien mire solo el vaso por fuera vería cambios, cansancio, volver a empezar.</p>` },
  { html: `<p class="oracion-p">Pero tú no miras así. Tú viste lo que pasaba dentro. La volviste a buscar en Hakuna, en Effetá, y ella volvió a ti.</p><p class="oracion-p">Y en medio de todo eso se atrevió a abrir la puerta a algo nuevo, y lo hizo con un <span class="accent">salto de fe.</span></p>` },
  {
    html: `<p class="oracion-p oracion-dim">Hoy quiero darte gracias por lo que pusiste dentro de ella:</p><p class="oracion-list" style="margin-top:14px"><span>su bondad,</span><span>su firmeza,</span><span>su empatía,</span><span>su hambre de justicia,</span><span>su ternura</span><span>y esa amabilidad que se le nota aun en los días difíciles.</span></p>`,
    list: true,
  },
  { html: `<p class="oracion-quote">«Den más bien limosna de lo que tienen.»</p><p class="oracion-p" style="margin-top:16px">Ella ya lo hace. Da de lo que tiene, y sobre todo de lo que tiene dentro, muchas veces sin darse cuenta.</p>` },
  { html: `<p class="oracion-p">Pero tú también conoces lo que hay dentro y todavía duele. Heridas del pasado que no se cierran solas.</p><p class="oracion-p">Muros que se levantaron para protegerse y que ahora no dejan pasar la luz.</p>` },
  { html: `<p class="oracion-p oracion-dim">Por eso hoy te pido por su nuevo año:</p><p class="oracion-p">Que sea un año para reconciliarse consigo misma, para mirarse como tú la miras. Que le des la gracia de perdonar, y de sanar lo que el tiempo no ha podido sanar.</p><p class="oracion-p">Que este trabajo nuevo sea el comienzo de una etapa bonita, un lugar donde florezca.</p>` },
  { html: `<p class="oracion-p">Que le ayudes a descubrir los muros que ella misma levantó, y a romperlos uno a uno. Tú que dijiste</p><p class="oracion-big" style="margin:6px 0"><span class="accent" style="font-size:1.5em">«Effetá»</span></p><p class="oracion-p">ábrete, di esa palabra otra vez sobre su corazón. Que sea más feliz: consigo misma y con los demás.</p>` },
  { html: `<p class="oracion-p">San José, tú que cuidaste en silencio la casa de Nazaret, cuida sus pasos este año: sus decisiones, su trabajo, su descanso.</p><p class="oracion-p">Madre, la de la Medalla Milagrosa: <span class="oracion-lilac">«Oh María sin pecado concebida, ruega por nosotros que recurrimos a ti».</span> Cúbrela con tu manto.</p>` },
  { html: `<p class="oracion-p">Jesús, ella está aquí, delante de ti, leyendo estas palabras. Y quiero que sepa algo: hoy no está orando sola.</p><p class="oracion-big" style="margin-top:12px">Yo también estoy orando por ella. <span class="accent">Y por nosotros.</span></p>` },
  { html: `<p class="oracion-p oracion-dim">Todo lo demás, lo de dentro,</p><p class="oracion-big" style="margin-top:6px">se lo dejo a <span class="accent">ustedes dos.</span></p>` },
]

const SWIPE_THRESHOLD = 40

// Referencia a la slide montada: onNav la necesita y deck.js llama a
// onNav como método suelto (no hay `this` de instancia útil acá). `activeAudio`
// se guarda igual, desde ctx.audio, para poder duckear al abrir/cerrar el lector.
let activeEl = null
let activeAudio = null
const READER_DUCK_LEVEL = 0.35

function shortHtml(i) {
  return SHORT[i] + (i === SHORT.length - 1 ? CTA_HTML : '')
}

function fillReaderSeg(seg, step) {
  seg.innerHTML = step.html
  if (step.list) {
    seg.querySelectorAll('.oracion-list span').forEach((s, k) => {
      setTimeout(() => s.classList.add('is-on'), 250 + k * 380)
    })
  }
}

function bindCta(el) {
  const cta = el._oracion.seg.querySelector('.oracion-cta')
  if (cta) cta.addEventListener('click', () => openReader(el))
}

function renderShortStep(el, i, ctx) {
  const o = el._oracion
  const html = shortHtml(i)
  if (ctx) {
    ctx.tl.to(o.seg, { opacity: 0, y: -10, filter: 'blur(4px)', duration: 0.3, ease: 'power2.in' })
    ctx.tl.call(() => {
      o.seg.innerHTML = html
      bindCta(el)
    })
    ctx.tl.fromTo(o.seg, { opacity: 0, y: 10, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' })
  } else {
    o.seg.innerHTML = html
    bindCta(el)
  }
}

function renderReaderStep(el, i, animate) {
  const o = el._oracion
  const step = FULL[i]
  if (animate) {
    gsap.to(o.readerSeg, {
      opacity: 0,
      y: -10,
      filter: 'blur(4px)',
      duration: 0.3,
      ease: 'power2.in',
      onComplete() {
        fillReaderSeg(o.readerSeg, step)
        gsap.fromTo(o.readerSeg, { opacity: 0, y: 10, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' })
      },
    })
  } else {
    fillReaderSeg(o.readerSeg, step)
    gsap.set(o.readerSeg, { opacity: 1, y: 0, filter: 'blur(0px)' })
  }
  o.dots.querySelectorAll('i').forEach((d, k) => d.classList.toggle('is-on', k === i))
}

function openReader(el) {
  const o = el._oracion
  o.reading = true
  o.readerStep = 0
  o.short.style.display = 'none'
  o.reader.hidden = false
  o.glow.classList.add('is-on')
  renderReaderStep(el, 0, false)
  gsap.fromTo(o.reader, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  activeAudio?.duck(READER_DUCK_LEVEL, 0.6)
}

function closeReader(el) {
  const o = el._oracion
  o.reading = false
  gsap.to(o.reader, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete() {
      o.reader.hidden = true
      o.short.style.display = ''
      o.glow.classList.remove('is-on')
    },
  })
  activeAudio?.restore(0.6)
}

function readerNext(el) {
  const o = el._oracion
  if (o.readerStep < FULL.length - 1) {
    o.readerStep++
    renderReaderStep(el, o.readerStep, true)
  } else {
    closeReader(el)
  }
}

function readerPrev(el) {
  const o = el._oracion
  if (o.readerStep > 0) {
    o.readerStep--
    renderReaderStep(el, o.readerStep, true)
  }
}

// El lector maneja su propio tap/swipe con `stopPropagation`, así el gesto
// no llega a los listeners globales de src/ui/controls.js (que moverían el
// deck). Las flechas de teclado y los botones sí pasan por ahí: los captura
// `onNav` más abajo.
function attachReaderGestures(el) {
  const o = el._oracion
  let tracking = false
  let startX = 0
  let startY = 0

  function onDown(e) {
    if (e.target.closest?.('[data-no-nav]')) return
    tracking = true
    startX = e.clientX
    startY = e.clientY
    e.stopPropagation()
  }

  function onUp(e) {
    if (!tracking) return
    tracking = false
    e.stopPropagation()
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dy) > Math.abs(dx)) return // movimiento vertical: no avanza
    if (dx >= SWIPE_THRESHOLD) readerPrev(el)
    else readerNext(el) // swipe a la izquierda o toque simple
  }

  o.reader.addEventListener('pointerdown', onDown)
  o.reader.addEventListener('pointerup', onUp)
}

export const slide07 = {
  id: '07-oracion',
  act: 'fe',
  steps: SHORT.length,
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-oracion')

    const short = document.createElement('div')
    short.className = 'oracion-short'
    const seg = document.createElement('div')
    seg.className = 'oracion-seg'
    short.appendChild(seg)
    el.appendChild(short)

    const reader = document.createElement('div')
    reader.className = 'oracion-reader'
    reader.hidden = true

    const glow = document.createElement('div')
    glow.className = 'oracion-glow'

    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.className = 'oracion-reader-close'
    closeBtn.setAttribute('aria-label', 'Cerrar')
    closeBtn.dataset.noNav = ''
    closeBtn.textContent = '×'

    const readerSeg = document.createElement('div')
    readerSeg.className = 'oracion-reader-seg'

    const dots = document.createElement('div')
    dots.className = 'oracion-reader-dots'
    FULL.forEach(() => dots.appendChild(document.createElement('i')))

    reader.append(glow, closeBtn, readerSeg, dots)
    el.appendChild(reader)

    el._oracion = { short, seg, reader, readerSeg, dots, glow, closeBtn, reading: false, readerStep: 0 }

    closeBtn.addEventListener('click', () => closeReader(el))
    attachReaderGestures(el)

    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
  },
  enter(el, ctx) {
    activeEl = el
    activeAudio = ctx.audio
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    renderShortStep(el, 0, null)
    const params = new URLSearchParams(window.location.search)
    if (params.has('leer')) openReader(el)
  },
  showStep(el, i, ctx) {
    if (el._oracion.reading) return // el lector avanza por su cuenta, no por acá
    renderShortStep(el, i, ctx)
  },
  // Ver el comentario junto a advance()/retreat() en src/deck.js.
  onNav(dir) {
    if (!activeEl || !activeEl._oracion.reading) return false
    if (dir === 'next') readerNext(activeEl)
    else readerPrev(activeEl)
    return true
  },
  leave(el, ctx) {
    if (activeEl === el) activeEl = null
    const o = el._oracion
    const wasReading = o.reading
    o.reading = false
    o.reader.hidden = true
    o.short.style.display = ''
    o.glow.classList.remove('is-on')
    // Salvaguarda: si se sale de la slide con el lector todavía abierto
    // (p. ej. navegación directa por índice), restaura el volumen igual.
    if (wasReading) (ctx.audio ?? activeAudio)?.restore(0.4)
    activeAudio = null
  },
}
