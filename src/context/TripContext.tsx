import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TripData, HotelOption, TransportLeg, LocalTransport, Activity, BudgetExtras } from '@/types/trip';
import { initialTripData } from '@/data/initialData';

interface TripContextType {
  data: TripData;
  orderedCities: TripData['cities'];
  orderedTransportLegs: TripData['transportLegs'];
  selectHotel: (cityId: string, hotelId: string) => void;
  deselectHotel: (cityId: string) => void;
  updateHotelPrice: (hotelId: string, price: number) => void;
  updateTransportLeg: (id: string, updates: Partial<TransportLeg>) => void;
  updateLocalTransport: (id: string, updates: Partial<LocalTransport>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  toggleRouteDirection: () => void;
  resetData: () => void;
  updateBudgetExtras: (extras: Partial<BudgetExtras>) => void;
}

const TripContext = createContext<TripContextType | null>(null);

const STORAGE_KEY = 'china-trip-data';

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TripData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.flights) parsed.flights = initialTripData.flights;
        if (!parsed.cityGallery) parsed.cityGallery = initialTripData.cityGallery;
        if (!parsed.hotelGallery) parsed.hotelGallery = initialTripData.hotelGallery;
        if (!parsed.trip.routeDirection) parsed.trip.routeDirection = 'forward';
        if (!parsed.budgetExtras) parsed.budgetExtras = initialTripData.budgetExtras;
        // Remove legacy fields that moved to Supabase
        delete parsed.places;
        delete parsed.pendingItems;
        return parsed;
      }
      return initialTripData;
    } catch {
      return initialTripData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const orderedCities = useMemo(() => {
    const sorted = [...data.cities].sort((a, b) => a.order - b.order);
    return data.trip.routeDirection === 'reverse' ? [...sorted].reverse() : sorted;
  }, [data.cities, data.trip.routeDirection]);

  const orderedTransportLegs = useMemo(() => {
    if (data.trip.routeDirection === 'forward') return data.transportLegs;
    return data.transportLegs.map(t => ({
      ...t,
      fromCityId: t.toCityId,
      toCityId: t.fromCityId,
    }));
  }, [data.transportLegs, data.trip.routeDirection]);

  const selectHotel = useCallback((cityId: string, hotelId: string) => {
    setData(prev => ({ ...prev, selectedHotels: { ...prev.selectedHotels, [cityId]: hotelId } }));
  }, []);

  const deselectHotel = useCallback((cityId: string) => {
    setData(prev => {
      const next = { ...prev.selectedHotels };
      delete next[cityId];
      return { ...prev, selectedHotels: next };
    });
  }, []);

  const updateHotelPrice = useCallback((hotelId: string, price: number) => {
    setData(prev => ({
      ...prev,
      hotels: prev.hotels.map(h => h.id === hotelId ? { ...h, totalPrice: price, priceStatus: 'known' as const } : h),
    }));
  }, []);

  const updateTransportLeg = useCallback((id: string, updates: Partial<TransportLeg>) => {
    setData(prev => ({
      ...prev,
      transportLegs: prev.transportLegs.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const updateLocalTransport = useCallback((id: string, updates: Partial<LocalTransport>) => {
    setData(prev => ({
      ...prev,
      localTransports: prev.localTransports.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, []);

  const toggleRouteDirection = useCallback(() => {
    setData(prev => ({
      ...prev,
      trip: {
        ...prev.trip,
        routeDirection: prev.trip.routeDirection === 'forward' ? 'reverse' : 'forward',
      },
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialTripData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateBudgetExtras = useCallback((extras: Partial<BudgetExtras>) => {
    setData(prev => ({
      ...prev,
      budgetExtras: { ...prev.budgetExtras, ...extras },
    }));
  }, []);

  return (
    <TripContext.Provider value={{
      data, orderedCities, orderedTransportLegs,
      selectHotel, deselectHotel, updateHotelPrice,
      updateTransportLeg, updateLocalTransport, updateActivity,
      toggleRouteDirection, resetData, updateBudgetExtras,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
