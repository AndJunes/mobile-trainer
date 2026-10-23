// Valida la coherencia de src/data/*.json. Uso: pnpm validar
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../src/data/', import.meta.url))
const leer = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))

const errores = []
const avisos = []
const err = (m) => errores.push(m)

const unidades = leer('unidades.json')
const banco = leer('preguntas.json')
const glosario = leer('glosario.json')
const idsPreguntas = new Set(banco.preguntas.map((p) => p.id))

if (idsPreguntas.size !== banco.preguntas.length) err('Hay ids de pregunta repetidos en preguntas.json')
for (const p of banco.preguntas) {
  if (!p.pregunta?.trim()) err(`Pregunta ${p.id} sin texto`)
  if (!p.campos?.respuestaModelo?.trim()) err(`Pregunta ${p.id} sin respuesta modelo`)
}

const ESTADOS = ['implementado', 'parcial', 'no-implementado', 'a-verificar']
const PRIORIDADES = ['alta', 'media', 'complementaria']
const idsTemas = new Set()
const usoDesafio = new Map()
const archivos = readdirSync(join(dir, 'temas')).filter((f) => f.endsWith('.json'))

for (const u of unidades) {
  if (!archivos.includes(`${u.id}.json`)) { err(`Falta temas/${u.id}.json`); continue }
  const temas = leer(`temas/${u.id}.json`)
  const enArchivo = temas.map((t) => t.id)
  if (JSON.stringify(enArchivo) !== JSON.stringify(u.temas)) err(`${u.id}: los temas del archivo no coinciden con unidades.json`)
  for (const t of temas) {
    const donde = `${u.id}/${t.id}`
    if (idsTemas.has(t.id)) err(`Tema repetido: ${t.id}`)
    idsTemas.add(t.id)
    if (t.unidad !== u.id) err(`${donde}: unidad "${t.unidad}" distinta de ${u.id}`)
    for (const campo of ['titulo', 'resumen']) if (!t[campo]?.trim()) err(`${donde}: falta ${campo}`)
    if (!PRIORIDADES.includes(t.prioridad)) err(`${donde}: prioridad inválida`)
    if (!Array.isArray(t.explicacion) || t.explicacion.length === 0) err(`${donde}: falta la explicación teórica`)
    if (!ESTADOS.includes(t.aplicacionTP?.estado)) err(`${donde}: estado de aplicación inválido`)
    if (!Array.isArray(t.referencias) || t.referencias.length === 0) err(`${donde}: sin referencias`)
    if (!Array.isArray(t.desafio) || t.desafio.length !== 3) err(`${donde}: el desafío tiene que tener 3 preguntas`)
    for (const id of [...(t.desafio ?? []), ...(t.preguntasRelacionadas ?? [])]) {
      if (!idsPreguntas.has(id)) err(`${donde}: la pregunta ${id} no existe en preguntas.json`)
    }
    for (const id of t.desafio ?? []) usoDesafio.set(id, [...(usoDesafio.get(id) ?? []), t.id])
    const palabras = (t.explicacion ?? []).join(' ').split(/\s+/).filter(Boolean).length
    if (palabras && palabras < 120) avisos.push(`${donde}: explicación corta (${palabras} palabras)`)
    if (t.comparacion) {
      const n = t.comparacion.columnas.length
      t.comparacion.filas.forEach((f, i) => f.length !== n && err(`${donde}: fila ${i + 1} de la comparación con ${f.length} celdas (se esperaban ${n})`))
    }
  }
}

for (const [id, temas] of usoDesafio) if (temas.length > 1) avisos.push(`La pregunta ${id} es desafío en ${temas.length} temas: ${temas.join(', ')}`)
const terminos = new Set()
for (const g of glosario) {
  if (terminos.has(g.termino)) err(`Término repetido en el glosario: ${g.termino}`)
  terminos.add(g.termino)
  if (!g.definicion?.trim()) err(`Término sin definición: ${g.termino}`)
}

console.log(`Unidades: ${unidades.length} · Temas: ${idsTemas.size} · Preguntas: ${idsPreguntas.size} · Glosario: ${glosario.length}`)
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n- ${avisos.join('\n- ')}`)
if (errores.length) {
  console.error(`\nErrores (${errores.length}):\n- ${errores.join('\n- ')}`)
  process.exit(1)
}
console.log('\nContenido válido.')
