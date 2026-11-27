import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import { IconMapPin, IconPlus, IconStore } from '../Icons'
import { getEscuelas, registrarCafeteria } from '../../services/api'

const OTRA = '__otra__'

const ESTADO_NEGOCIO = {
  APROBADO: { texto: 'Aprobado', clase: 'estado-entregado' },
  EN_REVISION: { texto: 'En revisión', clase: 'estado-pendiente' },
  RECHAZADO: { texto: 'Rechazado', clase: 'estado-cancelado' },
}

// Alta de una cafetería del negocio. La escuela se elige del catálogo o se escribe a mano.
const FormCafeteria = ({ onClose, onRegistrada }) => {
  const [escuelas, setEscuelas] = useState([])
  const [form, setForm] = useState({ nombre: '', ubicacion: '', escuelaId: '', nombreEscuela: '', ciudadEscuela: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getEscuelas()
      .then((lista) => {
        setEscuelas(lista)
        setForm((f) => ({ ...f, escuelaId: f.escuelaId || lista[0]?.id || OTRA }))
      })
      .catch((err) => setError(`No se pudo cargar el catálogo de escuelas: ${err.message}`))
  }, [])

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const esOtra = form.escuelaId === OTRA

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre.trim()) return setError('Escribe el nombre de la cafetería.')
    if (esOtra && (!form.nombreEscuela.trim() || !form.ciudadEscuela.trim())) {
      return setError('Escribe el nombre y la ciudad de la escuela.')
    }
    setGuardando(true)
    setError(null)
    try {
      const nueva = await registrarCafeteria({
        nombre: form.nombre.trim(),
        ubicacion: form.ubicacion.trim(),
        ...(esOtra
          ? { nombreEscuela: form.nombreEscuela.trim(), ciudadEscuela: form.ciudadEscuela.trim() }
          : { escuelaId: form.escuelaId }),
      })
      onRegistrada(nueva)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo="Registrar cafetería"
      onClose={onClose}
      pie={
        <>
          <button type="button" className="boton boton-secundario" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="form-cafeteria" className="boton boton-primario" disabled={guardando}>
            {guardando ? 'Registrando…' : 'Registrar'}
          </button>
        </>
      }
    >
      <form id="form-cafeteria" className="form-grid" onSubmit={handleSubmit}>
        <label className="campo campo-ancho">
          <span className="campo-label">Nombre de la cafetería</span>
          <input className="input" value={form.nombre} onChange={set('nombre')} required autoFocus placeholder="Ej. Latosos Biblioteca" />
        </label>

        <label className="campo campo-ancho">
          <span className="campo-label">Ubicación en el campus</span>
          <input className="input" value={form.ubicacion} onChange={set('ubicacion')} placeholder="Ej. Edificio B, planta baja" />
        </label>

        <label className="campo campo-ancho">
          <span className="campo-label">Escuela</span>
          <select className="input" value={form.escuelaId} onChange={set('escuelaId')}>
            {escuelas.length === 0 && <option value="">Cargando…</option>}
            {escuelas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} · {e.ciudad}
              </option>
            ))}
            <option value={OTRA}>Otra escuela (no está en la lista)</option>
          </select>
        </label>

        {esOtra && (
          <>
            <label className="campo">
              <span className="campo-label">Nombre de la escuela</span>
              <input className="input" value={form.nombreEscuela} onChange={set('nombreEscuela')} required />
            </label>
            <label className="campo">
              <span className="campo-label">Ciudad</span>
              <input className="input" value={form.ciudadEscuela} onChange={set('ciudadEscuela')} required />
            </label>
          </>
        )}

        {error && (
          <div className="alerta alerta-error campo-ancho" role="alert">
            {error}
          </div>
        )}
      </form>
    </Modal>
  )
}

FormCafeteria.propTypes = {
  onClose: PropTypes.func.isRequired,
  onRegistrada: PropTypes.func.isRequired,
}

