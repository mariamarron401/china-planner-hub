import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TripData, HotelOption, TransportLeg, LocalTransport, Activity, BudgetExtras } from '@/types/trip';
import { initialTripData } from '@/data/initialData';
import { supabase } from '@/integrations/supabase/client';

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
const OVERRIDES_CATEGORY = 'app_state';
const NO_CITY = 'none'; // city_id es NOT NULL en la tabla places

// Reconstruye una lista a partir de los datos "de fábrica" (initialData.ts), conservando
// solo los campos editables por la usuaria desde localStorage. Así, cuando el código se
// actualiza con información nueva (estaciones, fechas, notas...), esa info siempre llega
// aunque la usuaria ya tuviera datos antiguos guardados en el navegador.
function reconcileById<T extends { id: string }>(fresh: T[], saved: T[] | undefined, preserveKeys: (keyof T)[]): T[] {
  const savedMap = new Map((saved || []).map(item => [item.id, item]));
  return fresh.map(freshItem => {
    const savedItem = savedMap.get(freshItem.id);
    if (!savedItem) return freshItem;
    const merged = { ...freshItem };
    preserveKeys.forEach(key => {
      if (savedItem[key] !== null && savedItem[key] !== undefined) merged[key] = savedItem[key];
    });
    return merged;
  });
}

