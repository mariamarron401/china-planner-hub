/* Service worker de la app del viaje.
 *
 * Por qué existe: la app se sirve desde GitHub Pages (github.io), que en China va lento o
 * directamente no responde a través del Gran Cortafuegos, y la VPN es un único punto de fallo.
 * Con este service worker, la app queda guardada entera en el móvil la primera vez que se abre
 * (en España o con VPN) y a partir de ahí ARRANCA SIN RED: aunque github.io esté bloqueado, el
 * navegador la sirve de su propia caché.
 *
 * Estrategias:
 *  - Documento (navegación): red primero con 4 s de tope → si falla o tarda, copia en caché.
 *    Así, con red buena siempre se ve la última versión desplegada, y sin red se ve la última
 *    que se descargó.
 *  - Ficheros propios (JS/CSS/fuentes/iconos): caché primero + refresco en segundo plano.
 *  - Imágenes de fuera (Wikimedia, Trip.com): caché primero. Wikimedia está bloqueado en China,
 *    así que solo se verán las fotos que se hayan cargado alguna vez antes del viaje.
 *  - Supabase y el servidor de vídeos: SIEMPRE red, nunca caché. Son datos en vivo y una copia
 *    vieja sería peor que un error.
 */

const CACHE = 'viaje-china-v1';
const NAV_TIMEOUT_MS = 4000;

// Dominios de datos en vivo: no se cachean nunca.
const LIVE_ONLY = ['supabase.co', 'supabase.in', 'onrender.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // El documento raíz siempre, para poder arrancar sin red.
    await cache.add(new Request('./', { cache: 'reload' })).catch(() => {});
    // El resto de ficheros del build los lista `precache-manifest.json`, que genera
    // `scripts/generate-precache-manifest.mjs` después de `vite build`.
    try {
      const res = await fetch('./precache-manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const files = await res.json();
        await Promise.all(
          files.map((file) => cache.add(new Request(file, { cache: 'reload' })).catch(() => {}))
        );
      }
    } catch {
      // En desarrollo no existe el manifiesto: no es un error.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

function isLiveOnly(url) {
  return LIVE_ONLY.some((host) => url.hostname.endsWith(host));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NAV_TIMEOUT_MS);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response && response.ok) cache.put('./', response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match('./'));
    if (cached) return cached;
    throw new Error('offline y sin copia en caché');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Refresco silencioso en segundo plano: la próxima visita ya tendrá la versión nueva.
    fetch(request)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (isLiveOnly(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request).catch(() => fetch(request)));
  }
});
