import PropTypes from 'prop-types'
import Modal from '../Modal'
import AccionesPedido from './AccionesPedido'
import { IconNote } from '../Icons'
import { claseEstado, nombreEstado, totalPiezas } from '../../utils/estados'
import { folio, formatFechaHora, formatHora, formatPrice } from '../../utils/formato'

// Quién hizo cada cambio de estado
const autorCambio = (cambio, pedido, usuarioActualId) => {
  if (!cambio.usuarioId) return null
  if (cambio.usuarioId === usuarioActualId) return 'Tú'
  if (cambio.usuarioId === pedido.usuarioId) return 'Cliente'
  return `Personal ${cambio.usuarioId.slice(-4).toUpperCase()}`
}

// Panel lateral con la compra completa del cliente y la bitácora del pedido
export const DetallePedido = ({ pedido, estados, usuarioActualId, onClose, onActualizado }) => {
  const piezas = totalPiezas(pedido)

  return (
    <Modal
      variante="drawer"
      titulo={`Pedido ${folio(pedido.id)}`}
      subtitulo={
        <span className={`estado-badge ${claseEstado(pedido.estado)}`}>
          {nombreEstado(estados, pedido.estado)}
        </span>
      }
      onClose={onClose}
      pie={<AccionesPedido pedido={pedido} estados={estados} onActualizado={onActualizado} />}
    >
      <dl className="detalle-datos">
        <div>
          <dt>Pedido a las</dt>
          <dd>{formatFechaHora(pedido.creadoEn)}</dd>
        </div>
        <div>
          <dt>Recoge a las</dt>
          <dd>{formatHora(pedido.horaRecogida)}</dd>
        </div>
        {pedido.posicionEnCola != null && (
          <div>
            <dt>Lugar en la cola</dt>
            <dd>{pedido.posicionEnCola}°</dd>
          </div>
        )}
        <div>
          <dt>Cliente</dt>
          <dd className="mono">{pedido.usuarioId.slice(-6).toUpperCase()}</dd>
        </div>
      </dl>

      <section className="detalle-seccion">
        <h3 className="detalle-titulo">
          Compra · {piezas} {piezas === 1 ? 'pieza' : 'piezas'}
        </h3>
        <table className="tabla tabla-compra">
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col" className="num">
                Cant.
              </th>
              <th scope="col" className="num">
                Precio
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item, i) => (
              <tr key={`${item.productoId}-${i}`}>
                <td>{item.nombreProducto}</td>
                <td className="num">{item.cantidad}</td>
                <td className="num">{formatPrice(item.precioUnitario.monto, item.precioUnitario.moneda)}</td>
                <td className="num">
                  {formatPrice(item.precioUnitario.monto * item.cantidad, item.precioUnitario.moneda)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3}>
                Total
              </th>
              <td className="num">
                <strong>{formatPrice(pedido.total.monto, pedido.total.moneda)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="detalle-seccion">
        <h3 className="detalle-titulo">Notas del cliente</h3>
        {pedido.notas?.trim() ? (
          <p className="pedido-notas pedido-notas-grande">
            <IconNote size={16} />
            <span>{pedido.notas}</span>
          </p>
        ) : (
          <p className="texto-muted">Sin notas.</p>
        )}
      </section>

      <section className="detalle-seccion">
        <h3 className="detalle-titulo">Historial</h3>
        <ol className="timeline">
          {pedido.historial.map((cambio, i) => {
            const autor = autorCambio(cambio, pedido, usuarioActualId)
            return (
              <li key={`${cambio.estado}-${i}`} className={claseEstado(cambio.estado)}>
                <span className="timeline-punto" aria-hidden="true" />
                <div>
                  <strong>{nombreEstado(estados, cambio.estado)}</strong>
                  <span className="texto-muted">
                    {formatFechaHora(cambio.fecha)}
                    {autor && ` · ${autor}`}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </Modal>
  )
}

DetallePedido.propTypes = {
  pedido: PropTypes.shape({
    id: PropTypes.string.isRequired,
    usuarioId: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    total: PropTypes.object.isRequired,
    historial: PropTypes.arrayOf(PropTypes.object).isRequired,
    notas: PropTypes.string,
    horaRecogida: PropTypes.string,
    creadoEn: PropTypes.string,
    posicionEnCola: PropTypes.number,
  }).isRequired,
  estados: PropTypes.arrayOf(PropTypes.object).isRequired,
  usuarioActualId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onActualizado: PropTypes.func.isRequired,
}

export default DetallePedido
