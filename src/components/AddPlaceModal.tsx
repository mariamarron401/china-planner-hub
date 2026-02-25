import { useState, useEffect, useMemo } from 'react';
import { useTrip } from '@/context/TripContext';
import { PlaceCategory, PlaceItem } from '@/types/trip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ALL_CATEGORIES: PlaceCategory[] = [
  'cafes', 'restaurants', 'shops', 'excursions', 'photo_spots',
  'temples', 'pandas', 'bakeries', 'curiosities', 'places_to_visit',
];

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  cafes: 'Cafeterías',
  restaurants: 'Restaurantes',
  shops: 'Tiendas',
  excursions: 'Excursiones',
  photo_spots: 'POVs / Spots',
  temples: 'Templos',
  pandas: 'Pandas',
  bakeries: 'Pastelerías',
  curiosities: 'Curiosidades',
  places_to_visit: 'Lugares a visitar',
};

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCityId?: string;
  editPlace?: PlaceItem;
}

export default function AddPlaceModal({ open, onClose, defaultCityId, editPlace }: Props) {
  const { data, addPlace, updatePlace } = useTrip();
  const [cityId, setCityId] = useState(defaultCityId || data.cities[0]?.id || '');
  const [category, setCategory] = useState<PlaceCategory>('restaurants');
  const [name, setName] = useState('');
  const [altName, setAltName] = useState('');
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'saved' | 'must' | 'visited'>('saved');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (editPlace) {
      setCityId(editPlace.cityId);
      setCategory(editPlace.category);
      setName(editPlace.name);
      setAltName(editPlace.altName || '');
      setAddress(editPlace.address || '');
      setUrl(editPlace.url || '');
      setNotes(editPlace.notes || '');
      setStatus(editPlace.status);
      setImageUrl(editPlace.imageUrl || '');
      setTagsText(editPlace.tags.join(', '));
    } else {
      if (defaultCityId) setCityId(defaultCityId);
      setCategory('restaurants');
      setName(''); setAltName(''); setAddress(''); setUrl(''); setNotes('');
      setStatus('saved'); setImageUrl(''); setTagsText('');
    }
  }, [editPlace, defaultCityId, open]);

  const enabledCategories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => {
      if (cat === 'pandas' && cityId !== 'chengdu') return false;
      return true;
    });
  }, [cityId]);

  // If category is pandas and city changes away from chengdu, reset
  useEffect(() => {
    if (category === 'pandas' && cityId !== 'chengdu') {
      setCategory('restaurants');
    }
  }, [cityId, category]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }
    if (category === 'pandas' && cityId !== 'chengdu') {
      toast({ title: 'La lista de Pandas está asociada a Chengdu', variant: 'destructive' });
      return;
    }

    const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const now = new Date().toISOString();

    if (editPlace) {
      updatePlace(editPlace.id, {
        cityId, category, name: name.trim(), altName: altName.trim() || undefined,
        address: address.trim() || undefined, url: url.trim() || undefined,
        notes: notes.trim() || undefined, tags, status,
        imageUrl: imageUrl.trim() || undefined, updatedAt: now,
      });
      toast({ title: 'Sitio actualizado ✅' });
    } else {
      addPlace({
        id: `place-${Date.now()}`,
        cityId, category, name: name.trim(), altName: altName.trim() || undefined,
        address: address.trim() || undefined, url: url.trim() || undefined,
        notes: notes.trim() || undefined, tags, status,
        imageUrl: imageUrl.trim() || undefined, createdAt: now, updatedAt: now,
      });
      toast({ title: 'Sitio añadido ✅' });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPlace ? 'Editar sitio' : 'Añadir sitio'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* City */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Ciudad</label>
            <select
              value={cityId}
              onChange={e => setCityId(e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {data.cities.map(c => (
                <option key={c.id} value={c.id}>{c.cityName}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as PlaceCategory)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {enabledCategories.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nombre del sitio *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="可以是中文" className="mt-1" />
          </div>

          {/* Alt name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nombre alternativo</label>
            <Input value={altName} onChange={e => setAltName(e.target.value)} placeholder="En español/inglés" className="mt-1" />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Dirección</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Opcional" className="mt-1" />
          </div>

          {/* URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">URL / Link</label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Maps, Amap, web..." className="mt-1" />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">URL de imagen</label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Estado</label>
            <div className="flex gap-2 mt-1">
              {(['saved', 'must', 'visited'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {{ saved: 'Guardado', must: 'Imprescindible', visited: 'Visitado' }[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Etiquetas (separadas por coma)</label>
            <Input value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="desayuno, vistas, barato" className="mt-1" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none"
              placeholder="Opcional"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {editPlace ? 'Guardar cambios' : 'Añadir sitio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
