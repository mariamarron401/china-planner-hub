import { useTrip } from '@/context/TripContext';
import { Plane, Clock, Luggage, ArrowRight } from 'lucide-react';

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

      <div className="px-4 space-y-6">
        <FlightSection title="✈️ IDA — 9 OCT 2026" legs={outbound} />
        <FlightSection title="✈️ VUELTA — 1 NOV 2026" legs={returnFlights} />
      </div>
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
