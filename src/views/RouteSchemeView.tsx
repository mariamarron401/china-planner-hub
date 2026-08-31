import { useTrip } from '@/context/TripContext';
import { Building2, Car, TrainFront, MapPin, LogOut, LogIn, AlertTriangle, Clock } from 'lucide-react';
import MoreInfo from '@/components/MoreInfo';

/**
 * Puerta a puerta: la secuencia del día de viaje y nada más — a qué hora se sale del
 * hotel, qué Didi, qué estación, qué tren, y el check-in del hotel de destino.
 *
 * María pidió el 31/08/2026 quitar de aquí todo lo que no fuera necesario. Criterio
 * aplicado: en la tarjeta solo lo que hace falta MIRAR ESE DÍA con el móvil en la mano.
 * Lo que se ha quitado y dónde está ahora:
 *  - Precios por tramo y total del transporte → pantalla **Dinero**. Aquí no se decide
 *    nada de dinero, y ocupaban dos bloques por tarjeta.
 *  - Los textos largos de traslado, márgenes y desayuno → plegados en "Ver detalle".
 *  - La leyenda de iconos y el "qué estás viendo aquí" → los pasos ya llevan su texto.
 *  - El botón de copiar/buscar en Trip.com → era de cuando había que comprar los billetes.
 */

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

/**
 * Primera frase, cortando solo en punto y espacio (no en dos puntos: varios textos
 * llevan «a las 11:55, saliendo del hotel a las 11:10: ...» y ahí la coma manda).
 */
function firstPhrase(text?: string): string {
  if (!text) return '';
  return text.split(/\.\s/)[0].trim().replace(/\.$/, '');
}

/**
 * 'Beijing West (北京西站) · en Trip.com "Beijingxi"' → 'Beijing West (北京西站)'.
 * El nombre literal para teclear en Trip.com y los avisos de no confundirse de estación
 * están en Moverse → Trenes; aquí solo hace falta saber a qué estación se va.
 */
function stationName(text?: string): string {
  if (!text) return '';
  return text.split(' · ')[0].trim();
}

/**
 * '🕐 En la estación a las 08:36, saliendo del hotel a las 08:00' → 'Llegar a las 08:36'.
 * Del margen solo hace falta la hora de estar allí: la de salir del hotel ya va destacada
 * en el paso anterior, y repetirla era la duplicación más visible de la pantalla.
 */
function stationArrival(text?: string): string {
  const hora = text?.match(/a las (\d{1,2}:\d{2})/)?.[1];
  return hora ? `Llegar a las ${hora}` : firstPhrase(text);
}

/**
 * 'Hotel (Yabaolu, Chaoyang) → Beijing West: ~12 km, 40 min en Didi · ~40 CNY (~5€). A las…'
 * → '~12 km, 40 min en Didi · ~40 CNY (~5€)'
 * Se quita el «origen → destino» porque son justo los dos pasos que rodean al Didi en el
 * esquema, y se queda la primera frase, que es la que lleva km, minutos y precio.
 */
function transferShort(text?: string): string {
  if (!text) return '';
  const i = text.indexOf(': ');
  const cabeza = i > 0 ? text.slice(0, i) : '';
  const cuerpo = cabeza.includes('→') ? text.slice(i + 2) : text;
  return firstPhrase(cuerpo);
}

/**
 * Solo los avisos marcados con 🔴 (no equivocarse) o 🔲 (queda algo por hacer) salen en
 * la tarjeta. Los demás repetían datos que ya están arriba, como la hora de salir.
 */
