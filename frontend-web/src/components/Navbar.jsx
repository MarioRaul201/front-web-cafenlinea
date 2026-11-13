import PropTypes from 'prop-types'
import { IconCart, IconCoffee, IconMoon, IconSearch, IconSun, IconUser } from './Icons'

export const Navbar = ({
  cartCount = 0,
  cartTotalLabel = '',
  searchTerm = '',
  onSearchChange = () => {},
  theme = 'light',
  onToggleTheme = () => {},
}) => {
  return (
    <header className="topbar sticky-top">
      <div className="container-xxl topbar-inner">
        <a href="#" className="brand" aria-label="Café Express, inicio">
          <span className="brand-mark">
            <IconCoffee size={22} />
          </span>
          <span className="brand-text">
            <span className="brand-name">Café Express</span>
            <span className="brand-tag">Pide y recoge</span>
          </span>
        </a>

        <div className="topbar-search">
          <IconSearch size={18} className="search-icon" />
          <input
            type="search"
            className="search-input"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar café, postres, snacks…"
            aria-label="Buscar productos"
          />
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
            title={theme === 'light' ? 'Tema oscuro' : 'Tema claro'}
          >
            {theme === 'light' ? <IconMoon size={19} /> : <IconSun size={19} />}
          </button>

          <button type="button" className="cart-btn" aria-label={`Carrito, ${cartCount} productos`}>
            <span className="cart-icon">
              <IconCart size={19} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
            <span className="cart-label d-none d-sm-inline">
              {cartCount > 0 ? cartTotalLabel : 'Carrito'}
            </span>
          </button>

          <button type="button" className="icon-btn avatar-btn" aria-label="Mi cuenta" title="Mi cuenta">
            <IconUser size={19} />
          </button>
        </div>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  cartCount: PropTypes.number,
  cartTotalLabel: PropTypes.string,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  theme: PropTypes.oneOf(['light', 'dark']),
  onToggleTheme: PropTypes.func,
}

export default Navbar
