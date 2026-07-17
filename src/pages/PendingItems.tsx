import { useState } from 'react';
import { usePendingItems } from '@/hooks/usePendingItems';
import { useTrip } from '@/context/TripContext';
import { CheckCircle2, Circle, Plus, RotateCcw, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type ViewFilter = 'all' | 'open' | 'done';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function PendingItems() {
  const { items, resolveItem, reopenItem, addItem } = usePendingItems();
  const { data } = useTrip();
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newRelatedType, setNewRelatedType] = useState('');
  const [newRelatedCityId, setNewRelatedCityId] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const filtered = items
    .filter(p => {
      if (viewFilter === 'open' && p.status !== 'open') return false;
      if (viewFilter === 'done' && p.status !== 'done') return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0));

  const open = items.filter(p => p.status === 'open');
  const done = items.filter(p => p.status === 'done');

  const priorityColors: Record<string, string> = {
    high: 'bg-travel-important-bg text-travel-important',
    medium: 'bg-travel-pending-bg text-travel-pending',
    low: 'bg-muted text-muted-foreground',
  };

  const priorityLabels: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast({ title: 'El título es obligatorio', variant: 'destructive' });
      return;
    }
    await addItem({
      id: `pi-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      relatedType: newRelatedType,
      relatedId: '',
      relatedCityId: newRelatedCityId || undefined,
      priority: newPriority,
      status: 'open',
      deadline: newDeadline || undefined,
    });
    toast({ title: 'Pendiente añadido ✅' });
    setShowAdd(false);
    setNewTitle(''); setNewDesc(''); setNewPriority('medium'); setNewRelatedType(''); setNewRelatedCityId(''); setNewDeadline('');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pendientes</h1>
            <p className="text-sm text-muted-foreground mt-1">{open.length} pendientes · {done.length} resueltos</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Añadir pendiente"
            className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 flex gap-2 flex-wrap mb-3">
        {(['all', 'open', 'done'] as ViewFilter[]).map(f => (
          <button key={f} onClick={() => setViewFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${viewFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {{ all: 'Todos', open: 'Abiertos', done: 'Completados' }[f]}
          </button>
        ))}
        <span className="text-muted-foreground text-xs flex items-center"><Filter className="h-3 w-3 mr-1" /></span>
        {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map(f => (
          <button key={f} onClick={() => setPriorityFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${priorityFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {f === 'all' ? 'Todas' : priorityLabels[f]}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {filtered.map(p => (
          <div key={p.id} className={`bg-card rounded-xl border border-border p-4 shadow-sm ${p.status === 'done' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              {p.status === 'open' ? (
                <button onClick={() => resolveItem(p.id)} className="mt-0.5 flex-shrink-0">
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-travel-confirmed transition-colors" />
                </button>
              ) : (
                <button onClick={() => reopenItem(p.id)} className="mt-0.5 flex-shrink-0" title="Reabrir">
                  <CheckCircle2 className="h-5 w-5 text-travel-confirmed hover:text-muted-foreground transition-colors" />
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-medium text-sm text-foreground ${p.status === 'done' ? 'line-through' : ''}`}>{p.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[p.priority]}`}>
                    {priorityLabels[p.priority]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                <div className="flex gap-2 mt-2">
                  {p.relatedType && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">{p.relatedType}</span>
                  )}
                  {p.deadline && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">📅 {p.deadline}</span>
                  )}
                  {p.status === 'done' && (
                    <button onClick={() => reopenItem(p.id)} className="text-[10px] text-primary flex items-center gap-1 ml-auto">
                      <RotateCcw className="h-3 w-3" /> Reabrir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add modal */}
      <Dialog open={showAdd} onOpenChange={v => !v && setShowAdd(false)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo pendiente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridad</label>
              <div className="flex gap-2 mt-1">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${newPriority === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asociado a</label>
              <select value={newRelatedType} onChange={e => setNewRelatedType(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">General</option>
                <option value="hotel">Hotel</option>
                <option value="transport">Transporte</option>
                <option value="activity">Actividad</option>
                <option value="note">Nota</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ciudad (opcional)</label>
              <select value={newRelatedCityId} onChange={e => setNewRelatedCityId(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Ninguna</option>
                {data.cities.map(c => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fecha límite (opcional)</label>
              <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={handleAdd} className="w-full">Añadir pendiente</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
