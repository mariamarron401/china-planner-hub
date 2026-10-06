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

const FIRST_DAY = { day: 8, month: 10 }; // 8 oct 2026: bus nocturno Zaragoza → Madrid
const LAST_DAY = { day: 2, month: 11 }; // 2 nov 2026: llegada a Zaragoza de madrugada
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
  /** Horario hora a hora de ese día. Vacío si no hay nada planificado. */
  timeline: TimelineEntry[];
}

/** Notas de días que no salen de ninguna otra colección. */
const MANUAL_NOTES: Record<string, string[]> = {
  '2026-10-08': [
    'Bus nocturno Zaragoza → Madrid. No hace falta hotel: dormís en el bus. Coged uno que llegue a Barajas antes de las 03:00.',
  ],
  '2026-10-09': ['Día entero de viaje. No dormís en cama: la noche la pasáis en el avión.'],
  '2026-10-25': [
    { time: '06:30', what: 'Desayuno fuerte en cuanto abra. Coged fruta para media mañana.', kind: 'comida' },
    { time: '07:05', what: '🚕 Didi al 标志门 (Puerta Este), 3-5 min.' },
    { time: '07:15', what: '🏔️ PARQUE AVATAR ✅ comprada. Entrada 07:00-08:00, LÍNEA B (torno de la derecha). Pasaporte físico.', kind: 'clave' },
    { time: '', what: 'Si la pantalla de la puerta marca más de 60 min en el Bailong: plan B al revés (Tianzi primero), pedid el cambio a la Línea A en ventanilla.' },
    { time: '07:20', what: 'Eco-bus (~18 min) y ascensor Bailong (65 CNY, QR allí).' },
    { time: '08:15', what: 'Yuanjiajie: Mihun Terrace, Back Garden, Qiankun Pillar (la montaña Avatar) y Primer Puente bajo el Cielo. Ojo con los monos y la comida.' },
    { time: '11:15', what: 'Eco-bus a Tianzi, parada de 贺龙公园.' },
    { time: '12:00', what: 'Comida junto a la parada de 贺龙公园 (40-60 CNY/persona).', kind: 'comida' },
    { time: '12:45', what: 'Tianzi: He Long Park, Yubi Peak, Fairy Scattering Flowers y miradores.' },
    { time: '15:45', what: '🚡 Teleférico de Tianzi abajo (72 CNY). En la cola como muy tarde a las 16:30.', kind: 'clave' },
    { time: '16:15', what: 'Eco-bus al 标志门. El Didi de vuelta se pide en 驼峰路.' },
    { time: '17:15', what: 'Hotel: ducha y maletas cerradas ya.' },
    { time: '18:30', what: 'Cena de Sanxiaguo, pronto.', kind: 'comida' },
    { time: '20:00', what: '📋 RECEPCIÓN: Didi programado para mañana, check-out anticipado y desayuno para llevar (可以帮我们准备打包早餐吗？).', kind: 'clave' },
    { time: '', what: '🕐 Hoy España atrasa los relojes. Vosotros no notáis nada, pero desde hoy la diferencia con casa es de 7 h, no 6.' },
  ],
  '2026-10-26': [
    { time: '05:15', what: 'Despertador. Maletas hechas desde anoche.', kind: 'clave' },
    { time: '05:48', what: '🚕 Salir del hotel. El bufé abre a las 06:30 y no llegáis → desayuno para llevar, pedido anoche.', kind: 'clave' },
    { time: '06:28', what: 'En Zhangjiajiexi. 28 km desde el hotel, ~40 min. A esa hora la estación está vacía.' },
    { time: '07:28', what: '🚄 Tren G1367 → Shangrao. 6h11. Desayunáis en el tren y dormís lo que podáis.', kind: 'clave' },
    { time: '13:39', what: 'Llegada a Shangrao. Traslado a Wangxian Valley: ~40 km, ~1 h.' },
    { time: '14:40', what: 'En el hotel, DENTRO del recinto. La entrada al área escénica va incluida.' },
    { time: '', what: '🌄 Tarde entera en el valle: llegáis a las 14:40 y no hay nada más en la agenda.', kind: 'libre' },
    { time: '', what: '🌙 Y de noche, sin turistas de día y sin pagar entrada aparte. Es por esto que elegisteis dormir dentro.', kind: 'libre' },
  ],
  '2026-10-27': [
    { time: '07:30', what: '⏰ Desayuno 07:30-09:30. CIERRA a las 09:30 y no salís hasta las 11:45 → despertador.', kind: 'comida' },
    { time: '', what: 'Mañana por el valle, aprovechando que estáis dentro.', kind: 'libre' },
    { time: '11:45', what: '🚕 Salir hacia Shangrao. Es el traslado más largo a una estación del viaje: ~40 km y ~1 h.', kind: 'clave' },
    { time: '12:48', what: 'En la estación de Shangrao.' },
    { time: '13:48', what: '🚄 Tren G1370 → ShanghaiHongqiao. 2h37. ⚠️ Hongqiao, NO Shanghai South: hay trenes a South a horas parecidas.', kind: 'clave' },
    { time: '16:25', what: 'Llegada a Shanghai Hongqiao. Didi al hotel (People\'s Square).' },
    { time: '17:00', what: 'En el hotel. Tarde libre.', kind: 'libre' },
  ],
  '2026-10-28': [
    { time: '07:30', what: 'Desayuno (07:30-13:30), el horario más amplio del viaje.', kind: 'comida' },
    { time: '', what: 'Día de Shanghái y de descanso: el Bund, Nanjing Road, la Concesión Francesa, Yu Garden. Mañana es Disney y son 13-14 h de pie.', kind: 'libre' },
    { time: '22:00', what: '⚠️ A la cama pronto y pasaportes preparados: mañana salís a las 07:00.', kind: 'clave' },
  ],
  '2026-10-29': [
    { time: '07:00', what: '🏰 SHANGHAI DISNEYLAND. El desayuno abre a las 07:30 y no llegáis → para llevar, pedido anoche.', kind: 'clave' },
    { time: '', what: 'Entrada NOMINAL de fecha fija: pasaporte físico con el mismo número de la compra. No se vende en la puerta.', kind: 'clave' },
    { time: '', what: '⚡ Pases para saltar colas: NO compréis paquete. Entrad, mirad las esperas reales en la app oficial y comprad 1-2 sueltos (140-180 CNY) SOLO si TRON o Zootopia pasan de 80-90 min.', kind: 'clave' },
    { time: '', what: '🎉 Es el 10º aniversario: show nuevo de castillo (The Heart of Magic) y final especial en Illuminate!' },
  ],
  '2026-10-30': [
    { time: '07:30', what: 'Desayuno (07:30-13:30). Hoy sin despertador.', kind: 'comida' },
    { time: '', what: 'Shanghái libre. Pudong y la torre, o museos. Día de recuperación tras Disney.', kind: 'libre' },
  ],
  '2026-10-31': [
    { time: '07:30', what: 'Desayuno (07:30-13:30).', kind: 'comida' },
    { time: '', what: 'Último día. Compras y lo que quede pendiente.', kind: 'libre' },
    { time: '20:00', what: '⚠️ MALETAS HECHAS, cuenta del hotel pagada, taxi pedido para las 06:00 y desayuno para llevar encargado. Mañana salís hora y media antes de que abra el bufé.', kind: 'clave' },
  ],
  '2026-11-01': [
    { time: '06:00', what: '🚕 Salir hacia Hongqiao T2. ⚠️ Es SHA (Hongqiao), NO Pudong.', kind: 'clave' },
    { time: '06:55', what: 'En el aeropuerto.' },
    { time: '08:55', what: '✈️ Vuelo CA1590 Shanghái → Pekín PEK T3. 2 h.', kind: 'clave' },
    { time: '10:55', what: 'Llegada a Pekín. Escala de 4h05.' },
    { time: '15:00', what: '✈️ Vuelo CA897 Pekín → Madrid T1. 12h10.', kind: 'clave' },
    { time: '20:10', what: 'Llegada a Madrid (hora española). Equipaje en planta P0 de la T1.' },
    { time: '23:00', what: '🚌 Bus nocturno del T4 a Zaragoza. Salida recomendada 23:00-23:30.', kind: 'clave' },
  ],
  '2026-11-02': [
    { time: '02:30', what: '🏠 Llegada a Zaragoza-Delicias. Es festivo en Aragón: a dormir.', kind: 'libre' },
  ],
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
    // Los traslados se anclan por `calendarIso`, no leyendo su texto: los nocturnos
    // cruzan dos días y hay que colocarlos en el día en que toca actuar.
    const dayAirport = airportTransfers.filter(t => t.calendarIso === iso);

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
      timeline: DAY_TIMELINE[iso] ?? [],
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
