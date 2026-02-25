import { useTrip } from '@/context/TripContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { PlaceCategory, PlaceItem } from '@/types/trip';
import { ArrowLeft, Plus, Copy, ExternalLink, Check, Pencil, Trash2, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AddPlaceModal from '@/components/AddPlaceModal';

const ALL_CATEGORIES: PlaceCategory[] = [
  'cafes', 'restaurants', 'shops', 'excursions', 'photo_spots',
  'temples', 'pandas', 'bakeries', 'curiosities', 'places_to_visit',
];

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  cafes: '☕ Cafeterías',
  restaurants: '🍜 Restaurantes',
  shops: '🛍️ Tiendas',
  excursions: '🥾 Excursiones',
  photo_spots: '📸 POVs / Spots',
  temples: '🏯 Templos',
  pandas: '🐼 Pandas',
  bakeries: '🧁 Pastelerías',
  curiosities: '✨ Curiosidades',
  places_to_visit: '📍 Lugares a visitar',
};

type SortMode = 'must_first' | 'unvisited_first' | 'az';
type FilterMode = 'all' | 'must' | 'visited' | 'with_link' | 'with_notes';

export default function CityWhatToDo() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { data, deletePlace, updatePlace } = useTrip();
  const city = data.cities.find(c => c.id === cityId);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('must_first');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const enabledCategories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => {
      if (cat === 'pandas' && cityId !== 'chengdu') return false;
      return true;
    });
  }, [cityId]);

  const cityPlaces = useMemo(() => {
    let items = data.places.filter(p => p.cityId === cityId);
    if (activeCategory) items = items.filter(p => p.category === activeCategory);

    // Filter
    if (filterMode === 'must') items = items.filter(p => p.status === 'must');
    else if (filterMode === 'visited') items = items.filter(p => p.status === 'visited');
    else if (filterMode === 'with_link') items = items.filter(p => p.url);
    else if (filterMode === 'with_notes') items = items.filter(p => p.notes);

    // Sort
    items = [...items];
    if (sortMode === 'must_first') items.sort((a, b) => (a.status === 'must' ? -1 : 1) - (b.status === 'must' ? -1 : 1));
    else if (sortMode === 'unvisited_first') items.sort((a, b) => (a.status === 'visited' ? 1 : -1) - (b.status === 'visited' ? 1 : -1));
    else items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [data.places, cityId, activeCategory, sortMode, filterMode]);

  if (!city) return <div className="p-8 text-center text-muted-foreground">Ciudad no encontrada</div>;

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast({ title: 'Copiado ✅', description: name });
    } catch {
      toast({ title: 'Error al copiar', variant: 'destructive' });
    }
  };

  const toggleVisited = (place: PlaceItem) => {
    updatePlace(place.id, { status: place.status === 'visited' ? 'saved' : 'visited' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-5 pt-10 pb-5 rounded-b-3xl">
        <button onClick={() => navigate('/que-hacer')} className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">{city.cityName}</h1>
        <p className="text-primary-foreground/70 text-xs mt-0.5">
          {cityPlaces.length} sitios guardados
        </p>
      </div>

      {/* Category tabs */}
      <div className="px-4 -mt-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
            }`}
          >
            Todos
          </button>
          {enabledCategories.map(cat => {
            const count = data.places.filter(p => p.cityId === cityId && p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
                }`}
              >
                {CATEGORY_LABELS[cat]} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & sort */}
      <div className="px-4 mt-2 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg px-2.5 py-1.5"
        >
          <Filter className="h-3 w-3" /> Filtros
        </button>
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
        >
          <option value="must_first">Imprescindibles primero</option>
          <option value="unvisited_first">No visitados primero</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      {showFilters && (
        <div className="px-4 mt-2 flex gap-1.5 flex-wrap animate-fade-in">
          {(['all', 'must', 'visited', 'with_link', 'with_notes'] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                filterMode === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {{ all: 'Todos', must: 'Imprescindibles', visited: 'Visitados', with_link: 'Con enlace', with_notes: 'Con notas' }[f]}
            </button>
          ))}
        </div>
      )}

      {/* Places list */}
      <div className="px-4 mt-3 space-y-2">
        {cityPlaces.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay sitios en esta categoría.<br />
            Pulsa + para añadir uno.
          </div>
        )}
        {cityPlaces.map(place => (
          <div key={place.id} className="bg-card rounded-xl border border-border p-3 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              {place.imageUrl && (
                <img src={place.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3
                    className="font-semibold text-sm text-foreground truncate cursor-pointer"
                    onClick={() => copyName(place.name)}
                    onContextMenu={e => { e.preventDefault(); copyName(place.name); }}
                    title="Pulsa para copiar"
                  >
                    {place.name}
                  </h3>
                  <button
                    onClick={() => copyName(place.name)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    title="Copiar nombre"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                {place.altName && (
                  <p className="text-xs text-muted-foreground">{place.altName}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {place.status === 'must' && (
                    <span className="text-[9px] font-bold bg-travel-important-bg text-travel-important px-1.5 py-0.5 rounded-full">
                      Imprescindible
                    </span>
                  )}
                  {place.status === 'visited' && (
                    <span className="text-[9px] font-bold bg-travel-confirmed-bg text-travel-confirmed px-1.5 py-0.5 rounded-full">
                      ✓ Visitado
                    </span>
                  )}
                  {place.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                {place.notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{place.notes}</p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              <button onClick={() => copyName(place.name)} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Copy className="h-3 w-3" /> Copiar
              </button>
              {place.url && (
                <a href={place.url} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary">
                  <ExternalLink className="h-3 w-3" /> Abrir
                </a>
              )}
              <button onClick={() => toggleVisited(place)} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Check className="h-3 w-3" /> {place.status === 'visited' ? 'No visitado' : 'Visitado'}
              </button>
              <button onClick={() => setEditingPlace(place)} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Pencil className="h-3 w-3" /> Editar
              </button>
              <button onClick={() => deletePlace(place.id)} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-destructive ml-auto">
                <Trash2 className="h-3 w-3" /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddPlaceModal
        open={showAdd || !!editingPlace}
        onClose={() => { setShowAdd(false); setEditingPlace(null); }}
        defaultCityId={cityId}
        editPlace={editingPlace || undefined}
      />
    </div>
  );
}
