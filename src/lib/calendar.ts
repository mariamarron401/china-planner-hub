import {
  Activity,
  AirportTransfer,
  CityStop,
  HotelOption,
  LocalTransport,
  TransportLeg,
  TripData,
} from '@/types/trip';

/**
 * Construcción del calendario día a día del viaje.
 *
 * Todo se DERIVA de los datos que ya existen (hoteles, actividades, tramos de tren,
 * traslados) en lugar de escribir 25 días a mano: así, cuando se cambie la fecha de una
 * excursión o de un tren, el calendario se mueve solo y no hay dos verdades distintas.
 *
 * Las fechas del proyecto están escritas en texto libre y en varios formatos
 * ("10 oct", "13 oct 2026 (martes)", "Domingo 11 oct (mañana temprano)",
 * "1 nov 2026 (domingo) — noche"), así que se normalizan extrayendo día + mes.
 */

const FIRST_DAY = { day: 8, month: 10 }; // 8 oct 2026: AVE a Madrid + noche allí
const LAST_DAY = { day: 1, month: 11 }; // 1 nov 2026: vuelta a Madrid
const YEAR = 2026;

/** Día en que España pasa a horario de invierno (último domingo de octubre de 2026). */
export const DST_CHANGE = '2026-10-25';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** Extrae {day, month} de cualquiera de los formatos de fecha del proyecto. */
export function parseLooseDate(text: string | undefined): { day: number; month: number } | null {
  if (!text) return null;
  const m = text.match(/(\d{1,2})\s*(?:de\s*)?(oct|nov|sep|dic)/i);
  if (!m) return null;
  const monthMap: Record<string, number> = { sep: 9, oct: 10, nov: 11, dic: 12 };
  return { day: parseInt(m[1], 10), month: monthMap[m[2].toLowerCase()] };
}

function toIso(day: number, month: number): string {
  return `${YEAR}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function sameDay(text: string | undefined, day: number, month: number): boolean {
  const parsed = parseLooseDate(text);
  return parsed !== null && parsed.day === day && parsed.month === month;
}

/** Nº de orden absoluto para poder comparar fechas de octubre con las de noviembre. */
function rank(day: number, month: number): number {
  return month * 100 + day;
}

export interface CalendarDay {
  iso: string;
  day: number;
  month: number;
  /** Ej. "sáb 10 oct" */
  label: string;
  weekday: string;
  weekdayShort: string;
  isWeekend: boolean;
  /** Nº de día del viaje contando desde el 8 oct como día 1. */
  tripDay: number;
  /** Ciudad donde duermen esa noche. null si esa noche no hay hotel (en el aire). */
  cityName: string | null;
  hotel: HotelOption | null;
  isCheckIn: boolean;
  isCheckOut: boolean;
  activities: Activity[];
  transportLegs: TransportLeg[];
  localTransports: LocalTransport[];
  airportTransfers: AirportTransfer[];
  /** El 25 oct: España cambia a horario de invierno mientras están en China. */
  isDstChange: boolean;
  /** Hay tren, vuelo o traslado de aeropuerto ese día. */
  isTravelDay: boolean;
  /** Anotaciones que no se pueden derivar de los datos. */
  notes: string[];
}

/** Notas de días que no salen de ninguna otra colección. */
const MANUAL_NOTES: Record<string, string[]> = {
  '2026-10-08': [
    'AVE a Madrid + noche en Madrid. ⚠️ Todavía sin reservar: conviene hotel en la zona del aeropuerto con lanzadera 24 h.',
  ],
  '2026-10-09': ['Día entero de viaje. No dormís en cama: la noche la pasáis en el avión.'],
  '2026-10-25': [
    'En España se atrasan los relojes (horario de invierno). Vosotros no notáis nada, pero a partir de hoy la diferencia con casa es de 7 h en vez de 6 h.',
  ],
  '2026-11-01': ['Vuelta a casa. 18 h 15 min de viaje real, aunque el reloj solo marque 11 h 15 min.'],
};

export function buildCalendar(data: TripData): CalendarDay[] {
  const { cities, hotels, selectedHotels, activities, transportLegs, localTransports } = data;
  const airportTransfers = data.airportTransfers ?? [];

  // Hotel que corresponde a cada noche: check-in <= noche < check-out.
  const bookedHotels = cities
    .map(city => {
      const hotel = hotels.find(h => h.id === selectedHotels[city.id]);
      if (!hotel) return null;
      const inDate = parseLooseDate(hotel.checkInText);
      const outDate = parseLooseDate(hotel.checkOutText);
      if (!inDate || !outDate) return null;
      return { city, hotel, inRank: rank(inDate.day, inDate.month), outRank: rank(outDate.day, outDate.month) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const days: CalendarDay[] = [];
  let cursor = { ...FIRST_DAY };
  let tripDay = 1;

  // Se avanza día a día con Date solo para el día de la semana; el resto es aritmética simple.
  while (rank(cursor.day, cursor.month) <= rank(LAST_DAY.day, LAST_DAY.month)) {
    const { day, month } = cursor;
    const iso = toIso(day, month);
    const jsDate = new Date(YEAR, month - 1, day);
    const dow = jsDate.getDay();
    const currentRank = rank(day, month);

    const stay = bookedHotels.find(b => currentRank >= b.inRank && currentRank < b.outRank);
    const checkingIn = bookedHotels.find(b => b.inRank === currentRank);
    const checkingOut = bookedHotels.find(b => b.outRank === currentRank);

    const dayLegs = transportLegs.filter(l => sameDay(l.travelDate, day, month));
    const dayLocals = localTransports.filter(l => sameDay(l.date, day, month));
    const dayAirport = airportTransfers.filter(t => sameDay(t.date, day, month));

    days.push({
      iso,
      day,
      month,
      label: `${WEEKDAYS_SHORT[dow]} ${day} ${month === 10 ? 'oct' : 'nov'}`,
      weekday: WEEKDAYS[dow],
      weekdayShort: WEEKDAYS_SHORT[dow],
      isWeekend: dow === 0 || dow === 6,
      tripDay,
      cityName: stay?.city.cityName ?? null,
      hotel: stay?.hotel ?? null,
      isCheckIn: checkingIn !== undefined,
      isCheckOut: checkingOut !== undefined,
      activities: activities.filter(a => sameDay(a.recommendedDate, day, month)),
      transportLegs: dayLegs,
      localTransports: dayLocals,
      airportTransfers: dayAirport,
      isDstChange: iso === DST_CHANGE,
      isTravelDay: dayLegs.length > 0 || dayAirport.length > 0,
      notes: MANUAL_NOTES[iso] ?? [],
    });

    tripDay += 1;
    // Siguiente día del calendario (octubre tiene 31 días).
    if (month === 10 && day === 31) cursor = { day: 1, month: 11 };
    else cursor = { day: day + 1, month };
  }

  return days;
}

/** Agrupa los días por mes para poder pintar cabeceras. */
export function groupByMonth(days: CalendarDay[]): { month: number; label: string; days: CalendarDay[] }[] {
  const out: { month: number; label: string; days: CalendarDay[] }[] = [];
  for (const d of days) {
    let group = out.find(g => g.month === d.month);
    if (!group) {
      group = { month: d.month, label: d.month === 10 ? 'Octubre 2026' : 'Noviembre 2026', days: [] };
      out.push(group);
    }
    group.days.push(d);
  }
  return out;
}

export type { CityStop };
