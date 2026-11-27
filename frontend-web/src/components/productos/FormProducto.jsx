import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal'
import { IconImage } from '../Icons'
import { actualizarProducto, registrarProducto, subirImagenProducto } from '../../services/api'

const vacio = {
  nombre: '',
  descripcion: '',
  categoria: '',
  etiqueta: '',
  monto: '',
  moneda: 'MXN',
  tiempoPreparacionMin: 5,
  destacado: false,
  disponible: true,
  imagenUrl: '',
  stock: 20,
  puntoReorden: 5,
  cantidadReposicion: 20,
}

const desdeProducto = (p) => ({
  nombre: p.nombre,
  descripcion: p.descripcion ?? '',
  categoria: p.categoria ?? '',
  etiqueta: p.etiqueta ?? '',
  monto: String(p.precio.monto),
  moneda: p.precio.moneda,
  tiempoPreparacionMin: p.tiempoPreparacionMin,
  destacado: p.destacado,
  disponible: p.disponible,
  imagenUrl: p.imagenUrl ?? '',
  stock: p.inventario.stock,
  puntoReorden: p.inventario.puntoReorden,
  cantidadReposicion: p.inventario.cantidadReposicion,
})

// Alta o edición de un platillo (solo JEFE). Al editar se mandan solo los campos que cambiaron.
export const FormProducto = ({ producto = null, cafeteriaId, categorias = [], monedas = [], onClose, onGuardado }) => {
  const esNuevo = producto === null
  const [form, setForm] = useState(() => (esNuevo ? vacio : desdeProducto(producto)))
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)

  const set = (campo) => (event) => {
    const { type, checked, value } = event.target
    setForm((f) => ({ ...f, [campo]: type === 'checkbox' ? checked : value }))
  }

  const alElegirImagen = async (event) => {
    const archivo = event.target.files?.[0]
    event.target.value = ''
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    setSubiendo(true)
    setError(null)
    try {
      const url = await subirImagenProducto(cafeteriaId, archivo)
      setForm((f) => ({ ...f, imagenUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const monto = Number(form.monto)
    const tiempo = Number(form.tiempoPreparacionMin)
    if (!form.nombre.trim()) return setError('Escribe el nombre del producto.')
    if (!(monto > 0)) return setError('El precio debe ser mayor a 0.')
    if (!Number.isInteger(tiempo) || tiempo < 1) return setError('El tiempo de preparación debe ser de al menos 1 minuto.')

    setGuardando(true)
    setError(null)
    try {
      let guardado
      if (esNuevo) {
        guardado = await registrarProducto({
          cafeteriaId,
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          categoria: form.categoria.trim() || 'General',
          etiqueta: form.etiqueta.trim(),
          precio: { monto, moneda: form.moneda },
          tiempoPreparacionMin: tiempo,
          destacado: form.destacado,
          disponible: form.disponible,
          imagenUrl: form.imagenUrl || null,
          inventario: {
            stock: Number(form.stock),
            puntoReorden: Number(form.puntoReorden),
            cantidadReposicion: Number(form.cantidadReposicion),
          },
        })
      } else {
        const original = desdeProducto(producto)
        const cambios = {}
        for (const campo of ['nombre', 'descripcion', 'categoria', 'etiqueta', 'imagenUrl']) {
          if (form[campo].trim() !== original[campo]) cambios[campo] = form[campo].trim()
        }
        for (const campo of ['destacado', 'disponible']) {
          if (form[campo] !== original[campo]) cambios[campo] = form[campo]
        }
        if (tiempo !== original.tiempoPreparacionMin) cambios.tiempoPreparacionMin = tiempo
        if (monto !== Number(original.monto) || form.moneda !== original.moneda) {
          cambios.precio = { monto, moneda: form.moneda }
        }
        if (Object.keys(cambios).length === 0) {
          onClose()
          return
        }
        guardado = await actualizarProducto(producto.id, cambios)
      }
      onGuardado(guardado, esNuevo)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  const listaMonedas = monedas.length > 0 ? monedas : [{ codigo: form.moneda, nombre: form.moneda }]

  return (
    <Modal
      titulo={esNuevo ? 'Nuevo producto' : `Editar ${producto.nombre}`}
      onClose={onClose}
      ancho="lg"
      pie={
        <>
          <button type="button" className="boton boton-secundario" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="form-producto" className="boton boton-primario" disabled={guardando || subiendo}>
            {guardando ? 'Guardando…' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="form-producto" className="form-producto" onSubmit={handleSubmit}>
        <div className="form-imagen">
          <div className="imagen-preview">
            {form.imagenUrl ? <img src={form.imagenUrl} alt="" /> : <IconImage size={36} />}
          </div>
          <div className="form-imagen-acciones">
            <label className={`boton boton-secundario${subiendo ? ' is-disabled' : ''}`}>
              {subiendo ? 'Subiendo…' : form.imagenUrl ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={alElegirImagen} disabled={subiendo} hidden />
            </label>
            {form.imagenUrl && (
              <button type="button" className="boton boton-texto" onClick={() => setForm((f) => ({ ...f, imagenUrl: '' }))}>
                Quitar
              </button>
            )}
            <small className="texto-muted">Se guarda en Cloudinary.</small>
          </div>
        </div>

        <div className="form-grid">
          <label className="campo campo-ancho">
            <span className="campo-label">Nombre</span>
            <input className="input" value={form.nombre} onChange={set('nombre')} required maxLength={80} />
          </label>

          <label className="campo campo-ancho">
            <span className="campo-label">Descripción</span>
            <textarea className="input" rows={2} value={form.descripcion} onChange={set('descripcion')} maxLength={300} />
          </label>

          <label className="campo">
            <span className="campo-label">Categoría</span>
            <input className="input" value={form.categoria} onChange={set('categoria')} list="lista-categorias" placeholder="Ej. Bebidas" />
            <datalist id="lista-categorias">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="campo">
            <span className="campo-label">Etiqueta</span>
            <input className="input" value={form.etiqueta} onChange={set('etiqueta')} placeholder="Ej. Nuevo, Vegano" maxLength={30} />
          </label>

          <div className="campo">
            <span className="campo-label">Precio</span>
            <div className="input-grupo">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.monto}
                onChange={set('monto')}
                required
                aria-label="Monto"
              />
              <select className="input" value={form.moneda} onChange={set('moneda')} aria-label="Moneda">
                {listaMonedas.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.codigo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="campo">
            <span className="campo-label">Preparación (min)</span>
            <input className="input" type="number" min="1" step="1" value={form.tiempoPreparacionMin} onChange={set('tiempoPreparacionMin')} required />
          </label>

          {esNuevo && (
            <fieldset className="campo-ancho form-inventario">
              <legend className="campo-label">Inventario inicial</legend>
              <label className="campo">
                <span className="campo-sub">Existencias</span>
                <input className="input" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required />
              </label>
              <label className="campo">
                <span className="campo-sub">Avisar al llegar a</span>
                <input className="input" type="number" min="0" step="1" value={form.puntoReorden} onChange={set('puntoReorden')} required />
              </label>
              <label className="campo">
                <span className="campo-sub">Reponer de a</span>
                <input className="input" type="number" min="1" step="1" value={form.cantidadReposicion} onChange={set('cantidadReposicion')} required />
              </label>
            </fieldset>
          )}

          <label className="check campo-ancho">
            <input type="checkbox" checked={form.disponible} onChange={set('disponible')} />
            <span>
              <strong>Disponible</strong>
              <small>Si lo desactivas, los clientes lo ven como agotado.</small>
            </span>
          </label>

          <label className="check campo-ancho">
            <input type="checkbox" checked={form.destacado} onChange={set('destacado')} />
            <span>
              <strong>Destacado</strong>
              <small>Aparece primero en el menú de la app.</small>
            </span>
          </label>
        </div>

        {error && (
          <div className="alerta alerta-error" role="alert">
            {error}
          </div>
        )}
      </form>
    </Modal>
  )
}

FormProducto.propTypes = {
  producto: PropTypes.object,
  cafeteriaId: PropTypes.string.isRequired,
  categorias: PropTypes.arrayOf(PropTypes.string),
  monedas: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onGuardado: PropTypes.func.isRequired,
}

export default FormProducto
