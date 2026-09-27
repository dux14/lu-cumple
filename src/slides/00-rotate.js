// Slide 0: pantalla vertical "Gira tu teléfono". No cuenta en el progreso;
// sale por orientation.js (deck.start()), nunca por navegación normal.

// Compartido con el overlay de orientation.js para no duplicar el markup.
export function renderRotateContent() {
  const wrap = document.createElement('div')
  wrap.className = 'rotate-content'

  const phone = document.createElement('div')
  phone.className = 'phone-icon'
  wrap.appendChild(phone)

  const text = document.createElement('p')
  text.className = 'body'
  text.innerHTML = 'Gira tu teléfono,<br /><span class="accent">esto es para ti</span>'
  wrap.appendChild(text)

  return wrap
}

export const slide00 = {
  id: '00-rotate',
  act: 'apertura',
  render() {
    const el = document.createElement('div')
    el.classList.add('slide-vertical')
    el.appendChild(renderRotateContent())
    return el
  },
  enter() {
    // El giro del ícono ya corre solo por CSS; no hace falta animar la entrada.
  },
}
