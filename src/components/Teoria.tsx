import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { Tema } from '../types/contenido'
import { RichText } from './RichText'

interface Seccion {
  id: string
  titulo: string
  contenido: ReactNode
}

const etiquetaFuente = { clase: 'Dado en clase', pdf: 'Solo en el material (PDF)', mixto: 'Clase + material' }

/** Arma las secciones que tiene el tema; las que no tienen contenido no aparecen en la guía. */
function secciones(tema: Tema): Seccion[] {
  const s: Seccion[] = [
    {
      id: 'teoria',
      titulo: 'Teoría',
      contenido: (
        <div className="flex flex-col gap-3">
          {tema.explicacion.map((p, i) => <p key={i}><RichText texto={p} glosario /></p>)}
        </div>
      ),
    },
  ]
  if (tema.pasos?.length) {
    s.push({
      id: 'pasos',
      titulo: 'Paso a paso',
      contenido: (
        <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-purple">
          {tema.pasos.map((p, i) => <li key={i}><RichText texto={p} glosario /></li>)}
        </ol>
      ),
    })
  }
  if (tema.definiciones?.length) {
    s.push({
      id: 'definiciones',
      titulo: 'Definiciones',
      contenido: (
        <dl className="grid gap-3">
          {tema.definiciones.map((d, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] p-3">
              <dt className="font-bold text-ink"><RichText texto={d.termino} /></dt>
              <dd className="mt-1"><RichText texto={d.definicion} />{d.ref && <span className="ml-1 text-xs text-muted/80">{d.ref}</span>}</dd>
            </div>
          ))}
        </dl>
      ),
    })
  }
  if (tema.comparacion) {
    const c = tema.comparacion
    s.push({
      id: 'comparacion',
      titulo: c.titulo ?? 'Comparación',
      contenido: (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>{c.columnas.map((col, i) => <th key={i} scope="col" className="border-b border-line bg-white/5 p-2.5 font-bold text-ink"><RichText texto={col} /></th>)}</tr>
            </thead>
            <tbody>
              {c.filas.map((f, i) => (
                <tr key={i}>{f.map((celda, j) => <td key={j} className="border-b border-line/60 p-2.5 align-top"><RichText texto={celda} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    })
  }
  if (tema.erroresComunes?.length) {
    s.push({
      id: 'errores',
      titulo: 'Errores comunes',
      contenido: (
        <ul className="space-y-2">
          {tema.erroresComunes.map((e, i) => (
            <li key={i} className="rounded-xl bg-pink/10 p-3">
              <RichText texto={e.texto} glosario />{e.ref && <span className="ml-1 text-xs text-muted/80">{e.ref}</span>}
            </li>
          ))}
        </ul>
      ),
    })
  }
  if (tema.citasProfe?.length) {
    s.push({
      id: 'profe',
      titulo: 'Lo que dijo el profe',
      contenido: (
        <div className="flex flex-col gap-3">
          {tema.citasProfe.map((c, i) => (
            <blockquote key={i} className="rounded-xl bg-lime/10 p-3 text-ink">
              <p>“{c.texto}”</p>
              <footer className="mt-1 text-xs text-muted">{c.ref}</footer>
            </blockquote>
          ))}
        </div>
      ),
    })
  }
  if (tema.codigoClase) {
    const c = tema.codigoClase
    s.push({
      id: 'codigo',
      titulo: 'Código de ejemplo',
      contenido: (
        <>
          <pre className="overflow-x-auto rounded-xl bg-code p-4 font-mono text-[13px] leading-relaxed text-ink"><code>{c.fragmento}</code></pre>
          <p className="mt-2 text-xs">
            {c.nota && <><RichText texto={c.nota} /> · </>}
            <span className="text-muted/80">{c.ref}</span>
          </p>
        </>
      ),
    })
  }
  if (tema.aclaraciones?.length) {
    s.push({
      id: 'aclaraciones',
      titulo: 'Aclaraciones sobre las fuentes',
      contenido: (
        <ul className="list-disc space-y-2 pl-5">
          {tema.aclaraciones.map((a, i) => <li key={i}><RichText texto={a} /></li>)}
        </ul>
      ),
    })
  }
  return s
}

/**
 * Teoría del tema: el resumen siempre visible y una guía lateral (a la derecha en pantallas grandes)
 * que muestra una sola sección por vez, para no mezclar la teoría con las definiciones o las citas.
 */
export function Teoria({ tema }: { tema: Tema }) {
  const lista = secciones(tema)
  const [activa, setActiva] = useState(lista[0].id)
  const actual = lista.find((s) => s.id === activa) ?? lista[0]
  const base = useId()
  const panel = useRef<HTMLElement>(null)
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])

  const elegir = (id: string) => {
    setActiva(id)
    // Si el panel quedó arriba de la pantalla, se lo trae a la vista.
    const top = panel.current?.getBoundingClientRect().top ?? 0
    if (top < 0) panel.current?.scrollIntoView({ block: 'start' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = lista.findIndex((s) => s.id === actual.id)
    const destino =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % lista.length
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + lista.length) % lista.length
          : e.key === 'Home' ? 0
            : e.key === 'End' ? lista.length - 1
              : -1
    if (destino < 0) return
    e.preventDefault()
    elegir(lista[destino].id)
    pestanas.current[destino]?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-purple/40 bg-gradient-to-br from-purple/15 to-cyan/5 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest">
          <span className="text-purple">Antes de las preguntas · en pocas palabras</span>
          <span className="rounded-full border border-line px-2 py-0.5 text-muted normal-case tracking-normal">{etiquetaFuente[tema.fuenteTipo]}</span>
          {tema.enfasisClase >= 3 && (
            <span className="rounded-full bg-pink/20 px-2 py-0.5 text-pink normal-case tracking-normal">El profe lo remarcó</span>
          )}
        </div>
        <p className="text-lg leading-relaxed text-ink"><RichText texto={tema.resumen} glosario /></p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section
            ref={panel}
            key={actual.id}
            role="tabpanel"
            id={`${base}-panel`}
            aria-labelledby={`${base}-tab-${actual.id}`}
            tabIndex={0}
            className="animate-aparecer scroll-mt-20 rounded-2xl border border-line bg-panel/60 p-5 sm:p-6"
          >
            <h2 className="mb-3 text-lg font-extrabold text-ink"><RichText texto={actual.titulo} /></h2>
            <div className="leading-relaxed text-muted">{actual.contenido}</div>
          </section>

          <p className="px-1 text-xs text-muted">
            <span className="font-bold">Fuentes:</span> {tema.referencias.join(' · ')}
          </p>
        </div>

        <nav aria-label="Guía del tema" className="order-first min-w-0 lg:sticky lg:top-6 lg:order-none">
          <div className="mb-2 hidden text-[11px] font-extrabold uppercase tracking-widest text-muted lg:block">Guía del tema</div>
          <div
            role="tablist"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border lg:border-line lg:bg-panel/60 lg:p-2"
          >
            {lista.map((s, i) => {
              const sel = s.id === actual.id
              return (
                <button
                  key={s.id}
                  ref={(el) => { pestanas.current[i] = el }}
                  type="button"
                  role="tab"
                  id={`${base}-tab-${s.id}`}
                  aria-selected={sel}
                  aria-controls={`${base}-panel`}
                  tabIndex={sel ? 0 : -1}
                  onClick={() => elegir(s.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                    sel ? 'bg-purple/20 text-ink ring-1 ring-purple/50' : 'text-muted hover:bg-white/5 hover:text-ink'
                  }`}
                >
                  <span className={`text-xs tabular-nums ${sel ? 'text-purple' : 'text-muted/70'}`}>{i + 1}</span>
                  <span className="lg:truncate"><RichText texto={s.titulo} /></span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
