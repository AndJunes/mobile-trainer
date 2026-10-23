import { useEffect, useRef } from 'react'
import { hrefDe, type Ruta } from '../hooks/useRuta'
import { useProgreso } from '../hooks/useProgreso'
import { totalTemas } from '../lib/contenido'
import { UnidadesMenu } from './UnidadesMenu'

/**
 * Menú lateral con el progreso, las unidades y las herramientas.
 * En pantallas grandes se puede ocultar; en el celular se abre como panel deslizable.
 */
export function Barra({ ruta, unidadActiva, onAlternarTema, temaVisual, onReiniciar, abierto, oculto, onCerrar }: {
  ruta: Ruta
  unidadActiva?: string
  onAlternarTema: () => void
  temaVisual: 'oscuro' | 'claro'
  onReiniciar: () => void
  /** Panel abierto en pantallas chicas. */
  abierto: boolean
  /** Menú oculto en pantallas grandes. */
  oculto: boolean
  onCerrar: () => void
}) {
  const { estado } = useProgreso()
  const cerrarBtn = useRef<HTMLButtonElement>(null)
  const hechos = Object.keys(estado.temas).length
  const pct = Math.round((100 * hechos) / totalTemas)
  const repasar = Object.values(estado.preguntas).filter((e) => e === 'repasar').length

  useEffect(() => {
    if (abierto) cerrarBtn.current?.focus()
  }, [abierto])

  const vista = ruta.vista
  const enlace = (activo: boolean) =>
    `flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
      activo ? 'bg-purple/20 text-ink ring-1 ring-purple/50' : 'text-muted hover:bg-white/5 hover:text-ink'
    }`

  return (
    <aside
      id="menu-lateral"
      aria-label="Menú"
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(300px,85vw)] flex-col gap-5 overflow-y-auto border-r border-line bg-panel p-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:bg-panel/70 lg:shadow-none lg:backdrop-blur-md ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      } ${oculto ? 'lg:hidden' : ''}`}
    >
      <div className="flex items-center gap-3">
        <a href={hrefDe({ vista: 'inicio' })} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl">
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple to-pink text-lg font-black text-on-accent">✦</span>
          <span className="min-w-0">
            <span className="block font-black tracking-tight">Modo Defensa</span>
            <span className="block text-xs text-muted">Entrenador de defensas orales</span>
          </span>
        </a>
        <button
          ref={cerrarBtn}
          type="button"
          onClick={onCerrar}
          aria-label="Ocultar el menú"
          title="Ocultar el menú"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-lg text-muted hover:text-ink"
        >
          <span aria-hidden="true">«</span>
        </button>
      </div>

      <section aria-label="Progreso" className="rounded-2xl border border-line bg-panel2/60 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted">Progreso</span>
          <span className="text-2xl font-black tabular-nums">{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Temas dominados"
          aria-valuemin={0}
          aria-valuemax={totalTemas}
          aria-valuenow={hechos}
          className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-purple via-pink to-lime transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
          <span>{hechos} de {totalTemas} temas</span>
          <span className="font-bold text-lime">{estado.xp} XP</span>
        </div>
      </section>

      <UnidadesMenu ruta={ruta} unidadActiva={unidadActiva} />

      <nav aria-label="Herramientas" className="flex flex-col gap-1">
        <div className="px-1 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-muted">Herramientas</div>
        <a href={hrefDe({ vista: 'inicio' })} aria-current={vista === 'inicio' ? 'page' : undefined} className={enlace(vista === 'inicio')}>
          Inicio
        </a>
        <a href={hrefDe({ vista: 'banco' })} aria-current={vista === 'banco' ? 'page' : undefined} className={enlace(vista === 'banco')}>
          Banco de preguntas <span className="text-xs text-muted">298</span>
        </a>
        <a href={hrefDe({ vista: 'repaso' })} aria-current={vista === 'repaso' ? 'page' : undefined} className={enlace(vista === 'repaso')}>
          Para repasar <span className="text-xs tabular-nums text-pink">{repasar}</span>
        </a>
        <a href={hrefDe({ vista: 'glosario' })} aria-current={vista === 'glosario' ? 'page' : undefined} className={enlace(vista === 'glosario')}>
          Glosario
        </a>
        <a href={hrefDe({ vista: 'acerca' })} aria-current={vista === 'acerca' ? 'page' : undefined} className={enlace(vista === 'acerca')}>
          Acerca del proyecto
        </a>
      </nav>

      <div className="mt-auto flex flex-wrap gap-2 pb-[env(safe-area-inset-bottom)]">
        <button onClick={onAlternarTema} className="rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:text-ink">
          {temaVisual === 'oscuro' ? 'Tema claro' : 'Tema oscuro'}
        </button>
        <button onClick={onReiniciar} className="rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:text-pink">
          Reiniciar progreso
        </button>
      </div>
    </aside>
  )
}
