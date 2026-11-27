const formatters = new Map()

// Da formato a un monto con el código de moneda que manda el backend (MXN, USD, JPY…)
export const formatPrice = (monto, moneda = 'MXN') => {
  try {
    if (!formatters.has(moneda)) {
      formatters.set(moneda, new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }))
    }
    return formatters.get(moneda).format(monto)
  } catch {
    return `${monto} ${moneda}`
  }
}

const horaFmt = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' })
const fechaFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const fechaHoraFmt = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

const aFecha = (iso) => {
  if (!iso) return null
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

// "10:25 a. m."
export const formatHora = (iso) => {
  const fecha = aFecha(iso)
  return fecha ? horaFmt.format(fecha) : '—'
}

// "26 nov, 10:25 a. m." (o solo la hora si es de hoy)
export const formatFechaHora = (iso) => {
  const fecha = aFecha(iso)
  if (!fecha) return '—'
  return esHoy(fecha) ? horaFmt.format(fecha) : fechaHoraFmt.format(fecha)
}

export const formatFecha = (iso) => {
  const fecha = aFecha(iso)
  return fecha ? fechaFmt.format(fecha) : '—'
}

export const esHoy = (valor) => {
  const fecha = valor instanceof Date ? valor : aFecha(valor)
  if (!fecha) return false
  const hoy = new Date()
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  )
}

// Minutos entre ahora y la fecha (positivo = en el futuro)
export const minutosHasta = (iso, ahora = Date.now()) => {
  const fecha = aFecha(iso)
  return fecha ? Math.round((fecha.getTime() - ahora) / 60000) : null
}

// "hace 3 min", "hace 2 h"
export const haceCuanto = (iso, ahora = Date.now()) => {
  const min = minutosHasta(iso, ahora)
  if (min === null) return ''
  const pasados = -min
  if (pasados < 1) return 'justo ahora'
  if (pasados < 60) return `hace ${pasados} min`
  const horas = Math.floor(pasados / 60)
  if (horas < 24) return `hace ${horas} h`
  return formatFecha(iso)
}

// Últimos caracteres del id, para identificar un pedido de un vistazo ("#A3F9")
export const folio = (id = '') => `#${id.slice(-5).toUpperCase()}`
