// Cliente GraphQL del backend "Pide y Recoge" (repo Basededatosavanzadas, Apollo Server).
// La URL se puede cambiar con VITE_API_URL en un archivo .env.local
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/'

// Envía una consulta GraphQL y devuelve el campo "data" de la respuesta.
// Si se pasa un token, va en Authorization: Bearer <token> (sesión JWT + Redis del backend).
export const graphqlRequest = async (query, variables = {}, token = null) => {
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
  } catch {
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Revisa que el backend esté levantado.`,
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
    throw new Error(json.errors[0].message)
  }

  if (!response.ok || !json) {
    throw new Error(`Error ${response.status} al consultar la API`)
  }

  return json.data
}

// Catálogo público: escuelas activas con sus cafeterías
export const getEscuelas = async () => {
  const data = await graphqlRequest(
    `query CatalogoEscuelas {
      catalogoEscuelas {
        id clave nombre ciudad
        cafeterias { id nombre ubicacion }
      }
    }`,
  )
  return data.catalogoEscuelas
}

// Menú de una cafetería agrupado por categoría (destacados primero)
export const getMenu = async (cafeteriaId) => {
  const data = await graphqlRequest(
    `query MenuPorCategoria($cafeteriaId: ID!) {
      menuPorCategoria(cafeteriaId: $cafeteriaId) {
        categoria
        productos {
          id nombre descripcion categoria
          precio { monto moneda }
          imagenUrl destacado etiqueta
          tiempoPreparacionMin agotado
        }
      }
    }`,
    { cafeteriaId },
  )
  return data.menuPorCategoria
}
