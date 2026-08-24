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
    'En España se atrasan los relojes (horario de invierno). Vosotros no notáis nada, pero a partir de hoy la diferencia con casa es de 7 h en vez de 6 h.',
  ],
  '2026-11-01': [
    'Vuelta a casa: 18 h 15 min de viaje real, aunque el reloj solo marque 11 h 15 min. Al aterrizar, bus nocturno del T4 a Zaragoza.',
  ],
  '2026-11-02': [
    'Llegáis a Zaragoza-Delicias de madrugada (sobre las 02:30-03:00). ✅ Es festivo en Aragón, así que tenéis el día para dormir.',
  ],
};


/**
 * Horario definitivo de cada día: la hora y qué se hace. Construido el 24/08/2026,
 * ya con 5 de 7 trenes comprados, con la regla de 1 hora en estación, con los
 * horarios de desayuno verificados hotel por hotel y con las franjas reales de las
 * entradas. Es lo que se sigue sobre el terreno.
 *
 * Vive aquí y no en `initialData.ts` porque no es un dato editable: es la lectura
 * combinada de trenes + hoteles + actividades, que ya viven cada uno en su sitio.
 * Si cambia un tren, hay que repasar su día aquí.
 */
export interface TimelineEntry {
  /** Hora local de China en HH:MM, o '' si es algo sin hora fija. */
  time: string;
  what: string;
  /** 'clave' = no se puede fallar (tren, franja de entrada, vuelo). */
  kind?: 'clave' | 'comida' | 'libre';
}

