import { useTrip } from '@/context/TripContext';
import { getHotelCalcs } from '@/lib/calculations';
import { MapPin, Moon, Building2, Train, Compass, AlertTriangle } from 'lucide-react';

export default function Itinerary() {
  const { data } = useTrip();
  const { cities, hotels, selectedHotels, transportLegs, activities } = data;

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName || id;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Itinerario</h1>
        <p className="text-sm text-muted-foreground mt-1">10 ciudades · 22 noches</p>
      </div>

      <div className="px-4 space-y-3">
        {cities.map((city, idx) => {
          const cityHotels = hotels.filter(h => h.cityId === city.id);
          const selectedId = selectedHotels[city.id];
          const selectedHotel = selectedId ? cityHotels.find(h => h.id === selectedId) : null;
          const arrivalLeg = transportLegs.find(t => t.toCityId === city.id);
          const departureLeg = transportLegs.find(t => t.fromCityId === city.id);
          const cityActivities = activities.filter(a => a.cityId === city.id);
          const hasFlags = city.flags.length > 0;

          return (
            <div key={city.id} className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{idx + 1}</span>
                    <h3 className="font-bold text-foreground">{city.cityName}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{city.startDateText} – {city.endDateText}</span>
                    <span className="flex items-center gap-1"><Moon className="h-3 w-3" />{city.nights} {city.nights === 1 ? 'noche' : 'noches'}</span>
                  </div>
                </div>
                {hasFlags && (
                  <div className="flex gap-1">
                    {city.flags.map(f => (
                      <span key={f} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        f === 'duda' ? 'bg-travel-pending-bg text-travel-pending' : 'bg-travel-important-bg text-travel-important'
                      }`}>
                        {f === 'duda' ? '⚠ Duda' : '★ Importante'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotel */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <Building2 className="h-3 w-3" /> Hotel
                </div>
                {selectedHotel ? (
                  <div className="text-sm text-foreground">
                    ✅ Seleccionado — {selectedHotel.totalPrice}€ total
                    {selectedHotel.totalPrice && (
                      <span className="text-muted-foreground ml-1">
                        ({getHotelCalcs(selectedHotel, city.nights)?.perNight}€/noche)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {cityHotels.length > 0 ? (
                      <>
                        Sin seleccionar · {cityHotels.filter(h => h.priceStatus === 'known').length} opciones desde{' '}
                        {Math.min(...cityHotels.filter(h => h.totalPrice != null).map(h => h.totalPrice!))}€
                      </>
                    ) : (
                      'Sin opciones'
                    )}
                  </div>
                )}
              </div>

              {/* Transport */}
              {(arrivalLeg || departureLeg) && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <Train className="h-3 w-3" /> Transporte
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {arrivalLeg && (
                      <div>📥 Desde {getCityName(arrivalLeg.fromCityId)} · {arrivalLeg.mode} · {arrivalLeg.price != null ? `${arrivalLeg.price}€` : <PendingBadge />}</div>
                    )}
                    {departureLeg && (
                      <div>📤 Hacia {getCityName(departureLeg.toCityId)} · {departureLeg.mode} · {departureLeg.price != null ? `${departureLeg.price}€` : <PendingBadge />}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Activities */}
              {cityActivities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    <Compass className="h-3 w-3" /> Actividades
                  </div>
                  {cityActivities.map(a => (
                    <div key={a.id} className="text-xs text-foreground flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'Hecha' ? 'bg-travel-confirmed' : 'bg-travel-pending'}`} />
                      {a.title} · {a.status}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {city.notes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  {city.notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-travel-pending flex-shrink-0 mt-0.5" />
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}
