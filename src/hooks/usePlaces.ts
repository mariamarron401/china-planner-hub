import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlaceItem, PlaceCategory } from '@/types/trip';

function rowToPlace(row: any): PlaceItem {
  return {
    id: row.id,
    cityId: row.city_id,
    category: row.category as PlaceCategory,
    name: row.name,
    altName: row.alt_name || undefined,
    address: row.address || undefined,
    url: row.url || undefined,
    notes: row.notes || undefined,
    tags: row.tags || [],
    status: row.status as 'saved' | 'must' | 'visited',
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function usePlaces() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaces = useCallback(async () => {
    const { data, error } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (!error && data) setPlaces(data.map(rowToPlace));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlaces();
    const channel = supabase
      .channel('places-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, () => {
        fetchPlaces();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPlaces]);

  const addPlace = useCallback(async (place: PlaceItem) => {
    await supabase.from('places').insert({
      id: place.id,
      city_id: place.cityId,
      category: place.category,
      name: place.name,
      alt_name: place.altName || null,
      address: place.address || null,
      url: place.url || null,
      notes: place.notes || null,
      tags: place.tags,
      status: place.status,
      image_url: place.imageUrl || null,
    });
  }, []);

  const updatePlace = useCallback(async (id: string, updates: Partial<PlaceItem>) => {
    const mapped: any = {};
    if (updates.cityId !== undefined) mapped.city_id = updates.cityId;
    if (updates.category !== undefined) mapped.category = updates.category;
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.altName !== undefined) mapped.alt_name = updates.altName || null;
    if (updates.address !== undefined) mapped.address = updates.address || null;
    if (updates.url !== undefined) mapped.url = updates.url || null;
    if (updates.notes !== undefined) mapped.notes = updates.notes || null;
    if (updates.tags !== undefined) mapped.tags = updates.tags;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.imageUrl !== undefined) mapped.image_url = updates.imageUrl || null;
    await supabase.from('places').update(mapped).eq('id', id);
  }, []);

  const deletePlace = useCallback(async (id: string) => {
    await supabase.from('places').delete().eq('id', id);
  }, []);

  return { places, loading, addPlace, updatePlace, deletePlace };
}
