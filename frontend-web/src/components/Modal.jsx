import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { IconX } from './Icons'

// Pila de modales abiertos: Esc solo cierra el de arriba (p. ej. "Entregar" sobre el detalle)
const pila = []

// Ventana modal o panel lateral ("drawer"). Cierra con Esc o clic en el fondo.
export const Modal = ({ titulo, subtitulo = null, onClose, children, pie = null, variante = 'modal', ancho = 'md' }) => {
  const panelRef = useRef(null)
  // El padre suele pasar una función nueva en cada render; se guarda aparte para no
  // volver a correr el efecto (y robarle el foco a los campos) en cada tecla.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const anterior = document.activeElement
    const yo = {}
    pila.push(yo)
    panelRef.current?.focus()
    const alTeclear = (event) => {
      if (event.key === 'Escape' && pila[pila.length - 1] === yo) onCloseRef.current()
    }
    document.addEventListener('keydown', alTeclear)
    document.body.classList.add('modal-abierto')
    return () => {
      document.removeEventListener('keydown', alTeclear)
      pila.splice(pila.indexOf(yo), 1)
      if (pila.length === 0) document.body.classList.remove('modal-abierto')
      anterior?.focus?.()
    }
  }, [])

  return createPortal(
    <div className={`capa capa-${variante}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={`panel panel-${variante} panel-${ancho}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
      >
        <header className="panel-header">
          <div>
            <h2 className="panel-title">{titulo}</h2>
            {subtitulo && <div className="panel-subtitle">{subtitulo}</div>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </header>
        <div className="panel-body">{children}</div>
        {pie && <footer className="panel-footer">{pie}</footer>}
      </div>
    </div>,
    document.body,
  )
}

Modal.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  pie: PropTypes.node,
  variante: PropTypes.oneOf(['modal', 'drawer']),
  ancho: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default Modal
