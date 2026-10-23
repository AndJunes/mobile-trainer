// Carga del contenido. Las unidades y el glosario son livianos y se cargan de entrada;
// la teoría de cada unidad y el banco de preguntas se cargan cuando se necesitan.
import unidadesJson from '../data/unidades.json'
import glosarioJson from '../data/glosario.json'
import type { BancoPreguntas, EntradaGlosario, Pregunta, Tema, Unidad } from '../types/contenido'

export const unidades = unidadesJson as Unidad[]
export const glosario = glosarioJson as EntradaGlosario[]

export const totalTemas = unidades.reduce((n, u) => n + u.temas.length, 0)

export function unidadDeTema(temaId: string): Unidad | undefined {
  return unidades.find((u) => u.temas.includes(temaId))
}

const archivosTemas = import.meta.glob<{ default: Tema[] }>('../data/temas/*.json')
const cacheTemas = new Map<string, Promise<Tema[]>>()

export function cargarTemasDeUnidad(unidadId: string): Promise<Tema[]> {
  let p = cacheTemas.get(unidadId)
  if (!p) {
    const loader = archivosTemas[`../data/temas/${unidadId}.json`]
    p = loader ? loader().then((m) => m.default) : Promise.resolve([])
    cacheTemas.set(unidadId, p)
  }
  return p
}

export async function cargarTodosLosTemas(): Promise<Tema[]> {
  const listas = await Promise.all(unidades.map((u) => cargarTemasDeUnidad(u.id)))
  return listas.flat()
}

let cacheBanco: Promise<BancoPreguntas & { porId: Map<string, Pregunta> }> | null = null

export function cargarBanco() {
  if (!cacheBanco) {
    cacheBanco = import('../data/preguntas.json').then((m) => {
      const banco = m.default as unknown as BancoPreguntas
      return { ...banco, porId: new Map(banco.preguntas.map((p) => [p.id, p])) }
    })
  }
  return cacheBanco
}

/** Índice inverso: id de pregunta → temas que la usan (desafío o relacionadas). */
export function temasPorPregunta(temas: Tema[]): Map<string, Tema[]> {
  const mapa = new Map<string, Tema[]>()
  for (const t of temas) {
    for (const id of [...t.desafio, ...t.preguntasRelacionadas]) {
      const lista = mapa.get(id) ?? []
      if (!lista.includes(t)) lista.push(t)
      mapa.set(id, lista)
    }
  }
  return mapa
}
