import PropTypes from 'prop-types'
import AccionesPedido from './AccionesPedido'
import { IconClock, IconNote } from '../Icons'
import { formatHora, formatPrice, folio, haceCuanto, minutosHasta } from '../../utils/formato'
import { totalPiezas } from '../../utils/estados'

// "en 8 min", "ahora", "5 min tarde"
const cuentaRegresiva = (pedido, ahora) => {
  const min = minutosHasta(pedido.horaRecogida, ahora)
  if (min === null) return null
  if (pedido.estado === 'LISTO') return { texto: 'Listo', tono: 'ok' }
  if (min > 1) return { texto: `en ${min} min`, tono: min <= 5 ? 'pronto' : 'normal' }
  if (min >= -1) return { texto: 'ahora', tono: 'pronto' }
  return { texto: `${-min} min tarde`, tono: 'tarde' }
}

export const TarjetaPedido = ({ pedido, estados, ahora, esNuevo = false, onAbrir, onActualizado }) => {
  const cuenta = cuentaRegresiva(pedido, ahora)
  const piezas = totalPiezas(pedido)

  return (
    <article className={`pedido-card${esNuevo ? ' is-nuevo' : ''}`}>
      <button type="button" className="pedido-card-main" onClick={() => onAbrir(pedido)}>
        <div className="pedido-card-top">
          <span className="pedido-folio">{folio(pedido.id)}</span>
          {esNuevo && <span className="chip chip-nuevo">Nuevo</span>}
          <span className="pedido-hace">{haceCuanto(pedido.creadoEn, ahora)}</span>
        </div>

        <div className="pedido-recogida">
          <IconClock size={15} />
          <span>Recoge {formatHora(pedido.horaRecogida)}</span>
          {cuenta && <span className={`cuenta cuenta-${cuenta.tono}`}>{cuenta.texto}</span>}
        </div>

        <ul className="pedido-items">
          {pedido.items.map((item, i) => (
            <li key={`${item.productoId}-${i}`}>
              <span className="pedido-cantidad">{item.cantidad}×</span>
              <span className="pedido-producto">{item.nombreProducto}</span>
            </li>
          ))}
        </ul>

        {pedido.notas?.trim() && (
          <p className="pedido-notas">
            <IconNote size={14} />
            <span>{pedido.notas}</span>
          </p>
        )}

        <div className="pedido-card-foot">
          <span className="texto-muted">
            {piezas} {piezas === 1 ? 'pieza' : 'piezas'}
          </span>
          <strong>{formatPrice(pedido.total.monto, pedido.total.moneda)}</strong>
        </div>
      </button>

      <div className="pedido-card-acciones">
        <AccionesPedido pedido={pedido} estados={estados} onActualizado={onActualizado} compacto />
      </div>
    </article>
  )
}

TarjetaPedido.propTypes = {
  pedido: PropTypes.shape({
    id: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    total: PropTypes.shape({ monto: PropTypes.number, moneda: PropTypes.string }).isRequired,
    notas: PropTypes.string,
    horaRecogida: PropTypes.string,
    creadoEn: PropTypes.string,
  }).isRequired,
  estados: PropTypes.arrayOf(PropTypes.object).isRequired,
  ahora: PropTypes.number.isRequired,
  esNuevo: PropTypes.bool,
  onAbrir: PropTypes.func.isRequired,
  onActualizado: PropTypes.func.isRequired,
}

export default TarjetaPedido
