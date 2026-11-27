import { useCallback, useEffect, useState } from 'react'
import Login from './components/Login'
import Topbar from './components/Topbar'
import TableroPedidos from './components/pedidos/TableroPedidos'
import Historial from './components/pedidos/Historial'
import Productos from './components/productos/Productos'
import Cafeterias from './components/cafeterias/Cafeterias'
import useColaPedidos from './hooks/useColaPedidos'
import * as api from './services/api'
import './App.css'

const ROLES_PERMITIDOS = ['VENDEDOR', 'JEFE']
const VISTAS = ['pedidos', 'historial', 'productos', 'cafeterias']

// Preferencias de este navegador (si no hay almacenamiento, se usan los valores por defecto)
const KEYS = {
  token: 'cafe-panel:token',
  cafeteria: 'cafe-panel:cafeteria',
  tema: 'cafe-panel:tema',
  sonido: 'cafe-panel:sonido',
}

const leer = (clave) => {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

const guardar = (clave, valor) => {
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, valor)
  } catch {
    // Sin almacenamiento disponible (modo privado); no pasa nada
  }
}

const vistaDelHash = () => {
  const vista = window.location.hash.replace('#', '')
  return VISTAS.includes(vista) ? vista : 'pedidos'
}

const temaInicial = () => {
  const guardado = leer(KEYS.tema)
  if (guardado === 'light' || guardado === 'dark') return guardado
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  // Sesión: 'verificando' (hay token guardado) | 'fuera' | 'dentro'
  const [fase, setFase] = useState(() => (leer(KEYS.token) ? 'verificando' : 'fuera'))
  const [usuario, setUsuario] = useState(null)
  const [aviso, setAviso] = useState(null)

  // Datos del negocio
  const [negocio, setNegocio] = useState(null)
  const [estados, setEstados] = useState([])
  const [cafeteriaId, setCafeteriaId] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [reintento, setReintento] = useState(0)

  // Interfaz
  const [vista, setVista] = useState(vistaDelHash)
  const [theme, setTheme] = useState(temaInicial)
  const [sonido, setSonido] = useState(() => leer(KEYS.sonido) !== 'off')

  const cola = useColaPedidos(fase === 'dentro' ? cafeteriaId : null, { sonido })

  const cerrarSesionLocal = useCallback((mensaje = null) => {
    api.setToken(null)
    guardar(KEYS.token, null)
    setUsuario(null)
    setNegocio(null)
    setCafeteriaId(null)
    setAviso(mensaje)
    setFase('fuera')
  }, [])

  // Si el backend dice que el token ya no sirve, se regresa al login
  useEffect(() => {
    api.onSesionExpirada(() => cerrarSesionLocal('Tu sesión expiró. Vuelve a iniciar sesión.'))
  }, [cerrarSesionLocal])

  const entrar = useCallback((token, cuenta) => {
    if (!ROLES_PERMITIDOS.includes(cuenta.rol)) {
      api.logout()
      api.setToken(null)
      throw new Error('Este panel es solo para vendedores y dueños de cafetería. Los clientes usan la app móvil.')
    }
    guardar(KEYS.token, token)
    setUsuario(cuenta)
    setFase('dentro')
  }, [])

  // Al abrir la página con un token guardado, se valida con `me`
  useEffect(() => {
    if (fase !== 'verificando') return
    const token = leer(KEYS.token)
    api.setToken(token)
    api
      .getMe()
      .then((cuenta) => entrar(token, cuenta))
      .catch((err) => cerrarSesionLocal(err.code === 'NETWORK' ? err.message : null))
  }, [fase, entrar, cerrarSesionLocal])

  const handleLogin = async (correo, password) => {
    const sesion = await api.login(correo, password)
    api.setToken(sesion.token)
    entrar(sesion.token, sesion.usuario)
  }

  const handleLogout = async () => {
    await api.logout()
    cerrarSesionLocal()
  }

  // Ya dentro: negocio con sus cafeterías y catálogo de estados
  useEffect(() => {
    if (fase !== 'dentro' || !usuario) return undefined
    let cancelado = false
    setErrorCarga(null)

    Promise.all([api.getMiNegocio(), api.getEstadosPedido()])
      .then(([miNegocio, catalogo]) => {
        if (cancelado) return
        setNegocio(miNegocio)
        setEstados(catalogo)
        const cafeterias = miNegocio?.cafeterias ?? []
        if (usuario.rol === 'VENDEDOR') {
          setCafeteriaId(usuario.cafeteriaId)
        } else {
          const guardada = leer(KEYS.cafeteria)
          const inicial = cafeterias.find((c) => c.id === guardada) ?? cafeterias[0]
          setCafeteriaId(inicial?.id ?? null)
          if (!inicial) setVista('cafeterias')
        }
      })
      .catch((err) => {
        if (!cancelado) setErrorCarga(err.message)
      })

    return () => {
      cancelado = true
    }
  }, [fase, usuario, reintento])

  // Tema claro/oscuro en toda la página
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    guardar(KEYS.tema, theme)
  }, [theme])

  useEffect(() => {
    guardar(KEYS.sonido, sonido ? 'on' : 'off')
  }, [sonido])

  // La sección activa vive en la URL (#pedidos, #productos…) para que sobreviva a un F5
  useEffect(() => {
    if (window.location.hash !== `#${vista}`) window.history.replaceState(null, '', `#${vista}`)
  }, [vista])

  useEffect(() => {
    const alCambiar = () => setVista(vistaDelHash())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  // Pedidos nuevos en el título de la pestaña, para verlos aunque estés en otra
  useEffect(() => {
    const n = cola.nuevosPendientes
    document.title =
      fase !== 'dentro'
        ? 'Café Express · Panel'
        : n > 0
          ? `(${n}) ${n === 1 ? 'Pedido nuevo' : 'Pedidos nuevos'} · Café Express`
          : 'Pedidos · Café Express'
  }, [cola.nuevosPendientes, fase])

  const seleccionarCafeteria = (id, irA = null) => {
    setCafeteriaId(id)
    guardar(KEYS.cafeteria, id)
    if (irA) setVista(irA)
  }

  const alRegistrarCafeteria = async (nueva) => {
    const actualizado = await api.getMiNegocio().catch(() => null)
    setNegocio((actual) =>
      actualizado ?? { ...actual, cafeterias: [...(actual?.cafeterias ?? []), nueva] },
    )
    seleccionarCafeteria(nueva.id)
  }

  // ---------------------------------------------------------------
  if (fase === 'verificando') {
    return (
      <div className="pantalla-centro" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Abriendo el panel…</p>
      </div>
    )
  }

  if (fase === 'fuera' || !usuario) {
    return <Login onLogin={handleLogin} avisoInicial={aviso} />
  }

  const esJefe = usuario.rol === 'JEFE'
  const cafeterias = negocio?.cafeterias ?? []
  const cafeteria = cafeterias.find((c) => c.id === cafeteriaId) ?? null
  const vistaActual = vista === 'cafeterias' && !esJefe ? 'pedidos' : vista

  const renderVista = () => {
    if (errorCarga) {
      return (
        <div className="empty-state is-error" role="alert">
          <p className="empty-title">No se pudo cargar tu negocio</p>
          <p className="empty-text">{errorCarga}</p>
          <button type="button" className="boton boton-secundario" onClick={() => setReintento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )
    }

    if (!negocio && estados.length === 0) {
      return (
        <div className="pantalla-centro pantalla-centro-inline" role="status">
          <span className="spinner" aria-hidden="true" />
          <p>Cargando tu negocio…</p>
        </div>
      )
    }

    if (vistaActual === 'cafeterias') {
      return (
        <Cafeterias
          negocio={negocio}
          cafeteriaId={cafeteriaId}
          onSelectCafeteria={seleccionarCafeteria}
          onRegistrada={alRegistrarCafeteria}
        />
      )
    }

    if (!cafeteriaId) {
      return (
        <div className="empty-state">
          <p className="empty-title">{esJefe ? 'Aún no tienes cafeterías' : 'No tienes una cafetería asignada'}</p>
          <p className="empty-text">
            {esJefe
              ? 'Registra tu primera cafetería para empezar a recibir pedidos.'
              : 'Pide al dueño del negocio que te asigne a una cafetería.'}
          </p>
          {esJefe && (
            <button type="button" className="boton boton-primario" onClick={() => setVista('cafeterias')}>
              Registrar cafetería
            </button>
          )}
        </div>
      )
    }

    if (vistaActual === 'historial') {
      return <Historial key={cafeteriaId} cafeteriaId={cafeteriaId} estados={estados} usuarioId={usuario.id} />
    }

    if (vistaActual === 'productos') {
      return <Productos key={cafeteriaId} cafeteriaId={cafeteriaId} puedeEditar={esJefe} />
    }

    return (
      <TableroPedidos
        cola={cola}
        estados={estados}
        cafeteria={cafeteria}
        usuarioId={usuario.id}
        sonido={sonido}
        onToggleSonido={() => setSonido((s) => !s)}
      />
    )
  }

  return (
    <div className="app-layout">
      <Topbar
        usuario={usuario}
        vista={vistaActual}
        onCambiarVista={setVista}
        cafeterias={cafeterias}
        cafeteriaId={cafeteriaId}
        onSelectCafeteria={(id) => seleccionarCafeteria(id)}
        nuevosPendientes={cola.nuevosPendientes}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onLogout={handleLogout}
      />
      <main className="container-xxl app-body">{renderVista()}</main>
    </div>
  )
}

export default App
