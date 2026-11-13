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
