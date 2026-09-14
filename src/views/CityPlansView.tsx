import { useTrip } from '@/context/TripContext';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Check, Clock } from 'lucide-react';
import { cityPlans } from '@/data/cityPlans';

/**
 * Listado de las 10 paradas. Cada una lleva a su planning definitivo.
 *
 * Sustituye a la antigua pantalla de "Sitios por ciudad", que eran listas
 * vacías (cafeterías, tiendas, POVs...) que había que rellenar a mano.
 */
export default function CityPlansView() {
  const { data, orderedCities } = useTrip();
  const { cityGallery } = data;

  const listos = orderedCities.filter(c => cityPlans[c.id]).length;

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] text-muted-foreground">
          {listos} de {orderedCities.length} ciudades con el planning cerrado
        </p>
      </div>

      {orderedCities.map(city => {
        const plan = cityPlans[city.id];
        const coverImg = cityGallery.find(g => g.cityId === city.id)?.imageUrl;

        return (
          <Link
            key={city.id}
            to={`/planning/${city.id}`}
            className="block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in"
          >
            <div className="h-32 w-full bg-muted relative overflow-hidden">
              {coverImg ? (
                <img
                  src={coverImg}
                  alt={city.cityName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-8 w-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-3 left-4 text-lg font-bold text-white">{city.cityName}</h2>
              <span className="absolute bottom-3.5 right-4 text-[10px] font-medium text-white/80">
                {city.startDateText} – {city.endDateText}
              </span>
              {plan ? (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-travel-confirmed-bg text-travel-confirmed px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-2.5 w-2.5" /> Planning listo
                </span>
              ) : (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-muted/90 text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> Por cerrar
                </span>
              )}
            </div>

            <div className="p-3">
              {plan ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {plan.days.length} días
                    </span>
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {plan.highlights.filter(h => h.priority === 'must').length} imprescindibles
                    </span>
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {plan.restaurants.length} sitios para comer
                    </span>
                    {plan.bookings.length > 0 && (
                      <span className="text-[10px] font-medium bg-travel-pending-bg text-travel-pending px-2 py-0.5 rounded-full">
                        {plan.bookings.length} por reservar
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-2">{plan.headline}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Planning todavía por decidir</p>
              )}

              <div className="flex items-center justify-end mt-2 text-xs text-primary font-medium">
                {plan ? 'Ver el plan' : 'Ver ficha'} <ChevronRight className="h-3 w-3 ml-0.5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
