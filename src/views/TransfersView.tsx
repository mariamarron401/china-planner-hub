import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import {
  Car, ArrowRight, MapPin, Calendar, Clock, PlaneLanding, PlaneTakeoff,
  AlertTriangle, Building2, Languages,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MoreInfo from '@/components/MoreInfo';

/**
 * Traslados en coche: los 4 de aeropuerto (los que tienen hora fija y no se
 * pueden fallar) y los 7 de dentro de la ciudad. Los trenes entre ciudades
 * están en `TrainsView`.
 */
export default function TransfersView() {
  const { data, updateLocalTransport } = useTrip();
  const { cities, localTransports, airportTransfers } = data;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  const handleSave = (id: string) => {
    const price = editValues.price ? parseFloat(editValues.price) : null;
    const duration = editValues.duration ? parseInt(editValues.duration) : null;
    updateLocalTransport(id, {
      ...(price !== null && { price }),
      ...(duration !== null && { durationMinutes: duration }),
    });
    setEditingId(null);
    setEditValues({ price: '', duration: '' });
  };

  return (
    <div className="px-4 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Aeropuertos · {airportTransfers.length} traslados con hora fija
      </h2>

      {airportTransfers.map(t => {
        const isDeparture = t.direction === 'to_airport';
        return (
          <div key={t.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Cabecera: vuelo al que sirve */}
            <div className={`px-4 py-2.5 ${isDeparture ? 'bg-travel-pending-bg' : 'bg-primary/10'}`}>
              <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${isDeparture ? 'text-travel-pending' : 'text-primary'}`}>
                {isDeparture ? <PlaneTakeoff className="h-3.5 w-3.5" /> : <PlaneLanding className="h-3.5 w-3.5" />}
                {isDeparture ? 'Salida hacia el aeropuerto' : 'Llegada desde el aeropuerto'}
              </div>
              <div className="text-xs font-medium text-foreground mt-1">{t.flightRef}</div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-sm text-foreground">{t.fromText}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground">{t.toText}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">{t.date}</span>
              </div>

              {/* El dato principal: la hora */}
              <div className="rounded-lg bg-muted/60 border border-border p-3 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {isDeparture ? 'Salir a las' : 'Salís del aeropuerto sobre las'}
                </div>
                {/* Casi siempre es una hora ("06:20"), pero en algún traslado es una
                    condición ("un bus que llegue antes de las 03:00"): si es larga,
                    se pinta a tamaño de frase para que no se coma la tarjeta. */}
                <div className={`font-bold text-foreground mt-0.5 ${t.leaveAt.length > 10 ? 'text-base leading-snug' : 'text-2xl'}`}>
                  {t.leaveAt}
                </div>
                {t.beAtAirportBy && (
                  <div className="text-xs font-medium text-travel-pending mt-0.5">
                    Estar en el aeropuerto a las {t.beAtAirportBy}
                  </div>
                )}
                <MoreInfo label="Por qué a esa hora">
                  <p>{t.leaveAtNote}</p>
                </MoreInfo>
              </div>

              {t.terminal && (
                <div className="flex items-start gap-1.5 text-[11px] text-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                  <span>{t.terminal}</span>
                </div>
              )}

              {/* Opciones para cubrirlo: la recomendada abierta, el resto plegado */}
              <div className="space-y-2">
                {t.options.filter(o => o.recommended).map(o => (
                  <div key={o.mode} className="rounded-lg border border-travel-confirmed bg-travel-confirmed-bg/40 p-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">⭐ {o.mode}</span>
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">{o.priceText}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{o.durationMinutes} min</div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-1">{o.notes}</p>
                  </div>
                ))}
              </div>

              {t.options.some(o => !o.recommended) && (
                <MoreInfo
                  label={
                    t.options.filter(o => !o.recommended).length === 1
                      ? 'Otra forma de ir'
                      : `Otras ${t.options.filter(o => !o.recommended).length} formas de ir`
                  }
                >
                  {t.options.filter(o => !o.recommended).map(o => (
                    <div key={o.mode}>
                      <p className="text-foreground font-medium">
                        {o.mode} · {o.priceText} · {o.durationMinutes} min
                      </p>
                      <p>{o.notes}</p>
                    </div>
                  ))}
                </MoreInfo>
              )}

              {t.addressForDriver && (
                <div className="mt-3 rounded-lg bg-muted p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    <Languages className="h-3 w-3" /> Para enseñar al taxista
                  </div>
                  <p className="text-xs text-foreground leading-snug select-all">{t.addressForDriver}</p>
                </div>
              )}

              {(t.warnings.length > 0 || t.hotelNote) && (
                <MoreInfo label="Avisos de este traslado" tone="warn">
                  {t.hotelNote && (
                    <p className="flex gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                      <span>{t.hotelNote}</span>
                    </p>
                  )}
                  {t.warnings.map((w, i) => (
                    <p key={i} className="flex gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-travel-pending mt-px flex-shrink-0" />
                      <span>{w.replace(/^[🔴⚠️]\s*/, '')}</span>
                    </p>
                  ))}
                </MoreInfo>
              )}
            </div>
          </div>
        );
      })}

      <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground pt-3">
        Dentro de la ciudad · {localTransports.length} traslados
      </h2>

      {localTransports.map(lt => (
        <div key={lt.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-4 w-4 text-secondary" />
            <span className="font-medium text-sm text-foreground">{lt.fromText}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-sm text-foreground">{lt.toText}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="bg-muted px-1.5 py-0.5 rounded">{lt.mode}</span>
            <span className="bg-muted px-1.5 py-0.5 rounded">{getCityName(lt.cityId)}</span>
          </div>

          {lt.date && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-foreground">{lt.date}</span>
            </div>
          )}
          {lt.suggestedTime && (
            <div className="flex items-start gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-snug text-foreground">{lt.suggestedTime}</p>
            </div>
          )}

          <div className="flex gap-4 text-xs">
            <span>Precio: {lt.price != null ? `${lt.price}€` : <PendingBadge />}</span>
            <span>Duración: {lt.durationMinutes != null ? `${lt.durationMinutes} min` : <PendingBadge />}</span>
          </div>
          {lt.notes && <MoreInfo label="Notas"><p>{lt.notes}</p></MoreInfo>}

          {editingId === lt.id ? (
            <div className="mt-3 flex gap-2 items-center">
              <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
              <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
              <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(lt.id)}>Guardar</Button>
            </div>
          ) : (
            (lt.price === null || lt.durationMinutes === null) && (
              <button
                onClick={() => { setEditingId(lt.id); setEditValues({ price: lt.price?.toString() || '', duration: lt.durationMinutes?.toString() || '' }); }}
                className="mt-2 text-xs text-primary font-medium"
              >
                ✏️ Editar datos
              </button>
            )
          )}
        </div>
      ))}
    </div>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}
