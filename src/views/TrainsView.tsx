import { useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight, MapPin, CalendarClock, Calendar, Clock, Luggage } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MoreInfo from '@/components/MoreInfo';

/**
 * Trenes entre ciudades: las fechas en que hay que entrar en Trip.com y la ficha
 * de cada tramo. Los traslados de aeropuerto y los de dentro de la ciudad están
 * en `TransfersView` (misma pantalla "Moverse", otra sub-pestaña).
 */
/**
 * Nombre exacto de cada estación tal y como lo escribe Trip.com en su buscador,
 * verificado contra la venta real el 07/08/2026. En orden de uso durante el viaje.
 */
const TRIP_STATION_NAMES: { name: string; zh: string; warn?: string }[] = [
  { name: 'Beijing West', zh: '北京西站', warn: 'No confundir con Beijing Fengtai ni Qinghe: hay trenes a Xi\'an que salen de ahí' },
  { name: "Xi'an North", zh: '西安北站' },
  { name: 'Chengdu East', zh: '成都东站' },
  { name: 'Chongqing North', zh: '重庆北站', warn: 'Llegáis aquí el 19 oct. Es la más céntrica' },
  { name: 'Chongqing East', zh: '重庆东站', warn: 'Salís de aquí el 21 oct. Es OTRA estación, a 21 km del hotel. Abrió el 27 jun 2025' },
  { name: 'Fenghuang Gucheng', zh: '凤凰古城站', warn: 'No es «Fenghuang» a secas' },
  { name: 'Furongzhen', zh: '芙蓉镇站', warn: 'Todo junto. No es «Furong», ni Yongshun, ni Guzhang' },
  { name: 'Zhangjiajie West', zh: '张家界西站', warn: 'A veces aparece como «Zhangjiajiexi». No es «Zhangjiajie», que es la estación antigua' },
  { name: 'Shangrao', zh: '上饶站' },
  { name: 'Shanghai Hongqiao', zh: '上海虹桥站', warn: 'No «Shanghai» a secas, ni South, ni West' },
];

