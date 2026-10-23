import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  // preguntas.json (~850 kB) se carga en diferido con import(); no bloquea el primer render.
  build: { chunkSizeWarningLimit: 1000 },
})
