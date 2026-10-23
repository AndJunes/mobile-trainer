import type { ReactNode } from 'react'
import type { Pregunta } from '../types/contenido'
import { MarkdownBloque, RichText } from './RichText'

function Campo({ etiqueta, color, children }: { etiqueta: string; color: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-4">
      <div className={`mb-1.5 text-[11px] font-extrabold uppercase tracking-widest ${color}`}>{etiqueta}</div>
      <div className="leading-relaxed text-muted">{children}</div>
    </div>
  )
}

function Plegable({ titulo, children, abierto = false }: { titulo: string; children: ReactNode; abierto?: boolean }) {
  return (
    <details open={abierto} className="group rounded-xl border border-line">
      <summary className="flex items-center justify-between px-4 py-3 text-sm font-extrabold text-ink">
        {titulo}<span aria-hidden="true" className="text-muted transition group-open:rotate-90">›</span>
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>
    </details>
  )
}

/** Respuesta real de la guía. Primero lo que se dice en la Meet; el resto, desplegable. */
export function Respuesta({ pregunta }: { pregunta: Pregunta }) {
  const c = pregunta.campos
  return (
    <div className="flex flex-col gap-3">
      {c.preguntaOriginal && (
        <Campo etiqueta="Lo que preguntó el profe en clase" color="text-cyan"><RichText texto={c.preguntaOriginal} /></Campo>
      )}
      {c.respuestaBreve ? (
        <div className="rounded-xl border border-lime/50 bg-lime/10 p-4">
          <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-lime">Para decir en la Meet (30–60 s)</div>
          <p className="leading-relaxed text-ink"><RichText texto={c.respuestaBreve} glosario /></p>
        </div>
      ) : (
        <div className="rounded-xl border border-lime/50 bg-lime/10 p-4">
          <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-lime">Respuesta modelo</div>
          <p className="leading-relaxed text-ink"><RichText texto={c.respuestaModelo} glosario /></p>
        </div>
      )}
      {c.clave && c.clave.length > 0 && (
        <Campo etiqueta="Lo que no podés olvidar mencionar" color="text-lime">
          <ul className="list-disc space-y-1 pl-5">{c.clave.map((k, i) => <li key={i}><RichText texto={k} /></li>)}</ul>
        </Campo>
      )}
      {c.respuestaBreve && (
        <Plegable titulo="Respuesta modelo completa">
          <p className="leading-relaxed text-muted"><RichText texto={c.respuestaModelo} glosario /></p>
        </Plegable>
      )}
      {pregunta.extras && (
        <Plegable titulo="Material adicional de la guía"><div className="text-muted"><MarkdownBloque texto={pregunta.extras} /></div></Plegable>
      )}
      {c.repregunta && (
        <Plegable titulo="Repregunta probable">
          <p className="font-bold text-gold"><RichText texto={c.repregunta} /></p>
          {c.respuestaRepregunta && <p className="leading-relaxed text-muted"><RichText texto={c.respuestaRepregunta} glosario /></p>}
        </Plegable>
      )}
      {(c.fundamento || c.aplicacion || c.origen || c.tema || c.clasificacion || c.fuente) && (
        <Plegable titulo="Fundamento, aplicación y origen">
          {c.tema && <Campo etiqueta="Tema" color="text-muted"><RichText texto={c.tema} /></Campo>}
          {c.fundamento && <Campo etiqueta="Fundamento teórico" color="text-purple"><RichText texto={c.fundamento} /></Campo>}
          {c.aplicacion && <Campo etiqueta="Aplicación en el TP" color="text-cyan"><RichText texto={c.aplicacion} /></Campo>}
          {c.origen && <Campo etiqueta="Origen de la pregunta" color="text-muted"><RichText texto={c.origen} /></Campo>}
          {c.clasificacion && <Campo etiqueta="Clasificación" color="text-muted"><RichText texto={c.clasificacion} /></Campo>}
          {c.fuente && <Campo etiqueta="Fuente" color="text-muted"><RichText texto={c.fuente} /></Campo>}
          {c.prioridadTexto && <Campo etiqueta="Prioridad de estudio" color="text-muted"><RichText texto={c.prioridadTexto} /></Campo>}
        </Plegable>
      )}
    </div>
  )
}

export const etiquetaPrioridad = { alta: 'Prioridad alta', media: 'Prioridad media', complementaria: 'Complementaria' }

export function InsigniaPrioridad({ prioridad }: { prioridad: Pregunta['prioridad'] }) {
  if (!prioridad) return null
  const estilos = { alta: 'bg-pink/20 text-pink', media: 'bg-gold/20 text-gold', complementaria: 'bg-white/10 text-muted' }
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${estilos[prioridad]}`}>{etiquetaPrioridad[prioridad]}</span>
}
