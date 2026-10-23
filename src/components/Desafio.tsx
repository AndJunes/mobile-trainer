import { useId, useState } from 'react'
import { useProgreso } from '../hooks/useProgreso'
import type { Pregunta } from '../types/contenido'
import { useAviso } from './Aviso'
import { InsigniaPrioridad, Respuesta } from './Respuesta'
import { RichText } from './RichText'

/** Práctica de recuperación: intentá responder, revelá la respuesta real y autoevaluate. */
export function Desafio({ preguntas, onTerminar }: { preguntas: Pregunta[]; onTerminar: () => void }) {
  const [i, setI] = useState(0)
  const [revelada, setRevelada] = useState(false)
  const { estado, guardarRespuesta, marcarPregunta } = useProgreso()
  const aviso = useAviso()
  const campoId = useId()
  const p = preguntas[i]
  const texto = estado.respuestas[p.id] ?? ''

  const siguiente = () => {
    setRevelada(false)
    if (i + 1 < preguntas.length) setI(i + 1)
    else onTerminar()
  }

  return (
    <section aria-labelledby={`${campoId}-t`} className="rounded-3xl border border-line bg-panel/70 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${campoId}-t`} className="text-[11px] font-extrabold uppercase tracking-widest text-pink">Desafío de recuperación</h2>
        <div className="flex items-center gap-2" aria-label={`Pregunta ${i + 1} de ${preguntas.length}`}>
          {preguntas.map((q, k) => (
            <span key={q.id} aria-hidden="true" className={`h-1.5 w-7 rounded-full ${k < i ? 'bg-lime' : k === i ? 'bg-pink' : 'bg-line'}`} />
          ))}
          <span className="text-xs text-muted tabular-nums">{i + 1} de {preguntas.length}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full border border-line px-2 py-0.5 font-bold tabular-nums">N.º {p.id}</span>
        <InsigniaPrioridad prioridad={p.prioridad} />
      </div>
      <p className="mt-3 text-xl font-extrabold leading-snug text-ink sm:text-2xl"><RichText texto={p.pregunta} glosario /></p>

      <label htmlFor={campoId} className="mt-5 block text-sm font-bold text-muted">Tu respuesta (como la dirías en la Meet)</label>
      <textarea
        id={campoId}
        value={texto}
        onChange={(e) => guardarRespuesta(p.id, e.target.value)}
        rows={4}
        placeholder="Escribí lo que te acuerdes, aunque sea en pocas palabras…"
        className="mt-2 w-full resize-y rounded-2xl border border-line bg-bg/60 p-4 text-ink placeholder:text-muted/60 focus:border-purple focus:outline-none"
      />

      {!revelada ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setRevelada(true)}
            disabled={!texto.trim()}
            className="rounded-2xl bg-gradient-to-r from-purple to-pink px-5 py-3 font-extrabold text-on-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ver la respuesta
          </button>
          <button
            onClick={() => {
              marcarPregunta(p.id, 'repasar')
              setRevelada(true)
            }}
            className="rounded-2xl border border-line px-5 py-3 font-bold text-muted hover:text-ink"
          >
            No me acuerdo
          </button>
          {!texto.trim() && <p className="w-full text-xs text-muted">Intentá escribir algo antes de mirar: recordar primero ayuda a fijarlo.</p>}
        </div>
      ) : (
        <div className="mt-5 animate-aparecer">
          <Respuesta pregunta={p} />
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const xp = marcarPregunta(p.id, 'bien')
                if (xp) aviso(`+${xp} XP · ¡Bien!`)
                siguiente()
              }}
              className="rounded-2xl bg-lime px-5 py-3 font-extrabold text-on-accent"
            >
              ✓ La respondí bien
            </button>
            <button
              onClick={() => {
                marcarPregunta(p.id, 'repasar')
                aviso('Guardada en "Para repasar"')
                siguiente()
              }}
              className="rounded-2xl border border-line px-5 py-3 font-bold text-ink hover:border-pink"
            >
              ↻ Necesito repasarla
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
