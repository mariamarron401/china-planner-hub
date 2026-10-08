import { useMemo, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseWho } from '@/types/trip';

/**
 * Gastos del día a día con la cuenta conjunta (pedido por María el 08/10/2026): cada uno
 * apunta lo que gasta, se descuenta de lo que hay para el viaje y se ve quién va gastando
 * más, porque a cada uno le corresponde la mitad. Lo de «los dos» se reparte a medias.
 */

const NAMES: Record<ExpenseWho, string> = { josemi: 'José Miguel', maria: 'María', ambos: 'Los dos' };
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${DIAS[new Date(y, m - 1, d).getDay()]} ${d} ${MESES[m - 1]}`;
}

interface Props {
  /** Lo que hay en la conjunta para el viaje (saldo + lo que falta por ingresar). */
  forTripEur: number;
  cnyPerEur: number;
}

export default function ExpensesCard({ forTripEur, cnyPerEur }: Props) {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [who, setWho] = useState<ExpenseWho>('ambos');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CNY' | 'EUR'>('CNY');

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const amountEur = currency === 'CNY' ? amountNum / cnyPerEur : amountNum;

  const totals = useMemo(() => {
    let josemi = 0;
    let maria = 0;
    for (const e of expenses) {
      if (e.who === 'josemi') josemi += e.eur;
      else if (e.who === 'maria') maria += e.eur;
      else {
        josemi += e.eur / 2;
        maria += e.eur / 2;
      }
    }
    return { josemi, maria, all: josemi + maria };
  }, [expenses]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof expenses>();
    for (const e of expenses) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return [...map.entries()];
  }, [expenses]);

  const share = forTripEur / 2;
  const left = forTripEur - totals.all;
  const diff = totals.josemi - totals.maria;

  const submit = async () => {
    if (!concept.trim() || amountNum <= 0) return;
    await addExpense({ date, who, concept: concept.trim(), amount: amountNum, currency, eur: Math.round(amountEur * 100) / 100 });
    setConcept('');
    setAmount('');
    setOpen(false);
  };

  const remove = (id: string, label: string) => {
    if (window.confirm(`¿Borrar «${label}»?`)) deleteExpense(id);
  };

  return (
    <div className="bg-card rounded-xl border-2 border-primary/30 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide mb-3">
        <Wallet className="h-3.5 w-3.5" /> Gastos del viaje · cuenta conjunta
      </div>

      {/* Lo que queda en la conjunta */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">Quedan en la conjunta</span>
        <span className={`text-2xl font-bold ${left < 0 ? 'text-travel-important' : 'text-foreground'}`}>{eur(left)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-1.5">
        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (totals.all / forTripEur) * 100)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Gastado {eur(totals.all)}</span>
        <span>de {eur(forTripEur)}</span>
      </div>

      {/* Cada uno frente a su mitad */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {(['josemi', 'maria'] as const).map(p => {
          const spent = totals[p];
          return (
            <div key={p} className="rounded-lg bg-muted/50 px-2.5 py-2">
              <div className="text-xs font-bold text-foreground">{NAMES[p]}</div>
              <div className="text-base font-bold text-foreground leading-tight mt-0.5">{eur(spent)}</div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                <div
                  className={`h-full ${spent > share ? 'bg-travel-important' : 'bg-travel-confirmed'}`}
                  style={{ width: `${Math.min(100, (spent / share) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">le quedan {eur(share - spent)} de {eur(share)}</div>
            </div>
          );
        })}
      </div>
      {totals.all > 0 && (
        <p className="text-[11px] text-foreground text-center mt-2 font-medium">
          {Math.abs(diff) < 1
            ? '⚖️ Vais iguales'
            : `${diff > 0 ? NAMES.josemi : NAMES.maria} lleva ${eur(Math.abs(diff))} más`}
        </p>
      )}

      {/* Apuntar un gasto */}
      {!open ? (
        <button
          onClick={() => { setDate(todayIso()); setOpen(true); }}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2.5 active:opacity-80"
        >
          <Plus className="h-4 w-4" /> Apuntar gasto
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-border p-3 space-y-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {(['josemi', 'maria', 'ambos'] as ExpenseWho[]).map(w => (
              <button
                key={w}
                onClick={() => setWho(w)}
                className={`rounded-lg py-2 text-xs font-semibold border ${
                  who === w ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'
                }`}
              >
                {NAMES[w]}
              </button>
            ))}
          </div>
          <input
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="Qué (cena, Didi, entrada…)"
            className="w-full text-sm border border-input bg-background rounded-lg px-3 py-2"
          />
          <div className="flex gap-1.5">
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Importe"
              className="flex-1 min-w-0 text-sm border border-input bg-background rounded-lg px-3 py-2"
            />
            {(['CNY', 'EUR'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`w-11 rounded-lg text-sm font-bold border ${
                  currency === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'
                }`}
              >
                {c === 'CNY' ? '¥' : '€'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-sm border border-input bg-background rounded-lg px-2 py-1.5"
            />
            {currency === 'CNY' && amountNum > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">≈ {eur(amountEur)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm">
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={!concept.trim() || amountNum <= 0}
              className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista por días */}
      {byDay.length > 0 && (
        <div className="mt-3 space-y-3">
          {byDay.map(([day, items]) => (
            <div key={day}>
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground border-b border-border pb-1 mb-1">
                <span>{dayLabel(day)}</span>
                <span>{eur(items.reduce((s, e) => s + e.eur, 0))}</span>
              </div>
              <div className="space-y-1">
                {items.map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-xs">
                    <span
                      className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        e.who === 'ambos' ? 'bg-muted text-foreground' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {e.who === 'josemi' ? 'JM' : e.who === 'maria' ? 'M' : 'Los 2'}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-foreground">
                      {e.concept}
                      {e.pendingSync && <span className="text-travel-pending"> · ⏳ sin subir</span>}
                    </span>
                    <span className="font-mono text-foreground whitespace-nowrap">
                      {e.currency === 'CNY' ? `¥${e.amount} · ` : ''}
                      {eur(e.eur)}
                    </span>
                    <button onClick={() => remove(e.id, e.concept)} className="text-muted-foreground p-1" aria-label="Borrar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground mt-3">
        Los yuanes se pasan a euros a {cnyPerEur} ¥/€. Lo de «Los dos» cuenta mitad para cada uno.
      </p>
    </div>
  );
}
