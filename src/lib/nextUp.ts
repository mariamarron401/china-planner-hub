import { TripData, PendingItem } from '@/types/trip';
import { isAppTaskComplete } from '@/lib/calculations';

export interface NextAction {
  id: string;
  /** Fecha en formato YYYY-MM-DD */
  iso: string;
  /** Días desde hoy: 0 = hoy, negativo = ya pasó. */
  daysLeft: number;
  /** Qué hay que hacer, en una línea. */
  title: string;
  /** De qué va (tren, app, pendiente…). */
  kind: 'tren' | 'app' | 'esim' | 'pendiente';
  /** A dónde lleva el toque. */
  to: string;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86400000);
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} ${MESES[m - 1]}`;
}

export function countdownLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Ya pasó';
  if (daysLeft === 0) return '¡HOY!';
  if (daysLeft === 1) return 'Mañana';
  return `En ${daysLeft} días`;
}

/**
 * Junta en una sola lista TODO lo que tiene fecha y sigue sin hacer: los billetes
 * de tren por comprobar, gestiones de apps, la compra de las e-SIM y los pendientes
 * con fecha límite. Ordenado por fecha, lo primero es lo que toca.
 *
 * Existe para que la pantalla de inicio pueda responder a una sola pregunta
 * ("¿qué me toca hacer ahora?") sin que haya que ir mirando cinco pantallas.
 */
export function buildNextActions(data: TripData, pendingItems: PendingItem[] = []): NextAction[] {
  const out: NextAction[] = [];
  const cityName = (id: string) => data.cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  for (const leg of data.transportLegs) {
    const route = `${cityName(leg.fromCityId)} → ${cityName(leg.toCityId)}`;
    if (leg.saleOpensIso) {
      out.push({
        id: `${leg.id}-sale`,
        iso: leg.saleOpensIso,
        daysLeft: daysUntil(leg.saleOpensIso),
        title: `Comprobar que salió el billete ${route}`,
        kind: 'tren',
        to: '/moverse/trenes',
      });
    }
  }

  for (const task of data.appSetup.tasks) {
    if (!task.deadline || task.group === 'descartada' || isAppTaskComplete(task)) continue;
    out.push({
      id: task.id,
      iso: task.deadline,
      daysLeft: daysUntil(task.deadline),
      // El nombre solo ("Trip.com") no dice qué hay que hacer con él.
      title: `${task.emoji} Configurar ${task.name}`,
      kind: 'app',
      to: '/gestiones/apps',
    });
  }

  const esim = data.appSetup.esim;
  if (esim?.buyDeadline) {
    out.push({
      id: 'esim',
      iso: esim.buyDeadline,
      daysLeft: daysUntil(esim.buyDeadline),
      title: `Comprar las ${esim.units} e-SIM de ${esim.provider}`,
      kind: 'esim',
      to: '/gestiones/apps',
    });
  }

  for (const item of pendingItems) {
    if (item.status !== 'open' || !item.deadline) continue;
    out.push({
      id: item.id,
      iso: item.deadline,
      daysLeft: daysUntil(item.deadline),
      title: item.title,
      kind: 'pendiente',
      to: '/gestiones/pendientes',
    });
  }

  return out.filter(a => a.daysLeft >= 0).sort((a, b) => a.iso.localeCompare(b.iso));
}
