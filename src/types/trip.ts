export interface Trip {
  title: string;
  travelers: number;
  dateRangeText: string;
  totalNights: number;
  primaryCurrency: string;
  routeDirection: 'forward' | 'reverse';
}

export interface BudgetExtras {
  flightsInsurance: number;
  transportExtra: number;
  activitiesExtra: number;
  insurance: number;
  others: number;
}

export interface FlightLeg {
  id: string;
  direction: 'outbound' | 'return';
  airline: string;
  flightNumber: string;
  fromAirport: string;
  toAirport: string;
  departureDateTime: string;
  arrivalDateTime: string;
  durationMinutes: number;
  layoverMinutes: number | null;
  cabinClass: string;
  baggage: string;
}

export interface CityGalleryImage {
  id: string;
  cityId: string;
  imageUrl: string;
  source: string;
}

export interface HotelGalleryImage {
  id: string;
  hotelOptionId: string;
  imageUrl: string;
}

export interface CityStop {
  id: string;
  cityName: string;
  startDateText: string;
  endDateText: string;
  nights: number;
  notes: string[];
  flags: string[];
  order: number;
}

export interface HotelOption {
  id: string;
  cityId: string;
  provider: string;
  totalPrice: number | null;
  currency: string;
  link: string;
  breakfastIncluded: boolean;
  priceStatus: 'known' | 'pending';
  name?: string;
  /** Nombre del hotel en caracteres chinos, tal como lo registra Ctrip. Es lo que hay
   *  que pegar en Amap (高德地图) para que lo encuentre: el nombre occidental a menudo no existe allí.
   *  Verificado hotel por hotel en Ctrip el 07/08/2026. */
  nameZh?: string;
  /** Dirección completa en chino, para pegar en Amap o enseñar a un taxista si el nombre falla. */
  addressZh?: string;
  checkInText?: string;
  checkOutText?: string;
  checkInTime?: string;
  checkOutTime?: string;
  paymentNote?: string;
  booked?: boolean;
  imageUrl?: string;
  /** Depósito/fianza que el hotel pide al hacer el check-in, en yuanes (CNY). Reembolsable al salir. */
  depositCny?: number;
  /** Equivalente en euros del depósito, al cambio anotado en la reserva */
  depositEur?: number;
  /** Detalle de la política de depósito, ej. "Se paga al completar el registro de entrada" */
  depositNote?: string;
  /**
   * Horario en que el hotel sirve el desayuno, ej. "07:00-09:30".
   * Verificado en Trip.com el 03/08/2026 y **re-verificado hotel por hotel el 17/08/2026**
   * entrando en las 10 fichas ("Opening hours" de la sección de comidas): los 10 coincidían,
   * ninguno había cambiado. No hace falta volver a comprobarlos salvo cambio de reserva.
   */
  breakfastHours?: string;
  /** Tipo de desayuno, ej. "Bufé · occidental y chino" */
  breakfastType?: string;
  /** Aviso cuando algún día de la estancia hay que salir antes de que abra el desayuno. */
  breakfastAlert?: string;
}

/**
 * Un día en que hay que salir del hotel a una hora que choca (o casi) con el
 * horario de desayuno. Existe porque el desayuno ya está pagado en los 10
 * hoteles: si no se puede tomar, hay que pedirlo para llevar la noche antes.
 */
export interface EarlyStart {
  id: string;
  /** Ej. "1 nov 2026 (domingo)" */
  dateText: string;
  cityId: string;
  hotelName: string;
  /** Por qué hay que salir temprano, ej. "Vuelo CA1590 a Pekín (sale 08:55 de Hongqiao)" */
  reason: string;
  /** Hora a la que hay que salir del hotel, ej. "06:00-06:15" */
  leaveHotelAt: string;
  /** Horario de desayuno del hotel, ej. "07:30-13:30" */
  breakfastHours: string;
  /**
   * 'imposible' = se sale antes de que abra → desayuno para llevar obligatorio.
   * 'muy-justo' = quedan menos de 30 min → mejor pedirlo para llevar.
   * 'ok' = entra de sobra, no hay que hacer nada.
   */
  verdict: 'imposible' | 'muy-justo' | 'ok';
  /** Minutos de desayuno realmente disponibles (negativo si se sale antes de que abra). */
  marginMinutes: number;
  /** Qué hacer exactamente. */
  advice: string;
}

