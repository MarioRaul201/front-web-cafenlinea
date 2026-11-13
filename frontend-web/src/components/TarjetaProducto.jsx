import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { IconCheck, IconClock, IconPlus } from './Icons'
import { iconForCategory, toneForCategory } from './categoryIcons'
import { formatPrice } from '../utils/formato'

export const TarjetaProducto = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false)
  const {
    nombre,
    descripcion,
    categoria,
    precio,
    imagenUrl,
    destacado,
    etiqueta,
    agotado,
    tiempoPreparacionMin,
  } = product
  const Icon = iconForCategory(categoria)

  // Muestra "Agregado" por un momento después de hacer clic
  useEffect(() => {
    if (!added) return undefined
    const timeout = setTimeout(() => setAdded(false), 1200)
    return () => clearTimeout(timeout)
  }, [added])

  const handleAdd = () => {
    onAddToCart(product)
    setAdded(true)
  }

  return (
    <article className={`product-card${agotado ? ' is-soldout' : ''}`}>
      <div className={`product-media tone-${toneForCategory(categoria)}`}>
        {imagenUrl ? (
          <img src={imagenUrl} alt="" loading="lazy" className="product-img" />
        ) : (
          <Icon size={44} />
        )}
        {agotado ? (
          <span className="product-flag is-soldout">Agotado</span>
        ) : (
          destacado && <span className="product-flag">Destacado</span>
        )}
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{categoria}</span>
          {tiempoPreparacionMin > 0 && (
            <span className="product-time">
              <IconClock size={13} />
              {tiempoPreparacionMin} min
            </span>
          )}
        </div>
        <h3 className="product-name">{nombre}</h3>
        {descripcion && <p className="product-desc">{descripcion}</p>}
        {etiqueta && <span className="product-tag">{etiqueta}</span>}

        <div className="product-footer">
          <span className="product-price">{formatPrice(precio.monto, precio.moneda)}</span>
          <button
            type="button"
            className={`btn-add${added ? ' is-added' : ''}`}
            onClick={handleAdd}
            disabled={agotado}
            aria-label={agotado ? `${nombre} agotado` : `Agregar ${nombre} al carrito`}
          >
            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
            <span>{agotado ? 'Agotado' : added ? 'Agregado' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

TarjetaProducto.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    categoria: PropTypes.string.isRequired,
    precio: PropTypes.shape({
      monto: PropTypes.number.isRequired,
      moneda: PropTypes.string.isRequired,
    }).isRequired,
    imagenUrl: PropTypes.string,
    destacado: PropTypes.bool,
    etiqueta: PropTypes.string,
    agotado: PropTypes.bool,
    tiempoPreparacionMin: PropTypes.number,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
}

export default TarjetaProducto
