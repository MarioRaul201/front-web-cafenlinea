import PropTypes from 'prop-types'
import TarjetaProducto from './TarjetaProducto'
import { IconClock, IconMapPin } from './Icons'

// Tarjeta de relleno mientras cargan los productos
const SkeletonCard = () => (
  <div className="product-card is-skeleton" aria-hidden="true">
    <div className="product-media skeleton" />
    <div className="product-body">
      <span className="skeleton skeleton-line w-25" />
      <span className="skeleton skeleton-line skeleton-title w-75" />
      <span className="skeleton skeleton-line w-100" />
      <span className="skeleton skeleton-line w-50" />
    </div>
  </div>
)

// "3–10 min" con los tiempos de preparación del menú
const rangoPreparacion = (productos) => {
  const tiempos = productos.map((p) => p.tiempoPreparacionMin).filter((t) => t > 0)
  if (tiempos.length === 0) return null
  const min = Math.min(...tiempos)
  const max = Math.max(...tiempos)
  return min === max ? `${min} min` : `${min}–${max} min`
}

export const MainContent = ({
  cafeteria = null,
  productos = [],
  selectedCategory = 'todos',
  searchTerm = '',
  onAddToCart = () => {},
  isLoading = false,
  error = null,
  onRetry = () => {},
}) => {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredProducts = productos.filter((producto) => {
    const matchesCategory =
      selectedCategory === 'todos' ? true : producto.categoria === selectedCategory

    const matchesSearch =
      normalizedSearch.length === 0 ||
      producto.nombre.toLowerCase().includes(normalizedSearch) ||
      producto.descripcion.toLowerCase().includes(normalizedSearch) ||
      producto.categoria.toLowerCase().includes(normalizedSearch)

    return matchesCategory && matchesSearch
  })

  const preparacion = rangoPreparacion(productos)

  const renderProductos = () => {
    if (isLoading) {
      return (
        <div className="product-grid" role="status" aria-live="polite">
          <span className="visually-hidden">Cargando productos…</span>
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="empty-state is-error" role="alert">
          <p className="empty-title">No se pudo cargar el menú</p>
          <p className="empty-text">{error}</p>
          <button type="button" className="btn-retry" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )
    }

    if (!cafeteria) {
      return (
        <div className="empty-state">
          <p className="empty-title">No hay cafeterías disponibles</p>
          <p className="empty-text">Todavía no hay cafeterías activas en el catálogo.</p>
        </div>
      )
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="empty-state">
          <p className="empty-title">Sin resultados</p>
          <p className="empty-text">
            No hay productos que coincidan con tu búsqueda en esta categoría.
          </p>
        </div>
      )
    }

    return (
      <div className="product-grid">
        {filteredProducts.map((item) => (
          <TarjetaProducto key={item.id} product={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    )
  }

  return (
    <main className="main-content">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{cafeteria ? cafeteria.escuelaNombre : 'Pide y recoge'}</span>
          <h1 className="hero-title">Tu pedido listo, sin hacer fila.</h1>
          <p className="hero-text">
            {cafeteria
              ? `Pide en ${cafeteria.nombre} y recógelo cuando esté listo.`
              : 'Elige tu cafetería, haz tu pedido en línea y recógelo cuando esté listo.'}
          </p>
        </div>

        {cafeteria && (
          <ul className="hero-stats">
            {preparacion && (
              <li>
                <IconClock size={20} />
                <div>
                  <strong>{preparacion}</strong>
                  <span>Tiempo de preparación</span>
                </div>
              </li>
            )}
            {cafeteria.ubicacion && (
              <li>
                <IconMapPin size={20} />
                <div>
                  <strong>{cafeteria.ubicacion}</strong>
                  <span>Punto de recogida</span>
                </div>
              </li>
            )}
          </ul>
        )}
      </section>

      <section className="products-section" aria-labelledby="products-title">
        <div className="section-header">
          <h2 id="products-title" className="section-title">
            {selectedCategory === 'todos' ? 'Menú completo' : selectedCategory}
          </h2>
          {!isLoading && !error && cafeteria && (
            <span className="section-meta">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>
          )}
        </div>

        {renderProductos()}
      </section>
    </main>
  )
}

MainContent.propTypes = {
  cafeteria: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    ubicacion: PropTypes.string,
    escuelaNombre: PropTypes.string,
  }),
  productos: PropTypes.arrayOf(PropTypes.object),
  selectedCategory: PropTypes.string,
  searchTerm: PropTypes.string,
  onAddToCart: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
}

export default MainContent
