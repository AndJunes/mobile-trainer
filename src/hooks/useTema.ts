import { useEffect, useState } from 'react'

export type Tema = 'oscuro' | 'claro'
const CLAVE = 'modoDefensa_tema'

function inicial(): Tema {
  try {
    return localStorage.getItem(CLAVE) === 'claro' ? 'claro' : 'oscuro'
  } catch {
    return 'oscuro'
  }
}

/** Tema visual: oscuro por defecto, como la app original; claro opcional. */
export function useTemaVisual() {
  const [tema, setTema] = useState<Tema>(inicial)
  useEffect(() => {
    document.documentElement.dataset.theme = tema
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      /* sin almacenamiento */
    }
  }, [tema])
  return { tema, alternar: () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro')) }
}
