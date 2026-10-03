// Ventanilla impresa en el tiquete de la slide 19 (zona libre a la derecha
// de los códigos). Ida: Madrid de noche. Vuelta: Bogotá de día. SVG inline,
// sin imágenes externas; el avioncito y los parpadeos son CSS (transform y
// opacity). La cortina y la entrada las anima la slide con GSAP.

function madridNight() {
  const pts = [[118, 92], [122, 100], [132, 84], [136, 96], [146, 78], [150, 90], [146, 104], [160, 88], [164, 100], [132, 110], [58, 112], [64, 118], [90, 108]]
  const wins = pts.map(([x, y], i) => `<rect class="port-win" x="${x}" y="${y}" width="2.5" height="2.5" fill="${i % 3 ? '#ff5c7a' : '#c9b6ff'}"/>`).join('')
  return `<svg viewBox="0 0 186 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="portSkyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140B22"/><stop offset=".7" stop-color="#3A1A4F"/><stop offset="1" stop-color="#8C1D40"/></linearGradient></defs>
    <rect width="186" height="160" fill="url(#portSkyN)"/>
    <circle cx="40" cy="34" r="11" fill="#fff" opacity=".95"/><circle cx="45" cy="30" r="10" fill="#1a0f2a"/>
    <circle cx="80" cy="22" r=".9" fill="#fff"/><circle cx="130" cy="30" r=".8" fill="#c9b6ff"/><circle cx="160" cy="18" r="1" fill="#fff"/><circle cx="20" cy="70" r=".7" fill="#fff"/>
    <g class="port-plane"><path d="M10 52 l6 0 l2 -2 l1 0 l-1 2 l4 0 l0 1 l-12 0z" fill="#fff" opacity=".85"/><circle cx="11" cy="52.5" r=".8" fill="#ff5c7a"/></g>
    <rect x="114" y="70" width="10" height="70" fill="#0c0714"/><rect x="128" y="62" width="11" height="78" fill="#0c0714"/>
    <path d="M142 56 h12 v84 h-12z M142 56 q6 -6 12 0" fill="#0c0714"/><rect x="157" y="74" width="10" height="66" fill="#0c0714"/>
    <path d="M78 140 V104 h22 v36z" fill="#120a1c"/><path d="M80 104 q9 -20 18 0z" fill="#120a1c"/><rect x="88" y="78" width="2" height="8" fill="#c9b6ff"/><path d="M84 80 l5 -3 l5 3" stroke="#c9b6ff" stroke-width="1" fill="none"/>
    <path d="M20 140 V118 h50 v22 h-6 v-12 q-4 -6 -8 0 v12 h-4 v-12 q-4 -7 -8 0 v12 h-4 v-12 q-4 -6 -8 0 v12z" fill="#160c22"/><path d="M38 118 l7 -7 l7 7z" fill="#160c22"/>
    ${wins}
    <rect y="140" width="186" height="20" fill="#08060D"/>
    <path d="M0 141 H186" stroke="#ff5c7a" stroke-opacity=".35"/>
  </svg>`
}

function bogotaDay() {
  return `<svg viewBox="0 0 186 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="portSkyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1A4F"/><stop offset=".55" stop-color="#7a4a8f"/><stop offset="1" stop-color="#c9b6ff"/></linearGradient></defs>
    <rect width="186" height="160" fill="url(#portSkyD)"/>
    <circle cx="140" cy="34" r="12" fill="#ffd9a8" opacity=".9"/>
    <g class="port-cloud" opacity=".55"><ellipse cx="50" cy="40" rx="20" ry="5" fill="#fff"/><ellipse cx="60" cy="36" rx="10" ry="5" fill="#fff"/></g>
    <g class="port-plane"><path d="M10 60 l6 0 l2 -2 l1 0 l-1 2 l4 0 l0 1 l-12 0z" fill="#fff" opacity=".9"/></g>
    <path d="M0 120 L20 98 L42 70 L56 62 L70 76 L92 66 L120 88 L150 80 L186 104 V160 H0z" fill="#3a1a4f"/>
    <rect x="53" y="55" width="6" height="7" fill="#fff" opacity=".8"/><path d="M53 55 l3 -3 l3 3z" fill="#fff" opacity=".8"/>
    <rect x="96" y="76" width="9" height="64" fill="#1d0f2c"/><rect x="98" y="72" width="5" height="4" fill="#1d0f2c"/>
    <path d="M110 140 V84 l6 -4 v56z M118 140 V80 l6 4 v56z" fill="#22122f"/>
    <rect x="40" y="110" width="14" height="30" fill="#22122f"/><rect x="132" y="104" width="12" height="36" fill="#22122f"/><rect x="70" y="114" width="10" height="26" fill="#22122f"/>
    <rect y="140" width="186" height="20" fill="#140B22"/>
    <path d="M0 141 H186" stroke="#ff5c7a" stroke-opacity=".35"/>
  </svg>`
}

// scene: 'madrid-noche' | 'bogota-dia'. Devuelve el contenedor (a montar en
// `.holo`) y las partes que anima la slide.
export function renderTicketPort(scene) {
  const night = scene === 'madrid-noche'
  const wrap = document.createElement('div')
  wrap.className = 'holo-slot'
  wrap.innerHTML = `<div class="port"><div class="port-view">${night ? madridNight() : bogotaDay()}</div><div class="port-shade"></div><div class="port-glass"></div></div>
    <p class="port-cap">${night ? 'así se ve desde mi casa' : 'esta vista la vemos juntos después'}</p>`
  return {
    wrap,
    port: wrap.querySelector('.port'),
    shade: wrap.querySelector('.port-shade'),
    cap: wrap.querySelector('.port-cap'),
  }
}
