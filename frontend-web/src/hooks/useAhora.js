import { useEffect, useState } from 'react'

// Devuelve Date.now() y se actualiza cada `cadaMs` para refrescar "hace 3 min", "en 5 min"…
export const useAhora = (cadaMs = 30000) => {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), cadaMs)
    return () => clearInterval(id)
  }, [cadaMs])

  return ahora
}

export default useAhora
