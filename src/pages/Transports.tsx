import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Transports() {
  const { data, updateTransportLeg, updateLocalTransport } = useTrip();
  const { cities, transportLegs, localTransports } = data;
  const [tab, setTab] = useState<'inter' | 'local'>('inter');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  const handleSave = (id: string, type: 'inter' | 'local') => {
    const price = editValues.price ? parseFloat(editValues.price) : null;
    const duration = editValues.duration ? parseInt(editValues.duration) : null;
    if (type === 'inter') {
      updateTransportLeg(id, {
        ...(price !== null && { price, status: 'known' as const }),
        ...(duration !== null && { durationMinutes: duration }),
      });
    } else {
      updateLocalTransport(id, {
        ...(price !== null && { price }),
        ...(duration !== null && { durationMinutes: duration }),
      });
    }
    setEditingId(null);
    setEditValues({ price: '', duration: '' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Transportes</h1>
      </div>

      <div className="px-4 flex gap-2 mb-4">
        <button
          onClick={() => setTab('inter')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            tab === 'inter' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Train className="h-3.5 w-3.5" /> Entre ciudades ({transportLegs.length})
        </button>
        <button
          onClick={() => setTab('local')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            tab === 'local' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Car className="h-3.5 w-3.5" /> Locales ({localTransports.length})
        </button>
      </div>

      <div className="px-4 space-y-3">
        {tab === 'inter' && transportLegs.map(leg => (
          <div key={leg.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Train className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-foreground">{getCityName(leg.fromCityId)}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">{getCityName(leg.toCityId)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="bg-muted px-1.5 py-0.5 rounded">{leg.mode}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span>Precio: {leg.price != null ? `${leg.price}€` : <PendingBadge />}</span>
              <span>Duración: {leg.durationMinutes != null ? `${leg.durationMinutes} min` : <PendingBadge />}</span>
            </div>

            {editingId === leg.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(leg.id, 'inter')}>Guardar</Button>
              </div>
            ) : (
              (leg.price === null || leg.durationMinutes === null) && (
                <button
                  onClick={() => { setEditingId(leg.id); setEditValues({ price: leg.price?.toString() || '', duration: leg.durationMinutes?.toString() || '' }); }}
                  className="mt-2 text-xs text-primary font-medium"
                >
                  ✏️ Editar datos
                </button>
              )
            )}
          </div>
        ))}

        {tab === 'local' && localTransports.map(lt => (
          <div key={lt.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-secondary" />
              <span className="font-medium text-sm text-foreground">{lt.fromText}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">{lt.toText}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="bg-muted px-1.5 py-0.5 rounded">{lt.mode}</span>
              <span className="bg-muted px-1.5 py-0.5 rounded">{getCityName(lt.cityId)}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span>Precio: {lt.price != null ? `${lt.price}€` : <PendingBadge />}</span>
              <span>Duración: {lt.durationMinutes != null ? `${lt.durationMinutes} min` : <PendingBadge />}</span>
            </div>
            {lt.notes && <div className="text-xs text-muted-foreground mt-1">📝 {lt.notes}</div>}

            {editingId === lt.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(lt.id, 'local')}>Guardar</Button>
              </div>
            ) : (
              (lt.price === null || lt.durationMinutes === null) && (
                <button
                  onClick={() => { setEditingId(lt.id); setEditValues({ price: lt.price?.toString() || '', duration: lt.durationMinutes?.toString() || '' }); }}
                  className="mt-2 text-xs text-primary font-medium"
                >
                  ✏️ Editar datos
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
