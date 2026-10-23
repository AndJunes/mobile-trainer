import { useMemo, useState } from 'react'
import { glosario } from '../lib/contenido'

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function GlosarioVista() {
  const [q, setQ] = useState('')
  const lista = useMemo(() => {
    const n = normalizar(q.trim())
    return [...glosario]
      .sort((a, b) => a.termino.localeCompare(b.termino, 'es', { sensitivity: 'base' }))
      .filter((g) => !n || normalizar(`${g.termino} ${g.definicion}`).includes(n))
  }, [q])
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-lime">Referencia</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Glosario</h1>
        <p className="mt-2 text-muted">{glosario.length} términos. En la teoría y en las respuestas aparecen subrayados: pasá el mouse o tocalos para ver la definición.</p>
      </header>
      <label className="sr-only" htmlFor="g-q">Buscar en el glosario</label>
      <input id="g-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar un término…"
        className="rounded-xl border border-line bg-panel px-3 py-2.5 text-ink" />
      <dl className="flex flex-col gap-2">
        {lista.map((g) => (
          <div key={g.termino} className="rounded-2xl border border-line bg-panel/60 p-4">
            <dt className="font-extrabold text-ink">{g.termino}</dt>
            <dd className="mt-1 text-muted">{g.definicion}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
