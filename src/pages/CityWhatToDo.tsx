import { useTrip } from '@/context/TripContext';
import { usePlaces } from '@/hooks/usePlaces';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { PlaceCategory } from '@/types/trip';
import { ArrowLeft, ChevronRight } from 'lucide-react';

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

export default function CityWhatToDo() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { data } = useTrip();
  const { places } = usePlaces();
  const city = data.cities.find(c => c.id === cityId);

  const enabledCategories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => {
      if (cat === 'pandas' && cityId !== 'chengdu') return false;
      return true;
    });
  }, [cityId]);

  const cityCounts = useMemo(() => {
    const counts: Partial<Record<PlaceCategory, number>> = {};
    places.filter(p => p.cityId === cityId).forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [places, cityId]);

  if (!city) return <div className="p-8 text-center text-muted-foreground">Ciudad no encontrada</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-5 pt-10 pb-5 rounded-b-3xl">
        <button onClick={() => navigate('/que-hacer')} className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">{city.cityName}</h1>
        <p className="text-primary-foreground/70 text-xs mt-0.5">Selecciona una categoría</p>
      </div>

      <div className="px-4 -mt-3 space-y-2">
        {enabledCategories.map(cat => {
          const count = cityCounts[cat] || 0;
          return (
            <Link
              key={cat}
              to={`/que-hacer/${cityId}/${cat}`}
              className="flex items-center justify-between bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[cat]}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {count > 0 ? `${count} sitio${count > 1 ? 's' : ''}` : 'Sin sitios aún'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
