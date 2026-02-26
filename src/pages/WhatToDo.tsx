import { useTrip } from '@/context/TripContext';
import { usePlaces } from '@/hooks/usePlaces';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { PlaceCategory } from '@/types/trip';

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
  places_to_visit: 'Lugares',
};

export default function WhatToDo() {
  const { data, orderedCities } = useTrip();
  const { places } = usePlaces();
  const { cityGallery } = data;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">Qué hacer</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Listas por ciudad · estilo Apple Maps</p>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {orderedCities.map(city => {
          const cityPlaces = places.filter(p => p.cityId === city.id);
          const coverImg = cityGallery.find(g => g.cityId === city.id)?.imageUrl;

          const catCounts: Partial<Record<PlaceCategory, number>> = {};
          cityPlaces.forEach(p => {
            catCounts[p.category] = (catCounts[p.category] || 0) + 1;
          });

          return (
            <Link
              key={city.id}
              to={`/que-hacer/${city.id}`}
              className="block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in"
            >
              <div className="h-32 w-full bg-muted relative overflow-hidden">
                {coverImg ? (
                  <img src={coverImg} alt={city.cityName} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <h2 className="absolute bottom-3 left-4 text-lg font-bold text-white">{city.cityName}</h2>
              </div>
              <div className="p-3">
                {cityPlaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin sitios guardados aún</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(catCounts).map(([cat, count]) => (
                      <span key={cat} className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {count} {CATEGORY_LABELS[cat as PlaceCategory]}
                      </span>
                    ))}
                    <span className="text-[10px] font-medium text-muted-foreground ml-auto">{cityPlaces.length} total</span>
                  </div>
                )}
                <div className="flex items-center justify-end mt-2 text-xs text-primary font-medium">
                  Ver listas <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
