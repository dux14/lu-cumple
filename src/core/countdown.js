// Cuenta regresiva pura del viaje: sin DOM, solo fechas → texto.
// Ida: 2026-10-30T12:50:00Z (07:50 Bogotá, UTC−5).
// Regreso: 2026-11-10T07:10:00Z (08:10 Madrid, UTC+1 en esa fecha).
const DEPARTURE = new Date('2026-10-30T12:50:00Z')
const RETURN = new Date('2026-11-10T07:10:00Z')
const DAY_MS = 24 * 60 * 60 * 1000

function sameUtcDate(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

export function countdownText(now) {
  if (now >= RETURN) return 'Ya vivimos 12 días juntos'
  if (now >= DEPARTURE) return 'Estamos juntos'
  if (sameUtcDate(now, DEPARTURE)) return 'Hoy vuelas hacia mí'
  const days = Math.ceil((DEPARTURE - now) / DAY_MS)
  return days === 1 ? 'Falta 1 día para verte' : `Faltan ${days} días para verte`
}
