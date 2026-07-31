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
  alertNote?: string;
  travelDate?: string;
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
  /** Plataforma recomendada para comprar, ej. "Trip.com" */
  platform?: string;
  /** Precio en texto legible, ej. "~25 €/persona" */
  priceText?: string;
  /** URL para comprar la entrada */
  bookingUrl?: string;
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

export interface VideoTip {
  id: string;
  url: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
  title: string;
  tips: string[];
  cityId?: string;
  transcript?: string;
  caption?: string;
  status: 'pending_review' | 'reviewed';
  createdAt: string;
  updatedAt: string;
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
}
