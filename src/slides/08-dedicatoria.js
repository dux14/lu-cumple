// Slide 8: dedicatoria. Tratada como dedicatoria de libro: "PARA LU" fijo
// arriba y un pensamiento por pantalla, con mucho aire. El paso 1 juega con
// "LUz": el "LU" se enciende con un halo y la "z" se escribe a mano. El
// cierre ("Feliz cumple, mi niña") enciende unas estrellas alrededor una
// sola vez y lanza una estrella fugaz. Igual que la carta, cada paso tiene su
// propio timeline y mata al anterior.
import { gsap } from 'gsap'
import { splitWords } from '../core/words.js'

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SPARKS = Array.from({ length: 7 }, () => '<i class="ded-spark">✦</i>').join('')

const STEPS = [
  `<p class="ded-p">Hoy, mi niña, es un día bonito: un día para que estés linda y preciosa, y para que ese corazón que tienes <span class="accent">reluzca en todas partes.</span></p>`,
  `<p class="ded-p">Hoy Dios te regala un día más para dar y ser</p><p class="ded-luz"><span class="ded-halo"></span><span class="ded-lu">LU</span><span class="ded-z">z</span></p><p class="ded-p">para los demás, para que en ti <span class="accent alt">puedan encontrar a Dios.</span></p>`,
  `<p class="ded-p">Quiero que la pases muy bien hoy, que no te molesten mucho, que comas rico y <span class="accent">lo disfrutes todo.</span></p>`,
  `<p class="ded-p">Y que sepas que en cada momento, hoy y todos los días, <span class="accent">pienso y rezo mucho por ti.</span></p>`,
  `<div class="ded-final">${SPARKS}<p class="ded-big">Feliz cumple,</p><p class="ded-sign"><span class="accent">mi niña</span></p></div>`,
]

const LAST = STEPS.length - 1

function buildEnter(el, i, tl, ctx) {
  const o = el._ded
  o.seg.innerHTML = STEPS[i]
  gsap.set(o.seg, { opacity: 1, y: 0, filter: 'none' })
  const accents = o.seg.querySelectorAll('.accent')

  if (REDUCED) {
    accents.forEach((a) => a.classList.add('is-lit'))
    o.seg.querySelector('.ded-luz')?.classList.add('is-lit')
    return
  }

  // Revelado por palabras de los párrafos normales (no del bloque LUz ni
  // del cierre, que tienen su propia coreografía).
  o.seg.querySelectorAll('.ded-p').forEach((p, k) => {
    const words = splitWords(p)
    gsap.set(words, { opacity: 0, y: 8, filter: 'blur(6px)' })
    tl.to(
      words,
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.05, ease: 'power2.out' },
      k === 0 ? 0 : '>-0.1',
    )
    // El bloque LUz va entre el primer y el segundo párrafo.
    if (k === 0) addLuz(o.seg, tl)
  })

  if (accents.length) {
    tl.call(() => accents.forEach((a) => a.classList.add('is-lit')), null, '-=0.15')
  }

  if (i === LAST) addFinal(o.seg, tl, ctx)
}

function addLuz(seg, tl) {
  const luz = seg.querySelector('.ded-luz')
  if (!luz) return
  const lu = luz.querySelector('.ded-lu')
  const z = luz.querySelector('.ded-z')
  const halo = luz.querySelector('.ded-halo')
  gsap.set(lu, { opacity: 0, scale: 0.9 })
  gsap.set(z, { clipPath: 'inset(0 100% 0 0)' })
  gsap.set(halo, { opacity: 0, scale: 0.3 })
  tl.to(lu, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, '+=0.1')
  tl.to(halo, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, '<')
  tl.call(() => luz.classList.add('is-lit'), null, '<0.2')
  tl.to(z, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power1.inOut' }, '>-0.4')
}

function addFinal(seg, tl, ctx) {
  const big = seg.querySelector('.ded-big')
  const sign = seg.querySelector('.ded-sign .accent')
  const sparks = seg.querySelectorAll('.ded-spark')
  gsap.set(big, { opacity: 0, y: 14, filter: 'blur(8px)' })
  gsap.set(sign, { opacity: 0, clipPath: 'inset(0 100% 0 0)' })
  gsap.set(sparks, { opacity: 0, scale: 0 })
  tl.to(big, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.1)
  tl.to(sign, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power1.inOut' }, '>-0.1')
  tl.call(() => sign.classList.add('is-lit'))
  tl.to(sparks, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.09, ease: 'back.out(3)' }, '<')
  tl.call(() => sparks.forEach((s) => s.classList.add('is-twinkle')))
  tl.call(() => ctx?.sky?.shootingStar?.(), null, '<')
}

function showDed(el, i, ctx) {
  const o = el._ded
  o.tl?.kill()

  const start = () => {
    const tl = gsap.timeline()
    o.tl = tl
    buildEnter(el, i, tl, ctx)
  }

  if (o.seg.childElementCount && !REDUCED) {
    o.tl = gsap.to(o.seg, {
      opacity: 0,
      y: -10,
      filter: 'blur(6px)',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: start,
    })
  } else {
    start()
  }
}

export const slide08 = {
  id: '08-dedicatoria',
  act: 'fe',
  steps: STEPS.length,
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-ded')

    const eyebrow = document.createElement('p')
    eyebrow.className = 'ded-eyebrow'
    eyebrow.textContent = 'Para Lu'

    const seg = document.createElement('div')
    seg.className = 'ded-seg'

    el.append(eyebrow, seg)
    el._ded = { eyebrow, seg, tl: null }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
    gsap.set(el._ded.eyebrow, { opacity: 0, letterSpacing: '0.7em' })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    ctx.tl.to(el._ded.eyebrow, { opacity: 0.6, letterSpacing: '0.3em', duration: 1.2, ease: 'power2.out' }, 0)
    showDed(el, 0, ctx)
  },
  showStep(el, i, ctx) {
    showDed(el, i, ctx)
  },
  leave(el) {
    el._ded.tl?.kill()
  },
}
