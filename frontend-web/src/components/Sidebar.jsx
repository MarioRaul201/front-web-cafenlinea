import PropTypes from 'prop-types'
import { IconMapPin } from './Icons'
import { iconForCategory } from './categoryIcons'

export const Sidebar = ({
  escuelas = [],
  cafeteriaId = null,
  onSelectCafeteria = () => {},
  categorias = [],
  activeCategory = 'todos',
  onSelectCategory = () => {},
  isLoading = false,
}) => {
  return (
    <aside className="sidebar">
      <div className="cafeteria-picker">
        <label htmlFor="cafeteria-select" className="sidebar-label">
          Cafetería
        </label>
        <div className="select-wrap">
          <IconMapPin size={18} className="select-icon" />
          <select
            id="cafeteria-select"
            className="cafeteria-select"
            value={cafeteriaId ?? ''}
            onChange={(event) => onSelectCafeteria(event.target.value)}
            disabled={escuelas.length === 0}
          >
            {escuelas.length === 0 && <option value="">Cargando…</option>}
            {escuelas.map((escuela) => (
              <optgroup key={escuela.id} label={`${escuela.nombre} · ${escuela.ciudad}`}>
                {escuela.cafeterias.map((cafe) => (
                  <option key={cafe.id} value={cafe.id}>
                    {cafe.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="sidebar-label categories-label">Categorías</p>
        <nav aria-label="Categorías del menú">
          <ul className="category-list">
            {categorias.map((cat) => {
              const Icon = iconForCategory(cat.id)
              const isActive = activeCategory === cat.id

              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={`category-item${isActive ? ' active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => onSelectCategory(cat.id)}
                  >
                    <span className="category-icon">
                      <Icon size={18} />
                    </span>
                    <span className="category-name">{cat.label}</span>
                    {!isLoading && <span className="category-count">{cat.count}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  escuelas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      ciudad: PropTypes.string,
      cafeterias: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string.isRequired, nombre: PropTypes.string.isRequired }),
      ).isRequired,
    }),
  ),
  cafeteriaId: PropTypes.string,
  onSelectCafeteria: PropTypes.func,
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ),
  activeCategory: PropTypes.string,
  onSelectCategory: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default Sidebar
