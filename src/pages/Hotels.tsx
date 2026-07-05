import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { getHotelCalcs, getCityHotelStats } from '@/lib/calculations';
import { Check, ExternalLink, Coffee, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SortKey = 'total' | 'perNight' | 'perPersonPerNight';

export default function Hotels() {
  const { data, selectHotel, deselectHotel, updateHotelPrice } = useTrip();
  const { cities, hotels, selectedHotels } = data;
  const [filterCity, setFilterCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('total');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const filteredCities = filterCity === 'all' ? cities : cities.filter(c => c.id === filterCity);

  const handleSavePrice = (hotelId: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updateHotelPrice(hotelId, price);
      setEditingId(null);
      setEditPrice('');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-foreground">Hoteles</h1>
        <p className="text-sm text-muted-foreground mt-1">Todos con desayuno incluido</p>
      </div>

      {/* Filters */}
      <div className="px-4 flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <FilterChip active={filterCity === 'all'} onClick={() => setFilterCity('all')}>Todas</FilterChip>
        {cities.map(c => (
          <FilterChip key={c.id} active={filterCity === c.id} onClick={() => setFilterCity(c.id)}>
            {c.cityName.split(' (')[0]}
          </FilterChip>
        ))}
      </div>

      <div className="px-4 flex gap-2 mb-4">
        <SortChip active={sortBy === 'total'} onClick={() => setSortBy('total')}>Total €</SortChip>
        <SortChip active={sortBy === 'perNight'} onClick={() => setSortBy('perNight')}>€/noche</SortChip>
        <SortChip active={sortBy === 'perPersonPerNight'} onClick={() => setSortBy('perPersonPerNight')}>€/pers/noche</SortChip>
      </div>

      <div className="px-4 space-y-6">
        {filteredCities.map(city => {
          const cityHotels = hotels.filter(h => h.cityId === city.id);
          const stats = getCityHotelStats(cityHotels, city.nights);
          const selectedId = selectedHotels[city.id];

          const sortedHotels = [...cityHotels].sort((a, b) => {
            const ca = getHotelCalcs(a, city.nights);
            const cb = getHotelCalcs(b, city.nights);
            if (!ca) return 1;
            if (!cb) return -1;
            return (ca[sortBy] ?? 0) - (cb[sortBy] ?? 0);
          });

          return (
            <div key={city.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-bold text-foreground">{city.cityName}</h2>
                  <span className="text-xs text-muted-foreground">{city.startDateText} – {city.endDateText} · {city.nights}n</span>
                </div>
                {stats && (
                  <div className="text-right text-[10px] text-muted-foreground">
                    <div>{stats.min}€ – {stats.max}€</div>
                    <div>Avg: {stats.avgPerNight}€/n</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {sortedHotels.map((hotel, idx) => {
                  const calcs = getHotelCalcs(hotel, city.nights);
                  const isSelected = selectedId === hotel.id;
                  const isPending = hotel.priceStatus === 'pending';

                  return (
                    <div
                      key={hotel.id}
                      className={`bg-card rounded-xl border-2 p-3 shadow-sm transition-all ${
                        isSelected ? 'border-travel-confirmed shadow-md' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Opción {idx + 1}</span>
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{hotel.provider}</span>
                            <span className="text-[10px] bg-travel-confirmed-bg text-travel-confirmed px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Coffee className="h-2.5 w-2.5" /> Desayuno
                            </span>
                            {hotel.booked && (
                              <span className="text-[10px] bg-travel-confirmed text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                                Reservado
                              </span>
                            )}
                          </div>
                          {hotel.name && (
                            <p className="text-sm font-semibold text-foreground mt-1">{hotel.name}</p>
                          )}
                          {hotel.paymentNote && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{hotel.paymentNote}</p>
                          )}

                          {isPending ? (
                            <div className="mt-2">
                              {editingId === hotel.id ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    value={editPrice}
                                    onChange={e => setEditPrice(e.target.value)}
                                    placeholder="Precio total €"
                                    className="h-8 w-28 text-sm"
                                  />
                                  <Button size="sm" className="h-8" onClick={() => handleSavePrice(hotel.id)}>Guardar</Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setEditingId(hotel.id); setEditPrice(''); }}
                                  className="bg-travel-pending-bg text-travel-pending text-xs font-medium px-2 py-1 rounded mt-1"
                                >
                                  ⚠ PRECIO PENDIENTE — pulsa para añadir
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1.5">
                              <span className="text-xl font-bold text-foreground">{calcs?.total}€</span>
                              <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>{calcs?.perNight}€/noche</span>
                                <span>{calcs?.perPersonPerNight}€/pers/noche</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {!isPending && (
                            <button
                              onClick={() => isSelected ? deselectHotel(city.id) : selectHotel(city.id, hotel.id)}
                              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-travel-confirmed text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {isSelected ? 'Elegido' : 'Seleccionar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function SortChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-[10px] font-medium px-2 py-1 rounded border transition-colors ${
        active ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}
