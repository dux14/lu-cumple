// Slide 4: la carta. Un párrafo por pantalla (cada paso reemplaza al
// anterior), revelado palabra por palabra desde un desenfoque, con una frase
// por párrafo en Caveat rosa que se enciende al final. El cierre dibuja un
// corazón de un solo trazo y lanza una estrella fugaz. Cada paso corre en su
// propio timeline y mata al anterior: si ella toca rápido, salta al párrafo
// siguiente sin hacer cola detrás de las animaciones pendientes.
import { gsap } from 'gsap'
import { splitWords } from '../core/words.js'

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const HEART_SVG = `<svg class="carta-heart" viewBox="0 0 120 64" aria-hidden="true"><path d="M60 58 C 18 34, 26 4, 60 22 C 94 4, 102 34, 60 58" /></svg>`

const STEPS = [
  `<p class="carta-salute">Mi señorita:</p><p class="carta-p">Siento que uno de los acontecimientos más importantes de este año fue conocerte. Fue algo muy espontáneo, nada forzado: el fruto natural de un deseo.</p>`,
  `<p class="carta-p">Dios sabe cómo hace sus cosas, y siento que, más que lo que podamos hacer nosotros, se trata de <span class="accent">dejarnos ser</span> en lo que Él nos tiene preparado, sea cual sea la circunstancia.</p>`,
  `<p class="carta-p">Desde que estoy contigo he podido redescubrir facetas y sentimientos míos que no había querido volver a sentir. Me transmites mucha <span class="accent">paz</span> y ganas de hacer cosas diferentes e increíbles juntos.</p>`,
  `<p class="carta-p">Deseo mucho que tu corazón se sienta bonito con el mío. Puede que haya cosas que nos toque superar juntos, pero con un deseo genuino <span class="accent">lo vamos a lograr.</span></p>`,
  `<p class="carta-p">Quiero decirte lo mucho que te quiero y lo mucho que deseo cuidarte y protegerte en cada momento. Que en todas las situaciones, las tuyas y las mías, <span class="accent">nos tengamos el uno al otro.</span></p>`,
  `<p class="carta-p">Puede que tengamos nuestras heridas y cositas del pasado. Debemos aprender a amarlas, y a <span class="accent">hacernos santos</span> a través de cada una de ellas.</p>`,
  `<p class="carta-p">Y siento que en este día tan importante Dios te tiene preparado algo muy bonito: algo que solo tú conoces, el sueño que Él puso en tu corazón y que, con tu amor, <span class="accent">vas a hacer realidad.</span></p>`,
  `<p class="carta-p">Me cautivaste por ser tú: por tu forma de ver y de actuar, por no ponerte una máscara aunque duela. <span class="accent">Eso fue lo que me movió de ti.</span></p>`,
  `<p class="carta-p">Eres una muchacha muy bonita (lo reconozco), por dentro y por fuera. Tienes un corazón demasiado grande que nadie debe lastimar, y si lo hacen, sabes perdonar y <span class="accent">seguir amando.</span></p>`,
  `<p class="carta-big">Te quiero muchísimo,</p><p class="carta-sign"><span class="accent">mi princesa consentida</span></p>${HEART_SVG}`,
]

const LAST = STEPS.length - 1

function setDots(el, i) {
  el._carta.dots.querySelectorAll('i').forEach((d, k) => d.classList.toggle('is-on', k === i))
}

// Llena el segmento con el paso `i` y arma su animación de entrada sobre `tl`.
function buildEnter(el, i, tl) {
  const o = el._carta
  o.seg.innerHTML = STEPS[i]
  const words = splitWords(o.seg)
  const accents = o.seg.querySelectorAll('.accent')
  const heart = o.seg.querySelector('.carta-heart path')
  gsap.set(o.seg, { opacity: 1, y: 0, filter: 'none' })

  if (REDUCED) {
    accents.forEach((a) => a.classList.add('is-lit'))
    return
  }

  gsap.set(words, { opacity: 0, y: 8, filter: 'blur(6px)' })
  // Párrafos largos con stagger más corto: todos terminan de entrar en ~1,6 s.
  const each = Math.min(0.045, 1.4 / Math.max(words.length, 1))
  tl.to(words, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.55,
    stagger: each,
    ease: 'power2.out',
  })
  if (accents.length) {
    tl.call(() => accents.forEach((a) => a.classList.add('is-lit')), null, '-=0.15')
    tl.fromTo(accents, { scale: 1 }, { scale: 1.06, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, '<')
  }
  if (heart) {
    const len = heart.getTotalLength()
    gsap.set(heart, { strokeDasharray: len, strokeDashoffset: len })
    tl.to(heart, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' }, '-=0.2')
  }
}

function showCarta(el, i, ctx) {
  const o = el._carta
  o.tl?.kill()
  setDots(el, i)
  o.glow.classList.toggle('is-warm', i === LAST)

  const start = () => {
    const tl = gsap.timeline()
    o.tl = tl
    buildEnter(el, i, tl)
    if (i === LAST) tl.call(() => ctx?.sky?.shootingStar?.(), null, '-=1.2')
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

export const slide04 = {
  id: '04-carta',
  act: 'nosotros',
  steps: STEPS.length,
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-carta')

    const glow = document.createElement('div')
    glow.className = 'carta-glow'

    const seg = document.createElement('div')
    seg.className = 'carta-seg'

    const dots = document.createElement('div')
    dots.className = 'carta-dots'
    STEPS.forEach(() => dots.appendChild(document.createElement('i')))

    el.append(glow, seg, dots)
    el._carta = { glow, seg, dots, tl: null }
    return el
  },
  prepareEnter(el) {
    gsap.set(el, { opacity: 0 })
  },
  enter(el, ctx) {
    ctx.tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    showCarta(el, 0, ctx)
  },
  showStep(el, i, ctx) {
    showCarta(el, i, ctx)
  },
  leave(el) {
    el._carta.tl?.kill()
  },
}
