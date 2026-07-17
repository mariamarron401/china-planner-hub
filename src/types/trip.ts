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
  activities: Activity[];
  versions: TripVersion[];
  flights: FlightLeg[];
  cityGallery: CityGalleryImage[];
  hotelGallery: HotelGalleryImage[];
  budgetExtras: BudgetExtras;
}
