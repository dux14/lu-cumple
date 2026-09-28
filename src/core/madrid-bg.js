// Video de Madrid compartido entre las slides 19 y 20 (ver
// src/slides/19-boarding.js y src/slides/20-sorpresa.js): un único
// elemento <video>, creado una sola vez, para que al pasar de la 19 a la
// 20 el fondo siga sonando/reproduciendo sin volver a descargar el
// archivo. Cada slide solo lo reparenta con `appendChild`, lo que no
// reinicia su buffer.
let video = null

export function getMadridVideo() {
  if (!video) {
    video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'
    video.poster = `${import.meta.env.BASE_URL}video/madrid.jpg`
    video.src = `${import.meta.env.BASE_URL}video/madrid.mp4`
  }
  return video
}