export default function TrainsView() {
  const { data, updateTransportLeg } = useTrip();
  const { cities, transportLegs } = data;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ price: '', duration: '' });

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName?.split(' (')[0] || id;

  // Fechas en que hay que estar atenta, calculadas en vivo contra el día de hoy
  // para que la cuenta atrás nunca quede desfasada.
  const watchDates = buildWatchDates(transportLegs, getCityName);
  const nextWatch = watchDates.find(w => w.daysLeft >= 0);

  const handleSave = (id: string) => {
    const price = editValues.price ? parseFloat(editValues.price) : null;
    const duration = editValues.duration ? parseInt(editValues.duration) : null;
    updateTransportLeg(id, {
      ...(price !== null && { price, status: 'known' as const }),
      ...(duration !== null && { durationMinutes: duration }),
    });
    setEditingId(null);
    setEditValues({ price: '', duration: '' });
  };

  return (
    <>
      {/* Lo único que hay que hacer hoy con los trenes: mirar el calendario */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">📅 Días en que tienes que estar atenta</h2>

          {nextWatch ? (
            <div className="mt-2 mb-3 rounded-lg bg-primary text-primary-foreground px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide opacity-80">Lo siguiente que te toca</div>
              <div className="text-sm font-bold leading-tight mt-0.5">
                {nextWatch.daysLeft === 0
                  ? '¡HOY!'
                  : nextWatch.daysLeft === 1
                  ? 'Mañana'
                  : `Faltan ${nextWatch.daysLeft} días`}
                {' · '}{nextWatch.dateLabel}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {nextWatch.kind === 'pre'
                  ? `Activar la pre-reserva en Trip.com: ${nextWatch.label}`
                  : `Comprobar que el billete se emitió: ${nextWatch.label}`}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-travel-confirmed mt-1 mb-3">
              ✅ Ya han pasado todas las fechas de la lista: solo queda comprobar que los billetes están emitidos.
            </p>
          )}

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Agosto · activar pre-reserva
          </div>
          <div className="space-y-1.5">
            {watchDates.filter(w => w.kind === 'pre').map(w => (
              <WatchRow key={`p-${w.id}`} w={w} />
            ))}
          </div>

          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1.5">
            Sept-oct · comprobar que el billete salió
          </div>
          <div className="space-y-1.5">
            {watchDates.filter(w => w.kind === 'sale').map(w => (
              <WatchRow key={`s-${w.id}`} w={w} />
            ))}
          </div>

          <MoreInfo label="Por qué hay dos fechas por tren">
            <p>
              Primero, en agosto, <span className="font-medium text-foreground">activar la pre-reserva</span> en
              Trip.com (60 días antes del viaje): Trip.com compra sola en cuanto China abra la venta.
            </p>
            <p>
              Después, ya en octubre,{' '}
              <span className="font-medium text-foreground">comprobar que el billete se emitió de verdad</span> (15 días
              antes, que es cuando 12306 abre la venta real).
            </p>
            <p>
              <span className="font-medium text-foreground">Fechas recalculadas el 7 ago 2026</span> con la ventana
              real medida ese día: Trip.com dejaba llegar hasta el 4 de octubre, o sea{' '}
              <span className="font-medium text-foreground">58 días</span> por delante, no 60. Por eso cada fecha se ha
              movido 2 días más tarde. Si quieres ir sobrada puedes probar un par de días antes: no pasa nada, como
              mucho te dirá que aún no.
            </p>
            <p>
              Ojo, son dos calendarios distintos dentro de Trip.com: el de{' '}
              <span className="font-medium text-foreground">venta real</span> hoy solo llega a 15 días vista, y el de{' '}
              <span className="font-medium text-foreground">pre-reserva</span> es el que llega a 58. El primer tren del
              viaje es el 13 de octubre, así que hoy todavía no se puede tocar nada.
            </p>
            <p>
              El cambio de hotel Zhangjiajie → Wulingyuan del 24 oct no sale aquí: es un Didi que se pide en el
              momento.
            </p>
          </MoreInfo>
        </div>
      </div>

      {/* Chuleta de nombres exactos: lo que hay que teclear literalmente en el buscador
          de Trip.com. Verificado contra la venta real el 07/08/2026. */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">🚉 Cómo se llama cada estación en Trip.com</h2>
          <p className="text-[11px] text-muted-foreground mt-1 mb-3">
            Escribe el nombre <span className="font-medium text-foreground">tal cual</span> aparece aquí. Las 11
            estaciones están abiertas y vendiendo billetes (comprobado el 7 ago 2026).
          </p>

          <div className="space-y-1.5">
            {TRIP_STATION_NAMES.map(s => (
              <div key={s.name} className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{s.zh}</span>
                </div>
                {s.warn && <div className="text-[10px] text-travel-important mt-0.5 leading-snug">{s.warn}</div>}
              </div>
            ))}
          </div>

          <MoreInfo label="¿Por qué esa estación y no otra más cerca del hotel?">
            <p>
              Comprobado el 7 ago 2026 en las cinco ciudades que tienen más de una estación. El criterio es{' '}
              <span className="font-medium text-foreground">tren directo primero</span>, cercanía después.
            </p>
            <p>
              <span className="font-medium text-foreground">Pekín:</span> no sale ningún tren de alta velocidad a
              Xi'an desde la estación central, que sería la más cercana al hotel. Beijing West es obligada.
            </p>
            <p>
              <span className="font-medium text-foreground">Xi'an:</span> sí hay dos trenes a la estación central
              (a 2,5 km del hotel, frente a los 13 km de Xi'an North), pero tardan 5h54 en vez de 4h10. Casi dos
              horas más de tren para ahorrar 20 min de coche no compensa.
            </p>
            <p>
              <span className="font-medium text-foreground">Chengdu:</span> Chengdu South cae más cerca del hotel,
              pero no hay ningún directo desde Xi'an. Chengdu East es obligada.
            </p>
            <p>
              <span className="font-medium text-foreground">Chongqing:</span> hay directo tanto a Chongqing North
              como a Shapingba. Se mantiene North: yendo en Didi la distancia es casi la misma (8 vs 9 km) y North
              tiene 154 trenes al día de red de seguridad, frente a 2 en la franja de mañana a Shapingba.
            </p>
            <p>
              <span className="font-medium text-foreground">Shanghái:</span> no hay ningún tren desde Shangrao a la
              estación central. Hongqiao es obligada.
            </p>
          </MoreInfo>

          <MoreInfo label="Los tres errores fáciles de cometer">
            <p>
              <span className="font-medium text-foreground">Chongqing tiene 4 estaciones.</span> Llegáis el 19 oct a
              Chongqing North y salís el 21 oct desde Chongqing East, que es otra distinta y está a 21 km del hotel.
            </p>
            <p>
              <span className="font-medium text-foreground">Los pueblos llevan sufijo.</span> La estación de Fenghuang
              es «Fenghuang Gucheng» y la de Furong es «Furongzhen». Sin el sufijo, o no aparece o es otro sitio.
            </p>
            <p>
              <span className="font-medium text-foreground">En Shanghái, siempre Hongqiao.</span> «Shanghai» a secas es
              otra estación distinta y peor comunicada con el hotel.
            </p>
          </MoreInfo>
        </div>
      </div>

      {/* 4 bultos entre los dos (2 facturadas + 2 de cabina): condiciona el asiento del tren. */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">🧳 Vais con 4 bultos</h2>
          <p className="text-[11px] text-muted-foreground mt-1 mb-3">
            2 maletas facturadas + 2 de cabina. Con eso el Didi normal os vale, pero hay dos detalles útiles.
          </p>

          <div className="rounded-lg bg-muted/50 px-3 py-2 mb-2">
            <div className="text-xs font-semibold text-foreground">🚗 El Didi normal (快车) os sirve</div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Dos maletas grandes entran en el maletero de un turismo y las de cabina van dentro con vosotros. Si las
              facturadas son de 28" y veis que el coche asignado es pequeño, subid a{' '}
              <span className="font-medium text-foreground">优享 o 6 plazas (六座)</span>. Los traslados que no admiten
              fallo, dejadlos <span className="font-medium text-foreground">programados con antelación</span>: Didi
              acepta reservas hasta 7 días antes y cierra el precio.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-xs font-semibold text-foreground">🚄 En el tren, fila 1 o última del vagón</div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Las maletas grandes no caben en el portaequipajes de encima del asiento: van en los estantes de los
              extremos del vagón. Si elegís asiento en la primera o la última fila, las tenéis al lado y no las
              arrastráis por el pasillo.
            </p>
          </div>

          <MoreInfo label="¿Las maletas dan algún problema en el tren bala?">
            <p>
              <span className="font-medium text-foreground">No. En los trenes chinos no hay límite de número de
              bultos</span> — las normas solo hablan de peso y de tamaño por pieza. Y no se factura nada: en alta
              velocidad lo subís todo vosotros al vagón.
            </p>
            <p>
              Los dos límites teóricos: <span className="font-medium text-foreground">20 kg por adulto</span> y{' '}
              <span className="font-medium text-foreground">130 cm por bulto</span> sumando largo + ancho + alto (160
              cm en trenes normales). Una maleta facturada de avión suele ir a 23 kg y una de 28" ronda los 158 cm, o
              sea que sobre el papel os pasáis en las dos cosas. En la práctica no pesan ni miden nada salvo que sea
              algo escandaloso, y con 4 bultos entre dos personas no vais a llamar la atención.
            </p>
            <p>
              Lo único real es dónde ponerlas: los estantes están en las uniones entre vagones, de ahí lo de coger
              asiento en la primera o la última fila.
            </p>
            <p>
              <span className="font-medium text-foreground">El traslado que sí necesita cuidado</span> es el del 21 de
              octubre a Chongqing East: 21 km desde el hotel, a las 07:15 y en hora punta. Es el más largo del viaje
              hasta una estación y solo hay 3 trenes al día si lo perdéis.
            </p>
          </MoreInfo>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {transportLegs.map((leg, idx) => (
          <div key={leg.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {leg.fromStation || leg.toStation
                  ? <Train className="h-4 w-4 text-primary" />
                  : <Car className="h-4 w-4 text-amber-600" />}
                <span className="font-medium text-sm text-foreground">{getCityName(leg.fromCityId)}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-sm text-foreground">{getCityName(leg.toCityId)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Tramo {idx + 1}/{transportLegs.length}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="bg-muted px-1.5 py-0.5 rounded">{leg.mode}</span>
            </div>

            {leg.preBookingFrom && (
              <div className="mb-2 bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 flex-shrink-0" />
                <div className="text-xs leading-tight">
                  <div className="opacity-80">Entra tú en Trip.com este día:</div>
                  <div className="text-sm font-bold">{leg.preBookingFrom}</div>
                </div>
              </div>
            )}

            {leg.travelDate && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">Viaje: {leg.travelDate}</span>
              </div>
            )}

            {(leg.suggestedDeparture || leg.estimatedArrival) && (
              <div className="flex items-start gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-foreground">
                  <div><span className="text-muted-foreground">Salida:</span> <span className="font-medium">{leg.suggestedDeparture}</span></div>
                  <div><span className="text-muted-foreground">Llegada:</span> <span className="font-medium">{leg.estimatedArrival}</span></div>
                </div>
              </div>
            )}

            <div className="flex gap-4 text-xs mt-1">
              <span>Precio: {leg.price != null ? `${leg.price}€` : <PendingBadge />}</span>
              <span>Duración: {leg.durationMinutes != null ? `${leg.durationMinutes} min` : <PendingBadge />}</span>
            </div>

            {(leg.fromStation || leg.toStation) && (
              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-snug text-foreground">
                  <div><span className="text-muted-foreground">Escribe en Trip.com — Origen:</span> <span className="font-medium">{leg.fromStation}</span></div>
                  <div><span className="text-muted-foreground">Destino:</span> <span className="font-medium">{leg.toStation}</span></div>
                </div>
              </div>
            )}

            {leg.alertNote && (
              <div className="mt-2.5 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg">
                {leg.alertNote}
              </div>
            )}

            {/* El detalle largo (maletas, márgenes, notas) queda plegado */}
            {(leg.transferBefore || leg.transferAfter || leg.stationBuffer || leg.notes || leg.saleOpensOn) && (
              <MoreInfo label="Maletas, márgenes y notas del tramo">
                {leg.transferBefore && (
                  <p className="flex gap-1.5">
                    <Luggage className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                    <span><span className="text-foreground font-medium">Antes del tren:</span> {leg.transferBefore}</span>
                  </p>
                )}
                {leg.stationBuffer && (
                  <p><span className="text-foreground font-medium">Margen en la estación:</span> {leg.stationBuffer}</p>
                )}
                {leg.transferAfter && (
                  <p><span className="text-foreground font-medium">Después del tren:</span> {leg.transferAfter}</p>
                )}
                {leg.saleOpensOn && (
                  <p>
                    Si haces la pre-reserva en la fecha de arriba, Trip.com la compra sola en cuanto China abra la venta
                    real (será a partir del <span className="font-medium text-foreground">{leg.saleOpensOn}</span>). Si
                    no la hiciste a tiempo, entra tú ese día a comprarla a mano.
                  </p>
                )}
                {leg.notes && <p>{leg.notes}</p>}
              </MoreInfo>
            )}

            {editingId === leg.id ? (
              <div className="mt-3 flex gap-2 items-center">
                <Input type="number" placeholder="€" value={editValues.price} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="h-8 w-20 text-xs" />
                <Input type="number" placeholder="min" value={editValues.duration} onChange={e => setEditValues(v => ({ ...v, duration: e.target.value }))} className="h-8 w-20 text-xs" />
                <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(leg.id)}>Guardar</Button>
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
      </div>
    </>
  );
}

function PendingBadge() {
  return <span className="bg-travel-pending-bg text-travel-pending text-[10px] font-medium px-1.5 py-0.5 rounded">PENDIENTE</span>;
}

interface WatchDate {
  id: string;
  /** 'pre' = activar la pre-reserva en Trip.com (D-60). 'sale' = comprobar que el billete salió (D-15). */
  kind: 'pre' | 'sale';
  iso: string;
  /** Ej. "vie 14 ago" */
  dateLabel: string;
  /** Ej. "Beijing → Xi'an" */
  label: string;
  /** Ej. "13 oct" */
  travelLabel: string;
  /** Días desde hoy: 0 = hoy, negativo = ya pasó. */
  daysLeft: number;
  /** true en los tramos con riesgo alto (pocos trenes o Golden Week). */
  critical: boolean;
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** Días de calendario entre hoy y una fecha ISO, ignorando la hora. */
function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86400000);
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} ${MESES[m - 1]}`;
}

export function buildWatchDates(
  legs: { id: string; fromCityId: string; toCityId: string; preBookingIso?: string; saleOpensIso?: string; travelDate?: string; alertNote?: string }[],
  getCityName: (id: string) => string,
): WatchDate[] {
  const out: WatchDate[] = [];
  for (const leg of legs) {
    const label = `${getCityName(leg.fromCityId)} → ${getCityName(leg.toCityId)}`;
    const travelLabel = leg.travelDate?.split(' (')[0] ?? '';
    const critical = (leg.alertNote ?? '').includes('🔴🔴') || (leg.alertNote ?? '').includes('MÁS CRÍTICO');
    if (leg.preBookingIso) {
      out.push({ id: leg.id, kind: 'pre', iso: leg.preBookingIso, dateLabel: formatDateLabel(leg.preBookingIso), label, travelLabel, daysLeft: daysUntil(leg.preBookingIso), critical });
    }
    if (leg.saleOpensIso) {
      out.push({ id: leg.id, kind: 'sale', iso: leg.saleOpensIso, dateLabel: formatDateLabel(leg.saleOpensIso), label, travelLabel, daysLeft: daysUntil(leg.saleOpensIso), critical });
    }
  }
  return out.sort((a, b) => a.iso.localeCompare(b.iso));
}

function WatchRow({ w }: { w: WatchDate }) {
  const past = w.daysLeft < 0;
  const today = w.daysLeft === 0;
  return (
    <div className={`flex items-center gap-2 text-xs ${past ? 'opacity-45' : ''}`}>
      <span className={`font-mono font-bold w-[74px] flex-shrink-0 whitespace-nowrap ${today ? 'text-travel-pending' : 'text-primary'}`}>
        {w.dateLabel}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="text-foreground truncate">
        {w.critical && <span title="Tramo con pocos trenes: no fallar este día">🔴 </span>}
        {w.label}
      </span>
      <span className={`text-[10px] ml-auto flex-shrink-0 font-medium ${today ? 'text-travel-pending' : 'text-muted-foreground'}`}>
        {today ? '¡HOY!' : past ? 'ya pasó' : w.daysLeft === 1 ? 'mañana' : `en ${w.daysLeft} d`}
      </span>
    </div>
  );
}
