import { useEffect, useRef, useState } from 'react'
import { ConexionTP } from '../components/ConexionTP'
import { Desafio } from '../components/Desafio'
import { PreguntaItem } from '../components/PreguntaItem'
import { RichText } from '../components/RichText'
import { Teoria } from '../components/Teoria'
import { useAviso } from '../components/Aviso'
import { useCarga } from '../hooks/useCarga'
import { hrefDe, ir } from '../hooks/useRuta'
import { useProgreso } from '../hooks/useProgreso'
import { cargarBanco, cargarTemasDeUnidad, unidadDeTema, unidades } from '../lib/contenido'

type Fase = 'teoria' | 'desafio' | 'conexion'

export function LeccionVista({ temaId }: { temaId: string }) {
  const unidad = unidadDeTema(temaId) ?? unidades[0]
  const { dato, cargando } = useCarga(
    async () => {
      const [temas, banco] = await Promise.all([cargarTemasDeUnidad(unidad.id), cargarBanco()])
      return { temas, banco }
    },
    temaId,
  )
  const [fase, setFase] = useState<Fase>('teoria')
  const { completarTema } = useProgreso()
  const aviso = useAviso()
  const contenido = useRef<HTMLElement>(null)
  useEffect(() => setFase('teoria'), [temaId])

  // Al cambiar de etapa, llevar la vista al principio del contenido: si no, el desafío
  // arranca con la pantalla más abajo, en las preguntas relacionadas.
  const cambiarFase = (f: Fase) => {
    setFase(f)
    setTimeout(() => {
      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      contenido.current?.scrollIntoView({ block: 'start', behavior: reducido ? 'auto' : 'smooth' })
    })
  }

  if (cargando || !dato) return <p className="text-muted">Cargando la misión…</p>
  const tema = dato.temas.find((t) => t.id === temaId)
  if (!tema) return <p className="text-muted">No encontré ese tema. <a className="underline" href={hrefDe({ vista: 'unidad', unidadId: unidad.id })}>Volver a la unidad</a></p>

  const indice = unidad.temas.indexOf(tema.id)
  const desafio = tema.desafio.map((id) => dato.banco.porId.get(id)).filter((p) => p !== undefined)
  // Si una pregunta del desafío tiene otra versión en la guía, esa versión no se repite en "Más preguntas".
  const variantesDelDesafio = new Set(desafio.flatMap((p) => p.variantes ?? []))
  const relacionadas = tema.preguntasRelacionadas
    .filter((id) => !variantesDelDesafio.has(id))
    .map((id) => dato.banco.porId.get(id))
    .filter((p) => p !== undefined)

  const siguienteTema = () => {
    if (completarTema(tema.id)) aviso('+25 XP · Tema dominado')
    const sig = unidad.temas[indice + 1]
    if (sig) return ir({ vista: 'tema', temaId: sig })
    const u = unidades[unidades.indexOf(unidad) + 1]
    if (u) {
      aviso('¡Unidad completada!')
      return ir({ vista: 'unidad', unidadId: u.id })
    }
    aviso('¡Completaste todo el recorrido!')
    ir({ vista: 'unidad', unidadId: unidad.id })
  }

  return (
    <article className={`mx-auto flex flex-col gap-5 ${fase === 'teoria' ? 'max-w-5xl' : 'max-w-3xl'}`}>
      {/* Cada bloque (navegación, contenido y preguntas relacionadas) tiene su propio fondo para ver dónde empieza y termina. */}
      <section aria-label="Navegación del tema" className="flex flex-col gap-4 rounded-3xl border border-line bg-sec-nav p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <a href={hrefDe({ vista: 'unidad', unidadId: unidad.id })} className="font-bold text-muted hover:text-ink">← Volver a los temas</a>
          <span className="text-muted tabular-nums">Tema {indice + 1} de {unidad.temas.length}</span>
        </div>

        <header>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-purple">{unidad.titulo}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-balance sm:text-4xl"><RichText texto={tema.titulo} /></h1>
        </header>

        <nav aria-label="Etapas de la misión" className="flex flex-wrap gap-2 text-xs font-extrabold">
          {(['teoria', 'desafio', 'conexion'] as const).map((f, k) => (
            <button key={f} onClick={() => cambiarFase(f)} aria-current={fase === f ? 'step' : undefined}
              className={`rounded-full px-3 py-1.5 ${fase === f ? 'bg-purple text-on-accent' : 'bg-white/5 text-muted hover:text-ink'}`}>
              {k + 1}. {f === 'teoria' ? 'Teoría' : f === 'desafio' ? 'Desafío' : 'Conexión con el TP'}
            </button>
          ))}
        </nav>
      </section>

      <section ref={contenido} aria-label="Contenido del tema" className="scroll-mt-20 flex flex-col gap-5 rounded-3xl border border-line bg-sec-tema p-4 sm:p-6">
        {fase === 'teoria' && (
          <>
            <Teoria key={tema.id} tema={tema} />
            <button onClick={() => cambiarFase('desafio')}
              className="self-start rounded-2xl bg-gradient-to-r from-purple to-pink px-6 py-3.5 font-extrabold text-on-accent">
              Ya leí la teoría · Empezar el desafío →
            </button>
          </>
        )}

        {fase === 'desafio' && desafio.length > 0 && (
          <Desafio key={tema.id} preguntas={desafio} onTerminar={() => cambiarFase('conexion')} />
        )}

        {fase === 'conexion' && (
          <>
            <div className="rounded-2xl border border-lime/40 bg-lime/10 p-5 text-ink">
              <p className="font-extrabold">Terminaste las preguntas de esta misión.</p>
              <p className="mt-1 text-sm text-muted">Antes de seguir, mirá cómo se ve este tema en el código de la app.</p>
            </div>
            <ConexionTP tema={tema} />
            <div className="flex flex-wrap gap-2">
              <button onClick={siguienteTema} className="rounded-2xl bg-gradient-to-r from-purple to-pink px-6 py-3.5 font-extrabold text-on-accent">
                Entendí la conexión · Siguiente tema →
              </button>
              <button onClick={() => cambiarFase('desafio')} className="rounded-2xl border border-line px-5 py-3 font-bold text-muted hover:text-ink">
                Repasar preguntas
              </button>
            </div>
          </>
        )}
      </section>

      {relacionadas.length > 0 && (
        <section aria-labelledby="rel-t" className="rounded-3xl border border-line bg-sec-rel p-4 sm:p-6">
          <h2 id="rel-t" className="text-lg font-black">Más preguntas de la guía sobre este tema</h2>
          <div className="mt-3 flex flex-col gap-3">
            {relacionadas.map((p) => <PreguntaItem key={p.id} pregunta={p} />)}
          </div>
        </section>
      )}
    </article>
  )
}
