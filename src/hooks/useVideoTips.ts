import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoTip } from '@/types/trip';

function rowToVideoTip(row: any): VideoTip {
  return {
    id: row.id,
    url: row.url,
    platform: row.platform as VideoTip['platform'],
    title: row.title,
    tips: row.tips || [],
    cityId: row.city_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useVideoTips() {
  const [videoTips, setVideoTips] = useState<VideoTip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideoTips = useCallback(async () => {
    const { data, error } = await supabase.from('video_tips').select('*').order('created_at', { ascending: false });
    if (!error && data) setVideoTips(data.map(rowToVideoTip));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideoTips();
    const channel = supabase
      .channel('video-tips-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_tips' }, () => {
        fetchVideoTips();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchVideoTips]);

  const addVideoTip = useCallback(async (tip: VideoTip) => {
    await supabase.from('video_tips').insert({
      id: tip.id,
      url: tip.url,
      platform: tip.platform,
      title: tip.title,
      tips: tip.tips,
      city_id: tip.cityId || null,
    });
  }, []);

  const updateVideoTip = useCallback(async (id: string, updates: Partial<VideoTip>) => {
    const mapped: any = {};
    if (updates.url !== undefined) mapped.url = updates.url;
    if (updates.platform !== undefined) mapped.platform = updates.platform;
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.tips !== undefined) mapped.tips = updates.tips;
    if (updates.cityId !== undefined) mapped.city_id = updates.cityId || null;
    await supabase.from('video_tips').update(mapped).eq('id', id);
  }, []);

  const deleteVideoTip = useCallback(async (id: string) => {
    await supabase.from('video_tips').delete().eq('id', id);
  }, []);

  return { videoTips, loading, addVideoTip, updateVideoTip, deleteVideoTip };
}
