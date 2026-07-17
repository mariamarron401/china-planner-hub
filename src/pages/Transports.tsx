import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight, MapPin, CalendarClock, Calendar, Clock, Luggage, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Transports() {
  const { data, updateTransportLeg, updateLocalTransport } = useTrip();
  const { cities, transportLegs, localTransports } = data;
  const [tab, setTab] = useState<'inter' | 'local'>('inter');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  const handleSave = (id: string, type: 'inter' | 'local') => {
    const price = editValues.price ? parseFloat(editValues.price) : null;
    const duration = editValues.duration ? parseInt(editValues.duration) : null;
    if (type === 'inter') {
      updateTransportLeg(id, {
        ...(price !== null && { price, status: 'known' as const }),
        ...(duration !== null && { durationMinutes: duration }),
      });
    } else {
      updateLocalTransport(id, {
        ...(price !== null && { price }),
        ...(duration !== null && { durationMinutes: duration }),
      });
    }
    setEditingId(null);
    setEditValues({ price: '', duration: '' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Transportes</h1>
      </div>

      <div className="px-4 mb-4">
        <Link to="/trayectos" className="flex items-center gap-2.5 bg-primary/10 border border-primary/30 rounded-xl px-3.5 py-3 text-primary">
          <Waypoints className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold leading-tight">Ver esquema puerta a puerta</div>
            <div className="text-[11px] opacity-80 leading-tight">Hotel → Didi → estación → tren → estación → Didi → hotel, con horas y distancias</div>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      </div>

      <div className="px-4 flex gap-2 mb-4">
        <button
          onClick={() => setTab('inter')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            tab === 'inter' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Train className="h-3.5 w-3.5" /> Entre ciudades ({transportLegs.length})
        </button>
        <button
          onClick={() => setTab('local')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            tab === 'local' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Car className="h-3.5 w-3.5" /> Locales ({localTransports.length})
        </button>
      </div>

      {tab === 'inter' && (
        <div className="px-4 mb-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-2">📅 Calendario de agosto — cuándo entrar en Trip.com</h2>
            <p className="text-[11px] text-muted-foreground mb-3">Los 8 tramos, en el orden en que os van a tocar. Cada día, entra en Trip.com y activa la reserva anticipada de ese tramo (estaciones exactas en la tarjeta de abajo).</p>
            <div className="space-y-1.5">
              {transportLegs.map((leg, idx) => (
                <div key={leg.id} className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-primary w-20 flex-shrink-0">{leg.preBookingFrom}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground">{getCityName(leg.fromCityId)} → {getCityName(leg.toCityId)}</span>
                  <span className="text-muted-foreground text-[10px] ml-auto flex-shrink-0">(viaje {leg.travelDate?.split(' (')[0]})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-3">
        {tab === 'inter' && transportLegs.map((leg, idx) => (
          <div key={leg.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Train className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-foreground">{getCityName(leg.fromCityId)}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-sm text-foreground">{getCityName(leg.toCityId)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Tramo {idx + 1}/8</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="bg-muted px-1.5 py-0.5 rounded">{leg.mode}</span>
            </div>

            {leg.preBookingFrom && (
              <div className="mb-2 bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 flex-shrink-0" />
                <div className="text-xs leading-tight">
                  <div className="opacity-80">Entra tú en Trip.com este día:</div>
                  <div className="text-sm font-bold">{leg.preBookingFrom}</div>
                </div>
              </div>
            )}

            {leg.travelDate && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">Viaje: {leg.travelDate}</span>
              </div>
            )}

            {(leg.suggestedDeparture || leg.estimatedArrival) && (
              <div className="flex items-start gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-foreground">
                  <div><span className="text-muted-foreground">Salida:</span> <span className="font-medium">{leg.suggestedDeparture}</span></div>
                  <div><span className="text-muted-foreground">Llegada:</span> <span className="font-medium">{leg.estimatedArrival}</span></div>
                </div>
              </div>
            )}

            <div className="flex gap-4 text-xs mt-1">
              <span>Precio: {leg.price != null ? `${leg.price}€` : <PendingBadge />}</span>
              <span>Duración: {leg.durationMinutes != null ? `${leg.durationMinutes} min` : <PendingBadge />}</span>
            </div>
            {leg.notes && <div className="text-[11px] text-muted-foreground mt-1">{leg.notes}</div>}

            {(leg.fromStation || leg.toStation) && (
              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-foreground">
                  <div><span className="text-muted-foreground">Escribe en Trip.com — Origen:</span> <span className="font-medium">{leg.fromStation}</span></div>
                  <div><span className="text-muted-foreground">Destino:</span> <span className="font-medium">{leg.toStation}</span></div>
                </div>
              </div>
            )}

            {(leg.transferBefore || leg.transferAfter || leg.stationBuffer) && (
              <div className="mt-2 flex items-start gap-1.5">
                <Luggage className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-muted-foreground space-y-0.5">
                  {leg.transferBefore && <p><span className="text-foreground font-medium">Antes del tren:</span> {leg.transferBefore}</p>}
                  {leg.stationBuffer && <p><span className="text-foreground font-medium">Margen en la estación:</span> {leg.stationBuffer}</p>}
                  {leg.transferAfter && <p><span className="text-foreground font-medium">Después del tren:</span> {leg.transferAfter}</p>}
                </div>
              </div>
            )}

            {leg.saleOpensOn && (
              <div className="mt-2 flex items-start gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Si haces la pre-reserva en la fecha de arriba, Trip.com la compra sola en cuanto China abra la venta real (será a partir del <span className="font-medium text-foreground">{leg.saleOpensOn}</span>). Si no la hiciste a tiempo, entra tú ese día a comprarla a mano.
                </p>
              </div>
            )}

            {leg.alertNote && (
              <div className="mt-2.5 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg">
                {leg.alertNote}
              </div>
            )}

            {editingId === leg.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(leg.id, 'inter')}>Guardar</Button>
              </div>
            ) : (
              (leg.price === null || leg.durationMinutes === null) && (
                <button
                  onClick={() => { setEditingId(leg.id); setEditValues({ price: leg.price?.toString() || '', duration: leg.durationMinutes?.toString() || '' }); }}
                  className="mt-2 text-xs text-primary font-medium"
                >
                  ✏️ Editar datos
                </button>
              )
            )}
          </div>
        ))}

        {tab === 'local' && localTransports.map(lt => (
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
            {lt.notes && <div className="text-xs text-muted-foreground mt-1">📝 {lt.notes}</div>}

            {editingId === lt.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(lt.id, 'local')}>Guardar</Button>
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
    </div>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}
