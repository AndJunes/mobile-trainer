import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const Ctx = createContext<(texto: string) => void>(() => {})

/** Aviso breve (por ejemplo "+10 XP"), anunciado también a lectores de pantalla. */
export function AvisoProvider({ children }: { children: ReactNode }) {
  const [texto, setTexto] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const mostrar = useCallback((t: string) => {
    setTexto(t)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTexto(''), 1800)
  }, [])
  return (
    <Ctx value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50">
        {texto && (
          <div className="animate-aparecer rounded-xl bg-lime px-4 py-2.5 text-sm font-extrabold text-on-accent shadow-xl">{texto}</div>
        )}
      </div>
    </Ctx>
  )
}

export const useAviso = () => useContext(Ctx)