export interface TransportLeg {
  id: string;
  fromCityId: string;
  toCityId: string;
  mode: string;
  durationMinutes: number | null;
  price: number | null;
  currency: string;
  status: 'known' | 'pending';
  notes: string;
  fromStation?: string;
  toStation?: string;
  preBookingFrom?: string;
  saleOpensOn?: string;
  /**
   * Fecha ISO en que se puede activar la pre-reserva de Trip.com. Sirve para la cuenta atrás en vivo.
   * La ventana de Trip es de 58 días contados sobre la fecha de PEKÍN, y el calendario avanza un día
   * a las 00:00 de Pekín = las 18:00 en España. Por eso esta fecha es la TARDE ANTERIOR al día D-58:
   * a partir de las 18:00 h ya se puede dejar puesta la pre-reserva.
   */
  preBookingIso?: string;
  /** Fecha ISO en que 12306 abre la venta real (D-15). Día de verificar que el billete se emitió. */
  saleOpensIso?: string;
  /**
   * Importe REAL pagado por los dos billetes de este tramo, en euros. Se rellena solo cuando
   * la compra está hecha. Manda sobre `price` (que es la estimación calculada desde el precio
   * en yuanes) tanto en el total del presupuesto como en la pantalla Dinero, para que la cifra
   * se vaya volviendo real a medida que se compran los tramos.
   */
  paidEur?: number;
  /** Fecha legible en que se compró/pre-reservó este tramo, ej. '15 ago 2026'. */
  paidOn?: string;
  /**
   * Veredicto del desayuno del hotel de origen ese día. Los 10 hoteles lo tienen incluido y
   * PAGADO, así que perderlo es tirar dinero — es una preocupación explícita de María
   * (17/08/2026). Cruza el horario real de desayuno de cada hotel (verificados en Trip.com el
   * 03/08/2026, ver `.agent/knowledge/04-hoteles.md`) con la hora de salida de este tramo.
   * Vive aquí, y no solo en la pantalla Hoteles, porque la decisión de qué tren coger se toma
   * en Trenes.
   */
  breakfastNote?: string;
  /**
   * Hora (HH:MM, hora española) a la que conviene mirar el día de la venta real. No es la misma para
   * todos: 12306 libera los billetes a la hora fija de la estación DE SALIDA, entre las 8:00 y las
   * 18:00 de Pekín. En los tramos críticos se pone justo antes de la apertura; en el resto, a una
   * hora civilizada ya pasada la apertura. Si no se indica, el aviso se genera a las 09:00.
   */
  saleCheckTime?: string;
  alertNote?: string;
  travelDate?: string;
  /** Fecha del viaje en ISO. Necesaria para generar los avisos de calendario. */
  travelDateIso?: string;
  /** Número del tren recomendado, ej. 'G365'. Vacío en el tramo que no es tren. */
  trainNumber?: string;
  /** Hora de salida del tren recomendado en HH:MM, hora local de China. */
  departTime?: string;
  /** Hora de llegada del tren recomendado en HH:MM, hora local de China. */
  arriveTime?: string;
  /** Hora a la que hay que salir del hotel, en HH:MM. Sale del análisis de cada tramo. */
  leaveHotelTime?: string;
  suggestedDeparture?: string;
  estimatedArrival?: string;
  transferBefore?: string;
  transferAfter?: string;
  transferBeforeEur?: number;
  transferAfterEur?: number;
  stationBuffer?: string;
  /** Aviso cuando la hora real de salida del hotel NO es la del check-out de la reserva. */
  hotelDepartureNote?: string;
}

export interface LocalTransport {
  id: string;
  cityId: string;
  fromText: string;
  toText: string;
  mode: string;
  durationMinutes: number | null;
  price: number | null;
  currency: string;
  notes: string;
  date?: string;
  suggestedTime?: string;
}

/** Un momento del viaje con la hora que marca el reloj en cada país a la vez. */
export interface TimelineMilestone {
  label: string;
  /** Ej. "vie 9 oct · 06:20" */
  spainTime: string;
  chinaTime: string;
  /** true en el punto donde cambia el día del calendario, para resaltarlo. */
  dayChange?: boolean;
}

/**
 * Explicación del cambio de hora de un vuelo largo: lo que marca el reloj vs.
 * las horas que se pasan viajando de verdad. Existe porque el salto de día del
 * calendario despista mucho más que la propia duración del vuelo.
 */
export interface FlightTimeline {
  id: string;
  direction: 'outbound' | 'return';
  title: string;
  /** Horas reales de viaje, vuelos + escala. Ej. "16 h 25 min" */
  realDuration: string;
  /** Lo que parece si solo se miran las horas de salida y llegada. */
  clockDuration: string;
  /** Ej. "+6 h" (se adelanta) o "−7 h" (se atrasa). */
  clockJump: string;
  spainOffset: string;
  chinaOffset: string;
  /** Frase que resume en lenguaje llano qué pasa con el calendario. */
  summary: string;
  milestones: TimelineMilestone[];
  advice: string[];
}

