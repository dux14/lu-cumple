// Punto de entrada: monta el cielo, el deck, la orientación y el audio.
import './styles/tokens.css'
import './styles/base.css'
import './styles/deck.css'
import './styles/trip.css'
import { createSky } from './sky.js'
import { createDeck } from './deck.js'
import { initOrientation } from './orientation.js'
import { initAudio } from './audio.js'
import { slides } from './slides/index.js'

const skyCanvas = document.getElementById('sky')
const deckRoot = document.getElementById('deck')
const uiRoot = document.getElementById('ui')

const sky = createSky(skyCanvas)
const deck = createDeck({ root: deckRoot, uiRoot, slides, sky })
initOrientation({ deck, uiRoot })
initAudio({ uiRoot })
