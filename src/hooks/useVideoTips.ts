import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoTip, VideoTipEntry, TipCategory } from '@/types/trip';

// Los tips de vídeo se guardan en la tabla Supabase `places` (category = 'video_tip'),
// reutilizando columnas ya existentes: alt_name=platform, tags=lista de tips,
// notes=JSON con {caption, transcript, status}. Así se comparten en tiempo real entre
// dispositivos sin necesitar crear una tabla nueva (los usuarios no tienen cuenta propia
// en Supabase/Lovable para hacer esa gestión). Ver .agent/knowledge/07-app-lovable.md.
// city_id es NOT NULL en la tabla, así que los tips sin ciudad usan el sentinel 'none'.
const CATEGORY = 'video_tip';
const NO_CITY = 'none';
const TIP_CATEGORIES: TipCategory[] = ['restaurante', 'cafeteria', 'sitios_a_visitar', 'requisitos_ciudad', 'clip', 'otro'];

// Cada tip se guarda en `tags` como "categoria::texto" para poder agruparlos por temática
// sin tocar el esquema de la tabla. Los tips antiguos (guardados antes de esto, sin "::")
// se tratan como categoría "otro" para no perderlos.
function decodeTag(tag: string): VideoTipEntry {
  const sep = tag.indexOf('::');
  if (sep === -1) return { text: tag, category: 'otro' };
  const category = tag.slice(0, sep) as TipCategory;
  return { text: tag.slice(sep + 2), category: TIP_CATEGORIES.includes(category) ? category : 'otro' };
}

function encodeTag(entry: VideoTipEntry): string {
  return `${entry.category}::${entry.text}`;
}

function rowToVideoTip(row: any): VideoTip {
  let extra: { caption?: string; transcript?: string; status?: VideoTip['status'] } = {};
  try {
    extra = row.notes ? JSON.parse(row.notes) : {};
  } catch {
    extra = {};
  }
  return {
    id: row.id,
    url: row.url || '',
    platform: (row.alt_name as VideoTip['platform']) || 'other',
    title: row.name,
    tips: (row.tags || []).map(decodeTag),
    cityId: (row.city_id && row.city_id !== NO_CITY) ? row.city_id : undefined,
    caption: extra.caption || undefined,
    transcript: extra.transcript || undefined,
    status: extra.status || 'reviewed',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useVideoTips() {
  const [videoTips, setVideoTips] = useState<VideoTip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideoTips = useCallback(async () => {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', CATEGORY)
      .order('created_at', { ascending: false });
    if (!error && data) setVideoTips(data.map(rowToVideoTip));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideoTips();
    const channel = supabase
      .channel('video-tips-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places', filter: `category=eq.${CATEGORY}` }, () => {
        fetchVideoTips();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchVideoTips]);

  const addVideoTip = useCallback(async (tip: VideoTip) => {
    await supabase.from('places').insert({
      id: tip.id,
      category: CATEGORY,
      city_id: tip.cityId || NO_CITY,
      name: tip.title,
      alt_name: tip.platform,
      url: tip.url,
      tags: tip.tips.map(encodeTag),
      notes: JSON.stringify({ caption: tip.caption, transcript: tip.transcript, status: tip.status }),
      status: 'saved',
    });
  }, []);

  const updateVideoTip = useCallback(async (id: string, updates: Partial<VideoTip>) => {
    const current = videoTips.find(v => v.id === id);
    const mapped: any = {};
    if (updates.title !== undefined) mapped.name = updates.title;
    if (updates.platform !== undefined) mapped.alt_name = updates.platform;
    if (updates.url !== undefined) mapped.url = updates.url;
    if (updates.cityId !== undefined) mapped.city_id = updates.cityId || NO_CITY;
    if (updates.tips !== undefined) mapped.tags = updates.tips.map(encodeTag);
    if (current && (updates.caption !== undefined || updates.transcript !== undefined || updates.status !== undefined)) {
      mapped.notes = JSON.stringify({
        caption: updates.caption !== undefined ? updates.caption : current.caption,
        transcript: updates.transcript !== undefined ? updates.transcript : current.transcript,
        status: updates.status !== undefined ? updates.status : current.status,
      });
    }
    await supabase.from('places').update(mapped).eq('id', id);
  }, [videoTips]);

  const deleteVideoTip = useCallback(async (id: string) => {
    await supabase.from('places').delete().eq('id', id);
  }, []);

  return { videoTips, loading, addVideoTip, updateVideoTip, deleteVideoTip };
}
