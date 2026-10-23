import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { EntradaGlosario } from '../types/contenido'

interface Api {
  abrir: (e: EntradaGlosario, origen: HTMLElement) => void
}
const Ctx = createContext<Api | null>(null)

/** Ventana del glosario: atrapa el foco mientras está abierta y lo devuelve al término al cerrarse. */
export function GlosarioProvider({ children }: { children: ReactNode }) {
  const [entrada, setEntrada] = useState<EntradaGlosario | null>(null)
  const origen = useRef<HTMLElement | null>(null)
  const dialogo = useRef<HTMLDivElement>(null)
  const cerrarBtn = useRef<HTMLButtonElement>(null)
  const tituloId = useId()

  const abrir = useCallback((e: EntradaGlosario, el: HTMLElement) => {
    origen.current = el
    setEntrada(e)
  }, [])

  const cerrar = useCallback(() => {
    setEntrada(null)
    origen.current?.focus()
  }, [])

  useEffect(() => {
    if (!entrada) return
    cerrarBtn.current?.focus()
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') cerrar()
      if (ev.key === 'Tab' && dialogo.current) {
        const focos = dialogo.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
        if (focos.length === 1) {
          ev.preventDefault()
          focos[0].focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [entrada, cerrar])

  return (
    <Ctx value={{ abrir }}>
      {children}
      {entrada && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && cerrar()}
        >
          <div
            ref={dialogo}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl"
          >
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-lime">Glosario</div>
            <h2 id={tituloId} className="text-xl font-extrabold text-ink">{entrada.termino}</h2>
            <p className="mt-3 leading-relaxed text-muted">{entrada.definicion}</p>
            <button
              ref={cerrarBtn}
              onClick={cerrar}
              className="mt-5 rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Ctx>
  )
}

/** Término subrayado: muestra la definición al pasar o enfocar, y abre la ventana al tocarlo. */
export function TerminoGlosario({ entrada, children }: { entrada: EntradaGlosario; children: ReactNode }) {
  const api = useContext(Ctx)
  const tipId = useId()
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline">
      <button
        type="button"
        aria-describedby={visible ? tipId : undefined}
        onClick={(e) => {
          setVisible(false)
          api?.abrir(entrada, e.currentTarget)
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="cursor-help rounded-sm text-inherit underline decoration-lime/70 decoration-dotted underline-offset-4 hover:text-lime"
      >
        {children}
      </button>
      {visible && (
        <span
          id={tipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-40 mb-2 hidden w-72 rounded-xl border border-lime/40 bg-panel p-3 text-left text-sm font-normal leading-snug text-ink shadow-xl [@media(hover:hover)]:block"
        >
          <strong className="text-lime">{entrada.termino}:</strong> {entrada.definicion}
        </span>
      )}
    </span>
  )
}