function esAvisoCritico(text?: string): boolean {
  return Boolean(text && (text.startsWith('🔴') || text.startsWith('🔲')));
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

export default function RouteSchemeView() {
  const { data } = useTrip();
  const { cities, hotels, transportLegs, selectedHotels } = data;

  const cityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;
  const hotelFor = (cityId: string) => hotels.find(h => h.id === selectedHotels[cityId]);

  return (
    <div className="px-4 space-y-4">
      {transportLegs.map((leg, idx) => {
        const originHotel = hotelFor(leg.fromCityId);
        const destHotel = hotelFor(leg.toCityId);
        // Los tramos que no son tren (el coche del 23 y el Didi del 24) se dibujan
        // hotel → coche → hotel, sin los pasos de estación.
        const isTrain = Boolean(leg.fromStation || leg.toStation);
        const HeaderIcon = isTrain ? TrainFront : Car;
        const avisoCritico = esAvisoCritico(leg.alertNote);
        return (
          <div key={leg.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Tramo {idx + 1}/{transportLegs.length}
              </span>
              {leg.travelDate && <span className="text-[10px] text-muted-foreground">{leg.travelDate}</span>}
            </div>

            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-base font-bold text-foreground">{cityName(leg.fromCityId)}</span>
              <HeaderIcon className={`h-4 w-4 flex-shrink-0 ${isTrain ? 'text-primary' : 'text-amber-600'}`} />
              <span className="text-base font-bold text-foreground">{cityName(leg.toCityId)}</span>
            </div>

            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
              <div className="space-y-3">
                {/* Hotel de origen. La hora de salir es el dato que evita quedarse tirados,
                    así que va destacada y no escondida en un párrafo. */}
                <Step icon={Building2} iconColor="text-secondary">
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {originHotel?.name ?? cityName(leg.fromCityId)}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <LogOut className="h-3 w-3" /> Check-out {originHotel?.checkOutTime ?? '—'}
                  </p>
                  {leg.leaveHotelTime && (
                    <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-travel-important-bg px-2 py-1 text-[11px] font-bold text-travel-important">
                      <Clock className="h-3 w-3" /> Salir a las {leg.leaveHotelTime}
                    </p>
                  )}
                </Step>

                {/* Coche hasta la estación. En los tramos sin tren no se pinta: el coche
                    del paso siguiente ya es el tramo entero, puerta a puerta. */}
                {isTrain && leg.transferBefore && (
                  <Step icon={Car} iconColor="text-amber-600">
                    <p className="text-[11px] text-foreground leading-snug">{transferShort(leg.transferBefore)}</p>
                  </Step>
                )}

                {/* Estación de salida */}
                {isTrain && (
                  <Step icon={MapPin} iconColor="text-primary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{stationName(leg.fromStation)}</p>
                    {leg.stationBuffer && (
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                        {stationArrival(leg.stationBuffer)}
                      </p>
                    )}
                  </Step>
                )}

                {/* El tren (o el coche, en los dos tramos que no son tren) */}
                <Step
                  icon={isTrain ? TrainFront : Car}
                  iconColor={isTrain ? 'text-primary' : 'text-amber-600'}
                  highlight
                >
                  <p
                    className={`text-xs font-bold ${
                      isTrain ? 'text-primary' : 'text-amber-700 dark:text-amber-500'
                    }`}
                  >
                    {leg.trainNumber ?? leg.mode}
                    {leg.durationMinutes != null && ` · ${formatDuration(leg.durationMinutes)}`}
                  </p>
                  {leg.departTime && leg.arriveTime && (
                    <p className="mt-0.5 text-lg font-bold tabular-nums leading-none text-foreground">
                      {leg.departTime} <span className="text-muted-foreground font-normal">→</span> {leg.arriveTime}
                    </p>
                  )}
                </Step>

                {/* Estación de llegada */}
                {isTrain && (
                  <Step icon={MapPin} iconColor="text-primary">
                    <p className="text-xs font-semibold text-foreground leading-snug">{stationName(leg.toStation)}</p>
                  </Step>
                )}

                {/* Coche hasta el hotel */}
                {isTrain && leg.transferAfter && (
                  <Step icon={Car} iconColor="text-amber-600">
                    <p className="text-[11px] text-foreground leading-snug">{transferShort(leg.transferAfter)}</p>
                  </Step>
                )}

                {/* Hotel de destino */}
                <Step icon={Building2} iconColor="text-secondary">
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {destHotel?.name ?? cityName(leg.toCityId)}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <LogIn className="h-3 w-3" /> Check-in {destHotel?.checkInTime ?? '—'}
                  </p>
                </Step>
              </div>
            </div>

            {avisoCritico && (
              <div className="mt-3 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{leg.alertNote}</span>
              </div>
            )}

            <MoreInfo label="Ver detalle del tramo">
              {leg.hotelDepartureNote && <p>{leg.hotelDepartureNote}</p>}
              {leg.suggestedDeparture && (
                <p>
                  <span className="text-foreground font-medium">Salida:</span> {leg.suggestedDeparture}
                </p>
              )}
              {leg.estimatedArrival && (
                <p>
                  <span className="text-foreground font-medium">Llegada:</span> {leg.estimatedArrival}
                </p>
              )}
              {leg.transferBefore && (
                <p>
                  <span className="text-foreground font-medium">Antes:</span> {leg.transferBefore}
                </p>
              )}
              {leg.stationBuffer && (
                <p>
                  <span className="text-foreground font-medium">
                    {isTrain ? 'Margen en la estación:' : 'Al salir:'}
                  </span>{' '}
                  {leg.stationBuffer}
                </p>
              )}
              {isTrain && (
                <p>
                  <span className="text-foreground font-medium">Estaciones completas:</span>{' '}
                  {leg.fromStation} → {leg.toStation}
                </p>
              )}
              {leg.transferAfter && (
                <p>
                  <span className="text-foreground font-medium">Después:</span> {leg.transferAfter}
                </p>
              )}
              {leg.breakfastNote && (
                <p>
                  <span className="text-foreground font-medium">☕ Desayuno:</span> {leg.breakfastNote}
                </p>
              )}
              {leg.alertNote && !avisoCritico && <p>{leg.alertNote}</p>}
              {leg.notes && <p>{leg.notes}</p>}
              <p className="text-muted-foreground">
                Lo que cuesta este tramo y de qué cuenta sale está en la pantalla{' '}
                <span className="text-foreground font-medium">Dinero</span>.
              </p>
            </MoreInfo>
          </div>
        );
      })}
    </div>
  );
}
