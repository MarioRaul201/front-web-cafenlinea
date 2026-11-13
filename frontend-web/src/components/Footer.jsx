import { IconCoffee } from './Icons'

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-xxl">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="brand">
              <span className="brand-mark">
                <IconCoffee size={20} />
              </span>
              <span className="brand-name">Café Express</span>
            </a>
            <p>Pide desde tu celular y recoge en la cafetería de la escuela sin hacer fila.</p>
          </div>

          <div>
            <h2 className="footer-heading">Horario</h2>
            <ul className="footer-list">
              <li>Lunes a viernes</li>
              <li>7:00 a. m. – 8:00 p. m.</li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">Recogida</h2>
            <ul className="footer-list">
              <li>Barra principal</li>
              <li>Cafetería escolar</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Café Express. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
