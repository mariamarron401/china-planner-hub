import { useTrip } from '@/context/TripContext';
import { Building2, Car, TrainFront, MapPin, LogOut, LogIn, AlertTriangle, Clock } from 'lucide-react';

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

interface StepProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  highlight?: boolean;
  children: React.ReactNode;
}

function Step({ icon: Icon, iconColor, highlight, children }: StepProps) {
  return (
    <div className="flex gap-3 relative">
      <div
        className={`h-[22px] w-[22px] rounded-full bg-card border flex items-center justify-center flex-shrink-0 z-10 ${
          highlight ? 'border-primary ring-2 ring-primary/20' : 'border-border'
        }`}
      >
        <Icon className={`h-3 w-3 ${iconColor}`} />
      </div>
      <div className={`flex-1 min-w-0 ${highlight ? 'bg-primary/5 rounded-lg px-2.5 py-2 -mt-1' : 'pt-0.5'}`}>
        {children}
      </div>
    </div>
  );
}

export default function RouteScheme() {
  const { data } = useTrip();
  const { cities, hotels, transportLegs, selectedHotels } = data;

  const cityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;
  const hotelFor = (cityId: string) => hotels.find(h => h.id === selectedHotels[cityId]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Trayectos puerta a puerta</h1>
        <p className="text-xs text-muted-foreground mt-1 leading-snug">
          De hotel a hotel en cada tramo: salida del hotel, Didi/taxi a la estación (con distancia), tren bala y traslado hasta el hotel de destino. Preferencia aplicada: <span className="font-medium text-foreground">salidas entre las 9 y las 11 h</span> para no madrugar, cuadrando con los check-in.
        </p>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-3 shadow-sm flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-secondary" /> Hotel</span>
          <span className="flex items-center gap-1.5"><Car className="h-3.5 w-3.5 text-amber-600" /> Didi / taxi</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Estación</span>
          <span className="flex items-center gap-1.5"><TrainFront className="h-3.5 w-3.5 text-primary" /> Tren bala</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {transportLegs.map((leg, idx) => {
          const originHotel = hotelFor(leg.fromCityId);
          const destHotel = hotelFor(leg.toCityId);
          return (
            <div key={leg.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Tramo {idx + 1}/8</span>
                {leg.travelDate && <span className="text-[10px] text-muted-foreground">{leg.travelDate}</span>}
              </div>

              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-base font-bold text-foreground">{cityName(leg.fromCityId)}</span>
                <TrainFront className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-base font-bold text-foreground">{cityName(leg.toCityId)}</span>
              </div>

              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
                <div className="space-y-3">
                  {/* Hotel de origen */}
                  <Step icon={Building2} iconColor="text-secondary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{originHotel?.name ?? cityName(leg.fromCityId)}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <LogOut className="h-3 w-3" /> Check-out {originHotel?.checkOutTime ?? '—'}
                    </p>
                  </Step>

                  {/* Didi a la estación de origen */}
                  {leg.transferBefore && (
                    <Step icon={Car} iconColor="text-amber-600">
                      <p className="text-[11px] text-foreground leading-snug">{leg.transferBefore}</p>
                    </Step>
                  )}

                  {/* Estación de origen */}
                  <Step icon={MapPin} iconColor="text-primary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{leg.fromStation}</p>
                    {leg.stationBuffer && <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{leg.stationBuffer}</p>}
                  </Step>

                  {/* Tren bala */}
                  <Step icon={TrainFront} iconColor="text-primary" highlight>
                    <p className="text-xs font-bold text-primary mb-0.5">{leg.mode}{leg.durationMinutes != null ? ` · ~${formatDuration(leg.durationMinutes)}` : ''}</p>
                    <p className="text-[11px] text-foreground leading-snug"><span className="text-muted-foreground">Salida:</span> <span className="font-medium">{leg.suggestedDeparture}</span></p>
                    <p className="text-[11px] text-foreground leading-snug"><span className="text-muted-foreground">Llegada:</span> <span className="font-medium">{leg.estimatedArrival}</span></p>
                    {leg.price != null && (
                      <p className="text-[11px] text-foreground leading-snug"><span className="text-muted-foreground">Billete:</span> <span className="font-medium">~{leg.price}€ (2ª clase, 2 pers.)</span></p>
                    )}
                  </Step>

                  {/* Estación de destino */}
                  <Step icon={MapPin} iconColor="text-primary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{leg.toStation}</p>
                  </Step>

                  {/* Didi al hotel de destino */}
                  {leg.transferAfter && (
                    <Step icon={Car} iconColor="text-amber-600">
                      <p className="text-[11px] text-foreground leading-snug">{leg.transferAfter}</p>
                    </Step>
                  )}

                  {/* Hotel de destino */}
                  <Step icon={Building2} iconColor="text-secondary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{destHotel?.name ?? cityName(leg.toCityId)}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <LogIn className="h-3 w-3" /> Check-in {destHotel?.checkInTime ?? '—'}
                    </p>
                  </Step>
                </div>
              </div>

              {leg.alertNote && (
                <div className="mt-3 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{leg.alertNote}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="bg-primary/5 rounded-xl border border-primary/30 p-3.5 shadow-sm">
          <p className="text-sm font-bold text-foreground mb-2">💰 Coste aproximado del transporte interno</p>
          <div className="space-y-1 text-[11px] text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">8 trenes bala (2ª clase, 2 personas)</span>
              <span className="font-semibold">~{transportLegs.reduce((s, l) => s + (l.price ?? 0), 0)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Didi/taxi a estaciones</span>
              <span className="font-semibold">~3-20€ por trayecto</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 leading-snug">Precios de tren = tarifa oficial de 2ª clase por persona × 2. Los Didi son por coche (las 2 personas juntas) y varían por tráfico/hora; en Fenghuang y Furong suele ser tarifa fija negociada.</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-3 shadow-sm flex items-start gap-2">
          <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-snug">
            Horarios de tren tomados del calendario visible hasta el <span className="font-medium text-foreground">14 de septiembre</span> (el máximo disponible ahora), usado como referencia de octubre. Reconfirmad número y hora exactos cuando 12306/Trip.com abran las fechas de octubre. Los precios (tren y Didi) y los km hotel↔estación son aproximados.
          </p>
        </div>
      </div>
    </div>
  );
}
