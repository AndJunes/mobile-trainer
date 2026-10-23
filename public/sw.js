// Service worker de Modo Defensa: permite instalar la app y usarla sin conexión después de la primera visita.
// - Los archivos de assets/ llevan un hash en el nombre: nunca cambian, así que se sirven desde la caché.
// - Las navegaciones van primero a la red (para tomar la versión nueva) y, sin conexión, usan la copia guardada.
const CACHE = 'modo-defensa-v1'
const INICIALES = ['./', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(INICIALES)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copia))
          return respuesta
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (guardada) =>
        guardada ??
        fetch(request).then((respuesta) => {
          if (respuesta.ok && url.pathname.includes('/assets/')) {
            const copia = respuesta.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copia))
          }
          return respuesta
        }),
    ),
  )
})
