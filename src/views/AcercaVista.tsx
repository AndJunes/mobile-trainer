import type { ReactNode } from 'react'
import { RichText } from '../components/RichText'
import { proyecto } from '../lib/contenido'

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
      <h2 className="text-lg font-black tracking-tight text-ink">{titulo}</h2>
      <div className="mt-3 leading-relaxed text-muted">{children}</div>
    </section>
  )
}

/** Qué es el proyecto, cómo funciona, cómo se hizo y quién lo hizo. */
export function AcercaVista() {
  const p = proyecto
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-lime">Acerca del proyecto</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-balance sm:text-4xl">{p.nombre}</h1>
        <p className="mt-2 text-lg text-muted">{p.bajada}</p>
      </header>

      <Bloque titulo="El problema"><p><RichText texto={p.problema} /></p></Bloque>
      <Bloque titulo="La solución"><p><RichText texto={p.solucion} /></p></Bloque>

      <Bloque titulo="El método">
        <ul className="grid gap-3">
          {p.metodo.map((m) => (
            <li key={m.titulo} className="rounded-xl bg-white/[0.03] p-3">
              <p className="font-bold text-ink">{m.titulo}</p>
              <p className="mt-1"><RichText texto={m.texto} /></p>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Tecnologías">
        <ul className="grid gap-2">
          {p.stack.map((s) => (
            <li key={s.nombre}><span className="font-bold text-ink">{s.nombre}</span>: {s.detalle}</li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Cómo se hizo el contenido">
        <ul className="list-disc space-y-2 pl-5">
          {p.comoSeHizo.map((t, i) => <li key={i}><RichText texto={t} /></li>)}
        </ul>
      </Bloque>

      <Bloque titulo="Términos de la cursada">
        <dl className="grid gap-2">
          {p.terminos.map((t) => (
            <div key={t.termino}>
              <dt className="inline font-bold text-ink">{t.termino}: </dt>
              <dd className="inline">{t.definicion}</dd>
            </div>
          ))}
        </dl>
      </Bloque>

      <section className="rounded-3xl border border-purple/40 bg-gradient-to-br from-purple/15 to-cyan/5 p-5 sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-purple">Hecho por</p>
        <p className="mt-1 text-2xl font-black text-ink">{p.autora.nombre}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {[...p.autora.links, { etiqueta: 'Código en GitHub', url: p.repo }].map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel px-4 py-2 text-sm font-bold text-ink hover:border-purple">
                {l.etiqueta} <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
