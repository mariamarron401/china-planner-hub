import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { getHotelCalcs } from '@/lib/calculations';
import { MapPin, Moon, Building2, Train, Compass, AlertTriangle, Plane, ArrowLeftRight, Camera } from 'lucide-react';
import GalleryViewer from '@/components/GalleryViewer';

export default function Itinerary() {
  const { data, orderedCities, orderedTransportLegs, toggleRouteDirection } = useTrip();
  const { hotels, selectedHotels, activities, flights, cityGallery } = data;
  const [expandedGallery, setExpandedGallery] = useState<string | null>(null);

  const getCityName = (id: string) => data.cities.find(c => c.id === id)?.cityName || id;
  const firstFlight = flights.find(f => f.direction === 'outbound');
  const lastFlight = [...flights].reverse().find(f => f.direction === 'return');

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Itinerario</h1>
            <p className="text-sm text-muted-foreground mt-1">10 ciudades · 22 noches</p>
          </div>
          <button
            onClick={toggleRouteDirection}
            className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full transition-all hover:bg-primary/20"
          >
            <ArrowLeftRight className="h-3 w-3" />
            🔁 {data.trip.routeDirection === 'forward' ? 'Normal' : 'Invertido'}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Outbound flight card */}
        {firstFlight && (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
              <Plane className="h-3.5 w-3.5 text-primary" /> VUELO DE IDA
            </div>
            <div className="text-sm text-foreground">
              ✈️ {firstFlight.fromAirport} → {flights.filter(f => f.direction === 'outbound').pop()?.toAirport} · {firstFlight.departureDateTime.split('T')[0]}
            </div>
          </div>
        )}

        {orderedCities.map((city, idx) => {
          const cityHotels = hotels.filter(h => h.cityId === city.id);
          const selectedId = selectedHotels[city.id];
          const selectedHotel = selectedId ? cityHotels.find(h => h.id === selectedId) : null;
          const arrivalLeg = orderedTransportLegs.find(t => t.toCityId === city.id);
          const departureLeg = orderedTransportLegs.find(t => t.fromCityId === city.id);
          const cityActivities = activities.filter(a => a.cityId === city.id);
          const hasFlags = city.flags.length > 0;
          const cityImages = cityGallery.filter(g => g.cityId === city.id);
          const showGallery = expandedGallery === city.id;

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
                <div className="flex gap-1">
                  {hasFlags && city.flags.map(f => (
                    <span key={f} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      f === 'duda' ? 'bg-travel-pending-bg text-travel-pending' : 'bg-travel-important-bg text-travel-important'
                    }`}>
                      {f === 'duda' ? '⚠ Duda' : '★ Importante'}
                    </span>
                  ))}
                </div>
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

              {/* Gallery toggle */}
              {cityImages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setExpandedGallery(showGallery ? null : city.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary"
                  >
                    <Camera className="h-3 w-3" />
                    {showGallery ? 'Ocultar galería' : `📸 Ver galería (${cityImages.length})`}
                  </button>
                  {showGallery && (
                    <div className="mt-2 animate-fade-in">
                      <GalleryViewer images={cityImages} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Return flight card */}
        {lastFlight && (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
              <Plane className="h-3.5 w-3.5 text-primary" /> VUELO DE VUELTA
            </div>
            <div className="text-sm text-foreground">
              ✈️ {flights.filter(f => f.direction === 'return')[0]?.fromAirport} → {lastFlight.toAirport} · {lastFlight.departureDateTime.split('T')[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}
