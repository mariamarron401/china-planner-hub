import { useTrip } from '@/context/TripContext';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

export default function PendingItems() {
  const { data, resolvePending } = useTrip();
  const { pendingItems } = data;

  const open = pendingItems.filter(p => p.status === 'open');
  const done = pendingItems.filter(p => p.status === 'done');

  const priorityColors: Record<string, string> = {
    high: 'bg-travel-important-bg text-travel-important',
    medium: 'bg-travel-pending-bg text-travel-pending',
    low: 'bg-muted text-muted-foreground',
  };

  const priorityLabels: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Pendientes</h1>
        <p className="text-sm text-muted-foreground mt-1">{open.length} pendientes · {done.length} resueltos</p>
      </div>

      <div className="px-4 space-y-3">
        {open.length > 0 && (
          <div className="space-y-2">
            {open.map(p => (
              <div key={p.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <button onClick={() => resolvePending(p.id)} className="mt-0.5 flex-shrink-0">
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-travel-confirmed transition-colors" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm text-foreground">{p.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[p.priority]}`}>
                        {priorityLabels[p.priority]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                    {p.relatedType && (
                      <span className="inline-block mt-2 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        {p.relatedType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {done.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 mt-6">Resueltos</h2>
            <div className="space-y-2">
              {done.map(p => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-3 shadow-sm opacity-60">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-travel-confirmed flex-shrink-0" />
                    <span className="text-sm text-foreground line-through">{p.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
