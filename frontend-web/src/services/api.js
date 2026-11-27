// Cliente GraphQL del backend "Pide y Recoge" (repo Basededatosavanzadas, Apollo Server).
// La URL se lee de VITE_API_URL en el archivo .env (ver .env.example)
const API_URL = import.meta.env.VITE_API_URL ?? 'https://basededatosavanzadas.onrender.com/'

// Token de la sesión actual (JWT + Redis del backend). Lo fija App al iniciar sesión.
let tokenActual = null
// Se llama cuando el backend responde UNAUTHENTICATED (token vencido o revocado)
let alExpirarSesion = () => {}

export const setToken = (token) => {
  tokenActual = token
}

export const onSesionExpirada = (callback) => {
  alExpirarSesion = callback
}

export class ApiError extends Error {
  constructor(message, code = null) {
    super(message)
    this.code = code
  }
}

// Envía una consulta GraphQL y devuelve el campo "data" de la respuesta.
export const graphqlRequest = async (query, variables = {}) => {
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenActual ? { Authorization: `Bearer ${tokenActual}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
  } catch {
    throw new ApiError(
      `No se pudo conectar con el servidor (${API_URL}). Revisa tu conexión o que el backend esté levantado.`,
      'NETWORK',
    )
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    // La respuesta no trae JSON; se reporta abajo con el código HTTP
  }

  // Apollo manda los errores en "errors" (a veces con 200, a veces con 400/401)
  if (json?.errors?.length) {
    const { message, extensions } = json.errors[0]
    const code = extensions?.code ?? null
    if (code === 'UNAUTHENTICATED' && tokenActual) alExpirarSesion()
    throw new ApiError(message, code)
  }

  if (!response.ok || !json) {
    throw new ApiError(`Error ${response.status} al consultar la API`, `HTTP_${response.status}`)
  }

  return json.data
}

// ---------------------------------------------------------------
// Fragmentos
// ---------------------------------------------------------------
const USUARIO = `id nombre correo rol escuelaId negocioId cafeteriaId fotoPerfilUrl escuela { id nombre }`

const CAFETERIA = `id nombre ubicacion activa escuelaId escuela { id nombre ciudad }`

const PEDIDO = `
  id usuarioId cafeteriaId estado notas
  items { productoId nombreProducto cantidad precioUnitario { monto moneda } }
  total { monto moneda }
  tiempoEstimadoMin horaRecogida posicionEnCola creadoEn
  historial { estado fecha usuarioId }
`

const PRODUCTO = `
  id nombre descripcion categoria etiqueta imagenUrl
  precio { monto moneda }
  disponible agotado destacado tiempoPreparacionMin cafeteriaId
  inventario { stock puntoReorden cantidadReposicion requiereReposicion }
`

// ---------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------
export const login = async (correo, password) => {
  const data = await graphqlRequest(
    `mutation Login($correo: String!, $password: String!) {
      login(correo: $correo, password: $password) {
        token expiraEn
        usuario { ${USUARIO} }
      }
    }`,
    { correo, password },
  )
  return data.login
}

export const logout = async () => {
  try {
    await graphqlRequest(`mutation { logout }`)
  } catch {
    // Si el token ya venció, no hay nada que revocar
  }
}

export const getMe = async () => {
  const data = await graphqlRequest(`query { me { ${USUARIO} } }`)
  return data.me
}

// Negocio de la cuenta (JEFE o VENDEDOR) con todas sus cafeterías
export const getMiNegocio = async () => {
  const data = await graphqlRequest(
    `query { miNegocio { id nombre estado motivoRechazo cafeterias { ${CAFETERIA} } } }`,
  )
  return data.miNegocio
}

// ---------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------
export const getEstadosPedido = async () => {
  const data = await graphqlRequest(
    `query { estadosPedido { clave nombre orden esInicial esFinal transiciones } }`,
  )
  return data.estadosPedido
}

export const getMonedas = async () => {
  const data = await graphqlRequest(`query { monedas { codigo nombre simbolo activa } }`)
  return data.monedas.filter((m) => m.activa)
}

export const getEscuelas = async () => {
  const data = await graphqlRequest(`query { catalogoEscuelas { id nombre ciudad } }`)
  return data.catalogoEscuelas
}

// ---------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------
// Pedidos activos (PENDIENTE, ACEPTADO, EN_PREPARACION, LISTO) por hora de recogida
export const getColaCafeteria = async (cafeteriaId) => {
  const data = await graphqlRequest(
    `query Cola($cafeteriaId: ID!) { colaCafeteria(cafeteriaId: $cafeteriaId) { ${PEDIDO} } }`,
    { cafeteriaId },
  )
  return data.colaCafeteria
}

// Todos los pedidos de la cafetería, los más nuevos primero
export const getPedidosCafeteria = async (cafeteriaId) => {
  const data = await graphqlRequest(
    `query Pedidos($cafeteriaId: ID!) { pedidosPorCafeteria(cafeteriaId: $cafeteriaId) { ${PEDIDO} } }`,
    { cafeteriaId },
  )
  return data.pedidosPorCafeteria
}

export const actualizarEstadoPedido = async (pedidoId, nuevoEstado, codigoRecogida = null) => {
  const data = await graphqlRequest(
    `mutation Estado($pedidoId: ID!, $nuevoEstado: String!, $codigoRecogida: String) {
      actualizarEstadoPedido(pedidoId: $pedidoId, nuevoEstado: $nuevoEstado, codigoRecogida: $codigoRecogida) {
        ${PEDIDO}
      }
    }`,
    { pedidoId, nuevoEstado, codigoRecogida },
  )
  return data.actualizarEstadoPedido
}

// ---------------------------------------------------------------
// Productos
// ---------------------------------------------------------------
export const getProductos = async (cafeteriaId) => {
  const data = await graphqlRequest(
    `query Productos($cafeteriaId: ID!) { productosPorCafeteria(cafeteriaId: $cafeteriaId) { ${PRODUCTO} } }`,
    { cafeteriaId },
  )
  return data.productosPorCafeteria
}

export const cambiarDisponibilidad = async (productoId, disponible) => {
  const data = await graphqlRequest(
    `mutation Disp($productoId: ID!, $disponible: Boolean!) {
      cambiarDisponibilidadProducto(productoId: $productoId, disponible: $disponible) { ${PRODUCTO} }
    }`,
    { productoId, disponible },
  )
  return data.cambiarDisponibilidadProducto
}

export const reponerInventario = async (productoId, cantidad = null) => {
  const data = await graphqlRequest(
    `mutation Reponer($productoId: ID!, $cantidad: Int) {
      reponerInventario(productoId: $productoId, cantidad: $cantidad) { ${PRODUCTO} }
    }`,
    { productoId, cantidad },
  )
  return data.reponerInventario
}

export const actualizarProducto = async (productoId, cambios) => {
  const data = await graphqlRequest(
    `mutation Editar($productoId: ID!, $cambios: ProductoCambiosInput!) {
      actualizarProducto(productoId: $productoId, cambios: $cambios) { ${PRODUCTO} }
    }`,
    { productoId, cambios },
  )
  return data.actualizarProducto
}

export const registrarProducto = async (variables) => {
  const data = await graphqlRequest(
    `mutation Nuevo(
      $nombre: String!, $precio: DineroInput!, $disponible: Boolean, $inventario: InventarioInput!,
      $cafeteriaId: ID!, $descripcion: String, $categoria: String, $imagenUrl: String,
      $destacado: Boolean, $etiqueta: String, $tiempoPreparacionMin: Int
    ) {
      registrarProducto(
        nombre: $nombre, precio: $precio, disponible: $disponible, inventario: $inventario,
        cafeteriaId: $cafeteriaId, descripcion: $descripcion, categoria: $categoria,
        imagenUrl: $imagenUrl, destacado: $destacado, etiqueta: $etiqueta,
        tiempoPreparacionMin: $tiempoPreparacionMin
      ) { ${PRODUCTO} }
    }`,
    variables,
  )
  return data.registrarProducto
}

// Sube una imagen de producto a Cloudinary con la firma que genera el backend
export const subirImagenProducto = async (cafeteriaId, archivo) => {
  const data = await graphqlRequest(
    `mutation Firma($cafeteriaId: ID) {
      solicitarFirmaSubida(tipo: PRODUCTO, cafeteriaId: $cafeteriaId) {
        signature timestamp apiKey cloudName folder uploadPreset
      }
    }`,
    { cafeteriaId },
  )
  const firma = data.solicitarFirmaSubida

  const form = new FormData()
  form.append('file', archivo)
  form.append('api_key', firma.apiKey)
  form.append('timestamp', String(firma.timestamp))
  form.append('signature', firma.signature)
  form.append('folder', firma.folder)
  form.append('upload_preset', firma.uploadPreset)

  let response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new ApiError('No se pudo subir la imagen a Cloudinary.', 'NETWORK')
  }
  const json = await response.json().catch(() => null)
  if (!response.ok || !json?.secure_url) {
    throw new ApiError(json?.error?.message ?? 'Cloudinary rechazó la imagen.', 'UPLOAD')
  }
  return json.secure_url
}

// ---------------------------------------------------------------
// Cafeterías (JEFE)
// ---------------------------------------------------------------
// La escuela va por id (del catálogo) o por nombre + ciudad (se crea si no existe)
export const registrarCafeteria = async ({ nombre, ubicacion, escuelaId, nombreEscuela, ciudadEscuela }) => {
  const data = await graphqlRequest(
    `mutation NuevaCafeteria(
      $nombre: String!, $ubicacion: String, $escuelaId: ID, $nombreEscuela: String, $ciudadEscuela: String
    ) {
      registrarCafeteria(
        nombre: $nombre, ubicacion: $ubicacion, escuelaId: $escuelaId,
        nombreEscuela: $nombreEscuela, ciudadEscuela: $ciudadEscuela
      ) { ${CAFETERIA} }
    }`,
    { nombre, ubicacion, escuelaId, nombreEscuela, ciudadEscuela },
  )
  return data.registrarCafeteria
}