/** Una forma concreta de cubrir un traslado de aeropuerto (taxi, metro, bus...). */
export interface AirportTransferOption {
  mode: string;
  durationMinutes: number;
  /** Precio legible con moneda local si aplica, ej. "¥120-160 (~15-21 €)" */
  priceText: string;
  /** Coste estimado en euros para los dos, para el presupuesto. null si no aplica. */
  priceEur: number | null;
  /** La opción que recomendamos por defecto (una sola por traslado). */
  recommended?: boolean;
  notes: string;
}

/**
 * Traslado entre aeropuerto y hotel, en los dos sentidos. Se separa de `LocalTransport`
 * porque lo que manda aquí es una **hora límite** (facturación de un vuelo concreto) y no
 * un simple trayecto, y porque incluye Madrid, que no es una parada de `cities`.
 */
export interface AirportTransfer {
  id: string;
  direction: 'to_airport' | 'from_airport';
  /** Fecha legible, ej. "9 oct 2026 (viernes)" */
  date: string;
  /**
   * Día al que se ancla en el calendario, en ISO. Obligatorio porque los traslados
   * nocturnos cruzan dos días ("noche del dom 1 al lun 2 nov") y leer la fecha del
   * texto los colocaría en el día equivocado: se ancla al día en que hay que ACTUAR.
   */
  calendarIso: string;
  /** Vuelo al que sirve, ej. "SN3732 · Madrid → Bruselas · 06:20" */
  flightRef: string;
  fromText: string;
  toText: string;
  terminal?: string;
  /** Hora a la que hay que salir. Es el dato principal de la tarjeta. */
  leaveAt: string;
  /** Por qué esa hora (cuenta atrás desde la facturación o desde la llegada). */
  leaveAtNote: string;
  /** Solo en `to_airport`: hora a la que hay que estar ya en el aeropuerto. */
  beAtAirportBy?: string;
  options: AirportTransferOption[];
  /** Avisos en rojo: riesgos reales de perder el vuelo o quedarse tirados. */
  warnings: string[];
  /** Relación con el check-in/check-out del hotel de ese día. */
  hotelNote?: string;
  /** Dirección en caracteres chinos para enseñar al taxista. */
  addressForDriver?: string;
}

export interface Activity {
  id: string;
  cityId: string;
  title: string;
  type: string;
  duration: string | null;
  price: number | null;
  currency: string;
  status: 'Planificada' | 'Por reservar' | 'Hecha';
  notes: string;
  /** Día recomendado para hacer la actividad según el planning, ej. "Domingo 11 oct" */
  recommendedDate?: string;
  /** Cuándo hay que comprar la entrada, ej. "~1-2 oct (ventana ~10 días)" */
  whenToBuy?: string;
  /**
   * Fecha ISO en que se ABRE la venta de esta entrada. Con los 7 trenes ya comprados
   * (28/08/2026), las entradas pasan a ser la única gestión viva del viaje, así que la
   * pantalla Actividades necesita cuenta atrás y orden de urgencia, como tenía Trenes.
   */
  buyOpensIso?: string;
  /** Hora española a la que se libera, si es crítica. Ej. '14:00' en la Ciudad Prohibida. */
  buyOpensTime?: string;
  /** Plataforma recomendada para comprar, ej. "Trip.com" */
  platform?: string;
  /** Precio en texto legible, ej. "~25 €/persona" */
  priceText?: string;
  /** URL para comprar la entrada */
  bookingUrl?: string;
  /** Guía práctica sobre el terreno (consejos de guías locales). Informativa y de solo lectura. */
  fieldGuide?: FieldGuide;
}

/**
 * Guía práctica de una atracción: consejos concretos para el día de la visita.
 * Es contenido informativo de solo lectura (vive en `initialData.ts`, no se edita en la app).
 */
export interface FieldGuide {
  /** De dónde viene la información, ej. "Guía Explora China 013" */
  source: string;
  /** La idea que no hay que olvidar, en una frase */
  headline: string;
  sections: FieldGuideSection[];
}

export interface FieldGuideSection {
  /** Emoji que abre la sección, ej. "🚫" */
  icon: string;
  title: string;
  items: string[];
}

export interface PendingItem {
  id: string;
  title: string;
  description: string;
  relatedType: string;
  relatedId: string;
  relatedCityId?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done';
  deadline?: string;
}

