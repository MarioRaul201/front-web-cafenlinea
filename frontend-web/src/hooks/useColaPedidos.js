import { useCallback, useEffect, useRef, useState } from 'react'
import { getColaCafeteria } from '../services/api'

// El backend no tiene subscriptions: se consulta la cola cada pocos segundos
export const INTERVALO_MS = 10000

// Suena un "ding" corto con Web Audio (sin archivos). Si el navegador lo bloquea, no pasa nada.
const sonarAviso = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const tono = (frecuencia, inicio) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = frecuencia
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + inicio)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + inicio + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + inicio)
      osc.stop(ctx.currentTime + inicio + 0.4)
    }
    tono(880, 0)
    tono(1320, 0.15)
    setTimeout(() => ctx.close(), 800)
  } catch {
    // Sin audio disponible
  }
}

// Cola de pedidos activos de una cafetería, con detección de pedidos que acaban de llegar
export const useColaPedidos = (cafeteriaId, { sonido = true } = {}) => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [actualizadoEn, setActualizadoEn] = useState(null)
  const [nuevos, setNuevos] = useState(() => new Set())

  // Ids ya vistos; en la primera carga todo cuenta como visto
  const vistosRef = useRef(null)
  const sonidoRef = useRef(sonido)
  sonidoRef.current = sonido

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!cafeteriaId) return
      if (!silencioso) setCargando(true)
      try {
        const lista = await getColaCafeteria(cafeteriaId)
        setPedidos(lista)
        setError(null)
        setActualizadoEn(Date.now())

        if (vistosRef.current === null) {
          vistosRef.current = new Set(lista.map((p) => p.id))
        } else {
          const llegados = lista.filter((p) => !vistosRef.current.has(p.id))
          llegados.forEach((p) => vistosRef.current.add(p.id))
          if (llegados.length > 0) {
            setNuevos((actual) => new Set([...actual, ...llegados.map((p) => p.id)]))
            if (sonidoRef.current) sonarAviso()
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        if (!silencioso) setCargando(false)
      }
    },
    [cafeteriaId],
  )

  // Al cambiar de cafetería se empieza de cero
  useEffect(() => {
    vistosRef.current = null
    setPedidos([])
    setNuevos(new Set())
    setError(null)
    setActualizadoEn(null)
    if (!cafeteriaId) return undefined

    cargar()
    const id = setInterval(() => cargar({ silencioso: true }), INTERVALO_MS)
    return () => clearInterval(id)
  }, [cafeteriaId, cargar])

  // Un pedido "nuevo" deja de serlo cuando el vendedor lo abre o lo atiende
  const marcarVisto = useCallback((pedidoId) => {
    setNuevos((actual) => {
      if (!actual.has(pedidoId)) return actual
      const siguiente = new Set(actual)
      siguiente.delete(pedidoId)
      return siguiente
    })
  }, [])

  const marcarTodosVistos = useCallback(() => setNuevos(new Set()), [])

  // Aplica en pantalla la respuesta de una mutación sin esperar al siguiente sondeo
  const reemplazarPedido = useCallback((pedido) => {
    const activo = ['PENDIENTE', 'ACEPTADO', 'EN_PREPARACION', 'LISTO'].includes(pedido.estado)
    setPedidos((actual) =>
      activo
        ? actual.map((p) => (p.id === pedido.id ? pedido : p))
        : actual.filter((p) => p.id !== pedido.id),
    )
  }, [])

  // Solo cuentan los que siguen pendientes
  const nuevosPendientes = pedidos.filter((p) => nuevos.has(p.id)).length

  return {
    pedidos,
    cargando,
    error,
    actualizadoEn,
    nuevos,
    nuevosPendientes,
    recargar: cargar,
    marcarVisto,
    marcarTodosVistos,
    reemplazarPedido,
  }
}

export default useColaPedidos
