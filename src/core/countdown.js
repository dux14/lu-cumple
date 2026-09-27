// Cuenta regresiva pura del viaje: sin DOM, solo fechas → texto.
// Ida: 07:50 Bogotá (UTC−5) → 23:25 Madrid (UTC+1). Regreso: 08:10 Madrid.
// Los días se cuentan en calendario de Bogotá, donde ella abre la página.
const DEPARTURE = new Date('2026-10-30T12:50:00Z')
const ARRIVAL = new Date('2026-10-30T22:25:00Z')
const RETURN = new Date('2026-11-10T07:10:00Z')
const DAY_MS = 24 * 60 * 60 * 1000
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000 // Colombia no tiene horario de verano

function bogotaDayNumber(date) {
  return Math.floor((date.getTime() + BOGOTA_OFFSET_MS) / DAY_MS)
}

export function countdownText(now) {
  if (now >= RETURN) return 'Ya vivimos 12 días juntos'
  if (now >= ARRIVAL) return 'Estamos juntos'
  if (now >= DEPARTURE) return 'Vas volando hacia mí'
  const days = bogotaDayNumber(DEPARTURE) - bogotaDayNumber(now)
  if (days <= 0) return 'Hoy vuelas hacia mí'
  return days === 1 ? 'Falta 1 día para verte' : `Faltan ${days} días para verte`
}
