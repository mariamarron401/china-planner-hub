import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight, MapPin, CalendarClock, Calendar, Clock, Luggage } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MoreInfo from '@/components/MoreInfo';

/**
 * Trenes entre ciudades: las fechas en que hay que entrar en Trip.com y la ficha
 * de cada tramo. Los traslados de aeropuerto y los de dentro de la ciudad están
 * en `TransfersView` (misma pantalla "Moverse", otra sub-pestaña).
 */
export default function TrainsView() {
  const { data, updateTransportLeg } = useTrip();
  const { cities, transportLegs } = data;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  // Fechas en que hay que estar atenta, calculadas en vivo contra el día de hoy
  // para que la cuenta atrás nunca quede desfasada.
  const watchDates = buildWatchDates(transportLegs, getCityName);
  const nextWatch = watchDates.find(w => w.daysLeft >= 0);

  const handleSave = (id: string) => {
    const price = editValues.price ? parseFloat(editValues.price) : null;
    const duration = editValues.duration ? parseInt(editValues.duration) : null;
    updateTransportLeg(id, {
      ...(price !== null && { price, status: 'known' as const }),
      ...(duration !== null && { durationMinutes: duration }),
    });
    setEditingId(null);
    setEditValues({ price: '', duration: '' });
  };

  return (
    <>
      {/* Lo único que hay que hacer hoy con los trenes: mirar el calendario */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">📅 Días en que tienes que estar atenta</h2>

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

          <MoreInfo label="Por qué hay dos fechas por tren">
            <p>
              Primero, en agosto, <span className="font-medium text-foreground">activar la pre-reserva</span> en
              Trip.com (60 días antes del viaje): Trip.com compra sola en cuanto China abra la venta.
            </p>
            <p>
              Después, ya en octubre,{' '}
              <span className="font-medium text-foreground">comprobar que el billete se emitió de verdad</span> (15 días
              antes, que es cuando 12306 abre la venta real).
            </p>
            <p>
              Si alguna fecha de agosto todavía no la acepta Trip.com, reintenta al día siguiente: su ventana es de
              59-60 días según el momento. El cambio de hotel Zhangjiajie → Wulingyuan del 24 oct no sale aquí: es un
              Didi que se pide en el momento.
            </p>
          </MoreInfo>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {transportLegs.map((leg, idx) => (
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

            {(leg.fromStation || leg.toStation) && (
              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-foreground">
                  <div><span className="text-muted-foreground">Escribe en Trip.com — Origen:</span> <span className="font-medium">{leg.fromStation}</span></div>
                  <div><span className="text-muted-foreground">Destino:</span> <span className="font-medium">{leg.toStation}</span></div>
                </div>
              </div>
            )}

            {leg.alertNote && (
              <div className="mt-2.5 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg">
                {leg.alertNote}
              </div>
            )}

            {/* El detalle largo (maletas, márgenes, notas) queda plegado */}
            {(leg.transferBefore || leg.transferAfter || leg.stationBuffer || leg.notes || leg.saleOpensOn) && (
              <MoreInfo label="Maletas, márgenes y notas del tramo">
                {leg.transferBefore && (
                  <p className="flex gap-1.5">
                    <Luggage className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                    <span><span className="text-foreground font-medium">Antes del tren:</span> {leg.transferBefore}</span>
                  </p>
                )}
                {leg.stationBuffer && (
                  <p><span className="text-foreground font-medium">Margen en la estación:</span> {leg.stationBuffer}</p>
                )}
                {leg.transferAfter && (
                  <p><span className="text-foreground font-medium">Después del tren:</span> {leg.transferAfter}</p>
                )}
                {leg.saleOpensOn && (
                  <p>
                    Si haces la pre-reserva en la fecha de arriba, Trip.com la compra sola en cuanto China abra la venta
                    real (será a partir del <span className="font-medium text-foreground">{leg.saleOpensOn}</span>). Si
                    no la hiciste a tiempo, entra tú ese día a comprarla a mano.
                  </p>
                )}
                {leg.notes && <p>{leg.notes}</p>}
              </MoreInfo>
            )}

            {editingId === leg.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(leg.id)}>Guardar</Button>
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
      </div>
    </>
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

export function buildWatchDates(
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
      <span className={`font-mono font-bold w-[74px] flex-shrink-0 whitespace-nowrap ${today ? 'text-travel-pending' : 'text-primary'}`}>
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
