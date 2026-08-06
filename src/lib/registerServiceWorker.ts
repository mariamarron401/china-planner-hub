/**
 * Registro del service worker (`public/sw.js`).
 *
 * Solo en producción: en `npm run dev` un service worker interfiere con el recarga-en-caliente
 * de Vite y confunde más que ayuda.
 *
 * La ruta es relativa (`./sw.js`) a propósito: la app se sirve desde un subdirectorio
 * (`/china-planner-hub/`) en GitHub Pages, así que una ruta absoluta apuntaría fuera del sitio
 * y el ámbito del service worker no cubriría la app.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      // Que falle no debe romper la app: simplemente no habrá copia offline.
      console.warn('No se pudo registrar el service worker:', error);
    });
  });
}
