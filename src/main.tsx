import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

// Aplicar el tema guardado antes del primer render, para que no haya un destello de colores.
try {
  if (localStorage.getItem('modoDefensa_tema') === 'claro') document.documentElement.dataset.theme = 'claro'
} catch {
  /* sin almacenamiento */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
