import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, ExpenseWho } from '@/types/trip';

// Los gastos del viaje se guardan en la tabla Supabase `places` (category = 'expense'),
// igual que los tips de vídeo: así los dos móviles ven lo mismo sin crear una tabla nueva.
// Columnas reutilizadas: name = concepto, alt_name = quién, notes = JSON con
// {date, amount, currency, eur}. city_id es NOT NULL, así que va el sentinel 'none'.
//
// En China la conexión puede fallar (cortafuegos, VPN caída). Por eso cada gasto se guarda
// primero en el móvil (localStorage) y se sube a la nube en cuanto hay red: un gasto
// apuntado sin conexión no se pierde, sale marcado como «sin subir» y se reintenta solo.
const CATEGORY = 'expense';
const NO_CITY = 'none';
const LOCAL_KEY = 'china-trip-expenses';
// Gastos borrados sin conexión: se reintenta el borrado y no se vuelven a mostrar.
const DELETED_KEY = 'china-trip-expenses-deleted';
const WHO: ExpenseWho[] = ['josemi', 'maria', 'ambos'];

function readLocal(): Expense[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Expense[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // Sin almacenamiento (modo privado): la nube sigue siendo la copia buena.
  }
}

function readDeleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeDeleted(ids: string[]) {
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento: no hay nada que recordar.
  }
}

function rowToExpense(row: any): Expense | null {
  try {
    const extra = JSON.parse(row.notes || '{}');
    const who = WHO.includes(row.alt_name) ? (row.alt_name as ExpenseWho) : 'ambos';
    return {
      id: row.id,
      date: extra.date,
      who,
      concept: row.name,
      amount: Number(extra.amount) || 0,
      currency: extra.currency === 'EUR' ? 'EUR' : 'CNY',
      eur: Number(extra.eur) || 0,
      createdAt: row.created_at,
    };
  } catch {
    return null;
  }
}

function toRow(e: Expense) {
  return {
    id: e.id,
    category: CATEGORY,
    city_id: NO_CITY,
    name: e.concept,
    alt_name: e.who,
    notes: JSON.stringify({ date: e.date, amount: e.amount, currency: e.currency, eur: e.eur }),
    status: 'saved',
  };
}

const byDate = (a: Expense, b: Expense) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => readLocal().sort(byDate));

  const save = useCallback((list: Expense[]) => {
    const sorted = [...list].sort(byDate);
    writeLocal(sorted);
    setExpenses(sorted);
  }, []);

  // Sube lo pendiente y trae lo de la nube. Lo que aún no ha subido se conserva.
  const sync = useCallback(async () => {
    const local = readLocal();
    const pending = local.filter(e => e.pendingSync);
    for (const e of pending) {
      const { error } = await supabase.from('places').upsert(toRow(e));
      if (!error) e.pendingSync = false;
    }
    const deleted = readDeleted();
    const stillDeleted: string[] = [];
    for (const id of deleted) {
      const { error: delError } = await supabase.from('places').delete().eq('id', id).eq('category', CATEGORY);
      if (delError) stillDeleted.push(id);
    }
    writeDeleted(stillDeleted);
    const { data, error } = await supabase.from('places').select('*').eq('category', CATEGORY);
    if (error || !data) {
      save(local);
      return;
    }
    const remote = data
      .map(rowToExpense)
      .filter((e): e is Expense => Boolean(e && e.date && !stillDeleted.includes(e.id)));
    const stillPending = local.filter(e => e.pendingSync && !remote.some(r => r.id === e.id));
    save([...remote, ...stillPending]);
  }, [save]);

  useEffect(() => {
    sync();
    const channel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places', filter: `category=eq.${CATEGORY}` }, () => {
        sync();
      })
      .subscribe();
    window.addEventListener('online', sync);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', sync);
    };
  }, [sync]);

  const addExpense = useCallback(async (e: Omit<Expense, 'id' | 'createdAt' | 'pendingSync'>) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expense: Expense = { ...e, id, createdAt: new Date().toISOString(), pendingSync: true };
    save([...readLocal(), expense]);
    const { error } = await supabase.from('places').insert(toRow(expense));
    if (!error) save(readLocal().map(x => (x.id === id ? { ...x, pendingSync: false } : x)));
  }, [save]);

  const deleteExpense = useCallback(async (id: string) => {
    save(readLocal().filter(x => x.id !== id));
    const { error } = await supabase.from('places').delete().eq('id', id).eq('category', CATEGORY);
    if (error) writeDeleted([...readDeleted(), id]);
  }, [save]);

  return { expenses, addExpense, deleteExpense, sync };
}
