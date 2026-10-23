import { RichText } from '../components/RichText'
import { useProgreso } from '../hooks/useProgreso'
import { hrefDe } from '../hooks/useRuta'
import { proyecto, totalTemas, unidades } from '../lib/contenido'

const sinPrefijo = (t: string) => t.replace(/^U0\d\s*—\s*/, '')

const pasos = [
  { n: '1', titulo: 'Teoría', texto: 'El tema como se dio en clase, dividido en secciones y con sus fuentes.' },
  { n: '2', titulo: 'Desafío', texto: 'Tres preguntas reales: escribís tu respuesta y después la comparás con la de la guía.' },
  { n: '3', titulo: 'Conexión con el TP', texto: 'Dónde se ve el tema en el código del proyecto y si está implementado.' },
]

/** Pantalla de inicio: qué es la app y las 7 unidades con su progreso. */
export function InicioVista() {
  const { estado } = useProgreso()
  const hechos = Object.keys(estado.temas).length
  // Primer tema sin dominar, para retomar donde quedaste.
  const siguiente = unidades.flatMap((u) => u.temas).find((t) => !estado.temas[t])
  const c = proyecto.cifras

  return (
    <div className="flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-purple/25 via-panel to-cyan/15 p-6 sm:p-9">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-lime">{proyecto.nombre} · {proyecto.bajada}</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-5xl">Entendé. Respondé. Defendé.</h1>
        <p className="mt-3 max-w-2xl text-muted"><RichText texto={proyecto.resumen} /></p>
        <div className="mt-6 flex flex-wrap gap-2">
          {siguiente && (
            <a href={hrefDe({ vista: 'tema', temaId: siguiente })}
              className="rounded-2xl bg-gradient-to-r from-purple to-pink px-5 py-3 font-extrabold text-on-accent">
              {hechos === 0 ? 'Empezar la primera misión →' : 'Seguir donde quedé →'}
            </a>
          )}
          <a href={hrefDe({ vista: 'acerca' })} className="rounded-2xl border border-line px-5 py-3 font-bold text-ink hover:border-purple">
            Acerca del proyecto
          </a>
        </div>
        <dl className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            [c.unidades, 'unidades'],
            [c.temas, 'temas'],
            [c.preguntas, 'preguntas'],
            [c.terminos, 'términos de glosario'],
          ].map(([n, t]) => (
            <div key={t} className="flex items-baseline gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <dt className="sr-only">{t}</dt>
              <dd className="font-black tabular-nums text-ink">{n}</dd>
              <span aria-hidden="true" className="text-muted">{t}</span>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="como-t">
        <h2 id="como-t" className="text-xl font-black tracking-tight">Cómo es cada misión</h2>
        <ol className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
          {pasos.map((p) => (
            <li key={p.n} className="rounded-2xl border border-line bg-panel/70 p-5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple">Paso {p.n}</span>
              <p className="mt-1 text-lg font-extrabold text-ink">{p.titulo}</p>
              <p className="mt-1 text-sm text-muted">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="unidades-t">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="unidades-t" className="text-xl font-black tracking-tight">Las {unidades.length} unidades</h2>
          <span className="text-sm text-muted tabular-nums">{hechos} de {totalTemas} temas dominados</span>
        </div>
        <ul className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr))]">
          {unidades.map((u) => {
            const n = u.temas.filter((t) => estado.temas[t]).length
            const pct = Math.round((100 * n) / u.temas.length)
            return (
              <li key={u.id}>
                <a href={hrefDe({ vista: 'unidad', unidadId: u.id })}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-panel/70 p-5 transition hover:-translate-y-0.5 hover:border-purple">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple tabular-nums">Unidad {u.id.slice(1)}</span>
                  <span className="text-lg font-extrabold leading-snug text-ink">{sinPrefijo(u.titulo)}</span>
                  <span className="mt-auto flex flex-col gap-1.5">
                    <span className="flex justify-between text-xs text-muted tabular-nums">
                      <span>{u.temas.length} temas</span>
                      <span>{n}/{u.temas.length} dominados</span>
                    </span>
                    <span role="progressbar" aria-label={`Progreso de la unidad ${u.id.slice(1)}`} aria-valuemin={0} aria-valuemax={u.temas.length} aria-valuenow={n}
                      className="h-1.5 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-gradient-to-r from-purple via-pink to-lime" style={{ width: `${pct}%` }} />
                    </span>
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
