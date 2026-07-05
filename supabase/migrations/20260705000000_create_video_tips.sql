
-- Create video_tips table for tips extracted from public TikTok/Instagram videos
CREATE TABLE public.video_tips (
  id TEXT NOT NULL PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL DEFAULT '',
  tips TEXT[] NOT NULL DEFAULT '{}',
  city_id TEXT,
  transcript TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'reviewed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_tips ENABLE ROW LEVEL SECURITY;

-- Public access policies (shared trip app, no auth needed)
CREATE POLICY "Anyone can read video_tips" ON public.video_tips FOR SELECT USING (true);
CREATE POLICY "Anyone can insert video_tips" ON public.video_tips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update video_tips" ON public.video_tips FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete video_tips" ON public.video_tips FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_tips;

-- Trigger for updated_at (function already created by previous migration)
CREATE TRIGGER update_video_tips_updated_at BEFORE UPDATE ON public.video_tips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
