import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import { useVideoTips } from '@/hooks/useVideoTips';
import {
  ArrowLeft, MapPin, Calendar, Clock, ShoppingCart, ExternalLink,
  Info, Compass, Video, Ticket,
} from 'lucide-react';

/**
 * Parte un texto largo de `notes` en bloques legibles.
 * Las notas se escriben con un emoji delante de cada idea ("🚫 CIERRA LOS LUNES...
 * 🎟️ Entrada nominal..."), así que cada emoji marca el principio de un bloque.
 * Si la nota no lleva emojis, se devuelve entera como un único bloque.
 */
export function splitNotes(notes: string): string[] {
  const blocks = notes
    .split(/\s+(?=\p{Extended_Pictographic})/u)
    .map(b => b.trim())
    .filter(Boolean);
  return blocks.length > 0 ? blocks : [notes];
}

const statusColors: Record<string, string> = {
  'Planificada': 'bg-muted text-muted-foreground',
  'Por reservar': 'bg-travel-pending-bg text-travel-pending',
  'Hecha': 'bg-travel-confirmed-bg text-travel-confirmed',
};

export default function ActivityDetail() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { data, updateActivity } = useTrip();
  const { videoTips } = useVideoTips();

  const act = data.activities.find(a => a.id === activityId);

  if (!act) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-12">
          <button
            onClick={() => navigate('/actividades')}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Actividades
          </button>
          <p className="mt-8 text-center text-muted-foreground">Actividad no encontrada</p>
        </div>
      </div>
    );
  }

  const cityName = data.cities.find(c => c.id === act.cityId)?.cityName || act.cityId;
  const cityTips = videoTips.filter(v => v.cityId === act.cityId);

  const cycleStatus = () => {
    const order = ['Por reservar', 'Planificada', 'Hecha'] as const;
    const idx = order.indexOf(act.status as any);
    updateActivity(act.id, { status: order[(idx + 1) % order.length] });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cabecera con vuelta atrás */}
      <div className="px-4 pt-12 pb-2">
        <button
          onClick={() => navigate('/actividades')}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground active:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Actividades
        </button>
      </div>

      {/* Título y datos base */}
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-foreground leading-tight">{act.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cityName}</span>
          {act.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{act.duration}</span>}
          <span className="bg-muted px-1.5 py-0.5 rounded">{act.type}</span>
        </div>
        <button
          onClick={cycleStatus}
          className={`mt-3 text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[act.status] || ''}`}
        >
          {act.status} · toca para cambiar
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Día recomendado */}
        {act.recommendedDate && (
          <div className="flex items-start gap-2 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3">
            <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">Día recomendado</div>
              <div className="text-sm font-semibold text-foreground">{act.recommendedDate}</div>
            </div>
          </div>
        )}

        {/* Precio y cuándo comprar */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-muted/60 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Precio</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              {act.priceText || (act.price != null ? `~${act.price} €/persona` : '—')}
            </div>
          </div>
          <div className="rounded-2xl bg-travel-pending-bg px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-travel-pending">Cuándo comprar</div>
            <div className="text-[11px] font-medium text-foreground mt-0.5 leading-snug">
              {act.whenToBuy || 'Por confirmar'}
            </div>
          </div>
        </div>

        {/* Dónde comprar + botón */}
        {(act.platform || act.bookingUrl) && (
          <div className="rounded-2xl border border-border bg-card p-4">
            {act.platform && (
              <div className="flex items-start gap-2 text-xs">
                <Ticket className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dónde</div>
                  <div className="text-foreground font-medium mt-0.5">{act.platform}</div>
                </div>
              </div>
            )}
            {act.bookingUrl && (
              <a
                href={act.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 active:opacity-80 transition-opacity"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Comprar entrada
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
            )}
          </div>
        )}

        {/* Guía sobre el terreno — aquí se ve entera, sin desplegar nada */}
        {act.fieldGuide && (
          <section>
            <div className="flex items-center gap-1.5 px-1">
              <Compass className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Guía sobre el terreno</h2>
            </div>

            <div className="mt-2 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3">
              <p className="text-sm font-semibold text-foreground leading-snug">{act.fieldGuide.headline}</p>
            </div>

            <div className="mt-3 space-y-3">
              {act.fieldGuide.sections.map((section, si) => (
                <div key={section.title} className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center gap-2 bg-accent/40 px-4 py-2.5">
                    <span className="text-base leading-none" aria-hidden="true">{section.icon}</span>
                    <h3 className="text-xs font-bold text-foreground">{section.title}</h3>
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                      {si + 1}/{act.fieldGuide!.sections.length}
                    </span>
                  </div>
                  <ul className="px-4 py-3 space-y-2.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-2 px-1 text-[10px] text-muted-foreground/80">Fuente: {act.fieldGuide.source}</p>
          </section>
        )}

        {/* Detalles y consejos — la nota larga, partida en bloques legibles */}
        {act.notes && (
          <section>
            <div className="flex items-center gap-1.5 px-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Detalles y consejos</h2>
            </div>
            <div className="mt-2 space-y-2">
              {splitNotes(act.notes).map((block, i) => (
                <div key={i} className="rounded-xl bg-card border border-border px-3.5 py-3">
                  <p className="text-xs text-foreground/80 leading-relaxed">{block}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips de vídeos de esta ciudad */}
        {cityTips.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 px-1">
              <Video className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Tips de vídeos de {cityName}</h2>
            </div>
            <div className="mt-2 space-y-2">
              {cityTips.map(tip => (
                <div key={tip.id} className="rounded-2xl bg-card border border-border p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-foreground leading-snug">{tip.title}</h3>
                    {tip.url && (
                      <a
                        href={tip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver el vídeo original"
                        className="shrink-0 text-muted-foreground active:opacity-70"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {tip.tips.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {tip.tips.map((t, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="text-primary shrink-0" aria-hidden="true">•</span>
                          <span>{t.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Link to="/tips-videos" className="mt-2 inline-block px-1 text-[11px] font-medium text-primary">
              Ver todos los tips de vídeos →
            </Link>
          </section>
        )}

        {!act.fieldGuide && !act.notes && cityTips.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            Todavía no hay consejos guardados para esta actividad.
            Manda un vídeo o una guía al agente por chat y aparecerán aquí.
          </p>
        )}
      </div>
    </div>
  );
}
