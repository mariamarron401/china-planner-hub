import { TransportLeg } from '@/types/trip';

/**
 * Genera un archivo .ics con todos los avisos del viaje para importar en el
 * Calendario del iPhone. Se eligió el calendario (y no solo notificaciones push)
 * porque una alarma de calendario la dispara iOS en el propio móvil: funciona sin
 * cobertura, sin VPN y sin depender de que github.io sea accesible desde China.
 *
 * Dos bloques de avisos:
 *  1. Sept-oct — comprobar que el billete se emitió de verdad (D-15). Los 7 trenes
 *     están comprados desde agosto; esto solo verifica que China los emite.
 *  2. Los días de trayecto — aviso la noche antes y aviso a la hora de salir del hotel.
 *
 * Las horas van en "hora local flotante" (sin zona horaria): iOS las interpreta con
 * el reloj del móvil. Es justo lo que queremos — los avisos de septiembre suenan a esa
 * hora en España y los de octubre a esa hora en China, sin cálculos de husos.
 */

const CAL_NAME = 'Viaje China 2026';

/** Escapa los caracteres que RFC 5545 reserva dentro de un valor TEXT. */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Pliega las líneas a 75 octetos como exige RFC 5545. Se cuenta en bytes UTF-8,
 * no en caracteres, porque los nombres de estación en chino ocupan 3 bytes cada uno
 * y si se cortan por caracteres el archivo se pasa del límite.
 */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  // Primera línea 75 octetos; las de continuación llevan un espacio inicial, así que 74.
  for (const char of line) {
    const size = enc.encode(char).length;
    const limit = out.length === 0 ? 75 : 74;
    if (currentBytes + size > limit) {
      out.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += size;
  }
  if (current) out.push(current);
  return out.map((chunk, i) => (i === 0 ? chunk : ` ${chunk}`)).join('\r\n');
}

