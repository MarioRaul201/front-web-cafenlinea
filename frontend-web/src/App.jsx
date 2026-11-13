import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Footer from './components/Footer'
import { getEscuelas, getMenu } from './services/api'
import { formatPrice } from './utils/formato'
import './App.css'

// Recuerda la última cafetería elegida en este navegador
const CAFETERIA_KEY = 'cafe-express:cafeteria'

const leerCafeteriaGuardada = () => {
  try {
    return localStorage.getItem(CAFETERIA_KEY)
  } catch {
    return null
  }
}

const guardarCafeteria = (id) => {
  try {
    localStorage.setItem(CAFETERIA_KEY, id)
  } catch {
    // Sin almacenamiento disponible (modo privado); no pasa nada
  }
}

function App() {
  // Datos del backend
  const [escuelas, setEscuelas] = useState([])
  const [cafeteriaId, setCafeteriaId] = useState(null)
  const [menu, setMenu] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reintento, setReintento] = useState(0)

  // Estado de la interfaz
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')

  // useEffect 1: carga las escuelas y sus cafeterías, y elige una cafetería inicial
  useEffect(() => {
    let cancelado = false
    setIsLoading(true)
    setError(null)

    getEscuelas()
      .then((lista) => {
        if (cancelado) return
        setEscuelas(lista)
        const todas = lista.flatMap((escuela) => escuela.cafeterias)
        const guardada = leerCafeteriaGuardada()
        const inicial = todas.find((cafe) => cafe.id === guardada) ?? todas[0]
        setCafeteriaId(inicial?.id ?? null)
        if (!inicial) setIsLoading(false)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err.message)
        setIsLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [reintento])

  // useEffect 2: carga el menú cada vez que cambia la cafetería
  useEffect(() => {
    if (!cafeteriaId) return undefined
    let cancelado = false
    setIsLoading(true)
    setError(null)
    guardarCafeteria(cafeteriaId)

    getMenu(cafeteriaId)
      .then((secciones) => {
        if (!cancelado) setMenu(secciones)
      })
      .catch((err) => {
        if (cancelado) return
        setMenu([])
        setError(err.message)
      })
      .finally(() => {
        if (!cancelado) setIsLoading(false)
      })

    return () => {
      cancelado = true
    }
  }, [cafeteriaId, reintento])

  // useEffect 3: aplica el tema Claro/Oscuro a toda la página cuando cambia
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  // useEffect 4: actualiza el título de la pestaña con el número de productos en el carrito
  useEffect(() => {
    document.title =
      cart.length > 0 ? `(${cart.length}) Café Express` : 'Café Express'
  }, [cart])

  // El carrito es de una sola cafetería: al cambiarla se vacía
  const handleSelectCafeteria = (id) => {
    setCafeteriaId(id)
    setCart([])
    setSelectedCategory('todos')
  }

  const handleAddToCart = (product) => {
    setCart((currentCart) => [...currentCart, product])
  }

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  // Datos derivados
  const cafeteria =
    escuelas
      .flatMap((escuela) =>
        escuela.cafeterias.map((cafe) => ({ ...cafe, escuelaNombre: escuela.nombre })),
      )
      .find((cafe) => cafe.id === cafeteriaId) ?? null

  const productos = menu.flatMap((seccion) => seccion.productos)

  const categorias = [
    { id: 'todos', label: 'Todo el menú', count: productos.length },
    ...menu.map((seccion) => ({
      id: seccion.categoria,
      label: seccion.categoria,
      count: seccion.productos.length,
    })),
  ]

  const cartTotal = cart.reduce((total, item) => total + item.precio.monto, 0)
  const cartTotalLabel = formatPrice(cartTotal, cart[0]?.precio.moneda ?? 'MXN')

  return (
    <div className="app-layout">
      <Navbar
        cartCount={cart.length}
        cartTotalLabel={cartTotalLabel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="container-xxl app-body">
        <div className="app-grid">
          <Sidebar
            escuelas={escuelas}
            cafeteriaId={cafeteriaId}
            onSelectCafeteria={handleSelectCafeteria}
            categorias={categorias}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isLoading={isLoading}
          />

          <div className="app-main">
            <MainContent
              cafeteria={cafeteria}
              productos={productos}
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
              error={error}
              onRetry={() => setReintento((n) => n + 1)}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default App
