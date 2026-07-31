import { useTrip } from '@/context/TripContext';
import { Plane, Clock, Luggage, ArrowRight, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FlightTimeline } from '@/types/trip';

export default function Flights() {
  const { data } = useTrip();
  const outbound = data.flights.filter(f => f.direction === 'outbound');
  const returnFlights = data.flights.filter(f => f.direction === 'return');

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">🛫 Vuelos</h1>
        <p className="text-sm text-muted-foreground mt-1">Air China · Economy · 2 piezas equipaje</p>
      </div>

      <div className="px-4 mb-4">
        <Link to="/transportes" className="flex items-center gap-2.5 bg-primary/10 border border-primary/30 rounded-xl px-3.5 py-3 text-primary">
          <Car className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold leading-tight">Traslados de aeropuerto</div>
            <div className="text-[11px] opacity-80 leading-tight">A qué hora salir del hotel, cómo ir y cuánto cuesta — en Transportes → Aeropuertos</div>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      </div>

      <div className="px-4 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">🕐 EL CAMBIO DE HORA, EXPLICADO</h2>
          <div className="space-y-4">
            {(data.flightTimelines ?? []).map(tl => (
              <TimelineCard key={tl.id} tl={tl} />
            ))}
            <DstCard />
          </div>
        </div>

        <FlightSection title="✈️ IDA — 9 OCT 2026" legs={outbound} />
        <FlightSection title="✈️ VUELTA — 1 NOV 2026" legs={returnFlights} />
      </div>
    </div>
  );
}

function TimelineCard({ tl }: { tl: FlightTimeline }) {
  const goingEast = tl.direction === 'outbound';

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className={`px-4 py-2.5 ${goingEast ? 'bg-primary/10' : 'bg-secondary/10'}`}>
        <div className="text-sm font-bold text-foreground">{tl.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{tl.spainOffset} · {tl.chinaOffset}</div>
      </div>

      <div className="p-4">
        {/* Las tres cifras que importan */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-travel-confirmed-bg">
            <div className="text-base font-bold text-travel-confirmed leading-tight">{tl.realDuration}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">viajando de verdad</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-base font-bold text-foreground leading-tight">{tl.clockDuration}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">lo que parece en el reloj</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-travel-pending-bg">
            <div className="text-base font-bold text-travel-pending leading-tight">{tl.clockJump}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">salta el reloj</div>
          </div>
        </div>

        {/* Doble reloj en cada escala */}
        <div className="rounded-lg border border-border overflow-hidden mb-3">
          <div className="grid grid-cols-[1fr_66px_66px] gap-2 px-2.5 py-1.5 bg-muted/60 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span />
            <span className="text-right">🇪🇸 España</span>
            <span className="text-right">🇨🇳 China</span>
          </div>
          {tl.milestones.map((m, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_66px_66px] gap-2 px-2.5 py-2 items-center ${
                i > 0 ? 'border-t border-border' : ''
              } ${m.dayChange ? 'bg-travel-pending-bg/40' : ''}`}
            >
              <span className="text-[11px] text-foreground leading-snug">{m.label}</span>
              <Stamp value={m.spainTime} highlight={m.dayChange && !goingEast} />
              <Stamp value={m.chinaTime} highlight={m.dayChange && goingEast} />
            </div>
          ))}
        </div>

        <p className="text-xs text-foreground leading-snug">{tl.summary}</p>

        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
          {tl.advice.map((a, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
              <span className="text-primary flex-shrink-0">→</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Fecha pequeña arriba y hora grande debajo, para que no se parta de cualquier manera. */
function Stamp({ value, highlight }: { value: string; highlight?: boolean }) {
  const [date, time] = value.split(' · ');
  return (
    <span className="text-right leading-tight">
      <span className={`block text-[9px] ${highlight ? 'font-bold text-travel-pending' : 'text-muted-foreground'}`}>
        {date}
      </span>
      <span className={`block text-[12px] font-mono ${highlight ? 'font-bold text-foreground' : 'text-foreground/80'}`}>
        {time}
      </span>
    </span>
  );
}

/** El detalle que explica por qué la diferencia es de 6 h a la ida y de 7 h a la vuelta. */
function DstCard() {
  return (
    <div className="bg-card rounded-xl border-2 border-travel-pending/40 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-travel-pending uppercase tracking-wide mb-2">
        <Clock className="h-3.5 w-3.5" /> ¿Por qué 6 h a la ida y 7 h a la vuelta?
      </div>
      <p className="text-xs text-foreground leading-snug">
        Porque <strong>el cambio de hora en España os pilla estando ya en China</strong>. El domingo{' '}
        <strong>25 de octubre</strong> a las 03:00 en España se atrasan los relojes a las 02:00 (entra el horario de invierno).
        Ese día vosotros estáis en <strong>Wulingyuan</strong> y no notáis nada, pero a partir de ese momento la diferencia
        con casa pasa de 6 a 7 horas.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-muted">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Del 10 al 24 oct</div>
          <div className="text-lg font-bold text-foreground">+6 h</div>
          <div className="text-[10px] text-muted-foreground leading-tight">China va 6 h por delante de España</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Del 25 oct al 1 nov</div>
          <div className="text-lg font-bold text-foreground">+7 h</div>
          <div className="text-[10px] text-muted-foreground leading-tight">China va 7 h por delante de España</div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mt-3">
        Práctico para llamar a casa: si en China es mediodía, en España son las 6 de la mañana (o las 5 después del día 25).
        En China no se cambia la hora nunca, es UTC+8 todo el año y en todo el país, aunque sea enorme.
      </p>
    </div>
  );
}

function FlightSection({ title, legs }: { title: string; legs: any[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">
        {legs.map((leg: any, idx: number) => (
          <div key={leg.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{leg.flightNumber}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{leg.airline}</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{leg.cabinClass}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{leg.fromAirport}</div>
                  <div className="text-xs text-muted-foreground">{leg.departureDateTime.split('T')[1]}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor(leg.durationMinutes / 60)}h {leg.durationMinutes % 60}m
                  </div>
                  <div className="w-full h-px bg-border relative my-1">
                    <ArrowRight className="h-3 w-3 text-primary absolute right-0 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{leg.toAirport}</div>
                  <div className="text-xs text-muted-foreground">{leg.arrivalDateTime.split('T')[1]}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Luggage className="h-3 w-3" />{leg.baggage}</span>
                {leg.layoverMinutes && (
                  <span className="bg-travel-pending-bg text-travel-pending px-2 py-0.5 rounded font-medium">
                    Escala: {Math.floor(leg.layoverMinutes / 60)}h {leg.layoverMinutes % 60}m
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
