import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Compass, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Activities() {
  const { data, updateActivity } = useTrip();
  const { activities, cities } = data;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName || id;

  const statusColors: Record<string, string> = {
    'Planificada': 'bg-muted text-muted-foreground',
    'Por reservar': 'bg-travel-pending-bg text-travel-pending',
    'Hecha': 'bg-travel-confirmed-bg text-travel-confirmed',
  };

  const handleSavePrice = (id: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price >= 0) {
      updateActivity(id, { price });
      setEditingId(null);
    }
  };

  const cycleStatus = (id: string, current: string) => {
    const order = ['Por reservar', 'Planificada', 'Hecha'] as const;
    const idx = order.indexOf(current as any);
    updateActivity(id, { status: order[(idx + 1) % order.length] });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Actividades</h1>
        <p className="text-sm text-muted-foreground mt-1">{activities.length} actividades planificadas</p>
      </div>

      <div className="px-4 space-y-3">
        {activities.map(act => (
          <div key={act.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{act.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{getCityName(act.cityId)}</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">{act.type}</span>
                </div>
              </div>
              <button
                onClick={() => cycleStatus(act.id, act.status)}
                className={`text-[10px] font-medium px-2 py-1 rounded-full ${statusColors[act.status] || ''}`}
              >
                {act.status}
              </button>
            </div>

            <div className="flex gap-4 mt-3 text-xs">
              <span>Duración: {act.duration || <PendingBadge />}</span>
              <span>Coste: {act.price != null ? `${act.price}€` : <PendingBadge />}</span>
            </div>

            {act.notes && <div className="text-xs text-muted-foreground mt-2">📝 {act.notes}</div>}

            {act.price === null && (
              editingId === act.id ? (
                <div className="mt-2 flex gap-2 items-center">
                  <Input type="number" placeholder="Coste €" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="h-8 w-24 text-xs" />
                  <Button size="sm" className="h-8 text-xs" onClick={() => handleSavePrice(act.id)}>Guardar</Button>
                </div>
              ) : (
                <button onClick={() => { setEditingId(act.id); setEditPrice(''); }} className="mt-2 text-xs text-primary font-medium">
                  ✏️ Añadir precio
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}
