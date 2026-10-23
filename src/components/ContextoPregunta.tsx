import { escribir } from '../lib/almacen'
import { grupoDe } from '../lib/contenido'
import type { Pregunta } from '../types/contenido'
import { hrefDe } from '../hooks/useRuta'
import { MarkdownBloque, RichText } from './RichText'

/** Búsqueda que el banco de preguntas toma al abrirse (para enlazar una variante). */
export const CLAVE_BUSQUEDA_BANCO = 'modoDefensa_busquedaBanco'
export const EVENTO_BUSQUEDA_BANCO = 'modoDefensa:buscar'

/**
 * Contexto de la pregunta dentro de la guía. En el Bloque 6 varias preguntas tienen el mismo enunciado
 * ("¿Qué concepto representa?") y solo se entienden con el ejemplo de clase al que pertenecen.
 */
export function ContextoPregunta({ pregunta }: { pregunta: Pregunta }) {
  const grupo = grupoDe(pregunta)
  const variantes = pregunta.variantes ?? []
  if (!grupo && variantes.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2 text-sm">
      {grupo?.bloque === '6' ? (
        <details className="group rounded-xl border border-cyan/40 bg-cyan/5">
          <summary className="flex items-center justify-between gap-2 px-3 py-2 font-bold text-ink">
            <span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan">Ejemplo de clase · </span>
              <RichText texto={grupo.titulo.replace(/^Ejemplo [\d.]+ — /, '')} />
            </span>
            <span aria-hidden="true" className="text-muted transition group-open:rotate-90">›</span>
          </summary>
          <div className="px-3 pb-3 text-muted"><MarkdownBloque texto={grupo.intro} /></div>
        </details>
      ) : grupo ? (
        <p className="text-xs text-muted"><RichText texto={grupo.titulo} /></p>
      ) : null}

      {variantes.length > 0 && (
        <p className="text-xs text-muted">
          Otra versión de esta pregunta en la guía:{' '}
          {variantes.map((id, i) => (
            <span key={id}>
              {i > 0 && ', '}
              <a
                href={hrefDe({ vista: 'banco' })}
                onClick={() => {
                  escribir(CLAVE_BUSQUEDA_BANCO, id)
                  window.dispatchEvent(new CustomEvent(EVENTO_BUSQUEDA_BANCO, { detail: id }))
                }}
                className="font-bold text-ink underline decoration-dotted underline-offset-2 hover:text-purple"
              >
                N.º {id}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
