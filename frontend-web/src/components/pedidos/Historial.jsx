import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import DetallePedido from './DetallePedido'
import { IconRefresh, IconSearch } from '../Icons'
import { getPedidosCafeteria } from '../../services/api'
import { ESTADOS_ACTIVOS, claseEstado, nombreEstado, totalPiezas } from '../../utils/estados'
import { esHoy, folio, formatFechaHora, formatPrice } from '../../utils/formato'

const FILTROS_ESTADO = [
  { id: 'todos', label: 'Todos' },
  { id: 'ENTREGADO', label: 'Entregados' },
  { id: 'CANCELADO', label: 'Cancelados' },
  { id: 'activos', label: 'En curso' },
]

const FILTROS_FECHA = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'todo', label: 'Todo' },
]

const DIA_MS = 24 * 60 * 60 * 1000

const dentroDeFecha = (pedido, filtro) => {
  if (filtro === 'todo') return true
  if (filtro === 'hoy') return esHoy(pedido.creadoEn)
  const dias = filtro === '7d' ? 7 : 30
  const fecha = new Date(pedido.creadoEn).getTime()
  return Date.now() - fecha <= dias * DIA_MS
}

// Suma por moneda, para no mezclar MXN con USD
const sumarPorMoneda = (pedidos) =>
  pedidos.reduce((acc, p) => {
    acc[p.total.moneda] = (acc[p.total.moneda] ?? 0) + p.total.monto
    return acc
  }, {})

export const Historial = ({ cafeteriaId, estados, usuarioId }) => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('hoy')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setPedidos(await getPedidosCafeteria(cafeteriaId))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [cafeteriaId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const enRango = useMemo(
    () => pedidos.filter((p) => dentroDeFecha(p, filtroFecha)),
    [pedidos, filtroFecha],
  )

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase().replace(/^#/, '')
    return enRango.filter((p) => {
      const okEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' ? ESTADOS_ACTIVOS.includes(p.estado) : p.estado === filtroEstado)
      const okTexto =
        texto.length === 0 ||
        p.id.toLowerCase().endsWith(texto) ||
        p.items.some((i) => i.nombreProducto.toLowerCase().includes(texto)) ||
        p.notas?.toLowerCase().includes(texto)
      return okEstado && okTexto
    })
  }, [enRango, filtroEstado, busqueda])

  const entregados = enRango.filter((p) => p.estado === 'ENTREGADO')
  const cancelados = enRango.filter((p) => p.estado === 'CANCELADO')
  const ingresos = Object.entries(sumarPorMoneda(entregados))

  const alActualizar = (pedido) => {
    setPedidos((actual) => actual.map((p) => (p.id === pedido.id ? pedido : p)))
    setSeleccionado(pedido)
  }

  return (
    <section className="vista" aria-labelledby="titulo-historial">
      <div className="vista-header">
        <div>
          <h1 id="titulo-historial" className="vista-titulo">
            Historial
          </h1>
          <p className="vista-sub">Todos los pedidos de la cafetería.</p>
        </div>
        <div className="vista-acciones">
          <button type="button" className="icon-btn" onClick={cargar} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
            <IconRefresh size={18} className={cargando ? 'girando' : ''} />
          </button>
        </div>
      </div>

      <ul className="stats">
        <li>
          <span>Pedidos</span>
          <strong>{enRango.length}</strong>
        </li>
        <li>
          <span>Entregados</span>
          <strong>{entregados.length}</strong>
        </li>
        <li>
          <span>Cancelados</span>
          <strong>{cancelados.length}</strong>
        </li>
        <li>
          <span>Ventas entregadas</span>
          <strong>
            {ingresos.length === 0
              ? formatPrice(0)
              : ingresos.map(([moneda, monto]) => formatPrice(monto, moneda)).join(' · ')}
          </strong>
        </li>
      </ul>

      <div className="filtros">
        <div className="segmentado" role="group" aria-label="Periodo">
          {FILTROS_FECHA.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filtroFecha === f.id ? 'active' : ''}
              aria-pressed={filtroFecha === f.id}
              onClick={() => setFiltroFecha(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="segmentado" role="group" aria-label="Estado">
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filtroEstado === f.id ? 'active' : ''}
              aria-pressed={filtroEstado === f.id}
              onClick={() => setFiltroEstado(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="buscador">
          <IconSearch size={17} className="buscador-icono" />
          <input
            type="search"
            className="input"
            placeholder="Folio, producto o nota…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar pedidos"
          />
        </div>
      </div>

      {error ? (
        <div className="empty-state is-error" role="alert">
          <p className="empty-title">No se pudo cargar el historial</p>
          <p className="empty-text">{error}</p>
          <button type="button" className="boton boton-secundario" onClick={cargar}>
            Reintentar
          </button>
        </div>
      ) : cargando && pedidos.length === 0 ? (
        <div className="tarjeta">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="skeleton skeleton-line w-100 skeleton-fila" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Sin pedidos</p>
          <p className="empty-text">No hay pedidos con estos filtros.</p>
        </div>
      ) : (
        <div className="tarjeta tabla-scroll">
          <table className="tabla tabla-historial">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Fecha</th>
                <th scope="col">Compra</th>
                <th scope="col">Estado</th>
                <th scope="col" className="num">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const piezas = totalPiezas(p)
                return (
                  <tr key={p.id} onClick={() => setSeleccionado(p)} className="fila-click">
                    <td>
                      <button type="button" className="link-fila" onClick={() => setSeleccionado(p)}>
                        {folio(p.id)}
                      </button>
                    </td>
                    <td className="nowrap">{formatFechaHora(p.creadoEn)}</td>
                    <td className="celda-compra">
                      <span className="texto-muted">
                        {piezas} {piezas === 1 ? 'pieza' : 'piezas'}:
                      </span>{' '}
                      {p.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(', ')}
                    </td>
                    <td>
                      <span className={`estado-badge ${claseEstado(p.estado)}`}>
                        {nombreEstado(estados, p.estado)}
                      </span>
                    </td>
                    <td className="num nowrap">{formatPrice(p.total.monto, p.total.moneda)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {seleccionado && (
        <DetallePedido
          pedido={seleccionado}
          estados={estados}
          usuarioActualId={usuarioId}
          onClose={() => setSeleccionado(null)}
          onActualizado={alActualizar}
        />
      )}
    </section>
  )
}

Historial.propTypes = {
  cafeteriaId: PropTypes.string.isRequired,
  estados: PropTypes.arrayOf(PropTypes.object).isRequired,
  usuarioId: PropTypes.string,
}

export default Historial
