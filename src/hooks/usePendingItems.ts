import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PendingItem } from '@/types/trip';

function rowToItem(row: any): PendingItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    relatedType: row.related_type || '',
    relatedId: row.related_id || '',
    relatedCityId: row.related_city_id || undefined,
    priority: row.priority as 'high' | 'medium' | 'low',
    status: row.status as 'open' | 'done',
    deadline: row.deadline || undefined,
  };
}

/*
 * Almacén compartido a nivel de módulo.
 *
 * Ahora hay varias pantallas mirando los pendientes a la vez (la cabecera de
 * "Por hacer" pinta el contador, la lista los pinta enteros y el inicio calcula
 * lo siguiente que toca). Si cada una hiciera su propio fetch, pasaban dos
 * cosas: se pedía lo mismo 2-3 veces y, según qué respuesta llegaba primero,
 * el contador de la pestaña se quedaba a 0 mientras la lista ya tenía 21.
 * Con un solo fetch y un solo canal de realtime, todas ven exactamente lo mismo.
 */
let cache: PendingItem[] = [];
let loaded = false;
let inflight: Promise<void> | null = null;
let channel: ReturnType<typeof supabase.channel> | null = null;
const listeners = new Set<(items: PendingItem[]) => void>();

async function loadItems(): Promise<void> {
  const { data, error } = await supabase
    .from('pending_items')
    .select('*')
    .order('created_at', { ascending: true });
  if (!error && data) {
    cache = data.map(rowToItem);
    loaded = true;
    listeners.forEach(l => l(cache));
  }
}

function refresh(): Promise<void> {
  inflight ??= loadItems().finally(() => { inflight = null; });
  return inflight;
}

function ensureRealtime() {
  if (channel) return;
  channel = supabase
    .channel('pending-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_items' }, () => {
      refresh();
    })
    .subscribe();
}

export function usePendingItems() {
  const [items, setItems] = useState<PendingItem[]>(cache);
  const [loading, setLoading] = useState(!loaded);

  useEffect(() => {
    listeners.add(setItems);
    ensureRealtime();
    setItems(cache);
    refresh().then(() => setLoading(false));
    return () => { listeners.delete(setItems); };
  }, []);

  const addItem = useCallback(async (item: PendingItem) => {
    await supabase.from('pending_items').insert({
      id: item.id,
      title: item.title,
      description: item.description,
      related_type: item.relatedType,
      related_id: item.relatedId,
      related_city_id: item.relatedCityId || null,
      priority: item.priority,
      status: item.status,
      deadline: item.deadline || null,
    });
    await refresh();
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<PendingItem>) => {
    const mapped: any = {};
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.relatedType !== undefined) mapped.related_type = updates.relatedType;
    if (updates.relatedId !== undefined) mapped.related_id = updates.relatedId;
    if (updates.relatedCityId !== undefined) mapped.related_city_id = updates.relatedCityId || null;
    if (updates.priority !== undefined) mapped.priority = updates.priority;
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.deadline !== undefined) mapped.deadline = updates.deadline || null;
    await supabase.from('pending_items').update(mapped).eq('id', id);
    await refresh();
  }, []);

  const resolveItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').update({ status: 'done' }).eq('id', id);
    await refresh();
  }, []);

  const reopenItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').update({ status: 'open' }).eq('id', id);
    await refresh();
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').delete().eq('id', id);
    await refresh();
  }, []);

  return { items, loading, addItem, updateItem, resolveItem, reopenItem, deleteItem };
}
