import { useTrip } from '@/context/TripContext';
import { usePendingItems } from '@/hooks/usePendingItems';
import { getGlobalBudget, isAppTaskComplete } from '@/lib/calculations';
import { buildNextActions, countdownLabel, formatDateLabel } from '@/lib/nextUp';
import { Link } from 'react-router-dom';
import {
  Moon, Users, ChevronRight, Hourglass, CalendarRange, Route, Compass, ListTodo,
  MapPin, Bell,
} from 'lucide-react';

/**
 * Inicio = una sola pregunta respondida: "¿qué me toca hacer ahora?".
 * El detalle de cada cosa vive en su pantalla; aquí solo el titular y el enlace.
 */
export default function Dashboard() {
  const { data, orderedCities } = useTrip();
  const { items: pendingItems } = usePendingItems();
  const { trip, cities, hotels, selectedHotels, flights } = data;

  const budget = getGlobalBudget(cities, hotels, selectedHotels);
  const openPending = pendingItems.filter(p => p.status === 'open').length;
  const appsTasks = data.appSetup.tasks.filter(t => t.group !== 'descartada');
  const appsPending = appsTasks.filter(t => !isAppTaskComplete(t)).length;

  const actions = buildNextActions(data, pendingItems);
  const next = actions[0];
  const following = actions.slice(1, 4);

  // Cuenta atrás hasta la salida del vuelo de ida.
  const departureDate = flights.find(f => f.direction === 'outbound')?.departureDateTime;
  let daysToGo: number | null = null;
  if (departureDate) {
    const dep = new Date(departureDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    daysToGo = Math.round((dep.getTime() - startOfToday.getTime()) / 86400000);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero px-5 pt-12 pb-7 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">{trip.title}</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">{trip.dateRangeText}</p>

        {daysToGo !== null && daysToGo >= 0 && (
          <div className="mt-4 flex items-baseline gap-2 bg-primary-foreground/15 rounded-2xl px-4 py-3">
            <Hourglass className="h-5 w-5 text-primary-foreground/80 self-center" />
            <span className="text-3xl font-extrabold text-primary-foreground leading-none">{daysToGo}</span>
            <span className="text-primary-foreground/80 text-sm">{daysToGo === 1 ? 'día para el viaje' : 'días para el viaje'}</span>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <StatPill icon={<Moon className="h-4 w-4" />} value={`${trip.totalNights} noches`} />
          <StatPill icon={<MapPin className="h-4 w-4" />} value={`${cities.length} ciudades`} />
          <StatPill icon={<Users className="h-4 w-4" />} value={`${trip.travelers} viajeros`} />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* LO SIGUIENTE QUE TOCA — la única cosa urgente de la pantalla */}
        {next ? (
          <Link
            to={next.to}
            className="block bg-card rounded-2xl border-2 border-primary/40 p-4 shadow-sm animate-fade-in"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Bell className="h-3.5 w-3.5" /> Lo siguiente que te toca
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-foreground leading-none">
                {countdownLabel(next.daysLeft)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDateLabel(next.iso)}</span>
            </div>
            <p className="text-sm text-foreground leading-snug mt-1.5">{next.title}</p>
            <span className="text-xs font-medium text-primary mt-2 inline-flex items-center">
              Ver qué hacer <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm text-sm text-muted-foreground">
            No queda nada con fecha pendiente. 🎉
          </div>
        )}

        {/* Las 3 siguientes, en una línea cada una */}
        {following.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
            {following.map(a => (
              <Link key={a.id} to={a.to} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-[11px] font-mono font-bold text-primary w-[68px] shrink-0 whitespace-nowrap">
                  {formatDateLabel(a.iso)}
                </span>
                <span className="text-xs text-foreground leading-snug flex-1 line-clamp-2">{a.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Ruta, de un vistazo */}
        <Link to="/plan/ciudades" className="block bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            <Route className="h-3.5 w-3.5" /> La ruta
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {orderedCities.map((c, i) => (
              <span key={c.id} className="flex items-center gap-1">
                <span className="text-[13px] font-medium text-foreground">{c.cityName.split(' (')[0]}</span>
                {i < orderedCities.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </Link>

        {/* Las 4 secciones, con lo que queda por hacer en cada una */}
        <div className="grid grid-cols-2 gap-3">
          <BigLink
            to="/plan/dias"
            icon={<CalendarRange className="h-5 w-5" />}
            label="Plan"
            hint="Día a día, ciudades y hoteles"
          />
          <BigLink
            to="/moverse/trayectos"
            icon={<Route className="h-5 w-5" />}
            label="Moverse"
            hint="Trenes, traslados y vuelos"
          />
          <BigLink
            to="/descubrir/actividades"
            icon={<Compass className="h-5 w-5" />}
            label="Qué hacer"
            hint={`${data.activities.length} actividades y sitios`}
          />
          <BigLink
            to="/gestiones/pendientes"
            icon={<ListTodo className="h-5 w-5" />}
            label="Por hacer"
            hint={`${openPending} pendientes · ${appsPending} apps`}
            badge={openPending + appsPending}
          />
        </div>

        {/* Dinero, en una línea */}
        <Link to="/gestiones/dinero" className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3 shadow-sm">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Hoteles</div>
            <div className="text-lg font-bold text-foreground leading-tight">
              {budget.allSelected ? `${budget.selectedTotal}€` : `~${budget.avgTotal}€`}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ~{budget.avgPerNight}€/noche
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

function StatPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-3 py-1.5">
      <span className="text-primary-foreground/80">{icon}</span>
      <span className="text-primary-foreground font-semibold text-xs">{value}</span>
    </div>
  );
}

function BigLink({
  to,
  icon,
  label,
  hint,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  badge?: number;
}) {
  return (
    <Link to={to} className="relative bg-card rounded-xl border border-border p-4 shadow-sm">
      {!!badge && (
        <span className="absolute top-2.5 right-2.5 min-w-[20px] h-5 px-1.5 rounded-full bg-travel-important text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      <span className="text-primary">{icon}</span>
      <div className="text-sm font-bold text-foreground mt-2">{label}</div>
      <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{hint}</div>
    </Link>
  );
}
