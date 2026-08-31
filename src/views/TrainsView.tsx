import { useEffect, useState } from 'react';
import { useTrip } from '@/context/TripContext';
import { Train, Car, ArrowRight, MapPin, CheckCircle2, Calendar, Clock, Luggage, CalendarPlus, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MoreInfo from '@/components/MoreInfo';
import { downloadTripIcs, countTripAlerts } from '@/lib/calendarExport';
import { enablePush, getPushState, sendTestNotification, type PushState } from '@/lib/pushNotifications';
import { toast } from 'sonner';

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


/**
 * Las fichas se habían llenado de párrafos y María avisó (24/08/2026) de que se agobia
 * y se lía. Regla desde ahora: en la tarjeta solo dato corto y visual; la explicación
 * larga se pliega en "Ver detalle". Estos dos helpers recortan lo que ya está escrito
 * sin tener que reescribir los datos.
 */

/** 'Chongqing North · en Trip.com: "ChongqingBei" (重庆北站). Bei 北 = norte. Aquí...' → 'ChongqingBei' */
function stationShort(text?: string): string {
  if (!text) return '';
  const quoted = text.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  return text.split('·')[0].split('(')[0].split('—')[0].trim();
}

/** Primera frase, para enseñar la esencia y plegar el resto. */
function firstSentence(text?: string, max = 95): string {
  if (!text) return '';
  const cut = text.split(/(?<=[.:])\s/)[0].trim();
  return cut.length > max ? cut.slice(0, max).trimEnd() + '…' : cut;
}

/** Emoji de cabecera del aviso, para que el estado se lea de un vistazo. */
function noteTone(text?: string): 'ok' | 'warn' | 'bad' {
  if (!text) return 'ok';
  if (text.startsWith('✅')) return 'ok';
  if (text.startsWith('🔴')) return 'bad';
  return 'warn';
}

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

  const alertCount = countTripAlerts(transportLegs);

  // Suma de lo realmente pagado por los billetes. Se calcula, no se escribe a mano,
  // para que no pueda quedarse desfasada respecto a los datos de los tramos.
  const trainsPaidTotal = transportLegs.reduce((sum, leg) => sum + (leg.paidEur ?? 0), 0);

  const [pushState, setPushState] = useState<PushState | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    getPushState().then(setPushState).catch(() => setPushState('no-soportado'));
  }, []);

  const handleEnablePush = async () => {
    setPushBusy(true);
    try {
      const label = `iPhone · ${new Date().toLocaleDateString('es-ES')}`;
      const result = await enablePush(label);
      setPushState(result);
      if (result === 'activo') {
        await sendTestNotification();
        toast.success('Avisos activados en este móvil', {
          description: 'Te acabo de mandar una notificación de prueba.',
        });
      } else if (result === 'necesita-instalar') {
        toast.error('Primero añade la app a la pantalla de inicio', {
          description: 'Compartir → Añadir a inicio. iOS solo permite avisos así.',
        });
      } else if (result === 'denegado') {
        toast.error('Las notificaciones están bloqueadas', {
          description: 'Ajustes → Viaje China → Notificaciones, y actívalas.',
        });
      }
    } catch {
      toast.error('No se pudo activar', { description: 'Vuelve a intentarlo con conexión.' });
    } finally {
      setPushBusy(false);
    }
  };

  const handleAddToCalendar = () => {
    downloadTripIcs(transportLegs, getCityName);
    toast.success(`${alertCount} avisos listos`, {
      description: 'Acepta en el Calendario para añadirlos. Repítelo en el otro móvil.',
    });
  };

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
      {/* Lo único que queda por hacer con los trenes: comprobar que los 7 billetes se emiten. */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="rounded-lg bg-travel-confirmed-bg text-travel-confirmed px-3 py-2.5">
            <div className="text-sm font-bold">✅ Los 7 trenes están comprados</div>
            <div className="text-[11px] mt-0.5">
              {trainsPaidTotal.toFixed(2).replace('.', ',')} € los dos · pagados con la cuenta de María
            </div>
          </div>

          <h2 className="text-sm font-bold text-foreground mt-4">📅 Lo que queda por hacer</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
            Nada que comprar. Solo entrar en Trip.com estos 7 días y ver que el billete está emitido.
          </p>

          {nextWatch && (
            <div className="mb-3 rounded-lg bg-primary text-primary-foreground px-3 py-2">
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
                Comprobar que el billete se emitió: {nextWatch.label}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {watchDates.map(w => (
              <WatchRow key={`s-${w.id}`} w={w} />
            ))}
          </div>

          {!nextWatch && (
            <p className="text-[11px] text-travel-confirmed mt-3">
              ✅ Han pasado las 7 fechas: los billetes están emitidos y no queda nada pendiente aquí.
            </p>
          )}

          <MoreInfo label="¿Por qué hay que comprobar los billetes si ya están pagados?">
            <p>
              Los 7 se compraron en <span className="font-medium text-foreground">pre-reserva</span>, con dos meses de
              antelación. Trip.com cobró y guardó la orden, pero China no emite el billete de verdad hasta{' '}
              <span className="font-medium text-foreground">15 días antes</span> de cada viaje.
            </p>
            <p>
              De ahí esas 7 fechas entre el 28 de septiembre y el 12 de octubre: entrar y ver que el billete salió. Si
              alguna pre-reserva hubiera fallado, ese día hay que comprarlo a mano — por eso el del 6 de octubre
              (Chongqing → Fenghuang) lleva despertador: es el tramo con solo 3 trenes al día.
            </p>
          </MoreInfo>
        </div>
      </div>

      {/* Avisos al móvil. Se hace con el calendario del iPhone y no solo con push porque
          la alarma la dispara iOS en el propio dispositivo: suena sin cobertura, sin VPN
          y sin depender de que github.io (bloqueado en China) sea accesible. */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">🔔 Que el móvil os avise</h2>
          <p className="text-[11px] text-muted-foreground mt-1 mb-3">
            Añade los <span className="font-medium text-foreground">{alertCount} avisos</span> al Calendario del
            iPhone: los 7 días de comprobar el billete y, ya en el viaje, cada trayecto la noche antes y a la hora
            exacta de salir del hotel.
          </p>

          <Button onClick={handleAddToCalendar} className="w-full" size="sm">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Añadir los avisos al calendario
          </Button>

          <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
            Hazlo <span className="font-medium text-foreground">en cada móvil</span>. Se abrirá el Calendario
            pidiendo confirmación: acepta y ya está. Las alarmas suenan solas, sin internet y sin VPN.
          </p>

          {/* Push como refuerzo del calendario, nunca como sustituto: depende de red. */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs font-semibold text-foreground mb-1">Y además, notificación de la app</div>
            {pushState === 'activo' ? (
              <p className="text-[11px] text-travel-confirmed leading-snug">
                ✅ Activadas en este móvil. Llegarán además de las del calendario.
              </p>
            ) : pushState === 'necesita-instalar' ? (
              <p className="text-[11px] text-travel-pending leading-snug">
                Para esto hace falta abrir la app instalada, no en una pestaña: pulsa{' '}
                <span className="font-medium text-foreground">Compartir → Añadir a inicio</span>, ábrela desde el
                icono y vuelve aquí. iOS no permite notificaciones de otra forma.
              </p>
            ) : pushState === 'denegado' ? (
              <p className="text-[11px] text-travel-pending leading-snug">
                Están bloqueadas en el sistema. Ve a{' '}
                <span className="font-medium text-foreground">Ajustes → Viaje China → Notificaciones</span> y
                actívalas.
              </p>
            ) : pushState === 'no-soportado' ? (
              <p className="text-[11px] text-muted-foreground leading-snug">
                Este navegador no admite notificaciones. Los avisos del calendario sí funcionan.
              </p>
            ) : (
              <Button
                onClick={handleEnablePush}
                disabled={pushBusy}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                {pushBusy ? 'Activando…' : 'Activar notificaciones en este móvil'}
              </Button>
            )}
          </div>

          <MoreInfo label="Qué avisos se añaden exactamente">
            <p>
              <span className="font-medium text-foreground">7 avisos entre el 28 sept y el 12 oct</span>, para
              comprobar que cada billete se emitió cuando China abre la venta real. Cada uno suena a su hora, que
              depende de la estación de salida: los de Pekín, Xi'an y Chengdu a las 09:00 (abren de madrugada, no
              merece la pena levantarse), el de Chongqing a las{' '}
              <span className="font-medium text-foreground">4:50 de la madrugada</span> (es el tramo de solo 3 trenes)
              y los de Zhangjiajie y Shangrao a media mañana.
            </p>
            <p>
              <span className="font-medium text-foreground">2 avisos por cada día de trayecto</span>: uno la noche
              antes a las 20:00 con el tren del día siguiente, y otro justo a la hora de salir del hotel. Cada evento
              lleva dentro el número de tren, las dos estaciones, la hora y el traslado.
            </p>
            <p>
              Las horas van sin zona horaria a propósito: el iPhone las interpreta con su propio reloj, así que las de
              octubre suenan en hora china sin que tengas que hacer cuentas.
            </p>
            <p>
              Si algo cambia, vuelve a pulsar el botón: los avisos se actualizan solos porque cada uno lleva
              identificador propio, no se duplican.
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
            Las <span className="font-medium text-foreground">10 estaciones del viaje</span>, con el nombre tal cual
            lo escribe Trip.com. Útil para buscar el pedido, para el panel de la estación y para enseñárselo al
            conductor del Didi.
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

            {leg.paidEur != null && (
              <div className="mb-2 rounded-lg bg-travel-confirmed-bg text-travel-confirmed px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <div className="text-xs leading-tight">
                  <div className="text-sm font-bold">
                    Comprado · {leg.paidEur.toFixed(2).replace('.', ',')} €
                  </div>
                  <div className="opacity-80">
                    el {leg.paidOn} · cuenta de María · los dos billetes, 2ª clase
                  </div>
                </div>
              </div>
            )}

            {leg.travelDate && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">Viaje: {leg.travelDate}</span>
              </div>
            )}

            {(leg.departTime || leg.arriveTime) && (
              <div className="my-2 flex items-center justify-center gap-3 rounded-lg bg-muted/50 py-2">
                <div className="text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground leading-none">{leg.departTime}</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">salida</div>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  {leg.durationMinutes != null && (
                    <span className="text-[9px] text-muted-foreground tabular-nums">
                      {Math.floor(leg.durationMinutes / 60)}h{String(leg.durationMinutes % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground leading-none">{leg.arriveTime}</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">llegada</div>
                </div>
                {leg.leaveHotelTime && (
                  <div className="text-center border-l border-border pl-3 ml-1">
                    <div className="text-base font-bold tabular-nums text-travel-important leading-none">{leg.leaveHotelTime}</div>
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">salir hotel</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 text-xs mt-1">
              <span>
                {leg.paidEur != null
                  ? `Pagado: ${leg.paidEur.toFixed(2).replace('.', ',')}€`
                  : leg.price != null
                  ? `Se paga allí: ~${leg.price}€`
                  : <PendingBadge />}
              </span>
              <span>Duración: {leg.durationMinutes != null ? `${leg.durationMinutes} min` : <PendingBadge />}</span>
            </div>

            {(leg.fromStation || leg.toStation) && (
              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <code className="text-[11px] font-bold bg-muted px-1.5 py-0.5 rounded">{stationShort(leg.fromStation)}</code>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <code className="text-[11px] font-bold bg-muted px-1.5 py-0.5 rounded">{stationShort(leg.toStation)}</code>
                </div>
              </div>
            )}

            {/* El desayuno va incluido y pagado en los 10 hoteles: perderlo es tirar dinero,
                así que el veredicto se ve aquí y no solo en la pantalla Hoteles. */}
            {leg.breakfastNote && (
              <div
                className={`mt-2.5 text-[11px] leading-snug px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 ${
                  noteTone(leg.breakfastNote) === 'ok'
                    ? 'bg-travel-confirmed-bg text-travel-confirmed'
                    : 'bg-travel-pending-bg text-travel-pending'
                }`}
              >
                <span className="flex-shrink-0">☕</span>
                <span>{firstSentence(leg.breakfastNote, 80)}</span>
              </div>
            )}

            {leg.alertNote && (
              <div className="mt-2.5 bg-travel-important-bg text-travel-important text-[11px] leading-snug font-medium px-2.5 py-1.5 rounded-lg">
                {firstSentence(leg.alertNote, 110)}
              </div>
            )}

            {/* El detalle largo (maletas, márgenes, notas) queda plegado */}
            {(leg.transferBefore || leg.transferAfter || leg.stationBuffer || leg.notes || leg.saleOpensOn) && (
              <MoreInfo label="Ver detalle: estaciones, desayuno, maletas y notas">
                {(leg.fromStation || leg.toStation) && (
                  <p>
                    <span className="text-foreground font-medium">Estaciones completas:</span> {leg.fromStation}
                    {' → '}{leg.toStation}
                  </p>
                )}
                {leg.breakfastNote && (
                  <p><span className="text-foreground font-medium">☕ Desayuno:</span> {leg.breakfastNote}</p>
                )}
                {leg.alertNote && (
                  <p><span className="text-foreground font-medium">⚠️ Aviso completo:</span> {leg.alertNote}</p>
                )}
                {leg.transferBefore && (
                  <p className="flex gap-1.5">
                    <Luggage className="h-3.5 w-3.5 text-primary mt-px flex-shrink-0" />
                    <span><span className="text-foreground font-medium">Antes del tren:</span> {leg.transferBefore}</span>
                  </p>
                )}
                {leg.stationBuffer && (
                  <p>
                    <span className="text-foreground font-medium">
                      {leg.trainNumber ? 'Margen en la estación:' : 'Antes de salir:'}
                    </span>{' '}
                    {leg.stationBuffer}
                  </p>
                )}
                {leg.transferAfter && (
                  <p><span className="text-foreground font-medium">Después del tren:</span> {leg.transferAfter}</p>
                )}
                {leg.saleOpensOn && (
                  <p>
                    <span className="text-foreground font-medium">📅 Día de comprobar el billete:</span>{' '}
                    {leg.saleOpensOn}
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
  /** Comprobar que el billete se emitió (D-15). Es lo único que queda: los 7 están pagados. */
  kind: 'sale';
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
  legs: { id: string; fromCityId: string; toCityId: string; saleOpensIso?: string; travelDate?: string; alertNote?: string }[],
  getCityName: (id: string) => string,
): WatchDate[] {
  const out: WatchDate[] = [];
  for (const leg of legs) {
    const label = `${getCityName(leg.fromCityId)} → ${getCityName(leg.toCityId)}`;
    const travelLabel = leg.travelDate?.split(' (')[0] ?? '';
    const critical = (leg.alertNote ?? '').includes('🔴🔴') || (leg.alertNote ?? '').includes('MÁS CRÍTICO');
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
