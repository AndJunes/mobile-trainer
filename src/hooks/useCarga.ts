import { useEffect, useState } from 'react'

/** Ejecuta una carga asíncrona y expone su estado. Se vuelve a ejecutar cuando cambia `clave`. */
export function useCarga<T>(cargar: () => Promise<T>, clave: string) {
  const [estado, setEstado] = useState<{ clave: string; dato?: T; error?: unknown }>({ clave })

  useEffect(() => {
    let vigente = true
    cargar().then(
      (dato) => vigente && setEstado({ clave, dato }),
      (error) => vigente && setEstado({ clave, error }),
    )
    return () => {
      vigente = false
    }
  }, [clave])

  const actual = estado.clave === clave
  return {
    dato: actual ? estado.dato : undefined,
    error: actual ? estado.error : undefined,
    cargando: !actual || (estado.dato === undefined && estado.error === undefined),
  }
}
