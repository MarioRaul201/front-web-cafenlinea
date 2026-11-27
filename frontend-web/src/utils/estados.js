// Textos del panel para cada estado del catálogo (el nombre oficial viene del backend)
export const ESTADOS_ACTIVOS = ['PENDIENTE', 'ACEPTADO', 'EN_PREPARACION', 'LISTO']

export const COLUMNAS = [
  { clave: 'PENDIENTE', titulo: 'Nuevos', ayuda: 'Por aceptar' },
  { clave: 'ACEPTADO', titulo: 'Aceptados', ayuda: 'Por empezar' },
  { clave: 'EN_PREPARACION', titulo: 'En preparación', ayuda: 'En cocina' },
  { clave: 'LISTO', titulo: 'Listos', ayuda: 'Esperando al cliente' },
]

// Texto del botón que lleva a cada estado
export const ACCIONES = {
  ACEPTADO: 'Aceptar',
  EN_PREPARACION: 'Empezar a preparar',
  LISTO: 'Marcar listo',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

const NOMBRES_RESPALDO = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo para recoger',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const nombreEstado = (estados, clave) =>
  estados.find((e) => e.clave === clave)?.nombre ?? NOMBRES_RESPALDO[clave] ?? clave

export const transicionesDe = (estados, clave) =>
  estados.find((e) => e.clave === clave)?.transiciones ?? []

// Clase de color del badge: estado-pendiente, estado-listo…
export const claseEstado = (clave = '') => `estado-${clave.toLowerCase().replace('_', '-')}`

export const totalPiezas = (pedido) => pedido.items.reduce((suma, item) => suma + item.cantidad, 0)
