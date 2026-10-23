import { useState } from 'react'
import { hrefDe } from '../hooks/useRuta'
import { useProgreso } from '../hooks/useProgreso'
import type { Pregunta, Tema } from '../types/contenido'
import { useAviso } from './Aviso'
import { ContextoPregunta } from './ContextoPregunta'
import { InsigniaPrioridad, Respuesta } from './Respuesta'
import { RichText } from './RichText'

/** Pregunta del banco: se muestra cerrada y la respuesta se abre cuando la pedís. */
export function PreguntaItem({ pregunta, temas = [] }: { pregunta: Pregunta; temas?: Tema[] }) {
  const [abierta, setAbierta] = useState(false)
  const { estado, marcarPregunta } = useProgreso()
  const aviso = useAviso()
  const marca = estado.preguntas[pregunta.id]

  return (
    <article className="rounded-2xl border border-line bg-panel/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full border border-line px-2 py-0.5 font-bold tabular-nums">N.º {pregunta.id}</span>
        <InsigniaPrioridad prioridad={pregunta.prioridad} />
        {marca === 'bien' && <span className="rounded-full bg-lime/15 px-2 py-0.5 font-bold text-lime">✓ Respondida bien</span>}
        {marca === 'repasar' && <span className="rounded-full bg-pink/15 px-2 py-0.5 font-bold text-pink">Para repasar</span>}
        {temas.slice(0, 2).map((t) => (
          <a key={t.id} href={hrefDe({ vista: 'tema', temaId: t.id })} className="underline decoration-dotted underline-offset-2 hover:text-ink">
            Tema: <RichText texto={t.titulo} />
          </a>
        ))}
      </div>
      <ContextoPregunta pregunta={pregunta} />
      <h3 className="mt-2 text-base font-extrabold leading-snug text-ink sm:text-lg"><RichText texto={pregunta.pregunta} /></h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}
          className="rounded-xl border border-line px-3 py-1.5 text-sm font-bold text-ink hover:border-purple">
          {abierta ? 'Ocultar respuesta' : 'Ver respuesta'}
        </button>
        {abierta && (
          <>
            <button onClick={() => { const xp = marcarPregunta(pregunta.id, 'bien'); aviso(xp ? `+${xp} XP · ¡Bien!` : 'Marcada como bien') }}
              className="rounded-xl bg-lime/90 px-3 py-1.5 text-sm font-extrabold text-on-accent">✓ La sé</button>
            <button onClick={() => { marcarPregunta(pregunta.id, 'repasar'); aviso('Guardada en "Para repasar"') }}
              className="rounded-xl border border-line px-3 py-1.5 text-sm font-bold text-muted hover:text-pink">↻ Repasar</button>
          </>
        )}
      </div>
      {abierta && <div className="mt-4 animate-aparecer"><Respuesta pregunta={pregunta} /></div>}
    </article>
  )
}
