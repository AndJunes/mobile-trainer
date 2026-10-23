import { useCarga } from '../hooks/useCarga'
import { hrefDe } from '../hooks/useRuta'
import { useProgreso } from '../hooks/useProgreso'
import { cargarTemasDeUnidad, unidades } from '../lib/contenido'
import { RichText } from '../components/RichText'

export function UnidadVista({ unidadId }: { unidadId: string }) {
  const unidad = unidades.find((u) => u.id === unidadId) ?? unidades[0]
  const { dato: temas, cargando } = useCarga(() => cargarTemasDeUnidad(unidad.id), unidad.id)
  const { temaHecho } = useProgreso()
  const hechos = unidad.temas.filter((t) => temaHecho(t)).length

  return (
    <div className="flex flex-col gap-6">
      <a href={hrefDe({ vista: 'inicio' })} className="self-start text-sm font-bold text-muted hover:text-ink">← Todas las unidades</a>

      <section aria-labelledby="unidad-t">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-purple">Unidad {unidad.id.slice(1)}</p>
        <h1 id="unidad-t" className="mt-1 text-3xl font-black tracking-tight text-balance sm:text-4xl">{unidad.titulo.replace(/^U0\d\s*—\s*/, '')}</h1>
        <p className="mt-2 text-sm text-muted tabular-nums">{unidad.temas.length} misiones · {hechos} dominadas. Cada una tiene teoría, 3 preguntas y la conexión con el TP.</p>
        {unidad.descripcion && <p className="mt-2 max-w-3xl text-muted">{unidad.descripcion}</p>}

        {cargando && <p className="mt-6 text-muted">Cargando los temas…</p>}
        <ul className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr))]">
          {temas?.map((t, i) => {
            const hecho = temaHecho(t.id)
            return (
              <li key={t.id}>
                <a href={hrefDe({ vista: 'tema', temaId: t.id })}
                  className={`flex h-full flex-col gap-3 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-purple ${hecho ? 'border-lime/40 bg-lime/5' : 'border-line bg-panel/70'}`}>
                  <span className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest">
                    <span className="text-purple tabular-nums">Misión {String(i + 1).padStart(2, '0')}</span>
                    {hecho && <span className="text-lime">✓ Dominado</span>}
                  </span>
                  <span className="text-lg font-extrabold leading-snug text-ink"><RichText texto={t.titulo} /></span>
                  <span className="line-clamp-3 text-sm text-muted"><RichText texto={t.resumen} /></span>
                  <span className="mt-auto flex flex-wrap gap-1.5 text-xs">
                    {t.enfasisClase >= 3 && <span className="rounded-full bg-pink/15 px-2 py-0.5 font-bold text-pink">Remarcado en clase</span>}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-bold text-muted">{hecho ? 'Repasar y reforzar' : 'Teoría + 3 preguntas'}</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
