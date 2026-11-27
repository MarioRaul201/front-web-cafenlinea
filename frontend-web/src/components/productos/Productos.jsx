import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import FormProducto from './FormProducto'
import { IconAlert, IconClock, IconEdit, IconPlus, IconRefresh, IconSearch } from '../Icons'
import { iconForCategory, toneForCategory } from '../categoryIcons'
import { cambiarDisponibilidad, getMonedas, getProductos, reponerInventario } from '../../services/api'
import { formatPrice } from '../../utils/formato'

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'agotados', label: 'Agotados' },
  { id: 'reponer', label: 'Por reponer' },
]

// Fila de un producto: disponibilidad y existencias para todos; editar solo el jefe
const FilaProducto = ({ producto, puedeEditar, onCambio, onEditar }) => {
  const [ocupado, setOcupado] = useState(null)
  const [error, setError] = useState(null)
  const Icon = iconForCategory(producto.categoria)
  const { inventario } = producto

  const ejecutar = async (accion, fn) => {
    setOcupado(accion)
    setError(null)
    try {
      onCambio(await fn())
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(null)
    }
  }

  return (
    <li className={`producto-fila${producto.agotado ? ' is-agotado' : ''}`}>
      <div className={`producto-thumb tone-${toneForCategory(producto.categoria)}`}>
        {producto.imagenUrl ? <img src={producto.imagenUrl} alt="" loading="lazy" /> : <Icon size={24} />}
      </div>

      <div className="producto-info">
        <div className="producto-nombre">
          <strong>{producto.nombre}</strong>
          {producto.destacado && <span className="chip">Destacado</span>}
          {producto.etiqueta && <span className="chip chip-suave">{producto.etiqueta}</span>}
        </div>
        <div className="producto-meta">
          <span>{producto.categoria}</span>
          <span>{formatPrice(producto.precio.monto, producto.precio.moneda)}</span>
          <span className="con-icono">
            <IconClock size={13} /> {producto.tiempoPreparacionMin} min
          </span>
        </div>
        {error && <p className="texto-error">{error}</p>}
      </div>

      <div className={`producto-stock${inventario.requiereReposicion ? ' is-bajo' : ''}`}>
        <span className="stock-num">
          {inventario.requiereReposicion && <IconAlert size={14} />}
          {inventario.stock}
        </span>
        <small>existencias</small>
        <button
          type="button"
          className="boton boton-texto boton-mini"
          onClick={() => ejecutar('reponer', () => reponerInventario(producto.id))}
          disabled={ocupado !== null}
          title={`Sumar ${inventario.cantidadReposicion} unidades`}
        >
          {ocupado === 'reponer' ? '…' : `+${inventario.cantidadReposicion}`}
        </button>
      </div>

      <div className="producto-acciones">
        <label className="switch" title={producto.disponible ? 'Pausar (agotado)' : 'Volver a vender'}>
          <input
            type="checkbox"
            checked={producto.disponible}
            disabled={ocupado !== null}
            onChange={(e) => ejecutar('disp', () => cambiarDisponibilidad(producto.id, e.target.checked))}
          />
          <span className="switch-pista" aria-hidden="true" />
          <span className="switch-texto">{producto.agotado ? 'Agotado' : 'A la venta'}</span>
        </label>
        {puedeEditar && (
          <button type="button" className="icon-btn" onClick={() => onEditar(producto)} aria-label={`Editar ${producto.nombre}`} title="Editar">
            <IconEdit size={17} />
          </button>
        )}
      </div>
    </li>
  )
}

FilaProducto.propTypes = {
  producto: PropTypes.object.isRequired,
  puedeEditar: PropTypes.bool,
  onCambio: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
}

