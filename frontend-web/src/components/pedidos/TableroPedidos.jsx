import { useState } from 'react'
import PropTypes from 'prop-types'
import TarjetaPedido from './TarjetaPedido'
import DetallePedido from './DetallePedido'
import { IconBell, IconRefresh } from '../Icons'
import useAhora from '../../hooks/useAhora'
import { COLUMNAS } from '../../utils/estados'
import { formatHora } from '../../utils/formato'

const SkeletonPedido = () => (
  <div className="pedido-card is-skeleton" aria-hidden="true">
    <span className="skeleton skeleton-line w-25" />
    <span className="skeleton skeleton-line w-75" />
    <span className="skeleton skeleton-line w-100" />
    <span className="skeleton skeleton-line w-50" />
  </div>
)

export const TableroPedidos = ({ cola, estados, cafeteria, usuarioId, sonido, onToggleSonido }) => {
  const ahora = useAhora(20000)
  const [seleccionado, setSeleccionado] = useState(null)
  const { pedidos, cargando, error, actualizadoEn, nuevos, nuevosPendientes } = cola

  // El detalle muestra la versión más reciente que trae el sondeo
  const pedidoAbierto = seleccionado
    ? pedidos.find((p) => p.id === seleccionado.id) ?? seleccionado
    : null

  const abrir = (pedido) => {
    cola.marcarVisto(pedido.id)
    setSeleccionado(pedido)
  }

  const alActualizar = (pedido) => {
    cola.marcarVisto(pedido.id)
    cola.reemplazarPedido(pedido)
    setSeleccionado((actual) => (actual?.id === pedido.id ? pedido : actual))
  }

  const porEstado = (clave) => pedidos.filter((p) => p.estado === clave)
  const cargaInicial = cargando && actualizadoEn === null

  return (
    <section className="vista" aria-labelledby="titulo-pedidos">
      <div className="vista-header">
        <div>
          <h1 id="titulo-pedidos" className="vista-titulo">
            Pedidos
          </h1>
          <p className="vista-sub">
            {cafeteria?.nombre}
            {actualizadoEn && (
              <span className="en-vivo">
                <span className="en-vivo-punto" aria-hidden="true" /> En vivo · {formatHora(new Date(actualizadoEn).toISOString())}
              </span>
            )}
          </p>
        </div>
        <div className="vista-acciones">
          {nuevosPendientes > 0 && (
            <button type="button" className="boton boton-secundario" onClick={cola.marcarTodosVistos}>
              Marcar {nuevosPendientes} como vistos
            </button>
          )}
          <button
            type="button"
            className={`icon-btn${sonido ? ' is-on' : ''}`}
            onClick={onToggleSonido}
            aria-pressed={sonido}
            aria-label={sonido ? 'Silenciar aviso de pedidos nuevos' : 'Activar sonido de pedidos nuevos'}
            title={sonido ? 'Sonido activado' : 'Sonido desactivado'}
          >
            <IconBell size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => cola.recargar()}
            aria-label="Actualizar ahora"
            title="Actualizar ahora"
            disabled={cargando}
          >
            <IconRefresh size={18} className={cargando ? 'girando' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alerta alerta-error" role="alert">
          No se pudo actualizar la cola: {error}. Se vuelve a intentar en unos segundos.
        </div>
      )}

      <div className="tablero">
        {COLUMNAS.map((col) => {
          const lista = porEstado(col.clave)
          return (
            <section key={col.clave} className={`columna columna-${col.clave.toLowerCase()}`} aria-label={col.titulo}>
              <header className="columna-header">
                <h2>{col.titulo}</h2>
                <span className="columna-count">{cargaInicial ? '–' : lista.length}</span>
                <small>{col.ayuda}</small>
              </header>
              <div className="columna-body">
                {cargaInicial ? (
                  <>
                    <SkeletonPedido />
                    <SkeletonPedido />
                  </>
                ) : lista.length === 0 ? (
                  <p className="columna-vacia">Sin pedidos</p>
                ) : (
                  lista.map((pedido) => (
                    <TarjetaPedido
                      key={pedido.id}
                      pedido={pedido}
                      estados={estados}
                      ahora={ahora}
                      esNuevo={nuevos.has(pedido.id)}
                      onAbrir={abrir}
                      onActualizado={alActualizar}
                    />
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>

      {pedidoAbierto && (
        <DetallePedido
          pedido={pedidoAbierto}
          estados={estados}
          usuarioActualId={usuarioId}
          onClose={() => setSeleccionado(null)}
          onActualizado={alActualizar}
        />
      )}
    </section>
  )
}

TableroPedidos.propTypes = {
  cola: PropTypes.shape({
    pedidos: PropTypes.array.isRequired,
    cargando: PropTypes.bool,
    error: PropTypes.string,
    actualizadoEn: PropTypes.number,
    nuevos: PropTypes.instanceOf(Set).isRequired,
    nuevosPendientes: PropTypes.number,
    recargar: PropTypes.func.isRequired,
    marcarVisto: PropTypes.func.isRequired,
    marcarTodosVistos: PropTypes.func.isRequired,
    reemplazarPedido: PropTypes.func.isRequired,
  }).isRequired,
  estados: PropTypes.arrayOf(PropTypes.object).isRequired,
  cafeteria: PropTypes.shape({ nombre: PropTypes.string }),
  usuarioId: PropTypes.string,
  sonido: PropTypes.bool,
  onToggleSonido: PropTypes.func,
}

export default TableroPedidos
