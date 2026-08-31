/**
 * Genera `dist/push-schedule.json`: la lista de notificaciones push con su momento
 * exacto en UTC.
 *
 * Se genera desde `src/data/initialData.ts` en cada build, en vez de mantener un JSON
 * a mano, para que no pueda desincronizarse de los trenes reales. Si mañana cambia un
 * tren, el aviso cambia solo. Los 7 billetes están comprados desde agosto, así que ya no
 * hay avisos de pre-reserva: quedan el de comprobar que China emite cada billete y los
 * dos de cada día de trayecto.
 *
 * Ojo con los husos: aquí SÍ hacen falta horas absolutas (a diferencia del .ics, que usa
 * hora local flotante), porque quien envía es un servidor y tiene que saber el instante
 * exacto. Los avisos de compra suenan en hora de España (UTC+2 en agosto/septiembre) y
 * los del viaje en hora de China (UTC+8), porque en octubre ya están allí.
 */

import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Día en que aterrizan en Pekín: a partir de aquí el reloj de referencia es el chino. */
const LLEGADA_A_CHINA = '2026-10-10';

const OFFSET_ESPANA = 2; // CEST, vigente hasta el 25 de octubre
const OFFSET_CHINA = 8; // CST, sin horario de verano

/** Convierte fecha + hora local (con su offset) al instante UTC en ISO. */
function toUtcIso(dateIso, time, offsetHours) {
  const [y, m, d] = dateIso.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - offsetHours, mm)).toISOString();
}

function shiftDate(dateIso, days) {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** ¿Ese día ya están en China? */
function offsetFor(dateIso) {
  return dateIso >= LLEGADA_A_CHINA ? OFFSET_CHINA : OFFSET_ESPANA;
}

// Deja solo la estación. Corta por los dos separadores que usan los datos, ' · ' y ' — ':
// el nombre para teclear en Trip.com no cabe en una notificación del móvil.
function cleanStation(station) {
  return station ? station.split(/ · | — /)[0].trim() : '';
}

async function loadTripData() {
  // Se compila initialData.ts a un módulo temporal en memoria y se importa.
  const result = await build({
    entryPoints: [resolve(root, 'src/data/initialData.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    alias: { '@': resolve(root, 'src') },
    logLevel: 'error',
  });
  const code = result.outputFiles[0].text;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  return mod.initialTripData;
}

const data = await loadTripData();
const cityName = id => data.cities.find(c => c.id === id)?.cityName?.split(' (')[0] ?? id;

const alerts = [];

for (const leg of data.transportLegs) {
  const ruta = `${cityName(leg.fromCityId)} → ${cityName(leg.toCityId)}`;

  // 1. Día en que China abre la venta real: comprobar que el billete se emitió.
  //    La hora sale de `saleCheckTime`, igual que en el .ics: no es la misma para todos
  //    (el de Chongqing es a las 4:50 porque es el tramo de solo 3 trenes al día), y
  //    poner 09:00 fijo dejaba el aviso crítico 4 h tarde.
  if (leg.saleOpensIso && leg.trainNumber) {
    alerts.push({
      id: `checkticket-${leg.id}`,
      atUtc: toUtcIso(leg.saleOpensIso, leg.saleCheckTime ?? '09:00', offsetFor(leg.saleOpensIso)),
      title: `✅ Comprobar billete: ${ruta}`,
      body: `El ${leg.trainNumber} está pagado desde agosto, pero China lo emite hoy. Comprueba en Trip.com que salió; si la pre-reserva falló, cómpralo a mano ahora.`,
    });
  }

  // 2. Los dos avisos del día del trayecto.
  if (!leg.travelDateIso || !leg.leaveHotelTime) continue;

  const esTren = Boolean(leg.trainNumber && leg.departTime);
  const vispera = shiftDate(leg.travelDateIso, -1);

  alerts.push({
    id: `eve-${leg.id}`,
    atUtc: toUtcIso(vispera, '20:00', OFFSET_CHINA),
    title: esTren ? `🚄 Mañana: tren ${leg.trainNumber}` : `🚗 Mañana: ${leg.mode}`,
    body: esTren
      ? `${ruta}. Sale a las ${leg.departTime} de ${cleanStation(leg.fromStation)}. Salir del hotel a las ${leg.leaveHotelTime}.`
      : `${ruta} en ${leg.mode.toLowerCase()}. Salir a las ${leg.leaveHotelTime}.`,
  });

  alerts.push({
    id: `go-${leg.id}`,
    atUtc: toUtcIso(leg.travelDateIso, leg.leaveHotelTime, OFFSET_CHINA),
    title: esTren ? `⏰ Salir ya · tren ${leg.trainNumber}` : `⏰ Salir ya · ${ruta}`,
    body: esTren
      ? `${cleanStation(leg.fromStation)}, tren de las ${leg.departTime}. Asiento en fila 1 o última del vagón.`
      : `${ruta} en ${leg.mode.toLowerCase()}${leg.durationMinutes ? `, ~${leg.durationMinutes} min` : ''}.`,
  });
}

alerts.sort((a, b) => a.atUtc.localeCompare(b.atUtc));

const outDir = resolve(root, 'dist');
mkdirSync(outDir, { recursive: true });
writeFileSync(
  resolve(outDir, 'push-schedule.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), alerts }, null, 2)
);

console.log(`push-schedule.json: ${alerts.length} avisos programados.`);
