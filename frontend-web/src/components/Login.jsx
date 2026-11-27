import { useState } from 'react'
import PropTypes from 'prop-types'
import { IconClipboard, IconCoffee, IconBox, IconStore } from './Icons'

export const Login = ({ onLogin, avisoInicial = null }) => {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await onLogin(correo.trim(), password)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-aside" aria-hidden="true">
        <div className="brand brand-light">
          <span className="brand-mark">
            <IconCoffee size={22} />
          </span>
          <span className="brand-name">Café Express</span>
        </div>
        <div>
          <h1 className="login-aside-title">Panel de la cafetería</h1>
          <p className="login-aside-text">
            Recibe los pedidos que tus clientes hacen desde la app, prepáralos a tiempo y mantén tu
            menú al día.
          </p>
          <ul className="login-features">
            <li>
              <IconClipboard size={18} /> Pedidos en vivo, por hora de recogida
            </li>
            <li>
              <IconBox size={18} /> Menú, existencias y platillos agotados
            </li>
            <li>
              <IconStore size={18} /> Todas las cafeterías de tu negocio
            </li>
          </ul>
        </div>
        <p className="login-aside-foot">Para vendedores y dueños de cafetería</p>
      </section>

      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="brand login-brand-mobile">
            <span className="brand-mark">
              <IconCoffee size={22} />
            </span>
            <span className="brand-name">Café Express</span>
          </div>
          <h2 className="login-title">Inicia sesión</h2>
          <p className="login-sub">Usa la cuenta de vendedor o de dueño que te dieron de alta.</p>

          {avisoInicial && !error && <div className="alerta alerta-info">{avisoInicial}</div>}
          {error && (
            <div className="alerta alerta-error" role="alert">
              {error}
            </div>
          )}

          <label className="campo">
            <span className="campo-label">Correo</span>
            <input
              type="email"
              className="input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </label>

          <label className="campo">
            <span className="campo-label">Contraseña</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="boton boton-primario boton-bloque" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  )
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  avisoInicial: PropTypes.string,
}

export default Login
