import { useTrip } from '@/context/TripContext';
import { getGlobalBudget } from '@/lib/calculations';
import { Wallet, Building2, Train, Compass, AlertTriangle, Plane, Shield, Package } from 'lucide-react';
import { useState } from 'react';

export default function Budget() {
  const { data, updateBudgetExtras } = useTrip();
  const { cities, hotels, selectedHotels, transportLegs, localTransports, activities, budgetExtras, trip } = data;
  const budget = getGlobalBudget(cities, hotels, selectedHotels);

  const transportTotal = [...transportLegs, ...localTransports].reduce((sum, t) => {
    if ('price' in t && t.price != null) return sum + t.price;
    return sum;
  }, 0);
  const transportComplete = [...transportLegs, ...localTransports].every(t => t.price != null);

  const activitiesTotal = activities.reduce((sum, a) => (a.price != null ? sum + a.price : sum), 0);
  const activitiesComplete = activities.every(a => a.price != null);

  const hotelTotal = budget.allSelected ? budget.selectedTotal : budget.avgTotal;
  const totalKnown = budgetExtras.flightsInsurance + hotelTotal + transportTotal + activitiesTotal
    + budgetExtras.transportExtra + budgetExtras.activitiesExtra + budgetExtras.insurance + budgetExtras.others;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Presupuesto</h1>
        <p className="text-sm text-muted-foreground mt-1">Para {trip.travelers} viajeros · {trip.totalNights} noches</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Flights + Insurance */}
        <BudgetCard
          icon={<Plane className="h-3.5 w-3.5" />}
          title="Vuelos + Seguro"
          subtitle="Ya pagado: 1.011€ por persona"
        >
          <div className="text-2xl font-bold text-foreground">{budgetExtras.flightsInsurance}€</div>
          <EditableAmount
            label="Total vuelos"
            value={budgetExtras.flightsInsurance}
            onChange={v => updateBudgetExtras({ flightsInsurance: v })}
          />
        </BudgetCard>

        {/* Hotels */}
        <BudgetCard icon={<Building2 className="h-3.5 w-3.5" />} title="Hoteles">
          {budget.allSelected ? (
            <div>
              <div className="text-2xl font-bold text-foreground">{budget.selectedTotal}€</div>
              <div className="text-xs text-travel-confirmed font-medium mt-1">✅ Todos seleccionados</div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <BudgetBlock label="Mínimo" value={`${budget.minTotal}€`} />
                <BudgetBlock label="Promedio" value={`${budget.avgTotal}€`} highlight />
                <BudgetBlock label="Máximo" value={`${budget.maxTotal}€`} />
              </div>
              <div className="text-xs text-travel-pending font-medium">⚠ Sin hotel seleccionado en todas las ciudades</div>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>~{budget.avgPerNight}€/noche</div>
            <div>~{budget.avgPerPersonPerNight}€/pers/noche</div>
          </div>
        </BudgetCard>

        {/* Transport */}
        <BudgetCard icon={<Train className="h-3.5 w-3.5" />} title="Transportes">
          {transportComplete ? (
            <div className="text-2xl font-bold text-foreground">{transportTotal + budgetExtras.transportExtra}€</div>
          ) : (
            <div>
              <div className="text-lg font-bold text-foreground">{transportTotal > 0 ? `${transportTotal}€ parcial` : '—'}</div>
              <div className="text-xs text-travel-pending font-medium mt-1">⚠ Datos incompletos</div>
            </div>
          )}
          <EditableAmount label="Extra transporte" value={budgetExtras.transportExtra} onChange={v => updateBudgetExtras({ transportExtra: v })} />
        </BudgetCard>

        {/* Activities */}
        <BudgetCard icon={<Compass className="h-3.5 w-3.5" />} title="Actividades">
          {activitiesComplete ? (
            <div className="text-2xl font-bold text-foreground">{activitiesTotal + budgetExtras.activitiesExtra}€</div>
          ) : (
            <div>
              <div className="text-lg font-bold text-foreground">{activitiesTotal > 0 ? `${activitiesTotal}€ parcial` : '—'}</div>
              <div className="text-xs text-travel-pending font-medium mt-1">⚠ Datos incompletos</div>
            </div>
          )}
          <EditableAmount label="Extra actividades" value={budgetExtras.activitiesExtra} onChange={v => updateBudgetExtras({ activitiesExtra: v })} />
        </BudgetCard>

        {/* Insurance */}
        <BudgetCard icon={<Shield className="h-3.5 w-3.5" />} title="Seguro (separado)">
          <EditableAmount label="Seguro" value={budgetExtras.insurance} onChange={v => updateBudgetExtras({ insurance: v })} />
        </BudgetCard>

        {/* Others */}
        <BudgetCard icon={<Package className="h-3.5 w-3.5" />} title="Otros gastos">
          <EditableAmount label="Otros" value={budgetExtras.others} onChange={v => updateBudgetExtras({ others: v })} />
        </BudgetCard>

        {/* Total */}
        <div className="gradient-hero rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide mb-2">
            <Wallet className="h-3.5 w-3.5" /> Total estimado
          </div>
          <div className="text-3xl font-bold text-primary-foreground">{totalKnown}€</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-primary-foreground/70">
            <div>~{Math.round(totalKnown / trip.travelers)}€ por persona</div>
            <div>~{Math.round(totalKnown / trip.totalNights)}€ por día</div>
          </div>
          {!budget.allSelected && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-primary-foreground/80 bg-primary-foreground/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Presupuesto basado en promedios — selecciona hoteles para exactitud
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {icon} {title}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
      {children}
    </div>
  );
}

function BudgetBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-lg ${highlight ? 'bg-primary/5 border border-primary/20' : ''}`}>
      <div className={`text-lg font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function EditableAmount({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(String(value));

  const save = () => {
    const num = parseFloat(temp) || 0;
    onChange(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">{label}:</span>
        <input
          type="number"
          value={temp}
          onChange={e => setTemp(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === 'Enter' && save()}
          className="w-24 text-sm border border-input bg-background rounded px-2 py-1"
          autoFocus
        />
        <span className="text-xs text-muted-foreground">€</span>
      </div>
    );
  }

  return (
    <button onClick={() => { setTemp(String(value)); setEditing(true); }} className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary">
      {label}: {value}€ ✏️
    </button>
  );
}
