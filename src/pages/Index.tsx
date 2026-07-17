import { useTrip } from '@/context/TripContext';
import { usePendingItems } from '@/hooks/usePendingItems';
import { getGlobalBudget } from '@/lib/calculations';
import { Link } from 'react-router-dom';
import { MapPin, Moon, Users, Wallet, AlertCircle, CalendarDays, ChevronRight, ListTodo, Compass, Plane, ArrowLeftRight, TrainFront, Hourglass } from 'lucide-react';

export default function Dashboard() {
  const { data, orderedCities, toggleRouteDirection } = useTrip();
  const { items: pendingItems } = usePendingItems();
  const { trip, cities, hotels, selectedHotels, activities, flights, transportLegs } = data;
  const budget = getGlobalBudget(cities, hotels, selectedHotels);
  const openPending = pendingItems.filter(p => p.status === 'open');
  const outbound = flights.filter(f => f.direction === 'outbound');
  const returnFlights = flights.filter(f => f.direction === 'return');
  const firstCity = orderedCities[0];
  const lastCity = orderedCities[orderedCities.length - 1];
  const cityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  // Cuenta atrás hasta la salida del vuelo de ida.
  const departureDate = outbound[0]?.departureDateTime;
  let daysToGo: number | null = null;
  if (departureDate) {
    const dep = new Date(departureDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    daysToGo = Math.round((dep.getTime() - startOfToday.getTime()) / 86400000);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-5 pt-12 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">{trip.title}</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">{trip.dateRangeText}</p>

        {daysToGo !== null && daysToGo >= 0 && (
          <div className="mt-4 flex items-baseline gap-2 bg-primary-foreground/15 rounded-2xl px-4 py-3">
            <Hourglass className="h-5 w-5 text-primary-foreground/80 self-center" />
            <span className="text-3xl font-extrabold text-primary-foreground leading-none">{daysToGo}</span>
            <span className="text-primary-foreground/80 text-sm">{daysToGo === 1 ? 'día para el viaje' : 'días para el viaje'}</span>
          </div>
        )}

        <div className="flex gap-4 mt-5">
          <StatPill icon={<Moon className="h-4 w-4" />} value={trip.totalNights} label="noches" />
          <StatPill icon={<MapPin className="h-4 w-4" />} value={cities.length} label="ciudades" />
          <StatPill icon={<Users className="h-4 w-4" />} value={trip.travelers} label="viajeros" />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Flights summary */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Plane className="h-3.5 w-3.5" /> Vuelos
          </div>
          <div className="space-y-2 text-sm">
            {outbound.length > 0 && (
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">IDA</span>
                {outbound[0].fromAirport} → {outbound[outbound.length - 1].toAirport}
                <span className="text-xs text-muted-foreground ml-auto">{outbound[0].departureDateTime.split('T')[0]}</span>
              </div>
            )}
            {returnFlights.length > 0 && (
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded font-medium">VUELTA</span>
                {returnFlights[0].fromAirport} → {returnFlights[returnFlights.length - 1].toAirport}
                <span className="text-xs text-muted-foreground ml-auto">{returnFlights[0].departureDateTime.split('T')[0]}</span>
              </div>
            )}
          </div>
          <Link to="/vuelos" className="text-xs text-primary font-medium mt-2 inline-block">Ver detalle →</Link>
        </div>

        {/* Route card */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: '0.03s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Compass className="h-3.5 w-3.5" /> Ruta
            </div>
            <button onClick={toggleRouteDirection}
              className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full transition-all hover:bg-primary/20">
              <ArrowLeftRight className="h-3 w-3" />
              {firstCity?.cityName.split(' (')[0]} → {lastCity?.cityName.split(' (')[0]}
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {orderedCities.map((c, i) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">{c.cityName.split(' (')[0]}</span>
                {i < orderedCities.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>

        {/* Trenes internos / trayectos */}
        {transportLegs.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: '0.04s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <TrainFront className="h-3.5 w-3.5" /> Trenes internos
              </div>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{transportLegs.length} tramos</span>
            </div>
            <div className="space-y-2.5">
              {transportLegs.slice(0, 3).map(leg => (
                <div key={leg.id} className="text-sm">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <span>{cityName(leg.fromCityId)}</span>
                    <TrainFront className="h-3 w-3 text-primary flex-shrink-0" />
                    <span>{cityName(leg.toCityId)}</span>
                    {leg.travelDate && <span className="text-[11px] text-muted-foreground ml-auto">{leg.travelDate.replace(/\s*\(.*\)/, '')}</span>}
                  </div>
                  {leg.suggestedDeparture && (
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{leg.suggestedDeparture.replace(/^⭐\s*/, 'Salida ')}</p>
                  )}
                </div>
              ))}
            </div>
            <Link to="/trayectos" className="text-xs text-primary font-medium mt-3 inline-block">Ver los {transportLegs.length} tramos puerta a puerta →</Link>
          </div>
        )}

        {/* Budget preview */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Wallet className="h-3.5 w-3.5" /> Presupuesto hoteles
          </div>
          {budget.allSelected ? (
            <div>
              <span className="text-2xl font-bold text-foreground">{budget.selectedTotal}€</span>
              <span className="text-sm text-muted-foreground ml-2">total seleccionado</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <BudgetMini label="Mínimo" value={`${budget.minTotal}€`} />
              <BudgetMini label="Promedio" value={`${budget.avgTotal}€`} />
              <BudgetMini label="Máximo" value={`${budget.maxTotal}€`} />
            </div>
          )}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>~{budget.avgPerNight}€/noche</span>
            <span>~{budget.avgPerPersonPerNight}€/persona/noche</span>
          </div>
        </div>

        {/* Pending items */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <AlertCircle className="h-3.5 w-3.5" /> Pendientes
            </div>
            <span className="bg-travel-pending-bg text-travel-pending text-xs font-bold px-2 py-0.5 rounded-full">{openPending.length}</span>
          </div>
          <div className="space-y-2">
            {openPending.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-start gap-2">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${p.priority === 'high' ? 'bg-travel-important' : 'bg-travel-pending'}`} />
                <span className="text-sm text-foreground">{p.title}</span>
              </div>
            ))}
            {openPending.length > 3 && (
              <Link to="/pendientes" className="text-xs text-primary font-medium">Ver {openPending.length - 3} más →</Link>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <QuickLink to="/itinerario" icon={<CalendarDays className="h-5 w-5" />} label="Itinerario" />
          <QuickLink to="/vuelos" icon={<Plane className="h-5 w-5" />} label="Vuelos" />
          <QuickLink to="/actividades" icon={<Compass className="h-5 w-5" />} label={`Actividades (${activities.length})`} />
          <QuickLink to="/pendientes" icon={<ListTodo className="h-5 w-5" />} label={`Pendientes (${openPending.length})`} />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-3 py-1.5">
      <span className="text-primary-foreground/80">{icon}</span>
      <span className="text-primary-foreground font-bold text-sm">{value}</span>
      <span className="text-primary-foreground/70 text-xs">{label}</span>
    </div>
  );
}

function BudgetMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
}
