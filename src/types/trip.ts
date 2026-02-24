export interface Trip {
  title: string;
  travelers: number;
  dateRangeText: string;
  totalNights: number;
  primaryCurrency: string;
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
}

export interface PendingItem {
  id: string;
  title: string;
  description: string;
  relatedType: string;
  relatedId: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done';
}

export interface TripVersion {
  id: string;
  label: string;
  date: string;
  snapshot: string;
}

export interface TripData {
  trip: Trip;
  cities: CityStop[];
  hotels: HotelOption[];
  selectedHotels: Record<string, string>;
  transportLegs: TransportLeg[];
  localTransports: LocalTransport[];
  activities: Activity[];
  pendingItems: PendingItem[];
  versions: TripVersion[];
}
