import { useEffect, useState } from 'react'
import { unidades } from '../lib/contenido'

export type Ruta =
  | { vista: 'unidad'; unidadId: string }
  | { vista: 'tema'; temaId: string }
  | { vista: 'banco' }
  | { vista: 'repaso' }
  | { vista: 'glosario' }

function leerHash(): Ruta {
  const [, vista, id] = location.hash.replace(/^#\/?/, '#/').split('/')
  if (vista === 'tema' && id) return { vista: 'tema', temaId: decodeURIComponent(id) }
  if (vista === 'banco') return { vista: 'banco' }
  if (vista === 'repaso') return { vista: 'repaso' }
  if (vista === 'glosario') return { vista: 'glosario' }
  const u = unidades.find((x) => x.id === id) ?? unidades[0]
  return { vista: 'unidad', unidadId: u.id }
}

export function hrefDe(r: Ruta): string {
  switch (r.vista) {
    case 'unidad': return `#/unidad/${r.unidadId}`
    case 'tema': return `#/tema/${encodeURIComponent(r.temaId)}`
    default: return `#/${r.vista}`
  }
}

export function ir(r: Ruta) {
  location.hash = hrefDe(r)
}

/** Navegación por hash: cada tema tiene su propio enlace (#/tema/u04-permisos...). */
export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(leerHash)
  useEffect(() => {
    const alCambiar = () => {
      setRuta(leerHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return ruta
}
