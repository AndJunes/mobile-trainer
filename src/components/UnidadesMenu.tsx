import { useEffect, useState } from 'react'
import { useCarga } from '../hooks/useCarga'
import { useProgreso } from '../hooks/useProgreso'
import { hrefDe, type Ruta } from '../hooks/useRuta'
import { cargarTemasDeUnidad, unidades } from '../lib/contenido'
import type { Unidad } from '../types/contenido'
import { RichText } from './RichText'

const sinPrefijo = (t: string) => t.replace(/^U0\d\s*—\s*/, '')

/** Subtemas de una unidad: se cargan recién cuando se despliega. */
function Subtemas({ unidad, temaActivo }: { unidad: Unidad; temaActivo?: string }) {
  const { dato: temas, cargando } = useCarga(() => cargarTemasDeUnidad(unidad.id), unidad.id)
  const { temaHecho } = useProgreso()
  const enUnidad = !temaActivo || !unidad.temas.includes(temaActivo)

  return (
    <ul className="ml-4 flex flex-col gap-0.5 border-l border-line py-1 pl-2">
      <li>
        <a href={hrefDe({ vista: 'unidad', unidadId: unidad.id })} aria-current={enUnidad ? 'page' : undefined}
          className={`block rounded-lg px-2.5 py-1.5 text-xs font-bold ${enUnidad ? 'text-ink' : 'text-muted hover:bg-white/5 hover:text-ink'}`}>
          Ver todas las misiones
        </a>
      </li>
      {cargando && <li className="px-2.5 py-1.5 text-xs text-muted">Cargando temas…</li>}
      {temas?.map((t, i) => {
        const activo = t.id === temaActivo
        const hecho = temaHecho(t.id)
        return (
          <li key={t.id}>
            <a href={hrefDe({ vista: 'tema', temaId: t.id })} aria-current={activo ? 'page' : undefined}
              className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition ${
                activo ? 'bg-purple/20 font-bold text-ink ring-1 ring-purple/40' : 'text-muted hover:bg-white/5 hover:text-ink'
              }`}>
              <span aria-hidden="true" className={`mt-px w-4 shrink-0 text-right text-[11px] tabular-nums ${hecho ? 'text-lime' : 'text-muted/60'}`}>
                {hecho ? '✓' : i + 1}
              </span>
              <span className="min-w-0"><RichText texto={t.titulo} /></span>
              {hecho && <span className="sr-only">(dominado)</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Unidades del menú lateral: cada una se despliega y muestra todos sus subtemas. */
export function UnidadesMenu({ ruta, unidadActiva }: { ruta: Ruta; unidadActiva?: string }) {
  const { estado } = useProgreso()
  const [desplegada, setDesplegada] = useState<string | null>(unidadActiva ?? null)
  const temaActivo = ruta.vista === 'tema' ? ruta.temaId : undefined

  // Al entrar a otra unidad (desde la grilla o con un enlace), se despliega esa.
  useEffect(() => {
    if (unidadActiva) setDesplegada(unidadActiva)
  }, [unidadActiva])

  return (
    <nav aria-label="Unidades" className="flex flex-col gap-1">
      <div className="px-1 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-muted">Unidades</div>
      {unidades.map((u) => {
        const abierta = desplegada === u.id
        const activa = unidadActiva === u.id && (ruta.vista === 'unidad' || ruta.vista === 'tema')
        const n = u.temas.filter((t) => estado.temas[t]).length
        return (
          <div key={u.id}>
            <button
              type="button"
              aria-expanded={abierta}
              aria-controls={`subtemas-${u.id}`}
              onClick={() => setDesplegada(abierta ? null : u.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                activa ? 'bg-purple/20 text-ink ring-1 ring-purple/50' : 'text-muted hover:bg-white/5 hover:text-ink'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-xs font-black text-purple tabular-nums">{u.id.slice(1)}</span>
                <span className="truncate">{sinPrefijo(u.titulo)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted tabular-nums">{n}/{u.temas.length}</span>
                <span aria-hidden="true" className={`text-muted transition ${abierta ? 'rotate-90' : ''}`}>›</span>
              </span>
            </button>
            <div id={`subtemas-${u.id}`} hidden={!abierta}>
              {abierta && <Subtemas unidad={u} temaActivo={temaActivo} />}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
