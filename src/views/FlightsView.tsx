import { useTrip } from '@/context/TripContext';
import { Plane, Clock, Luggage, ArrowRight, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FlightTimeline } from '@/types/trip';
import MoreInfo from '@/components/MoreInfo';

export default function FlightsView() {
  const { data } = useTrip();
  const outbound = data.flights.filter(f => f.direction === 'outbound');
  const returnFlights = data.flights.filter(f => f.direction === 'return');

  return (
    <div className="px-4 space-y-6">
      <FlightSection title="✈️ Ida — 9 oct 2026" legs={outbound} />
      <FlightSection title="✈️ Vuelta — 1 nov 2026" legs={returnFlights} />

      <Link to="/moverse/traslados" className="flex items-center gap-2.5 bg-primary/10 border border-primary/30 rounded-xl px-3.5 py-3 text-primary">
        <Car className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">Cómo llegar al aeropuerto</div>
          <div className="text-[11px] opacity-80 leading-tight">Hora de salir del hotel, opciones y precio</div>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0" />
      </Link>

      <JetLagSection />

      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">🕐 El cambio de hora</h2>
        <div className="space-y-4">
          {(data.flightTimelines ?? []).map(tl => (
            <TimelineCard key={tl.id} tl={tl} />
          ))}
          <DstCard />
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ tl }: { tl: FlightTimeline }) {
  const goingEast = tl.direction === 'outbound';

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className={`px-4 py-2.5 ${goingEast ? 'bg-primary/10' : 'bg-secondary/10'}`}>
        <div className="text-sm font-bold text-foreground">{tl.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{tl.spainOffset} · {tl.chinaOffset}</div>
      </div>

      <div className="p-4">
        {/* Las tres cifras que importan */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-travel-confirmed-bg">
            <div className="text-base font-bold text-travel-confirmed leading-tight">{tl.realDuration}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">viajando de verdad</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-base font-bold text-foreground leading-tight">{tl.clockDuration}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">lo que parece en el reloj</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-travel-pending-bg">
            <div className="text-base font-bold text-travel-pending leading-tight">{tl.clockJump}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">salta el reloj</div>
          </div>
        </div>

        {/* Doble reloj en cada escala */}
        <div className="rounded-lg border border-border overflow-hidden mb-3">
          <div className="grid grid-cols-[1fr_66px_66px] gap-2 px-2.5 py-1.5 bg-muted/60 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span />
            <span className="text-right">🇪🇸 España</span>
            <span className="text-right">🇨🇳 China</span>
          </div>
          {tl.milestones.map((m, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_66px_66px] gap-2 px-2.5 py-2 items-center ${
                i > 0 ? 'border-t border-border' : ''
              } ${m.dayChange ? 'bg-travel-pending-bg/40' : ''}`}
            >
              <span className="text-[11px] text-foreground leading-snug">{m.label}</span>
              <Stamp value={m.spainTime} highlight={m.dayChange && !goingEast} />
              <Stamp value={m.chinaTime} highlight={m.dayChange && goingEast} />
            </div>
          ))}
        </div>

        <p className="text-xs text-foreground leading-snug">{tl.summary}</p>

        {tl.advice.length > 0 && (
          <MoreInfo label={`${tl.advice.length} consejos para este vuelo`}>
            {tl.advice.map((a, i) => (
              <p key={i} className="flex items-start gap-1.5">
                <span className="text-primary flex-shrink-0">→</span>
                <span>{a}</span>
              </p>
            ))}
          </MoreInfo>
        )}
      </div>
    </div>
  );
}

/** Fecha pequeña arriba y hora grande debajo, para que no se parta de cualquier manera. */
function Stamp({ value, highlight }: { value: string; highlight?: boolean }) {
  const [date, time] = value.split(' · ');
  return (
    <span className="text-right leading-tight">
      <span className={`block text-[9px] ${highlight ? 'font-bold text-travel-pending' : 'text-muted-foreground'}`}>
        {date}
      </span>
      <span className={`block text-[12px] font-mono ${highlight ? 'font-bold text-foreground' : 'text-foreground/80'}`}>
        {time}
      </span>
    </span>
  );
}

/** El detalle que explica por qué la diferencia es de 6 h a la ida y de 7 h a la vuelta. */
function DstCard() {
  return (
    <div className="bg-card rounded-xl border-2 border-travel-pending/40 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-travel-pending uppercase tracking-wide mb-2">
        <Clock className="h-3.5 w-3.5" /> ¿Por qué 6 h a la ida y 7 h a la vuelta?
      </div>
      <p className="text-xs text-foreground leading-snug">
        Porque <strong>el cambio de hora en España os pilla estando ya en China</strong>, el 25 de octubre.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-muted">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Del 10 al 24 oct</div>
          <div className="text-lg font-bold text-foreground">+6 h</div>
          <div className="text-[10px] text-muted-foreground leading-tight">China va 6 h por delante de España</div>
        </div>
        <div className="p-2.5 rounded-lg bg-muted">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Del 25 oct al 1 nov</div>
          <div className="text-lg font-bold text-foreground">+7 h</div>
          <div className="text-[10px] text-muted-foreground leading-tight">China va 7 h por delante de España</div>
        </div>
      </div>
      <MoreInfo label="Cómo funciona y cómo calcular la hora de casa">
        <p>
          El domingo <span className="font-medium text-foreground">25 de octubre</span> a las 03:00 en España se atrasan
          los relojes a las 02:00 (entra el horario de invierno). Ese día vosotros estáis en{' '}
          <span className="font-medium text-foreground">Wulingyuan</span> y no notáis nada, pero a partir de ese momento
          la diferencia con casa pasa de 6 a 7 horas.
        </p>
        <p>
          Práctico para llamar a casa: si en China es mediodía, en España son las 6 de la mañana (o las 5 después del
          día 25). En China no se cambia la hora nunca, es UTC+8 todo el año y en todo el país, aunque sea enorme.
        </p>
      </MoreInfo>
    </div>
  );
}

function FlightSection({ title, legs }: { title: string; legs: any[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">
        {legs.map((leg: any, idx: number) => (
          <div key={leg.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{leg.flightNumber}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{leg.airline}</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{leg.cabinClass}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{leg.fromAirport}</div>
                  <div className="text-xs text-muted-foreground">{leg.departureDateTime.split('T')[1]}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor(leg.durationMinutes / 60)}h {leg.durationMinutes % 60}m
                  </div>
                  <div className="w-full h-px bg-border relative my-1">
                    <ArrowRight className="h-3 w-3 text-primary absolute right-0 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{leg.toAirport}</div>
                  <div className="text-xs text-muted-foreground">{leg.arrivalDateTime.split('T')[1]}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Luggage className="h-3 w-3" />{leg.baggage}</span>
                {leg.layoverMinutes && (
                  <span className="bg-travel-pending-bg text-travel-pending px-2 py-0.5 rounded font-medium">
                    Escala: {Math.floor(leg.layoverMinutes / 60)}h {leg.layoverMinutes % 60}m
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Plan antijet lag ─────────────────────────
 * Contenido estático (como DstCard): no es un dato del viaje que cambie,
 * es el procedimiento de adaptación horaria calculado sobre ESTOS vuelos.
 * La lógica de fondo: hacia el este (ida) hay que ADELANTAR el reloj del
 * cuerpo, y para eso la luz de primera hora juega en contra hasta que el
 * cuerpo se recoloca; hacia el oeste (vuelta) hay que ATRASARLO, y la que
 * ayuda es la luz de la tarde.
 */

interface JetStep {
  icon: string;
  when: string;
  what: string;
  key?: boolean;
}

const IDA_STEPS: JetStep[] = [
  { icon: '🛏️', when: 'Hoy y mañana', what: 'A la cama y al despertador 1 h antes cada día. Cada hora que ganéis ahora es una hora menos de jet lag allí.' },
  { icon: '💊', when: 'Antes del día 8', what: 'Farmacia: melatonina de 1 mg (liberación inmediata), antifaz y tapones. Y las gafas de sol a mano, no en la maleta facturada.', key: true },
  { icon: '😴', when: 'Jue 8 · tarde', what: 'Siesta larga de verdad, 2-3 h, antes de coger el tren. La noche del 8 es una noche perdida.' },
  { icon: '🌙', when: 'Jue 8 · 00:30-04:20 en la T2', what: 'Dormid por turnos, uno vigilando los bultos. Lo que durmáis ahí cuenta.' },
  { icon: '🕐', when: 'Vie 9 · Bruselas', what: 'Reloj y móvil en hora china ya. Siesta de 1 h como mucho y el último café a las 10:00 (las 16:00 en China).' },
  { icon: '✈️', when: 'Vie 9 · 13:00 · vuelo a Pekín', what: 'Este vuelo ES la noche: despega a las 19:00 chinas y aterriza a las 04:45. Objetivo, 5-6 h de sueño.', key: true },
  { icon: '🕶️', when: 'Sáb 10 · hasta las 10:30', what: 'Gafas de sol en la calle, también en el Templo del Cielo. A las 10:30 os las quitáis y al sol todo lo que podáis.', key: true },
  { icon: '⏰', when: 'Sáb 10 · 14:00', what: 'La siesta del check-in, con alarma: 90 minutos y ni uno más. Nunca después de las 16:30.' },
  { icon: '🌜', when: 'Sáb 10 · 21:30', what: 'Melatonina de 1 mg y a la cama a las 22:00. Aunque os caigáis, no antes de las 21:30.' },
  { icon: '☀️', when: 'Dom 11 y lun 12', what: 'Despertador a las 06:45 pase lo que pase. El domingo, gafas de sol hasta las 09:00; el lunes ya no hacen falta.' },
  { icon: '✅', when: 'Mar 13', what: 'Reloj del cuerpo en hora china. Los madrugones de estos días juegan a vuestro favor.' },
];

const VUELTA_STEPS: JetStep[] = [
  { icon: '🛏️', when: 'Sáb 31 · 22:30', what: 'A la cama pronto. Halloween sin alargarlo: el domingo os levantáis a las 05:30.' },
  { icon: '🚶', when: 'Dom 1 · escala en Pekín', what: 'No durmáis las 4 h de escala. Comed sobre las 12:00 y andad por la terminal.' },
  { icon: '✈️', when: 'Dom 1 · 15:00 · vuelo a Madrid', what: 'Aquí sí: dormid todo lo que podáis. Para vuestro cuerpo son las horas de la noche del domingo.', key: true },
  { icon: '🚫', when: 'Dom 1 · 20:10 en Madrid', what: 'Nada de café en el aeropuerto. Lo que toca ahora es dormir en el bus.' },
  { icon: '🚌', when: 'Dom 1 · 23:45', what: 'Antifaz y tapones: el ALSA hasta las 03:15 es vuestra cama.' },
  { icon: '⏰', when: 'Lun 2', what: 'Llegáis a casa sobre las 04:00: dormid, pero con despertador a las 11:00 como muy tarde.', key: true },
  { icon: '☀️', when: 'Lun 2 · 15:00-18:00', what: 'A la calle, con luz de día. A la vuelta la que ayuda es la luz de la TARDE, no la de la mañana.', key: true },
  { icon: '🌜', when: 'Lun 2 · 23:00', what: 'A la cama a las 23:00, no a las 20:00. Si os acostáis a las 20:00 os despertaréis a las 03:00 y alargáis el jet lag una semana.' },
  { icon: '✅', when: 'Mar 3', what: 'Día normal. La vuelta se paga en 2-3 días, bastante menos que la ida.' },
];

function JetLagSection() {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-3">😴 Plan antijet lag</h2>
      <div className="space-y-4">
        <JetLagCard
          direction="outbound"
          title="IDA · +6 h de golpe"
          headline="La ida es la dura: hay que adelantar el reloj del cuerpo 6 horas. Todo el plan se juega en el vuelo de Bruselas a Pekín y en la mañana del sábado 10."
          steps={IDA_STEPS}
        >
          <p>
            <span className="font-medium text-foreground">Por qué las gafas de sol el sábado 10.</span> Cuando aterrizáis,
            vuestro cuerpo va por las 22:45 del viernes. Su momento más bajo —cuando aún "es de noche" para él— cae sobre
            las 10:30 hora china. La luz fuerte <span className="font-medium text-foreground">antes</span> de esa hora
            empuja el reloj hacia atrás, justo al revés de lo que os interesa; la de después lo adelanta. Por eso: gafas
            puestas hasta las 10:30 y luego sol a la cara. El domingo esa frontera ya está en las 09:00, y el lunes
            desaparece.
          </p>
          <p>
            <span className="font-medium text-foreground">El vuelo de Bruselas a Pekín.</span> Cenad lo que os den nada
            más despegar, melatonina sobre las 14:30 hora española (20:30 en China) y a dormir: persiana bajada, antifaz,
            tapones, nada de pantallas y cero alcohol. La noche en blanco de la T2 juega aquí a favor: vais a tener sueño
            de sobra. Despertaos con el desayuno de a bordo.
          </p>
          <p>
            <span className="font-medium text-foreground">Las dos cosas que lo estropean todo:</span> una siesta larga
            por la tarde y acostarse a las 19:00. Lo demás se perdona.
          </p>
          <p>
            La melatonina, las noches del 10, 11 y 12. A partir del 13 ya no hace falta. Si tomáis alguna medicación,
            preguntad en la farmacia al comprarla.
          </p>
        </JetLagCard>

        <JetLagCard
          direction="return"
          title="VUELTA · −7 h y 24 h despiertos"
          headline="La vuelta cuesta menos al reloj, pero el día 1 es una maratón: salís del hotel a las 06:00 y llegáis a Zaragoza a las 03:15 de la madrugada."
          steps={VUELTA_STEPS}
        >
          <p>
            <span className="font-medium text-foreground">Por qué la luz de la tarde.</span> Hacia el oeste hay que
            atrasar el reloj del cuerpo, y eso se consigue con luz al final del día y aguantando despiertos hasta una hora
            normal. El 2 de noviembre en Zaragoza el sol se pone sobre las 18:05: la franja útil es de 15:00 a 18:00.
          </p>
          <p>
            <span className="font-medium text-foreground">El lunes 2 es festivo en Aragón</span>, así que podéis dormir la
            mañana entera. Pero con despertador: dormir hasta las 17:00 os deja sin sueño esa noche. Si necesitáis siesta,
            30-40 minutos y antes de las 17:00.
          </p>
          <p>
            Melatonina en la vuelta no hace falta: para el sentido oeste apenas aporta. Lo que funciona es la luz y la
            hora de acostarse.
          </p>
        </JetLagCard>
      </div>
    </div>
  );
}

function JetLagCard({
  direction,
  title,
  headline,
  steps,
  children,
}: {
  direction: 'outbound' | 'return';
  title: string;
  headline: string;
  steps: JetStep[];
  children: React.ReactNode;
}) {
  const goingEast = direction === 'outbound';

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className={`px-4 py-2.5 ${goingEast ? 'bg-primary/10' : 'bg-secondary/10'}`}>
        <div className="text-sm font-bold text-foreground">{title}</div>
      </div>

      <div className="p-4">
        <p className="text-xs text-foreground leading-snug mb-3">{headline}</p>

        <div className="rounded-lg border border-border overflow-hidden">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 px-2.5 py-2 ${i > 0 ? 'border-t border-border' : ''} ${
                s.key ? 'bg-travel-pending-bg/40' : ''
              }`}
            >
              <span className="text-sm leading-none pt-0.5 flex-shrink-0">{s.icon}</span>
              <div className="min-w-0">
                <div className={`text-[10px] uppercase tracking-wide ${s.key ? 'font-bold text-travel-pending' : 'text-muted-foreground'}`}>
                  {s.when}
                </div>
                <div className="text-[11px] text-foreground leading-snug">{s.what}</div>
              </div>
            </div>
          ))}
        </div>

        <MoreInfo label="Por qué funciona así">{children}</MoreInfo>
      </div>
    </div>
  );
}
