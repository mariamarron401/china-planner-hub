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

export function usePendingItems() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase.from('pending_items').select('*').order('created_at', { ascending: true });
    if (!error && data) setItems(data.map(rowToItem));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('pending-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_items' }, () => {
        fetchItems();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

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
  }, []);

  const resolveItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').update({ status: 'done' }).eq('id', id);
  }, []);

  const reopenItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').update({ status: 'open' }).eq('id', id);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from('pending_items').delete().eq('id', id);
  }, []);

  return { items, loading, addItem, updateItem, resolveItem, reopenItem, deleteItem };
}