export const DAY_TIMELINE: Record<string, TimelineEntry[]> = {
  '2026-10-08': [
    { time: '', what: 'Bus nocturno Zaragoza → Madrid Barajas. Dormís en el bus, no hay hotel.', kind: 'clave' },
  ],
  '2026-10-09': [
    { time: '06:20', what: 'Vuelo SN3732 Madrid T2 → Bruselas. Mostradores Brussels Airlines 415-420, planta 2.', kind: 'clave' },
    { time: '08:35', what: 'Llegada a Bruselas. Escala de 4h25.' },
    { time: '13:00', what: 'Vuelo CA964 Bruselas T3 → Pekín. 9h45. Se duerme en el avión.', kind: 'clave' },
  ],
  '2026-10-10': [
    { time: '04:45', what: 'Llegada a Pekín PEK T3. Aduana, equipaje y e-SIM/VPN encendidas antes de salir.', kind: 'clave' },
    { time: '06:30', what: 'Didi al hotel (Yabaolu, Chaoyang). ~30 min a esa hora.' },
    { time: '07:00', what: 'En el hotel. El check-in es a las 14:00 → maletas en recepción. ⚠️ El desayuno de hoy NO va incluido (¥80/persona si lo queréis).' },
    { time: '', what: 'Día suave: es el día del jet lag y lleváis 16h25 de viaje. Barrio del hotel, primer contacto y cenar pronto.', kind: 'libre' },
    { time: '14:00', what: 'Check-in y a la habitación.' },
  ],
  '2026-10-11': [
    { time: '06:30', what: 'Desayuno (06:30-10:00).', kind: 'comida' },
    { time: '08:00', what: 'A la Ciudad Prohibida. Se entra por la Puerta del Mediodía (sur).' },
    { time: '', what: '⚠️ La plaza de Tiananmen NO es zona de paso: si no lleváis su reserva, hay que rodear por el Templo Ancestral (lado este).', kind: 'clave' },
    { time: '', what: 'Ciudad Prohibida, 3-4 h. Salida por la Puerta Divina (norte) → enlazar con la colina de Jingshan para las vistas.' },
    { time: '', what: 'Comida por la zona.', kind: 'comida' },
    { time: '17:00', what: 'Plaza de Tiananmen. Control de seguridad ~20 min, entrad por Qianmen (sur). Sin mecheros.' },
    { time: '17:45', what: 'Bajada de bandera (~17:45-17:55, la hora exacta la da el mini-programa). Dura ~30 min.', kind: 'clave' },
  ],
  '2026-10-12': [
    { time: '06:30', what: 'Desayuno (06:30-10:00). Mirad la previsión: el tobogán no opera con lluvia.', kind: 'comida' },
    { time: '07:30', what: 'Didi a Mutianyu. ~1h30 desde el centro.' },
    { time: '09:00', what: 'Entrada + bus de enlace. Combo telesilla ↑ y tobogán ↓ (140 CNY).', kind: 'clave' },
    { time: '', what: 'TELESILLA (silla abierta) hasta la Torre 6. ⚠️ El teleférico de cabina va a la Torre 14 y por ahí NO hay tobogán.', kind: 'clave' },
    { time: '', what: 'Andar de la Torre 6 a la Torre 12 (~1h por sentido, tramo casi vacío) y volver a la 6.' },
    { time: '', what: 'Bajada en TOBOGÁN desde la Torre 6. 🚫 No pueden usarlo mayores de 60 años.' },
    { time: '', what: 'Vuelta a Pekín. Noche tranquila: mañana salís a las 06:15.', kind: 'libre' },
    { time: '22:00', what: '⚠️ Maletas hechas y pedir el desayuno para llevar en recepción: 打包早餐.', kind: 'clave' },
  ],
  '2026-10-13': [
    { time: '06:15', what: '🚕 Salir del hotel. El bufé abre a las 06:30 y ya no llegáis → desayuno para llevar, pedido anoche.', kind: 'clave' },
    { time: '06:55', what: 'En Beijingxi (Beijing West). Es enorme: la hora de margen aquí se agradece.' },
    { time: '07:55', what: '🚄 Tren G351 → Xi\'anbei. 4h10. Desayunáis en el tren.', kind: 'clave' },
    { time: '12:05', what: 'Llegada a Xi\'an North. Didi al hotel (Bell Tower), 25-35 min.' },
    { time: '12:45', what: 'En el hotel. Check-in a las 14:00 → maletas en recepción y a comer al Barrio Musulmán, que está al lado.', kind: 'comida' },
    { time: '', what: 'Tarde entera en Xi\'an: es vuestro único día de ciudad. Muralla, Campanario y Barrio Musulmán de noche.', kind: 'libre' },
  ],
  '2026-10-14': [
    { time: '07:00', what: 'Desayuno (07:00-10:00).', kind: 'comida' },
    { time: '', what: 'Mañana libre en Xi\'an.', kind: 'libre' },
    { time: '13:30', what: '🏛️ Guerreros de Terracota POR LA TARDE. Por la mañana chocáis con todos los tours.', kind: 'clave' },
    { time: '', what: 'Se entra escaneando el pasaporte, que hay que llevar FÍSICO. Incluye Museo principal + Jardín Lishan.', kind: 'clave' },
  ],
  '2026-10-15': [
    { time: '07:00', what: 'Desayuno (07:00-10:00).', kind: 'comida' },
    { time: '', what: 'Día libre en Xi\'an. Sin nada reservado: pagoda del Ganso Salvaje, murallas en bici o Museo de Historia.', kind: 'libre' },
  ],
  '2026-10-16': [
    { time: '07:00', what: 'Desayuno (07:00-10:00). Tenéis una hora justa.', kind: 'comida' },
    { time: '08:00', what: '🚕 Salir del hotel hacia Xi\'anbei.' },
    { time: '08:36', what: 'En la estación.' },
    { time: '09:36', what: '🚄 Tren G2201 → ChengduDong. 3h36.', kind: 'clave' },
    { time: '13:12', what: 'Llegada a Chengdu East. Didi al hotel (Chunxi Road), 20-30 min.' },
    { time: '13:42', what: 'En el hotel — el mejor encaje del viaje: check-in a las 14:00, casi sin espera.' },
    { time: '', what: '⚠️ Pedid en recepción el desayuno para llevar de MAÑANA (Pandas) y valorad pedirlo también para el 18 y el 19: este hotel abre a las 07:30 y os fastidia tres días seguidos.', kind: 'clave' },
  ],
  '2026-10-17': [
    { time: '07:00', what: '🚕 Salir hacia la Base de Pandas. ⚠️ El desayuno abre a las 07:30 y no llegáis → para llevar.', kind: 'clave' },
    { time: '07:30', what: '🐼 Base de Pandas, franja de mañana. Reservad ese slot: los pandas están activos de 08:00 a 10:00; luego duermen.', kind: 'clave' },
    { time: '', what: 'Lanzadera interna opcional (~30 CNY). Vuelta a Chengdu a media mañana.' },
    { time: '', what: 'Tarde libre: Chunxi Road, People\'s Park y casa de té.', kind: 'libre' },
  ],
  '2026-10-18': [
    { time: '07:30', what: '🚕 Salir hacia Leshan. El desayuno abre justo ahora: o coméis a la carrera o para llevar.', kind: 'comida' },
    { time: '', what: '🗿 Buda Gigante de Leshan, día completo. Horario de invierno desde el 8 oct: abre 08:00, cierra 17:30.', kind: 'clave' },
    { time: '', what: '⭐ Coged el CRUCERO EN BARCO (~30 min, ~70 CNY/persona, se paga en el muelle en efectivo/Alipay). La bajada por los 278 escalones tiene 2-4 h de cola en fin de semana.', kind: 'clave' },
    { time: '', what: 'Vuelta a Chengdu por la tarde-noche.' },
  ],
  '2026-10-19': [
    { time: '07:30', what: 'Desayuno en cuanto abra: solo tenéis 15 min.', kind: 'comida' },
    { time: '07:45', what: '🚕 Salir hacia ChengduDong.' },
    { time: '08:18', what: 'En la estación.' },
    { time: '09:18', what: '🚄 Tren G8685 → ChongqingBei. 1h41. ⚠️ ChongqingBei (北, norte), NO ChongqingXi ni ChongqingDong.', kind: 'clave' },
    { time: '10:59', what: 'Llegada a Chongqing North, andén del North Square (北广场). Didi al hotel (Jiefangbei), 10-15 min.' },
    { time: '11:15', what: 'En el hotel. ⚠️ El check-in es a las 15:00: maletas en recepción y a aprovechar el día.' },
    { time: '', what: 'Día en Chongqing: Jiefangbei, y al anochecer Hongyadong iluminado, que es la postal de la ciudad.', kind: 'libre' },
  ],
  '2026-10-20': [
    { time: '07:00', what: 'Desayuno (07:00-09:30).', kind: 'comida' },
    { time: '', what: 'Día libre y completo en Chongqing. Ciudad de rascacielos y niebla: monorraíl de Liziba, Ciqikou y hotpot.', kind: 'libre' },
  ],
  '2026-10-21': [
    { time: '07:00', what: 'Desayuno tranquilo (07:00-09:30). ✅ Este lo salvamos al cambiar el tren.', kind: 'comida' },
    { time: '', what: 'Mañana libre en Chongqing.', kind: 'libre' },
    { time: '11:10', what: '🚕 Salir del hotel (check-out 12:00). 21 km hasta ChongqingDong, ~35 min.', kind: 'clave' },
    { time: '11:55', what: '⚠️ En ChongqingDong (东, este) — NO es ChongqingBei, por donde llegasteis el 19. Hay 21 km entre las dos.', kind: 'clave' },
    { time: '12:55', what: '🚄 Tren G2321 → FenghuangGucheng. 3h51.', kind: 'clave' },
    { time: '16:46', what: 'Llegada. Taxi/lanzadera al casco antiguo, ~10 km. ⚠️ Aquí Didi puede no operar: tarifa fija local, negociad antes.' },
    { time: '17:10', what: 'En la ciudad amurallada. Check-in directo.' },
    { time: '17:55', what: '🌅 Atardecer y luces del río Tuojiang. Es LO de Fenghuang.', kind: 'clave' },
  ],
  '2026-10-22': [
    { time: '08:00', what: 'Desayuno (08:00-10:00), el hotel que abre más tarde del viaje.', kind: 'comida' },
    { time: '', what: '☀️ DÍA ENTERO en Fenghuang: puentes, casas colgantes sobre el río, barca. Compensa que ayer llegasteis a las 17:10.', kind: 'libre' },
    { time: '16:15', what: '🚕 Salir hacia la estación (~20 min).' },
    { time: '16:35', what: 'En FenghuangGucheng.' },
    { time: '17:35', what: '🚄 Tren G5666 → Furongzhen. 34 min. Es el PRIMERO del día: esta línea no tiene servicio por la mañana en octubre.', kind: 'clave' },
    { time: '18:09', what: 'Llegada. Taxi al pueblo (~15 min).' },
    { time: '18:25', what: 'En Furong. Llegáis de noche, que es cuando la cascada está iluminada y el pueblo luce.' },
    { time: '', what: '⚠️ ENCARGAR EN RECEPCIÓN EL COCHE DE MAÑANA a las 09:30 hasta Zhangjiajie, con precio cerrado (~250-300 CNY).', kind: 'clave' },
  ],
  '2026-10-23': [
    { time: '07:00', what: 'Desayuno (07:00-09:00) y paseo por el pueblo y la cascada de día.', kind: 'comida' },
    { time: '09:30', what: '🚗 COCHE CON CHÓFER a Zhangjiajie. NO es tren: en octubre el primero sale a las 18:10 y perderíais Tianmen.', kind: 'clave' },
    { time: '11:00', what: 'Llegada a Zhangjiajie ciudad. Maletas al hotel y a comer.', kind: 'comida' },
    { time: '13:15', what: 'Al teleférico de Tianmen, que está a ~1 km del hotel, junto a la estación.' },
    { time: '14:00', what: '🚡 FRANJA DE ENTRADA A TIANMEN. La última admitida es la de las 16:00: aquí no se puede llegar tarde.', kind: 'clave' },
    { time: '', what: 'Subida: teleférico al tramo medio (28 min) + bus por las 99 curvas (25-30 min) + 7 tramos de escaleras mecánicas. ⚠️ El tramo superior del teleférico sigue cerrado por obras, pero se sube igual.', kind: 'clave' },
    { time: '', what: 'Arriba: pasarelas de cristal (fundas de zapatos 5-10 CNY), Valle de los Fantasmas, templo y los 999 escalones.' },
    { time: '17:55', what: 'Atardecer desde la montaña.' },
    { time: '18:30', what: '✨ Espectáculo de luces, hasta las 21:00. Solo con el tour nocturno: reservadlo aparte.', kind: 'clave' },
  ],
  '2026-10-24': [
    { time: '07:00', what: '⏰ Desayuno 07:00-09:00. Ojo: hoy no hay prisa y CIERRA a las 09:00 → poned despertador o lo perdéis durmiendo.', kind: 'comida' },
    { time: '10:00', what: '🚗 Didi a Wulingyuan. ~33 km, 45 min, ~14 €. Sin hora fija: es el traslado más relajado del viaje.' },
    { time: '12:00', what: 'Llegada a Wulingyuan y check-in.' },
    { time: '', what: '🥾 Tarde: estrenad la entrada de 4 días con el GOLDEN WHIP STREAM (~7,5 km llanos, 2,5 h, sin colas ni teleféricos).', kind: 'libre' },
    { time: '', what: '⚠️ Repasad la reserva de franja horaria de mañana: la entrada es de 4 días pero CADA día de acceso necesita su propia franja.', kind: 'clave' },
  ],
  '2026-10-25': [
    { time: '06:30', what: 'Desayuno en cuanto abra (06:30-10:00). Encaja justo.', kind: 'comida' },
    { time: '06:50', what: '🏔️ Al Parque Nacional (Avatar). Día completo de verdad: 8-9 h.', kind: 'clave' },
    { time: '', what: 'Reserva nominal con pasaporte FÍSICO + reconocimiento facial, por puerta y franja. Incluye los buses lanzadera internos.', kind: 'clave' },
    { time: '', what: 'Ascensor de Bailong (65 CNY) para subir y teleférico de Tianzi (72 CNY) para bajar. NO van incluidos en la entrada.' },
    { time: '', what: '🕐 Hoy España atrasa los relojes. Vosotros no notáis nada, pero desde hoy la diferencia con casa es de 7 h, no 6.' },
  ],
  '2026-10-26': [
    { time: '06:30', what: 'Desayuno (06:30-10:00), el mejor horario del viaje. Sin prisa.', kind: 'comida' },
    { time: '08:10', what: '🚕 Salir del hotel. ⚠️ PEDID CHECK-OUT ANTICIPADO: el de fábrica es a las 15:00 y con él perdéis los 4 trenes del día.', kind: 'clave' },
    { time: '08:51', what: 'En Zhangjiajiexi (Zhangjiajie West). 28 km desde el hotel, ~40 min.' },
    { time: '09:51', what: '🚄 Tren G2373 → Shangrao. 5h49. 🔴 EL TRAMO MÁS CRÍTICO: solo 4 directos al día.', kind: 'clave' },
    { time: '15:40', what: 'Llegada a Shangrao. Traslado a Wangxian Valley: ~40 km, ~1 h.' },
    { time: '16:45', what: 'En el hotel, DENTRO del recinto. La entrada al área escénica va incluida.' },
    { time: '', what: '🌙 Wangxian Valley de noche, sin turistas de día y sin pagar entrada aparte. Es exactamente por esto que elegisteis dormir dentro.', kind: 'libre' },
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
