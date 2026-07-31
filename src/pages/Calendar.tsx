import { useMemo, useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { buildCalendar, groupByMonth, CalendarDay } from '@/lib/calendar';
import {
  Building2,
  Compass,
  Train,
  Car,
  Plane,
  Clock,
  Moon,
  LogIn,
  LogOut,
  Info,
} from 'lucide-react';

type Filter = 'all' | 'activities' | 'travel';

export default function Calendar() {
  const { data } = useTrip();
  const days = useMemo(() => buildCalendar(data), [data]);
  const [filter, setFilter] = useState<Filter>('all');
  const [openDay, setOpenDay] = useState<string | null>(null);

  const visible = days.filter(d => {
    if (filter === 'activities') return d.activities.length > 0;
    if (filter === 'travel') return d.isTravelDay || d.localTransports.length > 0;
    return true;
  });

  const months = groupByMonth(visible);
  const totalActivities = days.reduce((s, d) => s + d.activities.length, 0);
  const travelDays = days.filter(d => d.isTravelDay).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Del 8 oct al 1 nov · día a día, con hotel, excursiones y traslados
        </p>
      </div>

      {/* Resumen */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-2">
        <Stat value={String(days.length)} label="días en total" />
        <Stat value={String(totalActivities)} label="excursiones" />
        <Stat value={String(travelDays)} label="días de traslado" />
      </div>

      {/* Filtros */}
      <div className="px-4 flex gap-2 mb-4">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Todo</Chip>
        <Chip active={filter === 'activities'} onClick={() => setFilter('activities')}>Solo excursiones</Chip>
        <Chip active={filter === 'travel'} onClick={() => setFilter('travel')}>Solo traslados</Chip>
      </div>

      <div className="px-4 space-y-5">
        {months.map(m => (
          <div key={m.month}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{m.label}</h2>
            <div className="space-y-2">
              {m.days.map(d => (
                <DayRow
                  key={d.iso}
                  d={d}
                  open={openDay === d.iso}
                  onToggle={() => setOpenDay(openDay === d.iso ? null : d.iso)}
                />
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay días que cumplan ese filtro.</p>
        )}
      </div>
    </div>
  );
}

function DayRow({ d, open, onToggle }: { d: CalendarDay; open: boolean; onToggle: () => void }) {
  const hasDetail =
    d.activities.length > 0 ||
    d.transportLegs.length > 0 ||
    d.localTransports.length > 0 ||
    d.airportTransfers.length > 0 ||
    d.notes.length > 0;

  return (
    <div
      className={`bg-card rounded-xl border shadow-sm overflow-hidden ${
        d.isTravelDay ? 'border-primary/40' : 'border-border'
      }`}
    >
      <button
        onClick={onToggle}
        disabled={!hasDetail}
        className="w-full text-left px-3 py-2.5 flex items-start gap-3"
      >
        {/* Columna de fecha */}
        <div
          className={`flex-shrink-0 w-12 rounded-lg py-1 text-center ${
            d.isWeekend ? 'bg-primary/10' : 'bg-muted'
          }`}
        >
          <div className="text-lg font-bold text-foreground leading-none">{d.day}</div>
          <div className="text-[9px] text-muted-foreground uppercase mt-0.5">{d.weekdayShort}</div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {d.cityName ? (
              <span className="text-sm font-semibold text-foreground truncate">{d.cityName.split(' (')[0]}</span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground italic">En viaje</span>
            )}
            {d.isCheckIn && (
              <span className="text-[9px] bg-travel-confirmed-bg text-travel-confirmed px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <LogIn className="h-2.5 w-2.5" /> entrada
              </span>
            )}
            {d.isCheckOut && (
              <span className="text-[9px] bg-travel-pending-bg text-travel-pending px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <LogOut className="h-2.5 w-2.5" /> salida
              </span>
            )}
            {d.isDstChange && (
              <span className="text-[9px] bg-secondary/20 text-secondary-foreground px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" /> cambio de hora
              </span>
            )}
          </div>

          {d.hotel && (
            <div className="flex items-start gap-1 mt-0.5 min-w-0">
              <Moon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-muted-foreground leading-snug truncate min-w-0">
                {d.hotel.name}
              </span>
            </div>
          )}

          {/* Iconos-resumen de lo que pasa ese día */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {d.airportTransfers.length > 0 && (
              <Tag icon={<Plane className="h-2.5 w-2.5" />} text="vuelo" tone="primary" />
            )}
            {d.transportLegs.map(l => (
              <Tag key={l.id} icon={<Train className="h-2.5 w-2.5" />} text={l.mode.toLowerCase()} tone="primary" />
            ))}
            {d.activities.map(a => (
              <Tag key={a.id} icon={<Compass className="h-2.5 w-2.5" />} text={a.title.split(' (')[0]} tone="muted" />
            ))}
            {d.localTransports.length > 0 && d.transportLegs.length === 0 && (
              <Tag icon={<Car className="h-2.5 w-2.5" />} text={`${d.localTransports.length} traslado${d.localTransports.length > 1 ? 's' : ''}`} tone="muted" />
            )}
          </div>
        </div>

        {hasDetail && (
          <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-1">{open ? '▲' : '▼'}</span>
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border mt-1">
          {d.notes.map((n, i) => (
            <Detail key={`n-${i}`} icon={<Info className="h-3.5 w-3.5 text-primary" />} title="Nota del día" body={n} />
          ))}

          {d.airportTransfers.map(t => (
            <Detail
              key={t.id}
              icon={<Plane className="h-3.5 w-3.5 text-primary" />}
              title={`${t.fromText} → ${t.toText}`}
              body={`${t.flightRef}. ${
                t.direction === 'to_airport'
                  ? `Salir a las ${t.leaveAt}${t.beAtAirportBy ? `, estar en el aeropuerto a las ${t.beAtAirportBy}` : ''}.`
                  : `Salís de la terminal sobre las ${t.leaveAt}.`
              }`}
            />
          ))}

          {d.transportLegs.map(l => (
            <Detail
              key={l.id}
              icon={<Train className="h-3.5 w-3.5 text-primary" />}
              title={`${l.mode}${l.suggestedDeparture ? ` · ${l.suggestedDeparture.replace(/^⭐\s*/, '')}` : ''}`}
              body={l.estimatedArrival ?? l.notes.slice(0, 160)}
            />
          ))}

          {d.localTransports.map(l => (
            <Detail
              key={l.id}
              icon={<Car className="h-3.5 w-3.5 text-secondary" />}
              title={`${l.fromText} → ${l.toText} (${l.mode})`}
              body={l.suggestedTime ?? l.notes.slice(0, 160)}
            />
          ))}

          {d.activities.map(a => (
            <Detail
              key={a.id}
              icon={<Compass className="h-3.5 w-3.5 text-primary" />}
              title={a.title}
              body={`${a.recommendedDate ?? ''}${a.duration ? ` · ${a.duration}` : ''}${a.priceText ? ` · ${a.priceText}` : ''} — ${a.status}`}
            />
          ))}

          {d.hotel && (
            <Detail
              icon={<Building2 className="h-3.5 w-3.5 text-primary" />}
              title={d.hotel.name ?? 'Hotel'}
              body={`Check-in desde ${d.hotel.checkInTime ?? '—'} · check-out hasta ${d.hotel.checkOutTime ?? '—'}${
                d.hotel.depositCny ? ` · depósito de ¥${d.hotel.depositCny} al entrar` : ''
              }`}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-2 pt-2">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground leading-snug">{title}</div>
        <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{body}</div>
      </div>
    </div>
  );
}

function Tag({ icon, text, tone }: { icon: React.ReactNode; text: string; tone: 'primary' | 'muted' }) {
  return (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 max-w-[130px] ${
        tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {icon}
      <span className="truncate">{text}</span>
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-2.5 text-center shadow-sm">
      <div className="text-xl font-bold text-foreground leading-none">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}
