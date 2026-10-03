// Punto de entrada: monta el cielo, el deck, la orientación y el audio.
import './styles/tokens.css'
import './styles/base.css'
import './styles/deck.css'
import './styles/collage.css'
import './styles/trip.css'
import './styles/oracion.css'
import './styles/chiste.css'
import './styles/programador.css'
import './styles/creditos.css'
import './styles/te-quiero.css'
import './styles/acabamos.css'
import './styles/o-no.css'
import './styles/falta-algo.css'
import './styles/sorpresa.css'
import './styles/locuras.css'
import './styles/cierre.css'
import './styles/nebula.css'
import './styles/avatar.css'
import { createSky } from './sky.js'
import { createNebula } from './nebula.js'
import { createDeck } from './deck.js'
import { initOrientation } from './orientation.js'
import { initAudio } from './audio.js'
import { slides } from './slides/index.js'
import { schedulePreload } from './core/preload.js'

const nebulaEl = document.getElementById('nebula')
const skyCanvas = document.getElementById('sky')
const deckRoot = document.getElementById('deck')
const uiRoot = document.getElementById('ui')

const nebula = createNebula(nebulaEl)
const sky = createSky(skyCanvas)
const audio = initAudio({ uiRoot })
const deck = createDeck({ root: deckRoot, uiRoot, slides, sky, audio: audio.api, nebula })
initOrientation({ deck, uiRoot })
schedulePreload()
