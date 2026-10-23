import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { escribir, leer } from '../lib/almacen'
import { unidades } from '../lib/contenido'

const CLAVE = 'modoDefensa_v2'
const CLAVE_V1 = 'modoDefensaReservas_v1'

export type EstadoPregunta = 'bien' | 'repasar'

interface Estado {
  temas: Record<string, true>
  preguntas: Record<string, EstadoPregunta>
  respuestas: Record<string, string>
  /** Claves que ya sumaron XP: los puntos se otorgan una sola vez. */
  otorgado: Record<string, true>
  xp: number
}

const VACIO: Estado = { temas: {}, preguntas: {}, respuestas: {}, otorgado: {}, xp: 0 }

/** La app anterior guardaba el progreso por posición ("unidad-tema"); los 66 temas están en el mismo orden. */
function migrarV1(): Estado | null {
  const v1 = leer<{ completed?: Record<string, boolean>; xp?: number }>(CLAVE_V1)
  if (!v1?.completed) return null
  const est: Estado = { ...VACIO, temas: {}, otorgado: {}, xp: v1.xp ?? 0 }
  for (const [clave, hecho] of Object.entries(v1.completed)) {
    const [ui, ti] = clave.split('-').map(Number)
    const id = unidades[ui]?.temas[ti]
    if (hecho && id) {
      est.temas[id] = true
      est.otorgado[`t:${id}`] = true
    }
  }
  return est
}

function cargar(): Estado {
  return { ...VACIO, ...(leer<Estado>(CLAVE) ?? migrarV1() ?? {}) }
}

interface Api {
  estado: Estado
  temaHecho: (id: string) => boolean
  completarTema: (id: string) => boolean
  marcarPregunta: (id: string, e: EstadoPregunta) => number
  guardarRespuesta: (id: string, texto: string) => void
  reiniciar: () => void
}

const Ctx = createContext<Api | null>(null)

export function ProgresoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(cargar)

  useEffect(() => {
    escribir(CLAVE, estado)
  }, [estado])

  const temaHecho = useCallback((id: string) => !!estado.temas[id], [estado.temas])

  /** Devuelve true si es la primera vez (suma 25 XP). */
  const completarTema = useCallback(
    (id: string) => {
      const primera = !estado.otorgado[`t:${id}`]
      setEstado((s) => ({
        ...s,
        temas: { ...s.temas, [id]: true },
        otorgado: primera ? { ...s.otorgado, [`t:${id}`]: true } : s.otorgado,
        xp: primera ? s.xp + 25 : s.xp,
      }))
      return primera
    },
    [estado.otorgado],
  )

  /** Devuelve los XP sumados (10 la primera vez que se responde bien, 0 si no). */
  const marcarPregunta = useCallback(
    (id: string, e: EstadoPregunta) => {
      const suma = e === 'bien' && !estado.otorgado[`q:${id}`] ? 10 : 0
      setEstado((s) => ({
        ...s,
        preguntas: { ...s.preguntas, [id]: e },
        otorgado: suma ? { ...s.otorgado, [`q:${id}`]: true } : s.otorgado,
        xp: s.xp + suma,
      }))
      return suma
    },
    [estado.otorgado],
  )

  const guardarRespuesta = useCallback((id: string, texto: string) => {
    setEstado((s) => ({ ...s, respuestas: { ...s.respuestas, [id]: texto } }))
  }, [])

  const reiniciar = useCallback(() => setEstado(VACIO), [])

  const api = useMemo(
    () => ({ estado, temaHecho, completarTema, marcarPregunta, guardarRespuesta, reiniciar }),
    [estado, temaHecho, completarTema, marcarPregunta, guardarRespuesta, reiniciar],
  )
  return <Ctx value={api}>{children}</Ctx>
}

export function useProgreso(): Api {
  const api = useContext(Ctx)
  if (!api) throw new Error('useProgreso tiene que usarse dentro de <ProgresoProvider>')
  return api
}
