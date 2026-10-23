import type { Tema } from '../types/contenido'
import { RichText } from './RichText'

const estados = {
  implementado: { texto: 'Implementado en el TP', clase: 'bg-lime/15 text-lime' },
  parcial: { texto: 'Implementado en parte', clase: 'bg-gold/15 text-gold' },
  'no-implementado': { texto: 'No implementado', clase: 'bg-pink/15 text-pink' },
  'a-verificar': { texto: 'A verificar en el teléfono', clase: 'bg-white/10 text-muted' },
}

export function ConexionTP({ tema }: { tema: Tema }) {
  const e = estados[tema.aplicacionTP.estado]
  return (
    <section className="rounded-3xl border border-cyan/40 bg-gradient-to-br from-cyan/10 to-transparent p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-cyan">Conexión con el TP</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${e.clase}`}>{e.texto}</span>
      </div>
      <p className="mt-3 leading-relaxed text-ink"><RichText texto={tema.aplicacionTP.texto} glosario /></p>
      {tema.aplicacionTP.archivos.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {tema.aplicacionTP.archivos.map((a, i) => (
            <li key={i} className="text-sm text-muted">
              <code className="rounded-md bg-code px-1.5 py-0.5 font-mono text-cyan [overflow-wrap:anywhere]">{a.ruta}{a.lineas ? `:${a.lineas}` : ''}</code>
              {a.nota && <> — <RichText texto={a.nota} /></>}
            </li>
          ))}
        </ul>
      )}
      {tema.preguntasRapidas.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-muted">Preguntas rápidas para practicar en voz alta</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {tema.preguntasRapidas.map((q, i) => <li key={i}><RichText texto={q} /></li>)}
          </ul>
        </div>
      )}
    </section>
  )
}
