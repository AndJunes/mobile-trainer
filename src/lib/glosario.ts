// Reconocimiento de términos del glosario dentro de un texto plano.
// Una sola expresión regular precompilada (en lugar de una por término y posición).
import { glosario } from './contenido'
import type { EntradaGlosario } from '../types/contenido'

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resaltables = glosario
  .filter((g) => g.resaltar !== false)
  .sort((a, b) => b.termino.length - a.termino.length)

const porClave = new Map<string, EntradaGlosario>()
for (const g of glosario) {
  porClave.set(g.distinguirMayusculas ? g.termino : g.termino.toLowerCase(), g)
}

// Límites de palabra Unicode: no reconoce "push" dentro de "router.push" ni partes de otras palabras.
const patron = resaltables.length
  ? new RegExp(
      `(?<![\\p{L}\\p{N}_.\\/-])(${resaltables.map((g) => escapar(g.termino)).join('|')})(?![\\p{L}\\p{N}_(])`,
      'giu',
    )
  : null

export function buscarEntrada(termino: string): EntradaGlosario | undefined {
  return porClave.get(termino) ?? porClave.get(termino.toLowerCase())
}

export interface Fragmento {
  texto: string
  entrada?: EntradaGlosario
}

/** Parte un texto en fragmentos; los que coinciden con un término traen su entrada. */
export function marcarTerminos(texto: string): Fragmento[] {
  if (!patron) return [{ texto }]
  const out: Fragmento[] = []
  let ultimo = 0
  patron.lastIndex = 0
  for (const m of texto.matchAll(patron)) {
    const encontrado = m[0]
    const entrada = buscarEntrada(encontrado)
    if (!entrada) continue
    if (entrada.distinguirMayusculas && entrada.termino !== encontrado) continue
    const i = m.index ?? 0
    if (i > ultimo) out.push({ texto: texto.slice(ultimo, i) })
    out.push({ texto: encontrado, entrada })
    ultimo = i + encontrado.length
  }
  if (ultimo < texto.length) out.push({ texto: texto.slice(ultimo) })
  return out
}
