import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { getHotelCalcs, getCityHotelStats, getHotelDeposits } from '@/lib/calculations';
import { Check, ExternalLink, Coffee, Wallet, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MoreInfo from '@/components/MoreInfo';

type SortKey = 'total' | 'perNight' | 'perPersonPerNight';

export default function HotelsView() {
  const { data, selectHotel, deselectHotel, updateHotelPrice } = useTrip();
  const { cities, hotels, selectedHotels } = data;
  const earlyStarts = data.earlyStarts ?? [];
  const blocked = earlyStarts.filter(e => e.verdict === 'imposible');
  const tight = earlyStarts.filter(e => e.verdict === 'muy-justo');
  // Arriba solo se pintan los días que exigen hacer algo; los que encajan de sobra
  // se quedan plegados al final para no llenar la pantalla de "todo bien".
  const actionableStarts = earlyStarts.filter(e => e.verdict !== 'ok');
  const fittingStarts = earlyStarts.filter(e => e.verdict === 'ok');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('total');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const filteredCities = filterCity === 'all' ? cities : cities.filter(c => c.id === filterCity);
  const deposits = getHotelDeposits(cities, hotels, selectedHotels);

  const handleSavePrice = (hotelId: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updateHotelPrice(hotelId, price);
      setEditingId(null);
      setEditPrice('');
    }
  };

  return (
    <>
      {/* Resumen de depósitos al check-in */}
      {deposits.items.length > 0 && (
        <div className="px-4 mb-3">
          <div className="bg-card rounded-xl border-2 border-travel-pending/40 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-travel-pending uppercase tracking-wide">
              <Wallet className="h-3.5 w-3.5" /> Saldo para depósitos
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">¥{deposits.totalCny}</span>
              <span className="text-sm font-semibold text-muted-foreground">≈ {deposits.totalEur.toFixed(2)} €</span>
            </div>
            <p className="text-[11px] text-foreground mt-0.5">
              Hay que llevarlo libre en la tarjeta, además del presupuesto.
            </p>
            <div className="mt-2 pt-2 border-t border-border space-y-1">
              {deposits.items.map(d => (
                <div key={d.cityId} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate pr-2">
                    {d.cityName.split(' (')[0]} · {d.checkInText}
                  </span>
                  <span className="font-semibold text-foreground whitespace-nowrap">
                    ¥{d.cny} ({d.eur.toFixed(2)} €)
                  </span>
                </div>
              ))}
            </div>
            <MoreInfo label="Cómo funciona el depósito">
              <p>
                Solo estos {deposits.items.length} hoteles piden depósito; los otros {deposits.hotelsWithoutDeposit} no
                tienen esta política, así que el total está cerrado.
              </p>
              <p>
                Se cobra al registrar la entrada y se devuelve al salir, pero la devolución puede tardar días → no
                contéis con ese dinero durante el viaje.
              </p>
            </MoreInfo>
          </div>
        </div>
      )}

      {/* Madrugones vs. horario de desayuno */}
      {earlyStarts.length > 0 && (
        <div className="px-4 mb-3">
          <div className="bg-card rounded-xl border-2 border-border p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
              <AlarmClock className="h-3.5 w-3.5" /> Desayuno los días de madrugón
            </div>
            <p className="text-[11px] text-foreground mt-1">
              <span className="font-semibold text-travel-pending">{blocked.length} días no da tiempo</span> y{' '}
              <span className="font-semibold">{tight.length} van al límite</span>. Esos días, pedidlo para llevar la
              noche antes.
            </p>

            <div className="mt-2 space-y-2">
              {actionableStarts.map(es => {
                const style =
                  es.verdict === 'imposible'
                    ? { box: 'bg-travel-pending-bg/50 border-travel-pending/40', label: 'text-travel-pending', tag: 'NO DA TIEMPO' }
                    : { box: 'bg-muted/60 border-border', label: 'text-foreground', tag: 'AL LÍMITE' };
                return (
                  <div key={es.id} className={`rounded-lg border px-2.5 py-2 ${style.box}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold text-foreground leading-snug">{es.dateText}</p>
                      <span className={`text-[9px] font-bold whitespace-nowrap ${style.label}`}>{style.tag}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                      <span className="text-muted-foreground">
                        Salís: <span className="font-semibold text-foreground">{es.leaveHotelAt}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Desayuno: <span className="font-semibold text-foreground">{es.breakfastHours}</span>
                      </span>
                      <span className={`font-semibold ${style.label}`}>
                        {es.marginMinutes < 0
                          ? `${Math.abs(es.marginMinutes)} min antes de que abra`
                          : es.marginMinutes === 0
                          ? 'Justo en el filo'
                          : `${es.marginMinutes} min`}
                      </span>
                    </div>
                    <MoreInfo label="Qué hacer ese día">
                      <p>{es.reason}</p>
                      <p className="text-foreground">{es.advice}</p>
                    </MoreInfo>
                  </div>
                );
              })}
            </div>

            <MoreInfo label="Cómo pedir el desayuno para llevar">
              <p>
                En recepción la noche antes:{' '}
                <span className="font-medium text-foreground">请帮我们准备两份打包早餐，明天早上很早出发</span>{' '}
                («preparadnos dos desayunos para llevar, mañana salimos muy temprano»). En China es normal y se llama{' '}
                <span className="font-medium text-foreground">打包早餐</span> (dǎbāo zǎocān).
              </p>
              <p>
                Horarios de desayuno verificados el 3 ago 2026, cruzados con la hora real de salida de cada día.
              </p>
            </MoreInfo>

            {fittingStarts.length > 0 && (
              <MoreInfo label={`Los ${fittingStarts.length} días que encajan de sobra`}>
                {fittingStarts.map(es => (
                  <p key={es.id} className="text-foreground">
                    <span className="font-medium">{es.dateText}</span> — salís {es.leaveHotelAt}, desayuno{' '}
                    {es.breakfastHours}. No hay que hacer nada.
                  </p>
                ))}
              </MoreInfo>
            )}
          </div>
        </div>
      )}

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
                      className={`bg-card rounded-xl border-2 overflow-hidden shadow-sm transition-all ${
                        isSelected ? 'border-travel-confirmed shadow-md' : 'border-border'
                      }`}
                    >
                      {hotel.imageUrl && (
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name ?? `Hotel en ${city.cityName}`}
                          loading="lazy"
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="flex items-start justify-between p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sortedHotels.length > 1 && <span className="text-xs text-muted-foreground">Opción {idx + 1}</span>}
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
                          {hotel.nameZh && (
                            <div className="mt-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5">
                              <div className="text-[9px] uppercase tracking-wide text-muted-foreground mb-0.5">
                                Para buscarlo en Amap · toca para seleccionar
                              </div>
                              <p className="text-[13px] font-semibold text-foreground leading-snug select-all">
                                {hotel.nameZh}
                              </p>
                              {hotel.addressZh && (
                                <p className="text-[11px] text-muted-foreground leading-snug select-all mt-0.5">
                                  {hotel.addressZh}
                                </p>
                              )}
                            </div>
                          )}
                          {hotel.paymentNote && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {hotel.paymentNote}
                              {/* Las 10 reservas se hicieron con la cuenta de María, así que los cargos
                                  automáticos de octubre salen de ahí y no de la cuenta conjunta. */}
                              <span className="text-foreground"> · cuenta de María</span>
                            </p>
                          )}
                          {(hotel.checkInTime || hotel.checkOutTime) && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Check-in: <span className="font-medium text-foreground">{hotel.checkInTime}</span>
                              {' · '}
                              Check-out: <span className="font-medium text-foreground">{hotel.checkOutTime}</span>
                            </p>
                          )}
                          {hotel.breakfastHours && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-start gap-1">
                              <Coffee className="h-3 w-3 mt-[1px] shrink-0" />
                              <span>
                                Desayuno: <span className="font-medium text-foreground">{hotel.breakfastHours}</span>
                                {hotel.breakfastType && <span className="text-muted-foreground"> · {hotel.breakfastType}</span>}
                              </span>
                            </p>
                          )}
                          {hotel.breakfastAlert && (
                            <p className={`text-[10px] mt-1 leading-snug ${
                              hotel.breakfastAlert.startsWith('⚠️') ? 'text-travel-pending' : 'text-muted-foreground'
                            }`}>
                              {hotel.breakfastAlert}
                            </p>
                          )}
                          {hotel.depositCny != null && (
                            <div className="mt-2 rounded-lg bg-travel-pending-bg/60 border border-travel-pending/30 px-2.5 py-1.5">
                              <p className="text-[11px] font-semibold text-travel-pending flex items-center gap-1">
                                <Wallet className="h-3 w-3" />
                                Depósito al check-in: ¥{hotel.depositCny}
                                {hotel.depositEur != null && ` (${hotel.depositEur.toFixed(2)} €)`}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {hotel.depositNote ?? 'Se paga al completar el registro de entrada.'} Hay que llevar la tarjeta con saldo.
                              </p>
                            </div>
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
    </>
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