export const Cafeterias = ({ negocio, cafeteriaId, onSelectCafeteria, onRegistrada }) => {
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState(null)
  const cafeterias = negocio?.cafeterias ?? []
  const estado = ESTADO_NEGOCIO[negocio?.estado] ?? null

  const alRegistrar = async (nueva) => {
    setAbierto(false)
    await onRegistrada(nueva)
    setAviso(
      nueva.activa
        ? `“${nueva.nombre}” ya está registrada y visible en la app.`
        : `“${nueva.nombre}” quedó registrada. Los clientes la verán cuando se apruebe tu negocio.`,
    )
  }

  return (
    <section className="vista" aria-labelledby="titulo-cafeterias">
      <div className="vista-header">
        <div>
          <h1 id="titulo-cafeterias" className="vista-titulo">
            Cafeterías
          </h1>
          <p className="vista-sub">
            {negocio?.nombre}
            {estado && <span className={`estado-badge ${estado.clase}`}>{estado.texto}</span>}
          </p>
        </div>
        <div className="vista-acciones">
          <button type="button" className="boton boton-primario" onClick={() => setAbierto(true)}>
            <IconPlus size={17} /> Registrar cafetería
          </button>
        </div>
      </div>

      {negocio?.estado === 'EN_REVISION' && (
        <div className="alerta alerta-info">
          Tu negocio está en revisión. Puedes preparar el menú, pero los clientes no verán tus cafeterías
          hasta que la plataforma lo apruebe.
        </div>
      )}
      {negocio?.estado === 'RECHAZADO' && (
        <div className="alerta alerta-error">
          Tu negocio fue rechazado{negocio.motivoRechazo ? `: ${negocio.motivoRechazo}` : '.'}
        </div>
      )}
      {aviso && (
        <div className="alerta alerta-ok" role="status">
          {aviso}
        </div>
      )}

      {cafeterias.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Aún no tienes cafeterías</p>
          <p className="empty-text">Registra la primera para empezar a recibir pedidos.</p>
        </div>
      ) : (
        <ul className="grid-cafeterias">
          {cafeterias.map((cafe) => {
            const actual = cafe.id === cafeteriaId
            return (
              <li key={cafe.id} className={`cafeteria-card${actual ? ' is-actual' : ''}`}>
                <div className="cafeteria-card-icono">
                  <IconStore size={22} />
                </div>
                <div className="cafeteria-card-info">
                  <strong>{cafe.nombre}</strong>
                  <span className="texto-muted">
                    {cafe.escuela?.nombre}
                    {cafe.escuela?.ciudad && ` · ${cafe.escuela.ciudad}`}
                  </span>
                  {cafe.ubicacion && (
                    <span className="con-icono texto-muted">
                      <IconMapPin size={14} /> {cafe.ubicacion}
                    </span>
                  )}
                  <span className={`estado-badge ${cafe.activa ? 'estado-entregado' : 'estado-cancelado'}`}>
                    {cafe.activa ? 'Visible en la app' : 'Oculta'}
                  </span>
                </div>
                <div className="cafeteria-card-acciones">
                  {actual ? (
                    <span className="chip">Seleccionada</span>
                  ) : (
                    <button type="button" className="boton boton-secundario" onClick={() => onSelectCafeteria(cafe.id, 'pedidos')}>
                      Ver pedidos
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {abierto && <FormCafeteria onClose={() => setAbierto(false)} onRegistrada={alRegistrar} />}
    </section>
  )
}

Cafeterias.propTypes = {
  negocio: PropTypes.shape({
    nombre: PropTypes.string,
    estado: PropTypes.string,
    motivoRechazo: PropTypes.string,
    cafeterias: PropTypes.arrayOf(PropTypes.object),
  }),
  cafeteriaId: PropTypes.string,
  onSelectCafeteria: PropTypes.func.isRequired,
  onRegistrada: PropTypes.func.isRequired,
}

export default Cafeterias
