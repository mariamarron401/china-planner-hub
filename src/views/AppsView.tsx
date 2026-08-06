import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { AppTask, AppTaskGroup, EsimPlan } from '@/types/trip';
import { isAppTaskComplete } from '@/lib/calculations';
import {
  Zap, TrainFront, MapPinned, Signal, Ban, CheckCircle2, Circle,
  AlertTriangle, ExternalLink, CalendarClock, Wifi,
} from 'lucide-react';
import MoreInfo from '@/components/MoreInfo';
import OfflineReadyCard from '@/components/OfflineReadyCard';

// Cuenta atrás en vivo contra el día real: así las fechas nunca quedan desfasadas
// y no hay que volver a tocar el código cada semana.
function daysUntil(iso: string): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  return Math.round((target.getTime() - startOfToday.getTime()) / 86400000);
}

function countdownLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Fecha pasada';
  if (daysLeft === 0) return '¡HOY!';
  if (daysLeft === 1) return 'Mañana';
  return `Faltan ${daysLeft} días`;
}

const GROUPS: { key: AppTaskGroup; label: string; icon: typeof Zap; blurb: string }[] = [
  { key: 'hoy', label: 'Hoy', icon: Zap, blurb: 'Lo que hay que hacer ya, porque otras cosas dependen de esto.' },
  { key: 'trenes', label: 'Trenes', icon: TrainFront, blurb: 'Las dos cuentas con las que se compran los 8 trenes.' },
  { key: 'terreno', label: 'Sobre el terreno', icon: MapPinned, blurb: 'Se pueden dejar para septiembre, pero siempre desde España.' },
  { key: 'esim', label: 'e-SIM', icon: Signal, blurb: 'Se contrata de cara al viaje. Aquí está exactamente qué comprar y cómo dejarlo listo.' },
  { key: 'descartada', label: 'Descartadas', icon: Ban, blurb: 'Estaban en la lista inicial y se han descartado a propósito. No hay que hacer nada.' },
];

