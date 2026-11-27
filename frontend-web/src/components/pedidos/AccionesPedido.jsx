import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import { actualizarEstadoPedido } from '../../services/api'
import { ACCIONES, transicionesDe } from '../../utils/estados'
import { folio } from '../../utils/formato'

// Botones para avanzar un pedido según las transiciones del catálogo de estados.
// ENTREGADO pide el código de recogida del cliente; CANCELADO pide confirmación.
export const AccionesPedido = ({ pedido, estados, onActualizado, compacto = false }) => {
  const [enviando, setEnviando] = useState(null)
  const [error, setError] = useState(null)
  const [dialogo, setDialogo] = useState(null) // 'entregar' | 'cancelar' | null
  const [codigo, setCodigo] = useState('')

  const transiciones = transicionesDe(estados, pedido.estado)
  if (transiciones.length === 0) return null

  const avanzar = async (nuevoEstado, codigoRecogida = null) => {
    setEnviando(nuevoEstado)
    setError(null)
    try {
      const actualizado = await actualizarEstadoPedido(pedido.id, nuevoEstado, codigoRecogida)
      setDialogo(null)
      setCodigo('')
      onActualizado(actualizado)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(null)
    }
  }

  const alPulsar = (estado) => {
    setError(null)
    if (estado === 'ENTREGADO') setDialogo('entregar')
    else if (estado === 'CANCELADO') setDialogo('cancelar')
    else avanzar(estado)
  }

  const cerrar = () => {
    setDialogo(null)
    setCodigo('')
    setError(null)
  }

  const principales = transiciones.filter((t) => t !== 'CANCELADO')
  const puedeCancelar = transiciones.includes('CANCELADO')

  return (
    <>
      <div className={`acciones${compacto ? ' acciones-compactas' : ''}`}>
        {principales.map((estado) => (
          <button
            key={estado}
            type="button"
            className="boton boton-primario"
            onClick={() => alPulsar(estado)}
            disabled={enviando !== null}
          >
            {enviando === estado ? 'Guardando…' : ACCIONES[estado] ?? estado}
          </button>
        ))}
        {puedeCancelar && (
          <button
            type="button"
            className="boton boton-peligro-suave"
            onClick={() => alPulsar('CANCELADO')}
            disabled={enviando !== null}
          >
            {ACCIONES.CANCELADO}
          </button>
        )}
      </div>
      {error && !dialogo && (
        <p className="texto-error" role="alert">
          {error}
        </p>
      )}

      {dialogo === 'entregar' && (
        <Modal
          titulo={`Entregar pedido ${folio(pedido.id)}`}
          onClose={cerrar}
          ancho="sm"
          pie={
            <>
              <button type="button" className="boton boton-secundario" onClick={cerrar}>
                Volver
              </button>
              <button
                type="submit"
                form={`entrega-${pedido.id}`}
                className="boton boton-primario"
                disabled={enviando !== null || codigo.trim().length === 0}
              >
                {enviando ? 'Verificando…' : 'Confirmar entrega'}
              </button>
            </>
          }
        >
          <form
            id={`entrega-${pedido.id}`}
            onSubmit={(e) => {
              e.preventDefault()
              avanzar('ENTREGADO', codigo.trim())
            }}
          >
            <p className="texto-muted">
              Pide al cliente el código de recogida que le aparece en la app y escríbelo aquí.
            </p>
            <label className="campo">
              <span className="campo-label">Código de recogida</span>
              <input
                className="input input-codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                autoFocus
                autoComplete="off"
                inputMode="text"
                placeholder="Ej. 4F7K"
              />
            </label>
            {error && (
              <div className="alerta alerta-error" role="alert">
                {error}
              </div>
            )}
          </form>
        </Modal>
      )}

      {dialogo === 'cancelar' && (
        <Modal
          titulo={`¿Cancelar el pedido ${folio(pedido.id)}?`}
          onClose={cerrar}
          ancho="sm"
          pie={
            <>
              <button type="button" className="boton boton-secundario" onClick={cerrar}>
                No, volver
              </button>
              <button
                type="button"
                className="boton boton-peligro"
                onClick={() => avanzar('CANCELADO')}
                disabled={enviando !== null}
              >
                {enviando ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
            </>
          }
        >
          <p className="texto-muted">
            El cliente verá su pedido como cancelado y las existencias de los productos se regresan al
            inventario. No se puede deshacer.
          </p>
          {error && (
            <div className="alerta alerta-error" role="alert">
              {error}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}

AccionesPedido.propTypes = {
  pedido: PropTypes.shape({
    id: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
  }).isRequired,
  estados: PropTypes.arrayOf(PropTypes.object).isRequired,
  onActualizado: PropTypes.func.isRequired,
  compacto: PropTypes.bool,
}

export default AccionesPedido
