import { useCarga } from '../hooks/useCarga'
import { hrefDe } from '../hooks/useRuta'
import { useProgreso } from '../hooks/useProgreso'
import { cargarTemasDeUnidad, unidades } from '../lib/contenido'
import { RichText } from '../components/RichText'

export function UnidadVista({ unidadId }: { unidadId: string }) {
  const unidad = unidades.find((u) => u.id === unidadId) ?? unidades[0]
  const { dato: temas, cargando } = useCarga(() => cargarTemasDeUnidad(unidad.id), unidad.id)
  const { temaHecho, estado } = useProgreso()
  const hechos = Object.keys(estado.temas).length

  return (
    <div className="flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-purple/25 via-panel to-cyan/15 p-6 sm:p-9">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-lime">Modo estudio</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-5xl">Entendé. Respondé. Defendé.</h1>
        <p className="mt-3 max-w-2xl text-muted">Cada misión empieza con la teoría que se dio en clase, sigue con 3 preguntas reales de la guía y termina con la conexión con el código del TP.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1 font-bold tabular-nums">{hechos} temas dominados</span>
          <span className="rounded-full bg-white/10 px-3 py-1 font-bold">Teoría + 3 preguntas por tema</span>
        </div>
      </header>

      <section aria-labelledby="unidad-t">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-purple">Unidad {unidad.id.slice(1)}</p>
        <h2 id="unidad-t" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{unidad.titulo.replace(/^U0\d\s*—\s*/, '')}</h2>
        {unidad.descripcion && <p className="mt-2 max-w-3xl text-muted">{unidad.descripcion}</p>}

        {cargando && <p className="mt-6 text-muted">Cargando los temas…</p>}
        <ul className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
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
