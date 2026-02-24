import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TripData, HotelOption, TransportLeg, LocalTransport, Activity, PendingItem } from '@/types/trip';
import { initialTripData } from '@/data/initialData';

interface TripContextType {
  data: TripData;
  selectHotel: (cityId: string, hotelId: string) => void;
  deselectHotel: (cityId: string) => void;
  updateHotelPrice: (hotelId: string, price: number) => void;
  updateTransportLeg: (id: string, updates: Partial<TransportLeg>) => void;
  updateLocalTransport: (id: string, updates: Partial<LocalTransport>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  updatePending: (id: string, updates: Partial<PendingItem>) => void;
  resolvePending: (id: string) => void;
  exportJSON: () => void;
  resetData: () => void;
}

const TripContext = createContext<TripContextType | null>(null);

const STORAGE_KEY = 'china-trip-data';

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TripData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialTripData;
    } catch {
      return initialTripData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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

  const updatePending = useCallback((id: string, updates: Partial<PendingItem>) => {
    setData(prev => ({
      ...prev,
      pendingItems: prev.pendingItems.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const resolvePending = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      pendingItems: prev.pendingItems.map(p => p.id === id ? { ...p, status: 'done' as const } : p),
    }));
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'viaje-china.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const resetData = useCallback(() => {
    setData(initialTripData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <TripContext.Provider value={{
      data, selectHotel, deselectHotel, updateHotelPrice,
      updateTransportLeg, updateLocalTransport, updateActivity,
      updatePending, resolvePending, exportJSON, resetData,
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