/** '10:30' → '10:45'. Da la hora de fin de un aviso de 15 minutos. */
function plus15(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + 15) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** '2026-10-13' + '09:55' → '20261013T095500' (hora local flotante). */
function stamp(dateIso: string, time: string): string {
  return `${dateIso.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

/** Suma minutos a un 'HH:MM' y devuelve { time, dayOffset }. */
function addMinutes(time: string, minutes: number): { time: string; dayOffset: number } {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const dayOffset = Math.floor(total / 1440);
  const rest = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(rest / 60)).padStart(2, '0');
  const mm = String(rest % 60).padStart(2, '0');
  return { time: `${hh}:${mm}`, dayOffset };
}

function shiftDate(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Minutos entre dos momentos del calendario, para calcular el TRIGGER de una alarma. */
function minutesBetween(fromIso: string, fromTime: string, toIso: string, toTime: string): number {
  const parse = (iso: string, t: string) => {
    const [y, mo, d] = iso.split('-').map(Number);
    const [h, mi] = t.split(':').map(Number);
    return Date.UTC(y, mo - 1, d, h, mi);
  };
  return Math.round((parse(toIso, toTime) - parse(fromIso, fromTime)) / 60000);
}

interface Alarm {
  /** Minutos ANTES del inicio del evento. Positivo = antes. */
  minutesBefore: number;
  description: string;
}

interface Event {
  uid: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  /** El evento termina al día siguiente (solo pasa si un tren cruzara medianoche). */
  endDayOffset?: number;
  title: string;
  description: string;
  location?: string;
  alarms: Alarm[];
}

function renderEvent(ev: Event, dtstamp: string): string[] {
  const lines: string[] = ['BEGIN:VEVENT', `UID:${ev.uid}`, `DTSTAMP:${dtstamp}`];
  lines.push(`DTSTART:${stamp(ev.dateIso, ev.startTime)}`);
  lines.push(`DTEND:${stamp(shiftDate(ev.dateIso, ev.endDayOffset ?? 0), ev.endTime)}`);
  lines.push(fold(`SUMMARY:${esc(ev.title)}`));
  lines.push(fold(`DESCRIPTION:${esc(ev.description)}`));
  if (ev.location) lines.push(fold(`LOCATION:${esc(ev.location)}`));
  ev.alarms.forEach(alarm => {
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(fold(`DESCRIPTION:${esc(alarm.description)}`));
    // RFC 5545: duración negativa = antes del inicio. -PT0M no es válido, se usa PT0S.
    lines.push(
      alarm.minutesBefore === 0 ? 'TRIGGER:PT0S' : `TRIGGER:-PT${alarm.minutesBefore}M`
    );
    lines.push('END:VALARM');
  });
  lines.push('END:VEVENT');
  return lines;
}

function cityLabel(leg: TransportLeg, cityName: (id: string) => string): string {
  return `${cityName(leg.fromCityId)} → ${cityName(leg.toCityId)}`;
}

/**
  * Deja solo la estación: 'Beijing West (北京西站) · en Trip.com "Beijingxi"' → 'Beijing West (北京西站)'.
  * Corta por los dos separadores que usan los datos, ' · ' y ' — ': el nombre para teclear
  * en Trip.com y los avisos de no confundirse de estación no caben en una notificación.
  */
function cleanStation(station?: string): string {
  if (!station) return '';
  return station.split(/ · | — /)[0].trim();
}

export function buildTripIcs(legs: TransportLeg[], cityName: (id: string) => string): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const events: Event[] = [];

  legs.forEach(leg => {
    const ruta = cityLabel(leg, cityName);

    // 1. Comprobar que el billete se emitió de verdad (D-15).
    if (leg.saleOpensIso && leg.trainNumber) {
      events.push({
        uid: `checkticket-${leg.id}@viajechina2026`,
        dateIso: leg.saleOpensIso,
        startTime: leg.saleCheckTime ?? '09:00',
        endTime: plus15(leg.saleCheckTime ?? '09:00'),
        title: `✅ Comprobar billete: ${ruta}`,
        description: [
          'Hoy China abre la venta real de este tren.',
          `El billete está pagado desde agosto: comprueba en Trip.com que el del ${leg.trainNumber} se ha emitido.`,
          `${leg.departTime} → ${leg.arriveTime}, ${leg.travelDate ?? ''}.`,
          '',
          'Si la pre-reserva falló, cómpralo a mano AHORA.',
        ].join('\n'),
        alarms: [{ minutesBefore: 0, description: `¿Se emitió el billete de ${ruta}?` }],
      });
    }

    // 2. El día del trayecto.
    if (!leg.travelDateIso || !leg.leaveHotelTime) return;

    const esTren = Boolean(leg.trainNumber && leg.departTime && leg.arriveTime);
    const start = esTren ? leg.departTime! : leg.leaveHotelTime;
    const endCalc = esTren
      ? { time: leg.arriveTime!, dayOffset: 0 }
      : addMinutes(leg.leaveHotelTime, 60);

    // Alarma la noche antes, a las 20:00.
    const nocheAntes = minutesBetween(
      shiftDate(leg.travelDateIso, -1),
      '20:00',
      leg.travelDateIso,
      start
    );
    // Alarma a la hora de salir del hotel.
    const alSalir = minutesBetween(leg.travelDateIso, leg.leaveHotelTime, leg.travelDateIso, start);

    const asiento = esTren
      ? '\nAsiento: fila 1 o última del vagón (ahí están los estantes de maletas grandes).'
      : '';

    events.push({
      uid: `leg-${leg.id}@viajechina2026`,
      dateIso: leg.travelDateIso,
      startTime: start,
      endTime: endCalc.time,
      endDayOffset: endCalc.dayOffset,
      title: esTren
        ? `🚄 ${leg.trainNumber} ${start} · ${ruta}`
        : `🚗 ${leg.mode} · ${ruta}`,
      description: esTren
        ? [
            `Tren ${leg.trainNumber}: sale ${start}, llega ${leg.arriveTime}.`,
            `Origen: ${cleanStation(leg.fromStation)}`,
            `Destino: ${cleanStation(leg.toStation)}`,
            '',
            `Salir del hotel a las ${leg.leaveHotelTime}.`,
            leg.transferBefore ?? '',
            leg.stationBuffer ?? '',
            asiento.trim(),
          ]
            .filter(Boolean)
            .join('\n')
        : [
            `${leg.mode}: este tramo no es tren, no hay billete que sacar.`,
            `Salir a las ${leg.leaveHotelTime}.`,
            leg.transferBefore ?? '',
            leg.notes ?? '',
          ]
            .filter(Boolean)
            .join('\n'),
      location: esTren ? cleanStation(leg.fromStation) : undefined,
      alarms: [
        {
          minutesBefore: nocheAntes,
          description: esTren
            ? `Mañana tren ${leg.trainNumber} a las ${start} desde ${cleanStation(leg.fromStation)}`
            : `Mañana ${leg.mode.toLowerCase()} a ${cityName(leg.toCityId)} a las ${start}`,
        },
        {
          minutesBefore: alSalir,
          description: esTren
            ? `Salir YA hacia ${cleanStation(leg.fromStation)} · tren ${leg.trainNumber} a las ${start}`
            : `Hora de salir hacia ${cityName(leg.toCityId)}`,
        },
      ],
    });
  });

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viaje China 2026//Planner//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${esc(CAL_NAME)}`),
    'X-APPLE-CALENDAR-COLOR:#E4572E',
  ];
  events.forEach(ev => lines.push(...renderEvent(ev, dtstamp)));
  lines.push('END:VCALENDAR');

  return lines.join('\r\n') + '\r\n';
}

/** Cuántos avisos genera el archivo, para poder decírselo al usuario antes de descargar. */
export function countTripAlerts(legs: TransportLeg[]): number {
  return legs.reduce((n, leg) => {
    let count = 0;
    if (leg.saleOpensIso && leg.trainNumber) count += 1;
    if (leg.travelDateIso && leg.leaveHotelTime) count += 2; // noche antes + al salir
    return n + count;
  }, 0);
}

/**
 * Descarga el .ics. En iOS Safari esto abre la hoja del Calendario para añadir los
 * eventos; en escritorio guarda el archivo.
 */
export function downloadTripIcs(legs: TransportLeg[], cityName: (id: string) => string): void {
  const ics = buildTripIcs(legs, cityName);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'viaje-china-2026-avisos.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Se libera con retraso: Safari necesita el blob vivo mientras abre la hoja del Calendario.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
