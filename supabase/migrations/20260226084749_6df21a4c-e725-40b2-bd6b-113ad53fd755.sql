
-- Create places table for shared "Qué hacer" data
CREATE TABLE public.places (
  id TEXT NOT NULL PRIMARY KEY,
  city_id TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  alt_name TEXT,
  address TEXT,
  url TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'saved',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pending_items table for shared pendientes
CREATE TABLE public.pending_items (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  related_type TEXT DEFAULT '',
  related_id TEXT DEFAULT '',
  related_city_id TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  deadline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_items ENABLE ROW LEVEL SECURITY;

-- Public access policies (shared trip app, no auth needed)
CREATE POLICY "Anyone can read places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Anyone can insert places" ON public.places FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update places" ON public.places FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete places" ON public.places FOR DELETE USING (true);

CREATE POLICY "Anyone can read pending_items" ON public.pending_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pending_items" ON public.pending_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pending_items" ON public.pending_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pending_items" ON public.pending_items FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.places;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_items;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pending_items_updated_at BEFORE UPDATE ON public.pending_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
