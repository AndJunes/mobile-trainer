import { useEffect, useRef } from 'react'

/** Confirmación propia (el confirm() nativo no se puede estilizar ni anunciar bien). */
export function Confirmar({ abierto, titulo, texto, accion, onConfirmar, onCancelar }: {
  abierto: boolean
  titulo: string
  texto: string
  accion: string
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const cancelar = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!abierto) return
    cancelar.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancelar()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto, onCancelar])
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="conf-t" aria-describedby="conf-d"
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2 id="conf-t" className="text-lg font-extrabold">{titulo}</h2>
        <p id="conf-d" className="mt-2 text-sm text-muted">{texto}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={cancelar} onClick={onCancelar} className="rounded-xl border border-line px-4 py-2 text-sm font-bold">Cancelar</button>
          <button onClick={onConfirmar} className="rounded-xl bg-pink px-4 py-2 text-sm font-extrabold text-on-accent">{accion}</button>
        </div>
      </div>
    </div>
  )
}
