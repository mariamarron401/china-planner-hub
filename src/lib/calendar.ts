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

const FIRST_DAY = { day: 8, month: 10 }; // 8 oct 2026: tren nocturno Zaragoza → Madrid
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
    'Tren Zaragoza-Delicias 21:59 → Madrid 23:48 y taxi al T2 (33 €). La noche se pasa en la terminal, abierta 24 h.',
  ],
  '2026-10-09': ['Día entero de viaje. No dormís en cama: la noche la pasáis en el avión.'],
  '2026-10-25': [
    'En España se atrasan los relojes (horario de invierno). Vosotros no notáis nada, pero a partir de hoy la diferencia con casa es de 7 h en vez de 6 h.',
  ],
  '2026-11-01': [
    'Vuelta a casa: 18 h 15 min de viaje real, aunque el reloj solo marque 11 h 15 min. Al aterrizar, bus ALSA de las 23:45 desde el T4 a Zaragoza (comprado).',
  ],
  '2026-11-02': [
    'Llegáis a Zaragoza-Delicias a las 03:15. ✅ Es festivo en Aragón, así que tenéis el día para dormir.',
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
    { time: '21:59', what: '🚄 Tren Zaragoza-Delicias → Madrid (llega 23:48). Estad en Delicias a las 21:30: es el último del día.', kind: 'clave' },
    { time: '23:48', what: 'Taxi al T2 (tarifa fija 33 €). Noche en la terminal: el mostrador de Brussels Airlines abre a las 04:20.' },
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
    { time: '', what: 'Mañana: Templo del Cielo y mercado de Hongqiao, pegado a la salida este.' },
    { time: '14:00', what: 'Check-in y 1½-2 h de descanso de verdad.' },
    { time: '17:00', what: '📲 RESERVAR EL MUSEO DE SHAANXI (para el jueves 15): las franjas salen a las 17:00 de Pekín = 11:00 en España. Se agotan.', kind: 'clave' },
    { time: '', what: 'Noche: Sanlitun y pato pekinés en Siji Minfu.', kind: 'comida' },
  ],
  '2026-10-11': [
    { time: '06:30', what: 'Desayuno (06:30-10:00).', kind: 'comida' },
    { time: '07:00', what: '📲 RESERVAR EL CRUCERO DE LESHAN (para el 18): miniprograma 大佛旅游 → 门票预约 → 游船. Abre a las 07:00 de Pekín.', kind: 'clave' },
    { time: '07:30', what: '🚕 Didi a Donghuamen (东华门) y andando por el foso hasta la Puerta del Mediodía. Sin pasar por la plaza.' },
    { time: '08:30', what: '🏯 Ciudad Prohibida ✅ comprada. Eje central → palacios interiores → Galería de los Tesoros (pagada) → salida norte y Jingshan.', kind: 'clave' },
    { time: '', what: 'Comida por la zona.', kind: 'comida' },
    { time: '16:15', what: 'Plaza de Tiananmen ✅ reservada (降旗及夜间). Control por Qianmen (sur), ~20 min. Sin mecheros. Enseñad la confirmación.', kind: 'clave' },
    { time: '17:41', what: 'Bajada de bandera (~17:41; reconfirmadla 24-48 h antes). Dura ~30 min.', kind: 'clave' },
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
    { time: '', what: 'Tarde en Xi\'an: muralla, Campanario y Barrio Musulmán de noche.', kind: 'libre' },
  ],
  '2026-10-14': [
    { time: '07:00', what: 'Desayuno (07:00-10:00).', kind: 'comida' },
    { time: '', what: 'Mañana libre en Xi\'an.', kind: 'libre' },
    { time: '13:30', what: '🏛️ Guerreros de Terracota POR LA TARDE. Por la mañana chocáis con todos los tours.', kind: 'clave' },
    { time: '', what: '✅ Comprada. Se entra escaneando el pasaporte FÍSICO. Incluye el Jardín Lishan (carrito 15 CNY/persona, dentro).', kind: 'clave' },
  ],
  '2026-10-15': [
    { time: '07:00', what: 'Desayuno (07:00-10:00).', kind: 'comida' },
    { time: '', what: '🏛️ Museo de Historia de Shaanxi, en la franja que reservasteis el 10 (gratis, nominal: pasaporte).', kind: 'clave' },
    { time: '', what: 'Gran Pagoda del Ganso Salvaje, en la misma zona sur.' },
    { time: '19:00', what: '✨ Grand Tang Ever-Bright City de noche (gratis). Vuelta en Didi, pidiéndolo desde una calle lateral.', kind: 'libre' },
  ],
  '2026-10-16': [
    { time: '07:00', what: 'Desayuno (07:00-10:00). Tenéis 1h10.', kind: 'comida' },
    { time: '08:10', what: '🚕 Salir del hotel hacia Xi\'anbei.' },
    { time: '08:48', what: 'En la estación.' },
    { time: '09:48', what: '🚄 Tren D1921 → ChengduDong. 3h44.', kind: 'clave' },
    { time: '13:32', what: 'Llegada a Chengdu East. Didi al hotel (Chunxi Road), 20-30 min.' },
    { time: '14:00', what: 'En el hotel justo a la hora del check-in: entráis directos, sin dejar maletas ni esperar.' },
    { time: '', what: '⚠️ Pedid en recepción el desayuno para llevar de MAÑANA (Pandas) y valorad pedirlo también para el 18 y el 19: este hotel abre a las 07:30 y os fastidia tres días seguidos.', kind: 'clave' },
  ],
  '2026-10-17': [
    { time: '06:50', what: '🚕 Salir hacia la Base de Pandas. ⚠️ El desayuno abre a las 07:30 y no llegáis → para llevar.', kind: 'clave' },
    { time: '07:30', what: '🐼 Base de Pandas ✅ comprada, franja de mañana. Los pandas están activos de 08:00 a 10:00; luego duermen.', kind: 'clave' },
    { time: '', what: 'Lanzadera interna opcional (~30 CNY). Vuelta a Chengdu a media mañana.' },
    { time: '', what: 'Tarde libre: Chunxi Road, People\'s Park y casa de té.', kind: 'libre' },
  ],
  '2026-10-18': [
    { time: '07:30', what: 'Desayuno rápido: abre a las 07:30.', kind: 'comida' },
    { time: '07:45', what: '🚕 Didi a la estación de Chengdu (East o South, la del billete), 1 h y media antes del tren.', kind: 'clave' },
    { time: '09:00', what: '🚄 Tren a Leshan, saliendo entre 09:00 y 09:30. 🔴 Hay que comprarlo: la venta está abierta desde el 3 de octubre.', kind: 'clave' },
    { time: '10:45', what: '🗿 Recinto del Buda ✅ comprado: entrada de 10:30 a 14:30. Cabeza del Buda y templo Lingyun.', kind: 'clave' },
    { time: '13:30', what: 'Comer cerca del muelle 嘉州渡码头: 跷脚牛肉.', kind: 'comida' },
    { time: '', what: '🚢 Barco en la franja reservada el día 11 (primera a partir de las 14:00), desde 嘉州渡码头. ~30 min.', kind: 'clave' },
    { time: '17:30', what: '🚄 Vuelta saliendo de Leshan entre 17:30 y 18:30. Mirad a qué estación de Chengdu llega.', kind: 'clave' },
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
    { time: '07:00', what: 'Desayuno tranquilo (07:00-09:30): hoy no salís hasta las 11:10.', kind: 'comida' },
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
    { time: '14:00', what: 'Check-out: maletas en recepción hasta la tarde.' },
    { time: '16:00', what: '🚕 Salir hacia la estación (~20 min).' },
    { time: '16:25', what: 'En FenghuangGucheng.' },
    { time: '17:35', what: '🚄 Tren G5666 → Furongzhen. 34 min. Es el PRIMERO del día: esta línea no tiene servicio por la mañana en octubre.', kind: 'clave' },
    { time: '18:09', what: 'Llegada. Taxi al pueblo (~15 min).' },
    { time: '18:20', what: '🎟️ Entrada al recinto de Furong (~108 CNY/persona, 3 días): el hotel está dentro. Si os recoge el hotel, preguntadles si la traen ellos.', kind: 'clave' },
    { time: '18:30', what: 'En Furong. Llegáis de noche, que es cuando la cascada está iluminada y el pueblo luce.' },
    { time: '', what: '⚠️ ENCARGAR EN RECEPCIÓN EL COCHE DE MAÑANA a las 09:30 hasta Zhangjiajie, con precio cerrado (~250-300 CNY).', kind: 'clave' },
  ],
  '2026-10-23': [
    { time: '07:00', what: 'Desayuno (07:00-09:00) y paseo por el pueblo y la cascada de día.', kind: 'comida' },
    { time: '09:30', what: '🚗 COCHE CON CHÓFER a Zhangjiajie. NO es tren: en octubre el primero sale a las 18:10 y perderíais Tianmen.', kind: 'clave' },
    { time: '11:00', what: 'Llegada al Thousand Hotel. Maletas (check-in a las 12:00).' },
    { time: '11:30', what: 'Comida cerca del hotel: Gongpopo (龚婆婆土厨), Sanxiaguo 土家三下锅.', kind: 'comida' },
    { time: '12:40', what: '🚕 Didi al 山门 (天门山山门), ~20 min. NO al teleférico de la ciudad: desde el 13 de octubre no funciona.', kind: 'clave' },
    { time: '13:00', what: '🚡 TIANMEN, LÍNEA C ✅ comprada. Entrada entre las 13:00 y las 14:00, pasaporte en el control del 山门. La franja es estricta.', kind: 'clave' },
    { time: '', what: 'Subida: teleférico exprés hasta la explanada de la cueva → escalera mecánica de pago (32 CNY) o 999 escalones → escaleras mecánicas por dentro de la montaña hasta la cima.' },
    { time: '', what: 'Arriba: Guigu Zhandao, pasarela de cristal del oeste y Panlong (fundas 5 CNY). La del este sigue cerrada.' },
    { time: '17:30', what: 'Escaleras mecánicas de bajada hacia la cueva.' },
    { time: '17:45', what: '🌙 Explanada al pie de los 999 escalones: atardecer (~18:00) y, si os dejan quedaros, las primeras luces de la cueva. Sin tour: no hace falta.', kind: 'clave' },
    { time: '', what: 'Preguntad al entrar: 今天天门洞几点亮灯？快线索道最晚几点下山？ (hora de las luces y del último teleférico).' },
    { time: '19:00', what: 'Teleférico exprés de bajada al 山门 y Didi (o lanzadera gratis) al hotel.' },
    { time: '19:45', what: 'Cena cerca del hotel. En recepción: dejad avisado el check-out, que mañana salís a las 09:00.', kind: 'comida' },
  ],
  '2026-10-24': [
    { time: '08:00', what: '⏰ Desayuno. CIERRA a las 09:00 y hoy sí hay prisa: poned despertador.', kind: 'comida' },
    { time: '09:00', what: '🚗 Didi a Wulingyuan. ~33 km, 45 min, ~14 €. Salid a esta hora: el puente de cristal cierra a media tarde.', kind: 'clave' },
    { time: '09:45', what: 'En el hotel de Wulingyuan. El check-in abre a las 10:00: dejad las maletas y no deshagáis nada.' },
    { time: '10:05', what: '🚕 Didi a 张家界大峡谷游客中心 (la entrada de arriba). ~30 km, 35-45 min, ~55-70 CNY.' },
    { time: '11:00', what: '🌉 GRAN CAÑÓN + PUENTE DE CRISTAL, LÍNEA B ✅ comprada. Entrada por arriba: 张家界大峡谷游客中心. Franja única de todo el día; último control a las 16:00.', kind: 'clave' },
    { time: '', what: 'Pasaportes físicos: puede que toque validarlos en la taquilla del centro de visitantes (10-15 min).' },
    { time: '', what: 'Ruta de ~3 h: puente de cristal, bajada al cañón (sendero empinado o ascensores de pago), paseo y barca hasta la salida.' },
    { time: '', what: '🚫 Sin palo selfie, trípode ni objetos metálicos. Consigna gratis. Fundas de zapatos para el puente, gratis.' },
    { time: '', what: '🍎 Llevad agua y picoteo: dentro no se para a comer.' },
    { time: '14:30', what: '🚕 Salida por ABAJO, en 双坪: Didi de vuelta desde 张家界大峡谷游客集散中心.', kind: 'clave' },
    { time: '15:30', what: 'Comida tardía en Wulingyuan, check-in, ducha y descanso.', kind: 'comida' },
    { time: '', what: '✨ Noche: UNA sola cosa. Cena tranquila + drones si los hay (WeChat: 武陵源发布) o Charming Xiangxi.', kind: 'libre' },
  ],
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
    { time: '20:00', what: '📋 RECEPCIÓN: Didi programado a las 05:35, check-out anticipado y desayuno para llevar (可以帮我们准备打包早餐吗？).', kind: 'clave' },
    { time: '', what: '🕐 Hoy España atrasa los relojes. Vosotros no notáis nada, pero desde hoy la diferencia con casa es de 7 h, no 6.' },
  ],
  '2026-10-26': [
    { time: '05:15', what: 'Despertador. Maletas hechas desde anoche.', kind: 'clave' },
    { time: '05:35', what: '🚕 Salir del hotel (Didi programado). El bufé abre a las 06:30 y no llegáis → desayuno para llevar, pedido anoche.', kind: 'clave' },
    { time: '06:15', what: 'En Zhangjiajiexi. 28 km desde el hotel, ~40 min. A esa hora la estación está vacía.' },
    { time: '07:28', what: '🚄 Tren G1367 → Shangrao. 6h11. Desayunáis en el tren y dormís lo que podáis.', kind: 'clave' },
    { time: '13:39', what: 'Llegada a Shangrao. Traslado a Wangxian Valley: ~40 km, ~1 h.' },
    { time: '14:40', what: 'En el hotel, DENTRO del recinto (entrada incluida). Maletas en recepción: el check-in es a las 17:00, con fianza de 300 CNY. Hacedlo al volver del paseo.' },
    { time: '', what: '🌄 Tarde entera en el valle: llegáis a las 14:40 y no hay nada más en la agenda.', kind: 'libre' },
    { time: '', what: '🌙 Y de noche, sin turistas de día y sin pagar entrada aparte. Es por esto que elegisteis dormir dentro.', kind: 'libre' },
  ],
  '2026-10-27': [
    { time: '07:30', what: '⏰ Desayuno 07:30-09:30. CIERRA a las 09:30 y no salís hasta las 11:30 → despertador.', kind: 'comida' },
    { time: '', what: 'Mañana por el valle, aprovechando que estáis dentro.', kind: 'libre' },
    { time: '11:30', what: '🚕 Salir hacia Shangrao. Es el traslado más largo a una estación del viaje: ~40 km y ~1 h.', kind: 'clave' },
    { time: '12:30', what: 'En la estación de Shangrao.' },
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
    { time: '23:45', what: '🚌 Bus ALSA del T4 a Zaragoza ✅ comprado. Bus Tránsito del T1 al T4 (15-20 min).', kind: 'clave' },
  ],
  '2026-11-02': [
    { time: '03:15', what: '🏠 Llegada a Zaragoza-Delicias. Es festivo en Aragón: a dormir.', kind: 'libre' },
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
