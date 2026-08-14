/**
 * Envía las notificaciones push que toquen ahora. Lo ejecuta el GitHub Action
 * `.github/workflows/push-reminders.yml` cada hora.
 *
 * Piezas:
 *  - Qué enviar: `dist/push-schedule.json`, que genera `generate-push-schedule.mjs`
 *    a partir de los trenes reales.
 *  - A quién: las suscripciones que guardan los móviles en la tabla `places`
 *    (category='push_sub'), desde `src/lib/pushNotifications.ts`.
 *  - Con qué: la clave privada VAPID, que llega por la variable de entorno
 *    VAPID_PRIVATE_KEY (secreto del repositorio, nunca en el código).
 *
 * Anti-duplicados: cada envío deja una fila (category='push_sent'). Es necesario
 * porque el cron de GitHub Actions no es puntual —puede retrasarse bastante— y sin
 * esto un aviso podría mandarse dos veces.
 */

import webpush from 'web-push';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const VAPID_PUBLIC = 'BDC85xKuRD99_XwVHqglsIXs0_wfXFQmxMNm7uFaSBXLgOPhVDOSAPBJW9ShFo6ITo9ZatDH3xL8U-a0ofZ7GBQ';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

/**
 * Ventana hacia atrás que se considera "ahora". Amplia a propósito: el cron de
 * GitHub Actions se retrasa con frecuencia y es mejor mandar un aviso 40 min tarde
 * que no mandarlo. Los duplicados los corta el registro de enviados.
 */
const VENTANA_MIN = 75;

if (!VAPID_PRIVATE) {
  console.error('Falta VAPID_PRIVATE_KEY. Añádelo como secreto del repositorio.');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan SUPABASE_URL / SUPABASE_KEY.');
  process.exit(1);
}

webpush.setVapidDetails('mailto:viaje@china2026.local', VAPID_PUBLIC, VAPID_PRIVATE);

const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

const { alerts } = JSON.parse(readFileSync(resolve(root, 'dist/push-schedule.json'), 'utf8'));

const now = Date.now();
const due = alerts.filter(a => {
  const t = new Date(a.atUtc).getTime();
  return t <= now && now - t <= VENTANA_MIN * 60_000;
});

if (due.length === 0) {
  console.log('Nada que enviar en esta ventana.');
  process.exit(0);
}

// Qué se ha mandado ya, para no repetir.
const sentRes = await rest('places?category=eq.push_sent&select=id');
const alreadySent = new Set((await sentRes.json()).map(r => r.id.replace(/^sent-/, '')));

const pending = due.filter(a => !alreadySent.has(a.id));
if (pending.length === 0) {
  console.log(`${due.length} aviso(s) en ventana, todos enviados ya.`);
  process.exit(0);
}

// Los móviles suscritos.
const subsRes = await rest('places?category=eq.push_sub&status=eq.active&select=id,name,notes');
const subs = (await subsRes.json())
  .map(r => {
    try {
      return { rowId: r.id, label: r.name, sub: JSON.parse(r.notes) };
    } catch {
      return null;
    }
  })
  .filter(Boolean);

if (subs.length === 0) {
  console.log('No hay ningún móvil suscrito todavía; no se envía nada.');
  process.exit(0);
}

console.log(`${pending.length} aviso(s) x ${subs.length} móvil(es).`);

for (const alert of pending) {
  let entregados = 0;

  for (const { rowId, label, sub } of subs) {
    const payload = JSON.stringify({
      title: alert.title,
      body: alert.body,
      tag: alert.id,
      url: './moverse',
    });

    try {
      await webpush.sendNotification(sub, payload);
      entregados++;
      console.log(`  OK    ${alert.id} → ${label}`);
    } catch (err) {
      const code = err?.statusCode;
      console.log(`  FALLA ${alert.id} → ${label} (${code ?? err.message})`);
      // 404/410 = la suscripción ya no existe (app desinstalada o permiso revocado).
      if (code === 404 || code === 410) {
        await rest(`places?id=eq.${encodeURIComponent(rowId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'inactive' }),
        });
        console.log(`        suscripción caducada, marcada inactiva`);
      }
    }
  }

  // Solo se marca como enviado si llegó a algún móvil: si fallaron todos, se
  // reintenta en la siguiente ejecución (dentro de la ventana).
  if (entregados > 0) {
    await rest('places', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: `sent-${alert.id}`,
        category: 'push_sent',
        city_id: 'global',
        name: alert.title,
        notes: new Date().toISOString(),
        status: 'sent',
      }),
    });
  }
}

console.log('Hecho.');
