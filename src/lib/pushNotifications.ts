import { supabase } from '@/integrations/supabase/client';

/**
 * Notificaciones push del viaje.
 *
 * Van EN PARALELO a los avisos de calendario (`calendarExport.ts`), no en su lugar.
 * El calendario es el respaldo fiable porque la alarma la dispara iOS en el propio
 * móvil, sin red. El push necesita que el móvil mantenga viva su conexión con el
 * servicio de notificaciones de Apple, que dentro de China es la pieza que puede
 * fallar — por eso se recomiendan los dos.
 *
 * Requisitos en iPhone (iOS 16.4+): la app tiene que estar **añadida a la pantalla
 * de inicio**. Safari no permite push web a una web abierta en pestaña.
 *
 * Quien envía es un GitHub Action programado (`.github/workflows/push-reminders.yml`),
 * que lee las suscripciones de aquí y usa la clave privada VAPID guardada como secreto.
 */

/** Clave pública VAPID. Es pública por diseño: identifica al remitente, no autoriza nada. */
const VAPID_PUBLIC_KEY =
  'BDC85xKuRD99_XwVHqglsIXs0_wfXFQmxMNm7uFaSBXLgOPhVDOSAPBJW9ShFo6ITo9ZatDH3xL8U-a0ofZ7GBQ';

/** Las suscripciones se guardan como filas de `places`, igual que el resto de estado compartido. */
const SUB_CATEGORY = 'push_sub';

export type PushState =
  | 'no-soportado'
  | 'necesita-instalar'
  | 'sin-permiso'
  | 'denegado'
  | 'activo';

/** ¿Está la app abierta como app instalada y no como pestaña de Safari? */
export function isInstalledApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS antiguo expone esto en lugar de display-mode.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) {
    // En iPhone el push existe pero solo si la app está instalada: se distingue
    // para poder dar la instrucción correcta en vez de un "no compatible" seco.
    return isIos() && !isInstalledApp() ? 'necesita-instalar' : 'no-soportado';
  }
  if (isIos() && !isInstalledApp()) return 'necesita-instalar';
  if (Notification.permission === 'denied') return 'denegado';
  if (Notification.permission !== 'granted') return 'sin-permiso';

  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'activo' : 'sin-permiso';
}

/** 'BJqU...' → Uint8Array, que es lo que espera `pushManager.subscribe`. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Pide permiso, se suscribe y guarda la suscripción.
 * Devuelve el estado final para que la UI pueda explicar qué falta.
 */
export async function enablePush(deviceLabel: string): Promise<PushState> {
  const state = await getPushState();
  if (state === 'no-soportado' || state === 'necesita-instalar' || state === 'denegado') {
    return state;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denegado' : 'sin-permiso';

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      // Obligatorio: toda notificación tiene que ser visible para el usuario.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = sub.toJSON();
  // El endpoint identifica al dispositivo de forma única: se usa como id de fila
  // para que volver a activar en el mismo móvil actualice en vez de duplicar.
  const id = `push-${await shortHash(json.endpoint ?? '')}`;

  const { error } = await supabase.from('places').upsert({
    id,
    category: SUB_CATEGORY,
    city_id: 'global',
    name: deviceLabel,
    notes: JSON.stringify(json),
    status: 'active',
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  return 'activo';
}

export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  const id = `push-${await shortHash(sub.endpoint)}`;
  await sub.unsubscribe();
  // Se marca inactiva en vez de borrarla: así queda rastro de qué móvil se dio de baja.
  await supabase.from('places').update({ status: 'inactive' }).eq('id', id);
}

/** Hash corto y estable del endpoint, para usarlo como id de fila. */
async function shortHash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)]
    .slice(0, 8)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Manda una notificación de prueba local, para comprobar que el móvil las muestra. */
export async function sendTestNotification(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Viaje China · prueba', {
    body: 'Si ves esto, las notificaciones funcionan en este móvil.',
    icon: './icon-192.png',
    tag: 'prueba',
  });
}
