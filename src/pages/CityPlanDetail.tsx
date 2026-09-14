import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import MoreInfo from '@/components/MoreInfo';
import { getCityPlan } from '@/data/cityPlans';
import type { PlanPriority, PlanBlockKind, PlanBlock } from '@/data/cityPlans';
import {
  ArrowLeft, Car, Camera, Utensils, ShoppingBag, Ticket, BedDouble,
  Landmark, ExternalLink, AlertTriangle, Clock,
} from 'lucide-react';

type SectionKey = 'dias' | 'ver' | 'comer' | 'comprar' | 'fotos' | 'reservas';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'dias', label: '🗓️ Los días' },
  { key: 'ver', label: '🏯 Qué ver' },
  { key: 'comer', label: '🍜 Comer' },
  { key: 'comprar', label: '🛍️ Comprar' },
  { key: 'fotos', label: '📸 Fotos' },
  { key: 'reservas', label: '🎟️ Reservas' },
];

const PRIORITY_LABEL: Record<PlanPriority, string> = {
  must: '🔴 Imprescindible',
  nice: '🟡 Muy recomendable',
  optional: '⚪ Si sobra tiempo',
  skip: '❌ No lo metería',
};

const PRIORITY_DOT: Record<PlanPriority, string> = {
  must: 'bg-travel-important',
  nice: 'bg-travel-pending',
  optional: 'bg-muted-foreground/40',
  skip: 'bg-muted-foreground/25',
};

const BLOCK_ICON: Record<PlanBlockKind, typeof Car> = {
  move: Car,
  visit: Landmark,
  food: Utensils,
  rest: BedDouble,
  ticket: Ticket,
  shop: ShoppingBag,
};

/** Tarjeta blanca estándar de la app. */
function Card({ children, alert }: { children: React.ReactNode; alert?: boolean }) {
  return (
    <div
      className={`bg-card rounded-xl border p-3.5 shadow-sm animate-fade-in ${
        alert ? 'border-travel-important/40 bg-travel-important-bg/40' : 'border-border'
      }`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 className="px-1 pt-1 text-[13px] font-bold text-foreground flex items-center gap-1.5">
      {children}
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-muted-foreground">{count}</span>
      )}
    </h2>
  );
}

/** Una parada del día, con su hora a la izquierda. */
function DayBlock({ block }: { block: PlanBlock }) {
  const Icon = BLOCK_ICON[block.kind];
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <div
          className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center ${
            block.alert ? 'bg-travel-important-bg text-travel-important' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 pb-3.5 min-w-0">
        <p
          className={`text-[10px] font-bold tracking-wide ${
            block.alert ? 'text-travel-important' : 'text-muted-foreground'
          }`}
        >
          {block.time}
        </p>
        <h4 className="text-sm font-semibold text-foreground leading-snug">{block.title}</h4>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{block.detail}</p>
        {block.more && <MoreInfo label="Por qué y cómo">{block.more}</MoreInfo>}
      </div>
    </div>
  );
}

