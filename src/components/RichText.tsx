import { Fragment, type ReactNode } from 'react'
import { marcarTerminos } from '../lib/glosario'
import { TerminoGlosario } from './Glosario'

// Renderer seguro de Markdown inline: `código`, **negrita**, *cursiva* y escapes (\[).
// Arma elementos React; nunca inserta HTML crudo.

type Token = { tipo: 'texto' | 'codigo' | 'negrita' | 'cursiva'; valor: string }

function tokenizar(src: string): Token[] {
  const tokens: Token[] = []
  let buf = ''
  const flush = () => {
    if (buf) tokens.push({ tipo: 'texto', valor: buf })
    buf = ''
  }
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === '\\' && i + 1 < src.length && /[[\]_~*`\\#|>-]/.test(src[i + 1])) {
      buf += src[i + 1]
      i += 2
      continue
    }
    if (c === '`') {
      const fin = src.indexOf('`', i + 1)
      if (fin > i) {
        flush()
        tokens.push({ tipo: 'codigo', valor: src.slice(i + 1, fin) })
        i = fin + 1
        continue
      }
    }
    if (src.startsWith('**', i)) {
      const fin = src.indexOf('**', i + 2)
      if (fin > i + 2) {
        flush()
        tokens.push({ tipo: 'negrita', valor: src.slice(i + 2, fin) })
        i = fin + 2
        continue
      }
    }
    if (c === '*' && src[i + 1] !== ' ' && !/\w/.test(src[i - 1] ?? '')) {
      const fin = src.indexOf('*', i + 1)
      if (fin > i + 1 && src[fin - 1] !== ' ') {
        flush()
        tokens.push({ tipo: 'cursiva', valor: src.slice(i + 1, fin) })
        i = fin + 1
        continue
      }
    }
    buf += c
    i++
  }
  flush()
  return tokens
}

function conGlosario(texto: string, clave: string, glosario: boolean): ReactNode {
  if (!glosario) return texto
  return marcarTerminos(texto).map((f, i) =>
    f.entrada ? (
      <TerminoGlosario key={`${clave}-${i}`} entrada={f.entrada}>{f.texto}</TerminoGlosario>
    ) : (
      <Fragment key={`${clave}-${i}`}>{f.texto}</Fragment>
    ),
  )
}

export function RichText({ texto, glosario = false }: { texto: string; glosario?: boolean }) {
  return (
    <>
      {tokenizar(texto).map((t, i) => {
        switch (t.tipo) {
          case 'codigo':
            return (
              <code key={i} className="rounded-md bg-code px-1.5 py-0.5 font-mono text-[0.88em] text-cyan [overflow-wrap:anywhere]">
                {t.valor}
              </code>
            )
          case 'negrita':
            return <strong key={i} className="font-bold text-ink"><RichText texto={t.valor} glosario={glosario} /></strong>
          case 'cursiva':
            return <em key={i}><RichText texto={t.valor} glosario={glosario} /></em>
          default:
            return <Fragment key={i}>{conGlosario(t.valor, `t${i}`, glosario)}</Fragment>
        }
      })}
    </>
  )
}

/** Bloque de Markdown con párrafos y tablas simples (para los "extras" de la guía). */
export function MarkdownBloque({ texto }: { texto: string }) {
  const bloques = texto.split(/\n\s*\n/).filter((b) => b.trim())
  return (
    <>
      {bloques.map((b, i) => {
        const lineas = b.split('\n').filter((l) => l.trim())
        if (lineas.every((l) => l.trim().startsWith('|'))) {
          const filas = lineas.filter((l) => !/^\|\s*-{3}/.test(l)).map(partirFila)
          const [cab, ...cuerpo] = filas
          return (
            <div key={i} className="my-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>{cab.map((c, j) => <th key={j} className="border-b border-line bg-white/5 p-2 font-bold"><RichText texto={c} /></th>)}</tr>
                </thead>
                <tbody>
                  {cuerpo.map((f, k) => (
                    <tr key={k}>{f.map((c, j) => <td key={j} className="border-b border-line/60 p-2 align-top"><RichText texto={c} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if (lineas.every((l) => /^\s*- /.test(l))) {
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5">
              {lineas.map((l, j) => <li key={j}><RichText texto={l.replace(/^\s*- /, '')} /></li>)}
            </ul>
          )
        }
        return <p key={i} className="my-2"><RichText texto={lineas.join(' ')} /></p>
      })}
    </>
  )
}

function partirFila(fila: string): string[] {
  let r = fila.trim()
  if (r.startsWith('|')) r = r.slice(1)
  if (r.endsWith('|')) r = r.slice(0, -1)
  const celdas: string[] = []
  let actual = ''
  let enCodigo = false
  for (let i = 0; i < r.length; i++) {
    const c = r[i]
    if (c === '`') enCodigo = !enCodigo
    if (c === '|' && !enCodigo && r[i - 1] !== '\\') {
      celdas.push(actual.trim())
      actual = ''
    } else actual += c
  }
  celdas.push(actual.trim())
  return celdas
}
