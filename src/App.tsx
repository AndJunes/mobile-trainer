import { useCallback, useEffect, useRef, useState } from 'react'
import { AvisoProvider } from './components/Aviso'
import { Barra } from './components/Barra'
import { Confirmar } from './components/Confirmar'
import { GlosarioProvider } from './components/Glosario'
import { ProgresoProvider, useProgreso } from './hooks/useProgreso'
import { useRuta } from './hooks/useRuta'
import { useTemaVisual } from './hooks/useTema'
import { escribir, leer } from './lib/almacen'
import { unidadDeTema } from './lib/contenido'
import { BancoVista } from './views/BancoVista'
import { GlosarioVista } from './views/GlosarioVista'
import { LeccionVista } from './views/LeccionVista'
import { UnidadVista } from './views/UnidadVista'

const CLAVE_MENU = 'modoDefensa_menuOculto'
const esEscritorio = () => window.matchMedia('(min-width: 1024px)').matches

function Contenido() {
  const ruta = useRuta()
  const { tema, alternar } = useTemaVisual()
  const { reiniciar } = useProgreso()
  const [confirmar, setConfirmar] = useState(false)
  // En el celular el menú es un panel que se abre; en pantallas grandes queda fijo y se puede ocultar.
  const [abierto, setAbierto] = useState(false)
  const [oculto, setOculto] = useState(() => leer<boolean>(CLAVE_MENU) === true)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const unidadActiva = ruta.vista === 'unidad' ? ruta.unidadId : ruta.vista === 'tema' ? unidadDeTema(ruta.temaId)?.id : undefined

  useEffect(() => escribir(CLAVE_MENU, oculto), [oculto])
  useEffect(() => setAbierto(false), [ruta])

  // El foco se mueve después de que el cambio se dibuja: antes, el botón destino todavía está oculto.
  const abrirMenu = () => {
    if (!esEscritorio()) return setAbierto(true)
    setOculto(false)
    setTimeout(() => document.querySelector<HTMLButtonElement>('#menu-lateral button')?.focus())
  }
  const cerrarMenu = useCallback(() => {
    if (esEscritorio()) setOculto(true)
    else setAbierto(false)
    setTimeout(() => menuBtn.current?.focus())
  }, [])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrarMenu()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto, cerrarMenu])

  return (
    <div className={`grid min-h-screen grid-cols-[minmax(0,1fr)] ${oculto ? '' : 'lg:grid-cols-[290px_minmax(0,1fr)]'}`}>
      <Barra
        ruta={ruta}
        unidadActiva={unidadActiva}
        temaVisual={tema}
        onAlternarTema={alternar}
        onReiniciar={() => setConfirmar(true)}
        abierto={abierto}
        oculto={oculto}
        onCerrar={cerrarMenu}
      />
      {abierto && <div aria-hidden="true" onClick={cerrarMenu} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden" />}

      <div className="min-w-0" inert={abierto}>
        <header
          className={`sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/85 py-2.5 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur-md ${oculto ? '' : 'lg:hidden'}`}
        >
          <button
            ref={menuBtn}
            type="button"
            onClick={abrirMenu}
            aria-controls="menu-lateral"
            aria-expanded={abierto || undefined}
            className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-sm font-extrabold text-ink hover:border-purple"
          >
            <span aria-hidden="true" className="text-base leading-none">☰</span> Menú
          </button>
          <span className="truncate font-black tracking-tight">Modo Defensa</span>
        </header>

        <main className="min-w-0 px-[max(1rem,env(safe-area-inset-left))] py-6 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-6xl">
            {ruta.vista === 'unidad' && <UnidadVista unidadId={ruta.unidadId} />}
            {ruta.vista === 'tema' && <LeccionVista temaId={ruta.temaId} />}
            {ruta.vista === 'banco' && <BancoVista />}
            {ruta.vista === 'repaso' && <BancoVista soloRepasar />}
            {ruta.vista === 'glosario' && <GlosarioVista />}
          </div>
        </main>
      </div>

      <Confirmar
        abierto={confirmar}
        titulo="¿Reiniciar el progreso?"
        texto="Se borran los temas dominados, las respuestas escritas, la lista para repasar y los XP. No se puede deshacer."
        accion="Reiniciar"
        onCancelar={() => setConfirmar(false)}
        onConfirmar={() => {
          reiniciar()
          setConfirmar(false)
        }}
      />
    </div>
  )
}

export function App() {
  return (
    <ProgresoProvider>
      <AvisoProvider>
        <GlosarioProvider>
          <Contenido />
        </GlosarioProvider>
      </AvisoProvider>
    </ProgresoProvider>
  )
}
