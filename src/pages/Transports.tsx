import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight, MapPin, CalendarClock, Calendar, Clock, Luggage, Waypoints, Plane, PlaneLanding, PlaneTakeoff, AlertTriangle, Building2, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Transports() {
  const { data, updateTransportLeg, updateLocalTransport } = useTrip();
  const { cities, transportLegs, localTransports, airportTransfers } = data;
  const [tab, setTab] = useState<'inter' | 'local' | 'airport'>('inter');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  // Fechas en que hay que estar atenta, calculadas en vivo contra el día de hoy
  // para que la cuenta atrás nunca quede desfasada.
  const watchDates = buildWatchDates(transportLegs, getCityName);
  const nextWatch = watchDates.find(w => w.daysLeft >= 0);

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
        <button
          onClick={() => setTab('airport')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            tab === 'airport' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Plane className="h-3.5 w-3.5" /> Aeropuertos ({airportTransfers.length})
        </button>
      </div>

      {tab === 'inter' && (
        <div className="px-4 mb-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-1">📅 Días en que tienes que estar atenta</h2>

            {nextWatch ? (
              <div className="mt-2 mb-3 rounded-lg bg-primary text-primary-foreground px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide opacity-80">Lo siguiente que te toca</div>
                <div className="text-sm font-bold leading-tight mt-0.5">
                  {nextWatch.daysLeft === 0
                    ? '¡HOY!'
                    : nextWatch.daysLeft === 1
                    ? 'Mañana'
                    : `Faltan ${nextWatch.daysLeft} días`}
                  {' · '}{nextWatch.dateLabel}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {nextWatch.kind === 'pre'
                    ? `Activar la pre-reserva en Trip.com: ${nextWatch.label}`
                    : `Comprobar que el billete se emitió: ${nextWatch.label}`}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-travel-confirmed mt-1 mb-3">
                ✅ Ya han pasado todas las fechas de la lista: solo queda comprobar que los billetes están emitidos.
              </p>
            )}

            <p className="text-[11px] text-muted-foreground mb-3">
              Dos cosas distintas por tramo. Primero, en agosto, <span className="font-medium text-foreground">activar la pre-reserva</span> en
              Trip.com (60 días antes del viaje): Trip.com compra sola en cuanto China abra la venta. Después, ya en
              octubre, <span className="font-medium text-foreground">comprobar que el billete se emitió de verdad</span> (15 días
              antes, que es cuando 12306 abre la venta real). Si alguna fecha de agosto todavía no la acepta Trip.com,
              reintenta al día siguiente: su ventana es de 59-60 días según el momento. El cambio de hotel
              Zhangjiajie → Wulingyuan del 24 oct no sale aquí: es un Didi que se pide en el momento.
            </p>

            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Agosto · activar pre-reserva
            </div>
            <div className="space-y-1.5">
              {watchDates.filter(w => w.kind === 'pre').map(w => (
                <WatchRow key={`p-${w.id}`} w={w} />
              ))}
            </div>

            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1.5">
              Sept-oct · comprobar que el billete salió
            </div>
            <div className="space-y-1.5">
              {watchDates.filter(w => w.kind === 'sale').map(w => (
                <WatchRow key={`s-${w.id}`} w={w} />
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
                {leg.fromStation || leg.toStation
                  ? <Train className="h-4 w-4 text-primary" />
                  : <Car className="h-4 w-4 text-amber-600" />}
                <span className="font-medium text-sm text-foreground">{getCityName(leg.fromCityId)}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-sm text-foreground">{getCityName(leg.toCityId)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Tramo {idx + 1}/{transportLegs.length}</span>
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

        {tab === 'airport' && airportTransfers.map(t => {
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
                  <div className="text-2xl font-bold text-foreground mt-0.5">{t.leaveAt}</div>
                  {t.beAtAirportBy && (
                    <div className="text-xs font-medium text-travel-pending mt-0.5">
                      Estar en el aeropuerto a las {t.beAtAirportBy}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1.5">{t.leaveAtNote}</p>
                </div>

                {t.terminal && (
                  <div className="flex items-start gap-1.5 text-[11px] text-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                    <span>{t.terminal}</span>
                  </div>
                )}

                {/* Opciones para cubrirlo */}
                <div className="space-y-2">
                  {t.options.map(o => (
                    <div
                      key={o.mode}
                      className={`rounded-lg border p-2.5 ${
                        o.recommended ? 'border-travel-confirmed bg-travel-confirmed-bg/40' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {o.recommended && '⭐ '}{o.mode}
                        </span>
                        <span className="text-xs font-medium text-foreground whitespace-nowrap">{o.priceText}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{o.durationMinutes} min</div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-1">{o.notes}</p>
                    </div>
                  ))}
                </div>

                {t.hotelNote && (
                  <div className="flex items-start gap-1.5 mt-3 text-[11px] text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                    <span>{t.hotelNote}</span>
                  </div>
                )}

                {t.addressForDriver && (
                  <div className="mt-3 rounded-lg bg-muted p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      <Languages className="h-3 w-3" /> Para enseñar al taxista
                    </div>
                    <p className="text-xs text-foreground leading-snug select-all">{t.addressForDriver}</p>
                  </div>
                )}

                {t.warnings.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {t.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-travel-pending mt-px flex-shrink-0" />
                        <span>{w.replace(/^[🔴⚠️]\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

interface WatchDate {
  id: string;
  /** 'pre' = activar la pre-reserva en Trip.com (D-60). 'sale' = comprobar que el billete salió (D-15). */
  kind: 'pre' | 'sale';
  iso: string;
  /** Ej. "vie 14 ago" */
  dateLabel: string;
  /** Ej. "Beijing → Xi'an" */
  label: string;
  /** Ej. "13 oct" */
  travelLabel: string;
  /** Días desde hoy: 0 = hoy, negativo = ya pasó. */
  daysLeft: number;
  /** true en los tramos con riesgo alto (pocos trenes o Golden Week). */
  critical: boolean;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** Días de calendario entre hoy y una fecha ISO, ignorando la hora. */
function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86400000);
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} ${MESES[m - 1]}`;
}

function buildWatchDates(
  legs: { id: string; fromCityId: string; toCityId: string; preBookingIso?: string; saleOpensIso?: string; travelDate?: string; alertNote?: string }[],
  getCityName: (id: string) => string,
): WatchDate[] {
  const out: WatchDate[] = [];
  for (const leg of legs) {
    const label = `${getCityName(leg.fromCityId)} → ${getCityName(leg.toCityId)}`;
    const travelLabel = leg.travelDate?.split(' (')[0] ?? '';
    const critical = (leg.alertNote ?? '').includes('🔴🔴') || (leg.alertNote ?? '').includes('MÁS CRÍTICO');
    if (leg.preBookingIso) {
      out.push({ id: leg.id, kind: 'pre', iso: leg.preBookingIso, dateLabel: formatDateLabel(leg.preBookingIso), label, travelLabel, daysLeft: daysUntil(leg.preBookingIso), critical });
    }
    if (leg.saleOpensIso) {
      out.push({ id: leg.id, kind: 'sale', iso: leg.saleOpensIso, dateLabel: formatDateLabel(leg.saleOpensIso), label, travelLabel, daysLeft: daysUntil(leg.saleOpensIso), critical });
    }
  }
  return out.sort((a, b) => a.iso.localeCompare(b.iso));
}

function WatchRow({ w }: { w: WatchDate }) {
  const past = w.daysLeft < 0;
  const today = w.daysLeft === 0;
  return (
    <div className={`flex items-center gap-2 text-xs ${past ? 'opacity-45' : ''}`}>
      <span className={`font-mono font-bold w-[68px] flex-shrink-0 ${today ? 'text-travel-pending' : 'text-primary'}`}>
        {w.dateLabel}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="text-foreground truncate">
        {w.critical && <span title="Tramo con pocos trenes: no fallar este día">🔴 </span>}
        {w.label}
      </span>
      <span className={`text-[10px] ml-auto flex-shrink-0 font-medium ${today ? 'text-travel-pending' : 'text-muted-foreground'}`}>
        {today ? '¡HOY!' : past ? 'ya pasó' : w.daysLeft === 1 ? 'mañana' : `en ${w.daysLeft} d`}
      </span>
    </div>
  );
}