export default function AppsView() {
  const { data, updateAppTask } = useTrip();
  const { tasks, esim, goldenRules } = data.appSetup;
  const [group, setGroup] = useState<AppTaskGroup>('hoy');

  const active = tasks.filter(t => t.group !== 'descartada');
  const doneCount = active.filter(isAppTaskComplete).length;
  const pct = active.length ? Math.round((doneCount / active.length) * 100) : 0;

  // Lo siguiente que toca: la tarea sin terminar con la fecha límite más cercana.
  const nextUp = tasks
    .filter(t => t.deadline && !isAppTaskComplete(t) && t.group !== 'descartada')
    .map(t => ({ task: t, daysLeft: daysUntil(t.deadline as string) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .find(x => x.daysLeft >= 0);

  const visible = tasks.filter(t => t.group === group);
  const groupMeta = GROUPS.find(g => g.key === group);

  return (
    <>
      <div className="px-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground leading-none">{doneCount}</span>
            <span className="text-muted-foreground text-sm">de {active.length} gestiones listas</span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>

          {nextUp && (
            <div className="mt-3 rounded-lg bg-primary text-primary-foreground px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide opacity-80">Lo siguiente con fecha</div>
              <div className="text-sm font-bold leading-tight mt-0.5">
                {countdownLabel(nextUp.daysLeft)} · {nextUp.task.emoji} {nextUp.task.name}
              </div>
            </div>
          )}

          {/* Los 3 hechos que condicionan el plan entero */}
          <MoreInfo label="Por qué se hace todo ahora y desde casa">
            <p>
              📵 <span className="font-medium text-foreground">La e-SIM de Holafly es de solo datos:</span> no da número
              chino ni recibe SMS. El número de todas las cuentas es vuestro{' '}
              <span className="font-medium text-foreground">+34</span>, y el SMS de registro llega sin problemas ahora,
              no allí.
            </p>
            <p>
              📱 <span className="font-medium text-foreground">Los dos iPhone se configuran igual.</span> El 14 y el 17
              Pro comprados en España conservan bandeja de SIM física: SIM española puesta + e-SIM de Holafly encima.
            </p>
            <p>
              🛡️{' '}
              <span className="font-medium text-foreground">
                La VPN de Holafly va incluida, pero es un único punto de fallo.
              </span>{' '}
              Si cae, se van Google, WhatsApp y las pantallas «Qué hacer» y «Pendientes» de esta app. La app en sí
              sigue abriéndose sin VPN (está guardada en el móvil): ver la tarjeta de aquí abajo.
            </p>
          </MoreInfo>

          <MoreInfo label="Cuatro reglas que valen para todo">
            {goldenRules.map((r, i) => (
              <p key={i} className="text-foreground">· {r}</p>
            ))}
          </MoreInfo>
        </div>
      </div>

      {/* Si esta app se abrirá o no en China, y cómo dejarla guardada en el móvil */}
      <OfflineReadyCard />

      {/* Filtros por bloque */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {GROUPS.map(g => {
          const list = tasks.filter(t => t.group === g.key);
          const pending = list.filter(t => !isAppTaskComplete(t)).length;
          return (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                group === g.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <g.icon className="h-3.5 w-3.5" />
              {g.label}
              {g.key !== 'descartada' && pending > 0 && (
                <span className={`text-[10px] font-bold ${group === g.key ? 'opacity-90' : 'text-travel-important'}`}>
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {groupMeta && (
        <p className="px-4 mt-3 text-[11px] text-muted-foreground leading-snug">{groupMeta.blurb}</p>
      )}

      {/* Ficha del plan de e-SIM, solo en su pestaña */}
      {group === 'esim' && <EsimCard esim={esim} />}

      <div className="px-4 mt-3 space-y-3">
        {visible.map(t => (
          <TaskCard key={t.id} task={t} onUpdate={updateAppTask} />
        ))}
      </div>
    </>
  );
}

function TaskCard({
  task,
  onUpdate,
}: {
  task: AppTask;
  onUpdate: (id: string, updates: Partial<Pick<AppTask, 'done' | 'doneJm' | 'doneMaria'>>) => void;
}) {
  const complete = isAppTaskComplete(task);
  const discarded = task.group === 'descartada';
  const daysLeft = task.deadline ? daysUntil(task.deadline) : null;
  const overdue = daysLeft !== null && daysLeft < 0 && !complete;

  return (
    <div
      className={`bg-card rounded-xl border p-4 shadow-sm transition-all ${
        complete ? 'border-travel-confirmed/50 opacity-70' : overdue ? 'border-travel-important/60' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{task.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold text-[15px] text-foreground leading-tight ${complete ? 'line-through' : ''}`}>
              {task.name}
            </h3>
            {complete && <CheckCircle2 className="h-5 w-5 text-travel-confirmed flex-shrink-0" />}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                discarded
                  ? 'bg-muted text-muted-foreground'
                  : task.group === 'hoy'
                  ? 'bg-travel-important-bg text-travel-important'
                  : 'bg-travel-pending-bg text-travel-pending'
              }`}
            >
              {task.whenLabel}
            </span>
            {daysLeft !== null && !complete && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> {countdownLabel(daysLeft)}
              </span>
            )}
            {task.perPerson && !discarded && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Una por persona
              </span>
            )}
          </div>

          <p className="text-[13px] text-muted-foreground leading-snug mt-2">{task.purpose}</p>
        </div>
      </div>

      <ol className="mt-3 space-y-1.5">
        {task.steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-foreground leading-snug">
            <span className="flex-shrink-0 h-[18px] w-[18px] rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      {task.warning && (
        <div className="mt-3 flex gap-2 bg-travel-important-bg text-travel-important rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] leading-snug font-medium">{task.warning}</p>
        </div>
      )}

      {task.why && (
        <MoreInfo label="Por qué esa fecha">
          <p>{task.why}</p>
        </MoreInfo>
      )}

      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary"
        >
          Abrir enlace <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {!discarded && (
        <div className="mt-3 pt-3 border-t border-border">
          {task.perPerson ? (
            <div className="grid grid-cols-2 gap-2">
              <PersonToggle
                label="José Miguel"
                checked={Boolean(task.doneJm)}
                onClick={() => onUpdate(task.id, { doneJm: !task.doneJm })}
              />
              <PersonToggle
                label="María"
                checked={Boolean(task.doneMaria)}
                onClick={() => onUpdate(task.id, { doneMaria: !task.doneMaria })}
              />
            </div>
          ) : (
            <PersonToggle
              label={task.done ? 'Hecho' : 'Marcar como hecho'}
              checked={Boolean(task.done)}
              onClick={() => onUpdate(task.id, { done: !task.done })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PersonToggle({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 w-full text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
        checked ? 'bg-travel-confirmed-bg text-travel-confirmed' : 'bg-muted text-muted-foreground'
      }`}
    >
      {checked ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {label}
    </button>
  );
}

function EsimCard({ esim }: { esim: EsimPlan }) {
  const total = esim.priceEachEur * esim.units;
  const daysLeft = daysUntil(esim.buyDeadline);
  const lines = Array.from(new Set(esim.lineSetup.map(l => l.line)));

  return (
    <div className="px-4 mt-3 space-y-3">
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Wifi className="h-3.5 w-3.5" /> {esim.provider}
        </div>
        <h2 className="text-base font-bold text-foreground mt-1">{esim.planLabel}</h2>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <Stat label="cada una" value={`${esim.priceEachEur.toFixed(2).replace('.', ',')} €`} />
          <Stat label="unidades" value={`× ${esim.units}`} />
          <Stat label="total" value={`${total.toFixed(2).replace('.', ',')} €`} highlight />
        </div>

        <div className="mt-3 space-y-1.5 text-[13px]">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-[72px] flex-shrink-0">Comprar</span>
            <span className="font-medium text-foreground">
              {esim.buyWindow}
              {daysLeft >= 0 && <span className="text-muted-foreground font-normal"> · {countdownLabel(daysLeft)}</span>}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-[72px] flex-shrink-0">Activar</span>
            <span className="font-medium text-foreground">{esim.activateWhen}</span>
          </div>
        </div>

        <MoreInfo label={`${esim.facts.length} cosas que saber de este plan`}>
          {esim.facts.map((f, i) => (
            <p key={i}>· {f}</p>
          ))}
        </MoreInfo>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <h2 className="text-sm font-bold text-foreground">📶 Cómo quedan las dos líneas del móvil</h2>
        <p className="text-[11px] text-muted-foreground leading-snug mt-1">{esim.phonesNote}</p>

        {lines.map(line => (
          <div key={line} className="mt-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{line}</div>
            <div className="space-y-1.5">
              {esim.lineSetup
                .filter(l => l.line === line)
                .map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px]">
                    <span className="text-foreground flex-1 leading-snug">{l.setting}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        l.tone === 'ok'
                          ? 'bg-travel-confirmed-bg text-travel-confirmed'
                          : 'bg-travel-important-bg text-travel-important'
                      }`}
                    >
                      {l.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg px-2 py-2 text-center ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
      <div className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
