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

// Service worker solo en la versión publicada: en desarrollo cachearía archivos que cambian todo el tiempo.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* sin service worker la app funciona igual, solo que no offline */
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