export interface TripVersion {
  id: string;
  label: string;
  date: string;
  snapshot: string;
}

export type PlaceCategory =
  | 'cafes'
  | 'restaurants'
  | 'shops'
  | 'excursions'
  | 'photo_spots'
  | 'temples'
  | 'pandas'
  | 'bakeries'
  | 'curiosities'
  | 'places_to_visit';

export interface PlaceItem {
  id: string;
  cityId: string;
  category: PlaceCategory;
  name: string;
  altName?: string;
  address?: string;
  url?: string;
  notes?: string;
  tags: string[];
  status: 'saved' | 'must' | 'visited';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Temática de un tip individual de vídeo, para poder agruparlos por ciudad + tema en la app. */
export type TipCategory = 'restaurante' | 'cafeteria' | 'sitios_a_visitar' | 'requisitos_ciudad' | 'clip' | 'otro';

export interface VideoTipEntry {
  text: string;
  category: TipCategory;
}

export interface VideoTip {
  id: string;
  url: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
  title: string;
  tips: VideoTipEntry[];
  cityId?: string;
  transcript?: string;
  caption?: string;
  status: 'pending_review' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}

/** Bloque de la pantalla "Apps" en el que se agrupa cada gestión. */
export type AppTaskGroup = 'hoy' | 'trenes' | 'terreno' | 'esim' | 'descartada';

/**
 * Una app o gestión de conectividad que hay que dejar lista antes de volar.
 * El contenido informativo vive en initialData.ts; solo los campos `done*` son
 * editables y se comparten entre los dos móviles vía Supabase.
 */
export interface AppTask {
  id: string;
  /** Nombre visible, ej. "WeChat" */
  name: string;
  emoji: string;
  group: AppTaskGroup;
  /** Para qué sirve, en una línea */
  purpose: string;
  /** Cuándo toca hacerlo, en texto: "HOY", "Antes del 14 ago"... */
  whenLabel: string;
  /** Fecha límite real (YYYY-MM-DD) para la cuenta atrás en vivo */
  deadline?: string;
  /** true si hace falta una cuenta/configuración por persona (José Miguel y María) */
  perPerson: boolean;
  /** Pasos accionables, en orden */
  steps: string[];
  /** Aviso destacado */
  warning?: string;
  /** Por qué esa fecha y no otra */
  why?: string;
  /** Enlace de descarga o de información */
  url?: string;
  /** Estado marcable de las tareas de una sola casilla */
  done?: boolean;
  /** Estado marcable de José Miguel (solo en tareas perPerson) */
  doneJm?: boolean;
  /** Estado marcable de María (solo en tareas perPerson) */
  doneMaria?: boolean;
}

/** Plan de e-SIM. Decisión ya tomada: se contrata de cara al viaje, no ahora. */
export interface EsimPlan {
  provider: string;
  planLabel: string;
  priceEachEur: number;
  units: number;
  buyWindow: string;
  /** Fecha objetivo de compra (YYYY-MM-DD) para la cuenta atrás */
  buyDeadline: string;
  activateWhen: string;
  facts: string[];
  /** Configuración de las dos líneas, igual en el iPhone 14 y en el 17 Pro */
  lineSetup: { line: string; setting: string; value: string; tone: 'ok' | 'warn' }[];
  phonesNote: string;
}

export interface AppSetup {
  tasks: AppTask[];
  esim: EsimPlan;
  goldenRules: string[];
}

export interface TripData {
  trip: Trip;
  cities: CityStop[];
  hotels: HotelOption[];
  selectedHotels: Record<string, string>;
  transportLegs: TransportLeg[];
  localTransports: LocalTransport[];
  airportTransfers: AirportTransfer[];
  flightTimelines: FlightTimeline[];
  activities: Activity[];
  versions: TripVersion[];
  flights: FlightLeg[];
  cityGallery: CityGalleryImage[];
  hotelGallery: HotelGalleryImage[];
  budgetExtras: BudgetExtras;
  /** Días de salida temprana cruzados con el horario de desayuno de cada hotel. */
  earlyStarts: EarlyStart[];
  /** Apps a configurar desde España + plan de e-SIM y configuración de los dos iPhone. */
  appSetup: AppSetup;
  /**
   * Sello de la última re-verificación de precios y duraciones de los tramos de tren.
   * Solo se escribe en localStorage; sirve para que una corrección de cifras llegue a
   * quien ya tenía la app abierta (ver `FARES_VERIFIED_ON` en `TripContext.tsx`).
   */
  faresVerifiedOn?: string;
}