// Ediciones compartidas entre dispositivos (selección de hotel, precios, estados...) se
// guardan como filas sueltas en la tabla Supabase `places` (category='app_state'), una fila
// por clave, con el valor como JSON en `notes`. Se reutiliza esa tabla porque ya funciona sin
// ninguna cuenta (RLS abierta) y no hace falta crear una tabla nueva. `applyOverrides` los
// superpone sobre los datos locales/de fábrica; siempre gana el override más reciente visto.
function applyOverrides(base: TripData, overrides: Record<string, any>): TripData {
  const selectedHotelsOverride = overrides['override:selectedHotels'];
  const budgetExtrasOverride = overrides['override:budgetExtras'];
  const routeDirectionOverride = overrides['override:routeDirection'];
  return {
    ...base,
    trip: routeDirectionOverride ? { ...base.trip, routeDirection: routeDirectionOverride.routeDirection } : base.trip,
    selectedHotels: selectedHotelsOverride || base.selectedHotels,
    hotels: base.hotels.map(h => {
      const o = overrides[`override:hotel:${h.id}`];
      return o ? { ...h, ...o } : h;
    }),
    activities: base.activities.map(a => {
      const o = overrides[`override:activity:${a.id}`];
      return o ? { ...a, ...o } : a;
    }),
    transportLegs: base.transportLegs.map(t => {
      const o = overrides[`override:transportLeg:${t.id}`];
      return o ? { ...t, ...o } : t;
    }),
    localTransports: base.localTransports.map(lt => {
      const o = overrides[`override:localTransport:${lt.id}`];
      return o ? { ...lt, ...o } : lt;
    }),
    budgetExtras: budgetExtrasOverride ? { ...base.budgetExtras, ...budgetExtrasOverride } : base.budgetExtras,
  };
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [localData, setLocalData] = useState<TripData>(() => {
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
        delete parsed.videoTips; // ahora vive en Supabase (tabla places, category='video_tip'), no en localStorage
        // Refrescar contenido informativo desde initialData.ts sin perder ediciones manuales
        parsed.hotels = reconcileById(initialTripData.hotels, parsed.hotels, ['totalPrice', 'priceStatus', 'booked']);
        parsed.transportLegs = reconcileById(initialTripData.transportLegs, parsed.transportLegs, ['price', 'durationMinutes', 'status']);
        parsed.localTransports = reconcileById(initialTripData.localTransports, parsed.localTransports, ['price', 'durationMinutes']);
        parsed.activities = reconcileById(initialTripData.activities, parsed.activities, ['price', 'duration', 'status']);
        return parsed;
      }
      return initialTripData;
    } catch {
      return initialTripData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
  }, [localData]);

  // Ediciones compartidas: se cargan de Supabase y se mantienen al día por realtime,
  // para que un cambio hecho en un móvil se vea en el otro sin recargar ni redesplegar.
  const [overrides, setOverridesState] = useState<Record<string, any>>({});

  const fetchOverrides = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('places')
      .select('id, notes')
      .eq('category', OVERRIDES_CATEGORY);
    if (!error && rows) {
      const map: Record<string, any> = {};
      rows.forEach(r => {
        try { map[r.id] = r.notes ? JSON.parse(r.notes) : {}; } catch { /* ignore fila corrupta */ }
      });
      setOverridesState(map);
    }
  }, []);

  useEffect(() => {
    fetchOverrides();
    const channel = supabase
      .channel('app-state-overrides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places', filter: `category=eq.${OVERRIDES_CATEGORY}` }, () => {
        fetchOverrides();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOverrides]);

  const setOverride = useCallback((id: string, payload: Record<string, any>) => {
    setOverridesState(prev => ({ ...prev, [id]: payload }));
    supabase.from('places').upsert({
      id,
      category: OVERRIDES_CATEGORY,
      name: id,
      city_id: NO_CITY,
      url: null,
      tags: [],
      status: 'saved',
      notes: JSON.stringify(payload),
    }).then(({ error }) => {
      if (error) console.error(`Error guardando override ${id}:`, error);
    });
  }, []);

  const data = useMemo(() => applyOverrides(localData, overrides), [localData, overrides]);

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
    const next = { ...data.selectedHotels, [cityId]: hotelId };
    setLocalData(prev => ({ ...prev, selectedHotels: next }));
    setOverride('override:selectedHotels', next);
  }, [data.selectedHotels, setOverride]);

  const deselectHotel = useCallback((cityId: string) => {
    const next = { ...data.selectedHotels };
    delete next[cityId];
    setLocalData(prev => ({ ...prev, selectedHotels: next }));
    setOverride('override:selectedHotels', next);
  }, [data.selectedHotels, setOverride]);

  const updateHotelPrice = useCallback((hotelId: string, price: number) => {
    setLocalData(prev => ({
      ...prev,
      hotels: prev.hotels.map(h => h.id === hotelId ? { ...h, totalPrice: price, priceStatus: 'known' as const } : h),
    }));
    setOverride(`override:hotel:${hotelId}`, { totalPrice: price, priceStatus: 'known' });
  }, [setOverride]);

  const updateTransportLeg = useCallback((id: string, updates: Partial<TransportLeg>) => {
    setLocalData(prev => ({
      ...prev,
      transportLegs: prev.transportLegs.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
    const current = data.transportLegs.find(t => t.id === id);
    const merged = { ...current, ...updates };
    setOverride(`override:transportLeg:${id}`, { price: merged.price, durationMinutes: merged.durationMinutes, status: merged.status });
  }, [data.transportLegs, setOverride]);

  const updateLocalTransport = useCallback((id: string, updates: Partial<LocalTransport>) => {
    setLocalData(prev => ({
      ...prev,
      localTransports: prev.localTransports.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
    const current = data.localTransports.find(t => t.id === id);
    const merged = { ...current, ...updates };
    setOverride(`override:localTransport:${id}`, { price: merged.price, durationMinutes: merged.durationMinutes });
  }, [data.localTransports, setOverride]);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setLocalData(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
    const current = data.activities.find(a => a.id === id);
    const merged = { ...current, ...updates };
    setOverride(`override:activity:${id}`, { price: merged.price, duration: merged.duration, status: merged.status });
  }, [data.activities, setOverride]);

  const toggleRouteDirection = useCallback(() => {
    const next = data.trip.routeDirection === 'forward' ? 'reverse' : 'forward';
    setLocalData(prev => ({ ...prev, trip: { ...prev.trip, routeDirection: next } }));
    setOverride('override:routeDirection', { routeDirection: next });
  }, [data.trip.routeDirection, setOverride]);

  // Solo resetea la caché local del propio dispositivo; no borra los overrides compartidos
  // de Supabase (que representan decisiones reales ya tomadas, quizá desde otro móvil).
  const resetData = useCallback(() => {
    setLocalData(initialTripData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateBudgetExtras = useCallback((extras: Partial<BudgetExtras>) => {
    const next = { ...data.budgetExtras, ...extras };
    setLocalData(prev => ({ ...prev, budgetExtras: next }));
    setOverride('override:budgetExtras', next);
  }, [data.budgetExtras, setOverride]);

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
