// Datos del viaje — solo lo permitido para un repo público (ver CLAUDE.md
// del proyecto y las instrucciones de privacidad de esta entrega). Sin
// apellido, sin número de tiquete completo, sin precio ni datos de pago.
export const passenger = 'Luisa Fernanda'
export const reservation = 'AO••••'

export const outbound = {
  flight: 'AV46',
  from: { code: 'BOG', city: 'Bogotá', airport: 'El Dorado', terminal: 'T1' },
  to: { code: 'MAD', city: 'Madrid', airport: 'Barajas', terminal: 'T4S' },
  date: 'vie 30 oct 2026',
  departure: '07:50',
  arrival: '23:25',
  duration: '9 h 35 min',
  seat: '14D',
}

export const inbound = {
  flight: 'AV27',
  from: { code: 'MAD', city: 'Madrid', airport: 'Barajas', terminal: 'T4S' },
  to: { code: 'BOG', city: 'Bogotá', airport: 'El Dorado', terminal: 'T1' },
  date: 'mar 10 nov 2026',
  departure: '08:10',
  arrival: '12:30',
  duration: '10 h 20 min',
  seat: '14D',
}
