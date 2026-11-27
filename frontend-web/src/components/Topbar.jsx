import PropTypes from 'prop-types'
import {
  IconBox,
  IconClipboard,
  IconCoffee,
  IconHistory,
  IconLogout,
  IconMapPin,
  IconMoon,
  IconStore,
  IconSun,
} from './Icons'

const ETIQUETA_ROL = { JEFE: 'Dueño', VENDEDOR: 'Vendedor' }

export const Topbar = ({
  usuario,
  vista,
  onCambiarVista,
  cafeterias = [],
  cafeteriaId = null,
  onSelectCafeteria = () => {},
  nuevosPendientes = 0,
  theme = 'light',
  onToggleTheme = () => {},
  onLogout = () => {},
}) => {
  const esJefe = usuario.rol === 'JEFE'

  const vistas = [
    { id: 'pedidos', label: 'Pedidos', Icon: IconClipboard, badge: nuevosPendientes },
    { id: 'historial', label: 'Historial', Icon: IconHistory },
    { id: 'productos', label: 'Productos', Icon: IconBox },
    ...(esJefe ? [{ id: 'cafeterias', label: 'Cafeterías', Icon: IconStore }] : []),
  ]

  // Cafeterías agrupadas por escuela para el selector del jefe
  const porEscuela = cafeterias.reduce((grupos, cafe) => {
    const nombre = cafe.escuela?.nombre ?? 'Sin escuela'
    ;(grupos[nombre] ??= []).push(cafe)
    return grupos
  }, {})

  const cafeteriaActual = cafeterias.find((c) => c.id === cafeteriaId)

  return (
    <header className="topbar sticky-top">
      <div className="container-xxl topbar-inner">
        <a href="#" className="brand" aria-label="Café Express, panel" onClick={(e) => { e.preventDefault(); onCambiarVista('pedidos') }}>
          <span className="brand-mark">
            <IconCoffee size={22} />
          </span>
          <span className="brand-text">
            <span className="brand-name">Café Express</span>
            <span className="brand-tag">Panel de cafetería</span>
          </span>
        </a>

        <div className="topbar-cafeteria">
          {esJefe && cafeterias.length > 0 ? (
            <div className="select-wrap">
              <IconMapPin size={18} className="select-icon" />
              <select
                className="cafeteria-select"
                value={cafeteriaId ?? ''}
                onChange={(e) => onSelectCafeteria(e.target.value)}
                aria-label="Cafetería"
              >
                {Object.entries(porEscuela).map(([escuela, lista]) => (
                  <optgroup key={escuela} label={escuela}>
                    {lista.map((cafe) => (
                      <option key={cafe.id} value={cafe.id}>
                        {cafe.nombre}
                        {cafe.activa ? '' : ' (oculta)'}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ) : (
            cafeteriaActual && (
              <div className="cafeteria-fija">
                <IconMapPin size={18} />
                <span>
                  <strong>{cafeteriaActual.nombre}</strong>
                  <small>{cafeteriaActual.escuela?.nombre}</small>
                </span>
              </div>
            )
          )}
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

          <div className="user-chip" title={usuario.correo}>
            <span className="user-avatar">
              {usuario.fotoPerfilUrl ? (
                <img src={usuario.fotoPerfilUrl} alt="" />
              ) : (
                usuario.nombre.charAt(0).toUpperCase()
              )}
            </span>
            <span className="user-text d-none d-md-flex">
              <strong>{usuario.nombre}</strong>
              <small>{ETIQUETA_ROL[usuario.rol] ?? usuario.rol}</small>
            </span>
          </div>

          <button type="button" className="icon-btn" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <IconLogout size={19} />
          </button>
        </div>
      </div>

      <nav className="container-xxl tabs" aria-label="Secciones del panel">
        {vistas.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            type="button"
            className={`tab${vista === id ? ' active' : ''}`}
            aria-current={vista === id ? 'page' : undefined}
            onClick={() => onCambiarVista(id)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {badge > 0 && <span className="tab-badge">{badge}</span>}
          </button>
        ))}
      </nav>
    </header>
  )
}

Topbar.propTypes = {
  usuario: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    correo: PropTypes.string,
    rol: PropTypes.string.isRequired,
    fotoPerfilUrl: PropTypes.string,
  }).isRequired,
  vista: PropTypes.string.isRequired,
  onCambiarVista: PropTypes.func.isRequired,
  cafeterias: PropTypes.arrayOf(PropTypes.object),
  cafeteriaId: PropTypes.string,
  onSelectCafeteria: PropTypes.func,
  nuevosPendientes: PropTypes.number,
  theme: PropTypes.oneOf(['light', 'dark']),
  onToggleTheme: PropTypes.func,
  onLogout: PropTypes.func,
}

export default Topbar