export default function CityPlanDetail() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { data } = useTrip();
  const [section, setSection] = useState<SectionKey>('dias');

  const city = data.cities.find(c => c.id === cityId);
  const plan = getCityPlan(cityId);

  if (!city) {
    return <div className="p-8 text-center text-muted-foreground">Ciudad no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cabecera */}
      <div className="gradient-hero px-5 pt-11 pb-5 rounded-b-3xl">
        <button
          onClick={() => navigate('/descubrir/planning')}
          className="flex items-center gap-1 text-primary-foreground/80 text-sm mb-2 active:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" /> Planning
        </button>
        <h1 className="text-2xl font-bold text-primary-foreground leading-tight">{city.cityName}</h1>
        <p className="text-primary-foreground/80 text-xs mt-1">
          {city.startDateText} – {city.endDateText} · {city.nights} {city.nights === 1 ? 'noche' : 'noches'}
        </p>
        {plan && <p className="text-primary-foreground/70 text-[11px] mt-2 leading-snug">{plan.headline}</p>}
      </div>

      {!plan ? (
        <div className="px-4 pt-6">
          <Card>
            <h3 className="text-sm font-semibold text-foreground">Planning todavía no cerrado</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              Cuando esté decidido el plan de {city.cityName}, aparece aquí: los días hora a hora, qué ver,
              dónde comer, mercados, fotos y las reservas con su fecha límite.
            </p>
          </Card>
        </div>
      ) : (
        <>
          {/* Navegación entre bloques */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSection(s.key);
                    window.scrollTo({ top: 0 });
                  }}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    section === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pt-3 space-y-3">
            {/* ---------------- LOS DÍAS ---------------- */}
            {section === 'dias' && (
              <>
                <Card alert>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-travel-important" />
                    Antes de nada
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {plan.keyNotes.map((n, i) => (
                      <li key={i} className="text-xs text-foreground/80 leading-snug flex gap-1.5">
                        <span className="text-travel-important font-bold">·</span>
                        {n}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <h3 className="text-[13px] font-bold text-foreground">📍 Desde nuestro hotel</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.base.map((b, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </Card>

                {plan.days.map(day => (
                  <Card key={day.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                          {day.dateText}
                        </p>
                        <h3 className="text-sm font-bold text-foreground leading-snug">{day.title}</h3>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {day.zone}
                      </span>
                    </div>
                    <div className="mt-3">
                      {day.blocks.map((b, i) => (
                        <DayBlock key={i} block={b} />
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* ---------------- QUÉ VER ---------------- */}
            {section === 'ver' && (
              <>
                {(['must', 'nice', 'skip'] as PlanPriority[]).map(prio => {
                  const items = plan.highlights.filter(h => h.priority === prio);
                  if (!items.length) return null;
                  return (
                    <div key={prio} className="space-y-2">
                      <SectionTitle count={items.length}>{PRIORITY_LABEL[prio]}</SectionTitle>
                      {items.map(h => (
                        <Card key={h.name}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[h.priority]}`} />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-foreground leading-snug">
                                {h.name}
                                {h.nameZh && (
                                  <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                                    {h.nameZh}
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-snug mt-0.5">{h.what}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                  {h.zone}
                                </span>
                                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {h.time}
                                </span>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {h.ticket}
                                </span>
                              </div>
                              {h.more && <MoreInfo>{h.more}</MoreInfo>}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                })}

                <SectionTitle>🏁 Nuestra jerarquía final</SectionTitle>
                <Card>
                  {([
                    ['must', plan.ranking.must],
                    ['nice', plan.ranking.nice],
                    ['optional', plan.ranking.optional],
                    ['skip', plan.ranking.skip],
                  ] as [PlanPriority, string[]][]).map(([prio, names]) =>
                    names.length ? (
                      <div key={prio} className="py-1.5 border-b border-border last:border-0">
                        <p className="text-[10px] font-bold text-muted-foreground">{PRIORITY_LABEL[prio]}</p>
                        <p className="text-xs text-foreground/80 leading-snug mt-0.5">{names.join(' · ')}</p>
                      </div>
                    ) : null,
                  )}
                </Card>
              </>
            )}

            {/* ---------------- COMER ---------------- */}
            {section === 'comer' && (
              <>
                <SectionTitle count={plan.restaurants.length}>🍽️ Dónde comer</SectionTitle>
                {plan.restaurants.map(r => (
                  <Card key={r.name}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[r.priority]}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground leading-snug">
                          {r.name}
                          {r.nameZh && (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{r.nameZh}</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{r.what}</p>
                        {r.when && <p className="text-[11px] text-primary font-medium mt-1">🕑 {r.when}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.price && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {r.price}
                            </span>
                          )}
                          {r.phone && (
                            <a
                              href={`tel:${r.phone.replace(/\s/g, '')}`}
                              className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                            >
                              {r.phone}
                            </a>
                          )}
                        </div>
                        {r.address && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 select-all leading-snug">
                            {r.address}
                          </p>
                        )}
                        {r.more && <MoreInfo>{r.more}</MoreInfo>}
                      </div>
                    </div>
                  </Card>
                ))}

                {(['salado', 'dulce'] as const).map(kind => (
                  <div key={kind} className="space-y-2">
                    <SectionTitle count={plan.food.filter(f => f.kind === kind).length}>
                      {kind === 'salado' ? '🥟 Qué comer sí o sí' : '🍬 Dulces y snacks'}
                    </SectionTitle>
                    <Card>
                      {plan.food
                        .filter(f => f.kind === kind)
                        .map(f => (
                          <div key={f.name} className="py-2 border-b border-border last:border-0">
                            <h4 className="text-sm font-semibold text-foreground leading-snug">
                              {f.name}
                              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                                {f.pinyin}
                              </span>
                            </h4>
                            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{f.what}</p>
                          </div>
                        ))}
                    </Card>
                  </div>
                ))}
              </>
            )}

            {/* ---------------- COMPRAR ---------------- */}
            {section === 'comprar' && (
              <>
                <SectionTitle count={plan.markets.length}>🏮 Mercados y calles</SectionTitle>
                {plan.markets.map(m => (
                  <Card key={m.name} alert={m.priority === 'skip'}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[m.priority]}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground leading-snug">
                          {m.name}
                          {m.nameZh && (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{m.nameZh}</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{m.what}</p>
                        {m.when && <p className="text-[11px] text-primary font-medium mt-1">🕑 {m.when}</p>}
                        {m.address && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 select-all leading-snug">
                            {m.address}
                          </p>
                        )}
                        {m.more && <MoreInfo>{m.more}</MoreInfo>}
                      </div>
                    </div>
                  </Card>
                ))}

                <SectionTitle count={plan.shopping.length}>🛍️ Compras</SectionTitle>
                {plan.shopping.map(s => (
                  <Card key={s.name}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[s.priority]}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground leading-snug">
                          {s.name}
                          {s.nameZh && (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{s.nameZh}</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.what}</p>
                        {s.when && <p className="text-[11px] text-primary font-medium mt-1">🕑 {s.when}</p>}
                        {s.address && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 select-all leading-snug">
                            {s.address}
                          </p>
                        )}
                        {s.more && <MoreInfo>{s.more}</MoreInfo>}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* ---------------- FOTOS ---------------- */}
            {section === 'fotos' && (
              <>
                <SectionTitle count={plan.photoSpots.length}>📸 Los POV que guardaría</SectionTitle>
                {plan.photoSpots.map(p => (
                  <Card key={p.name}>
                    <h3 className="text-sm font-semibold text-foreground leading-snug flex items-start gap-1.5">
                      <Camera className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>
                        {p.name}
                        {p.nameZh && (
                          <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{p.nameZh}</span>
                        )}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug mt-1">{p.how}</p>
                    {p.when && <p className="text-[11px] text-primary font-medium mt-1">🕑 {p.when}</p>}
                  </Card>
                ))}

                <SectionTitle count={plan.trends.length}>📱 Lo que se ve en redes</SectionTitle>
                {(['si', 'quizas', 'no'] as const).map(v => {
                  const items = plan.trends.filter(t => t.verdict === v);
                  if (!items.length) return null;
                  const label = v === 'si' ? '🔥 Sí merece la pena' : v === 'quizas' ? '🤳 Bonito, pero no lo priorizaría' : '❌ Desactualizado';
                  return (
                    <Card key={v}>
                      <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
                      {items.map(t => (
                        <div key={t.name} className="py-2 border-b border-border last:border-0">
                          <h4 className="text-sm font-semibold text-foreground leading-snug">{t.name}</h4>
                          <p className="text-xs text-muted-foreground leading-snug mt-0.5">{t.why}</p>
                        </div>
                      ))}
                    </Card>
                  );
                })}
              </>
            )}

            {/* ---------------- RESERVAS ---------------- */}
            {section === 'reservas' && (
              <>
                <SectionTitle count={plan.bookings.length}>🎟️ Qué hay que reservar</SectionTitle>
                {plan.bookings.map(b => (
                  <Card key={b.title} alert>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{b.title}</h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-foreground/80 leading-snug">
                        <span className="font-semibold">Cuándo:</span> {b.when}
                      </p>
                      <p className="text-xs text-foreground/80 leading-snug">
                        <span className="font-semibold">Precio:</span> {b.price}
                      </p>
                      <p className="text-xs text-foreground/80 leading-snug">
                        <span className="font-semibold">Dónde:</span> {b.how}
                      </p>
                    </div>
                    {b.alert && (
                      <p className="mt-2 text-[11px] font-medium text-travel-important leading-snug">⚠️ {b.alert}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {b.url && (
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1"
                        >
                          Reservar <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {b.activityId && (
                        <Link
                          to={`/actividades/${b.activityId}`}
                          className="text-[11px] font-semibold bg-muted text-muted-foreground px-3 py-1.5 rounded-full"
                        >
                          Ver ficha completa
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
