// Precarga en segundo plano de los assets pesados de las slides 3
// (collage), 18 (vuelo) y 20 (sorpresa): las 22 fotos del rollo y los
// videos de flores/vuelo/Madrid. Se dispara una sola vez, poco después de
// montar el deck, sin bloquear el arranque (requestIdleCallback si existe,
// si no un timeout corto). Así, cuando se llega a esas slides, el navegador
// ya tiene el archivo en caché y decodificado en vez de arrancar la
// descarga/decode justo en medio de la transición.
import { photos } from '../data/photos.js'

function preloadImage(src) {
  const img = new Image()
  img.src = src
  // decode() fuerza la decodificación fuera del hilo principal cuando el
  // navegador lo soporta; si falla (o no existe), la imagen igual queda en
  // caché por el fetch del `src`.
  img.decode?.().catch(() => {})
}

function preloadVideo(src) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'video'
  link.href = src
  document.head.appendChild(link)
}

function preloadHeavyAssets() {
  const base = import.meta.env.BASE_URL
  photos.forEach((p) => {
    preloadImage(p.preview)
    if (p.moment) preloadImage(p.full)
  })
  ;[
    `${base}video/rosas.mp4`,
    `${base}video/amarillas.mp4`,
    `${base}video/ventanilla.mp4`,
    `${base}video/madrid.mp4`,
  ].forEach(preloadVideo)
}

export function schedulePreload() {
  const run = () => preloadHeavyAssets()
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 1500)
}