export const Productos = ({ cafeteriaId, puedeEditar = false }) => {
  const [productos, setProductos] = useState([])
  const [monedas, setMonedas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [categoria, setCategoria] = useState('todas')
  const [editando, setEditando] = useState(undefined) // undefined = cerrado, null = nuevo
  const [aviso, setAviso] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setProductos(await getProductos(cafeteriaId))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [cafeteriaId])

  useEffect(() => {
    setCategoria('todas')
    setProductos([])
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!puedeEditar) return
    getMonedas().then(setMonedas).catch(() => setMonedas([]))
  }, [puedeEditar])

  useEffect(() => {
    if (!aviso) return undefined
    const id = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(id)
  }, [aviso])

  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [productos],
  )

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return productos
      .filter((p) => categoria === 'todas' || p.categoria === categoria)
      .filter((p) => (filtro === 'agotados' ? p.agotado : filtro === 'reponer' ? p.inventario.requiereReposicion : true))
      .filter(
        (p) =>
          texto.length === 0 ||
          p.nombre.toLowerCase().includes(texto) ||
          p.descripcion?.toLowerCase().includes(texto),
      )
      .sort((a, b) => a.categoria.localeCompare(b.categoria, 'es') || a.nombre.localeCompare(b.nombre, 'es'))
  }, [productos, categoria, filtro, busqueda])

  const agotados = productos.filter((p) => p.agotado).length
  const porReponer = productos.filter((p) => p.inventario.requiereReposicion).length

  const reemplazar = (actualizado) =>
    setProductos((lista) => lista.map((p) => (p.id === actualizado.id ? actualizado : p)))

  const alGuardar = (producto, esNuevo) => {
    setProductos((lista) => (esNuevo ? [...lista, producto] : lista.map((p) => (p.id === producto.id ? producto : p))))
    setEditando(undefined)
    setAviso(esNuevo ? `Se agregó “${producto.nombre}” al menú.` : `Se guardaron los cambios de “${producto.nombre}”.`)
  }

  const conteo = { todos: productos.length, agotados, reponer: porReponer }

  return (
    <section className="vista" aria-labelledby="titulo-productos">
      <div className="vista-header">
        <div>
          <h1 id="titulo-productos" className="vista-titulo">
            Productos
          </h1>
          <p className="vista-sub">
            {puedeEditar
              ? 'Edita el menú, las existencias y los platillos agotados.'
              : 'Marca lo que se agotó y repón existencias.'}
          </p>
        </div>
        <div className="vista-acciones">
          <button type="button" className="icon-btn" onClick={cargar} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
            <IconRefresh size={18} className={cargando ? 'girando' : ''} />
          </button>
          {puedeEditar && (
            <button type="button" className="boton boton-primario" onClick={() => setEditando(null)}>
              <IconPlus size={17} /> Nuevo producto
            </button>
          )}
        </div>
      </div>

      {aviso && (
        <div className="alerta alerta-ok" role="status">
          {aviso}
        </div>
      )}

      <div className="filtros">
        <div className="segmentado" role="group" aria-label="Filtro">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filtro === f.id ? 'active' : ''}
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
              {!cargando && <span className="segmentado-count">{conteo[f.id]}</span>}
            </button>
          ))}
        </div>
        <select className="input input-select" value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría">
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="buscador">
          <IconSearch size={17} className="buscador-icono" />
          <input
            type="search"
            className="input"
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
      </div>

      {error ? (
        <div className="empty-state is-error" role="alert">
          <p className="empty-title">No se pudieron cargar los productos</p>
          <p className="empty-text">{error}</p>
          <button type="button" className="boton boton-secundario" onClick={cargar}>
            Reintentar
          </button>
        </div>
      ) : cargando && productos.length === 0 ? (
        <div className="tarjeta">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="skeleton skeleton-line w-100 skeleton-fila" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">{productos.length === 0 ? 'Esta cafetería aún no tiene productos' : 'Sin resultados'}</p>
          <p className="empty-text">
            {productos.length === 0 && puedeEditar
              ? 'Agrega el primero con “Nuevo producto”.'
              : 'No hay productos con estos filtros.'}
          </p>
        </div>
      ) : (
        <ul className="tarjeta lista-productos">
          {filtrados.map((p) => (
            <FilaProducto key={p.id} producto={p} puedeEditar={puedeEditar} onCambio={reemplazar} onEditar={setEditando} />
          ))}
        </ul>
      )}

      {editando !== undefined && (
        <FormProducto
          producto={editando}
          cafeteriaId={cafeteriaId}
          categorias={categorias}
          monedas={monedas}
          onClose={() => setEditando(undefined)}
          onGuardado={alGuardar}
        />
      )}
    </section>
  )
}

Productos.propTypes = {
  cafeteriaId: PropTypes.string.isRequired,
  puedeEditar: PropTypes.bool,
}

export default Productos
