import { useDeferredValue, useMemo, useState } from 'react'
import { PreguntaItem } from '../components/PreguntaItem'
import { useCarga } from '../hooks/useCarga'
import { useProgreso } from '../hooks/useProgreso'
import { cargarBanco, cargarTodosLosTemas, temasPorPregunta } from '../lib/contenido'

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Las 298 preguntas de la guía, con búsqueda y filtros. Con `soloRepasar` muestra la lista de repaso. */
export function BancoVista({ soloRepasar = false }: { soloRepasar?: boolean }) {
  const { dato, cargando } = useCarga(async () => {
    const [banco, temas] = await Promise.all([cargarBanco(), cargarTodosLosTemas()])
    return { banco, indice: temasPorPregunta(temas) }
  }, 'banco')
  const { estado } = useProgreso()
  const [busqueda, setBusqueda] = useState('')
  const [bloque, setBloque] = useState('')
  const [prioridad, setPrioridad] = useState('')
  const [marca, setMarca] = useState('')
  const q = useDeferredValue(normalizar(busqueda.trim()))

  const textos = useMemo(
    () => new Map(dato?.banco.preguntas.map((p) => [p.id, normalizar([p.pregunta, ...Object.values(p.campos).flat()].join(' '))])),
    [dato],
  )

  const lista = useMemo(() => {
    if (!dato) return []
    return dato.banco.preguntas.filter((p) => {
      const m = estado.preguntas[p.id]
      if (soloRepasar && m !== 'repasar') return false
      if (bloque && p.bloque !== bloque) return false
      if (prioridad && p.prioridad !== prioridad) return false
      if (marca === 'sin' && m) return false
      if (marca && marca !== 'sin' && m !== marca) return false
      if (q) return normalizar(p.id) === q || normalizar(p.id).startsWith(`${q}.`) || (textos.get(p.id) ?? '').includes(q)
      return true
    })
  }, [dato, estado.preguntas, soloRepasar, bloque, prioridad, marca, q, textos])

  const selector = 'rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ink'

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-lime">{soloRepasar ? 'Tu lista' : 'Guía completa'}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{soloRepasar ? 'Para repasar' : 'Banco de preguntas'}</h1>
        <p className="mt-2 text-muted">
          {soloRepasar
            ? 'Las preguntas que marcaste con "Necesito repasarla" o "No me acuerdo".'
            : 'Las 298 preguntas de la guía con su respuesta para la Meet, la respuesta modelo y la repregunta.'}
        </p>
      </header>

      <div role="search" className="flex flex-wrap gap-2 rounded-2xl border border-line bg-panel/60 p-3">
        <label className="sr-only" htmlFor="b-q">Buscar</label>
        <input id="b-q" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por palabra o número (ej.: 9.15, permisos)" className={`${selector} min-w-0 flex-[1_1_16rem]`} />
        {!soloRepasar && (
          <>
            <label className="sr-only" htmlFor="b-bl">Bloque</label>
            <select id="b-bl" value={bloque} onChange={(e) => setBloque(e.target.value)} className={selector}>
              <option value="">Todos los bloques</option>
              {dato?.banco.bloques.map((b) => <option key={b.id} value={b.id}>{b.titulo}</option>)}
            </select>
            <label className="sr-only" htmlFor="b-mk">Estado</label>
            <select id="b-mk" value={marca} onChange={(e) => setMarca(e.target.value)} className={selector}>
              <option value="">Cualquier estado</option>
              <option value="sin">Sin responder</option>
              <option value="bien">Respondidas bien</option>
              <option value="repasar">Para repasar</option>
            </select>
          </>
        )}
        <label className="sr-only" htmlFor="b-pr">Prioridad</label>
        <select id="b-pr" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className={selector}>
          <option value="">Cualquier prioridad</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="complementaria">Complementaria</option>
        </select>
      </div>

      <p aria-live="polite" className="text-sm text-muted tabular-nums">{cargando ? 'Cargando preguntas…' : `${lista.length} preguntas`}</p>
      {soloRepasar && !cargando && lista.length === 0 && (
        <p className="rounded-2xl border border-line bg-panel/60 p-5 text-muted">Todavía no marcaste preguntas para repasar. Aparecen acá cuando elegís "Necesito repasarla" en una misión o en el banco.</p>
      )}
      <div className="flex flex-col gap-3">
        {lista.map((p) => <PreguntaItem key={p.id} pregunta={p} temas={dato?.indice.get(p.id)} />)}
      </div>
    </div>
  )
}
