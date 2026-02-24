import { useTrip } from '@/context/TripContext';
import { getGlobalBudget } from '@/lib/calculations';
import { Wallet, Building2, Train, Compass, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Budget() {
  const { data, exportJSON } = useTrip();
  const { cities, hotels, selectedHotels, transportLegs, localTransports, activities } = data;
  const budget = getGlobalBudget(cities, hotels, selectedHotels);

  const transportTotal = [...transportLegs, ...localTransports].reduce((sum, t) => {
    if ('price' in t && t.price != null) return sum + t.price;
    return sum;
  }, 0);
  const transportComplete = [...transportLegs, ...localTransports].every(t => t.price != null);

  const activitiesTotal = activities.reduce((sum, a) => (a.price != null ? sum + a.price : sum), 0);
  const activitiesComplete = activities.every(a => a.price != null);

  const totalKnown = (budget.allSelected ? budget.selectedTotal : budget.avgTotal) + transportTotal + activitiesTotal;
  const isComplete = (budget.allSelected) && transportComplete && activitiesComplete;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Presupuesto</h1>
        <p className="text-sm text-muted-foreground mt-1">Para {data.trip.travelers} viajeros · {data.trip.totalNights} noches</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Hotels */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Building2 className="h-3.5 w-3.5" /> Hoteles
          </div>

          {budget.allSelected ? (
            <div>
              <div className="text-2xl font-bold text-foreground">{budget.selectedTotal}€</div>
              <div className="text-xs text-travel-confirmed font-medium mt-1">✅ Todos los hoteles seleccionados</div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <BudgetBlock label="Mínimo" value={`${budget.minTotal}€`} />
                <BudgetBlock label="Promedio" value={`${budget.avgTotal}€`} highlight />
                <BudgetBlock label="Máximo" value={`${budget.maxTotal}€`} />
              </div>
              <div className="text-xs text-travel-pending font-medium">
                ⚠ Sin hotel seleccionado en todas las ciudades
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Media ~{budget.avgPerNight}€/noche</div>
            <div>Media ~{budget.avgPerPersonPerNight}€/pers/noche</div>
          </div>
        </div>

        {/* Transport */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Train className="h-3.5 w-3.5" /> Transportes
          </div>
          {transportComplete ? (
            <div className="text-2xl font-bold text-foreground">{transportTotal}€</div>
          ) : (
            <div>
              <div className="text-lg font-bold text-foreground">{transportTotal > 0 ? `${transportTotal}€ parcial` : '—'}</div>
              <div className="text-xs text-travel-pending font-medium mt-1">
                ⚠ Datos incompletos — faltan precios por introducir
              </div>
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Compass className="h-3.5 w-3.5" /> Actividades
          </div>
          {activitiesComplete ? (
            <div className="text-2xl font-bold text-foreground">{activitiesTotal}€</div>
          ) : (
            <div>
              <div className="text-lg font-bold text-foreground">{activitiesTotal > 0 ? `${activitiesTotal}€ parcial` : '—'}</div>
              <div className="text-xs text-travel-pending font-medium mt-1">
                ⚠ Datos incompletos — faltan precios de actividades
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="gradient-hero rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide mb-2">
            <Wallet className="h-3.5 w-3.5" /> Total estimado
          </div>
          <div className="text-3xl font-bold text-primary-foreground">{totalKnown}€</div>
          <div className="text-sm text-primary-foreground/70 mt-1">
            {totalKnown > 0 && `~${Math.round(totalKnown / 2)}€ por persona`}
          </div>
          {!isComplete && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-primary-foreground/80 bg-primary-foreground/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Presupuesto incompleto — hay datos pendientes
            </div>
          )}
        </div>

        <Button onClick={exportJSON} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" /> Exportar datos como JSON
        </Button>
      </div>
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
