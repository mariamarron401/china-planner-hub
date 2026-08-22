import { useTrip } from '@/context/TripContext';
import { getGlobalBudget, getHotelDeposits } from '@/lib/calculations';
import { Wallet, Building2, Train, Compass, AlertTriangle, Plane, Shield, Package, CreditCard } from 'lucide-react';
import { useState } from 'react';
import MoreInfo from '@/components/MoreInfo';

export default function BudgetView() {
  const { data, updateBudgetExtras } = useTrip();
  const { cities, hotels, selectedHotels, transportLegs, localTransports, activities, budgetExtras, trip, airportTransfers } = data;
  const budget = getGlobalBudget(cities, hotels, selectedHotels);
  const deposits = getHotelDeposits(cities, hotels, selectedHotels);

  // El importe realmente pagado manda sobre la estimación: según se van comprando los
  // tramos, el total deja de ser un cálculo y pasa a ser dinero de verdad.
  const transportTotal = [...transportLegs, ...localTransports].reduce((sum, t) => {
    if ('paidEur' in t && t.paidEur != null) return sum + t.paidEur;
    if ('price' in t && t.price != null) return sum + t.price;
    return sum;
  }, 0);
  const transportComplete = [...transportLegs, ...localTransports].every(t => t.price != null);

  // Progreso de compra de los trenes. Solo cuentan los tramos que son tren de verdad:
  // el cambio de hotel Zhangjiajie → Wulingyuan es un Didi y no se compra por adelantado.
  const trainLegs = transportLegs.filter(t => t.trainNumber);
  const trainsBought = trainLegs.filter(t => t.paidEur != null);
  const trainsPaidTotal = trainsBought.reduce((sum, t) => sum + (t.paidEur ?? 0), 0);
  const trainsPendingEstimate = trainLegs
    .filter(t => t.paidEur == null)
    .reduce((sum, t) => sum + (t.price ?? 0), 0);

  // Traslados de aeropuerto: se cuenta la opción recomendada de cada uno (o la más barata
  // si ninguna está marcada), porque es la que vais a coger de verdad.
  const airportTotal = airportTransfers.reduce((sum, t) => {
    const chosen = t.options.find(o => o.recommended) ?? t.options[0];
    return sum + (chosen?.priceEur ?? 0);
  }, 0);

  const activitiesTotal = activities.reduce((sum, a) => (a.price != null ? sum + a.price : sum), 0);
  const activitiesComplete = activities.every(a => a.price != null);

  const hotelTotal = budget.allSelected ? budget.selectedTotal : budget.avgTotal;
  const totalKnown = budgetExtras.flightsInsurance + hotelTotal + transportTotal + activitiesTotal + airportTotal
    + budgetExtras.transportExtra + budgetExtras.activitiesExtra + budgetExtras.insurance + budgetExtras.others;

  return (
    <div className="px-4 space-y-4">
        {/* Total arriba: es la cifra que se busca al entrar */}
        <div className="gradient-hero rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide mb-2">
            <Wallet className="h-3.5 w-3.5" /> Total estimado · {trip.travelers} personas
          </div>
          <div className="text-3xl font-bold text-primary-foreground">{totalKnown}€</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-primary-foreground/70">
            <div>~{Math.round(totalKnown / trip.travelers)}€ por persona</div>
            <div>~{Math.round(totalKnown / trip.totalNights)}€ por día</div>
          </div>
          {deposits.items.length > 0 && (
            <div className="mt-3 bg-primary-foreground/10 rounded-lg px-3 py-2">
              <div className="text-sm font-bold text-primary-foreground">
                Saldo a tener en la tarjeta: {Math.round(totalKnown + deposits.totalEur)}€
              </div>
              <div className="text-[11px] text-primary-foreground/80 mt-0.5">
                incluye {deposits.totalEur.toFixed(2)} € de depósitos de hotel, que se devuelven
              </div>
            </div>
          )}
          {!budget.allSelected && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-primary-foreground/80 bg-primary-foreground/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              Basado en promedios — elige hoteles para que sea exacto
            </div>
          )}
        </div>

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

        {/* Hotel deposits */}
        {deposits.items.length > 0 && (
          <div className="bg-card rounded-xl border-2 border-travel-pending/40 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-travel-pending uppercase tracking-wide mb-3">
              <CreditCard className="h-3.5 w-3.5" /> Depósitos de hotel (recámara en tarjeta)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">¥{deposits.totalCny}</span>
              <span className="text-sm font-semibold text-muted-foreground">≈ {deposits.totalEur.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-foreground mt-1.5">
              <strong>No es gasto, es saldo</strong> — hay que llevarlo además del presupuesto.
            </p>
            <MoreInfo label="Cuándo se cobra y cuándo vuelve">
              <p>
                Cada hotel lo cobra al completar el registro de entrada y lo devuelve al hacer el check-out, pero la
                devolución puede tardar días en volver a la tarjeta. Por eso hay que llevar los{' '}
                {deposits.totalEur.toFixed(2)} € completos disponibles además del presupuesto del viaje.
              </p>
            </MoreInfo>
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              {deposits.items.map(d => (
                <div key={d.cityId} className="flex items-start justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <div className="text-foreground font-medium truncate">{d.cityName.split(' (')[0]}</div>
                    <div className="text-[10px] text-muted-foreground">Check-in {d.checkInText}</div>
                  </div>
                  <span className="font-semibold text-foreground whitespace-nowrap">
                    ¥{d.cny} · {d.eur.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-travel-confirmed mt-3">
              ✅ Cifra cerrada: los otros {deposits.hotelsWithoutDeposit} hoteles no tienen política de depósito.
            </p>
          </div>
        )}

        {/* Transport */}
        <BudgetCard icon={<Train className="h-3.5 w-3.5" />} title="Transportes">
          {transportComplete ? (
            <div className="text-2xl font-bold text-foreground">{Math.round(transportTotal + airportTotal + budgetExtras.transportExtra)}€</div>
          ) : (
            <div>
              <div className="text-lg font-bold text-foreground">{transportTotal > 0 ? `${Math.round(transportTotal + airportTotal)}€ parcial` : '—'}</div>
              <div className="text-xs text-travel-pending font-medium mt-1">⚠ Datos incompletos</div>
            </div>
          )}
          {/* Trenes: cuánto es ya dinero real y cuánto sigue siendo estimación. */}
          {trainLegs.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Train className="h-3.5 w-3.5 text-primary" />
                  Trenes: {trainsBought.length} de {trainLegs.length} comprados
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {Math.round((trainsBought.length / trainLegs.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
                <div
                  className="h-full bg-travel-confirmed rounded-full transition-all"
                  style={{ width: `${(trainsBought.length / trainLegs.length) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-travel-confirmed font-bold">{trainsPaidTotal.toFixed(2)}€</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">pagado de verdad</div>
                </div>
                <div>
                  <div className="text-travel-pending font-bold">{Math.round(trainsPendingEstimate)}€</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    estimado, {trainLegs.length - trainsBought.length} sin comprar
                  </div>
                </div>
              </div>
              {trainsBought.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {trainsBought.map(t => (
                    <div key={t.id} className="flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        ✅ {t.trainNumber} · {t.travelDate?.split(' (')[0]}
                      </span>
                      <span className="font-mono text-foreground">{t.paidEur?.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              )}
              {trainsBought.length < trainLegs.length && (
                <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
                  Lo estimado sale del precio en yuanes y{' '}
                  <span className="font-medium text-foreground">se queda corto</span>. En los tres tramos comparables
                  (mismo tren que se estimó) el desvío medio es de un{' '}
                  <span className="font-medium text-travel-pending">+16,5%</span>: +8%, +30% y +26%. El tramo 4 se
                  disparó un +77%, pero ahí la causa es otra — se cambió un tren D por uno G, que cuesta más.
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                  Si el +16,5% se mantiene, los {trainLegs.length - trainsBought.length} que faltan costarán unos{' '}
                  <span className="font-medium text-foreground">{Math.round(trainsPendingEstimate * 1.165)}€</span> en
                  vez de {Math.round(trainsPendingEstimate)}€. El grueso es{' '}
                  <span className="font-medium text-foreground">Zhangjiajie → Shangrao</span>, el más caro del viaje.
                </p>
              )}
            </div>
          )}

          {airportTotal > 0 && (
            <div className="mt-2 pt-2 border-t border-border flex items-start gap-1.5">
              <Plane className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                Incluye <span className="font-semibold text-foreground">{Math.round(airportTotal)}€</span> de los {airportTransfers.length} traslados
                de aeropuerto (opción recomendada de cada uno). Detalle en Moverse → Traslados.
              </div>
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
