import { useNavigate } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import { useVideoTips } from '@/hooks/useVideoTips';
import { MapPin, Calendar, Clock, ShoppingCart, ExternalLink, ChevronRight, Compass, Video } from 'lucide-react';

export default function ActivitiesView() {
  const navigate = useNavigate();
  const { data, updateActivity } = useTrip();
  const { videoTips } = useVideoTips();
  const { activities, cities } = data;

  const getCityName = (id: string) => cities.find(c => c.id === id)?.cityName || id;

  const statusColors: Record<string, string> = {
    'Planificada': 'bg-muted text-muted-foreground',
    'Por reservar': 'bg-travel-pending-bg text-travel-pending',
    'Hecha': 'bg-travel-confirmed-bg text-travel-confirmed',
  };

  const cycleStatus = (id: string, current: string) => {
    const order = ['Por reservar', 'Planificada', 'Hecha'] as const;
    const idx = order.indexOf(current as any);
    updateActivity(id, { status: order[(idx + 1) % order.length] });
  };

  return (
    <div className="px-4 space-y-4">
        {activities.map(act => {
          const guideSections = act.fieldGuide?.sections.length || 0;
          const cityTipsCount = videoTips.filter(v => v.cityId === act.cityId).length;

          return (
            <div
              key={act.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/actividades/${act.id}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/actividades/${act.id}`);
                }
              }}
              className="w-full text-left bg-card rounded-2xl border border-border shadow-sm overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
            >
              {/* Cabecera */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground leading-tight">{act.title}</h3>
                  <button
                    onClick={e => { e.stopPropagation(); cycleStatus(act.id, act.status); }}
                    className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[act.status] || ''}`}
                  >
                    {act.status}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{getCityName(act.cityId)}</span>
                  {act.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{act.duration}</span>}
                  <span className="bg-muted px-1.5 py-0.5 rounded">{act.type}</span>
                </div>
              </div>

              {/* Día recomendado — destacado */}
              {act.recommendedDate && (
                <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">Día recomendado</div>
                    <div className="text-sm font-semibold text-foreground">{act.recommendedDate}</div>
                  </div>
                </div>
              )}

              {/* Precio + Cuándo comprar */}
              <div className="mx-4 mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-muted/60 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Precio</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {act.priceText || (act.price != null ? `~${act.price} €/persona` : '—')}
                  </div>
                </div>
                <div className="rounded-xl bg-travel-pending-bg px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-travel-pending">Cuándo comprar</div>
                  <div className="text-[11px] font-medium text-foreground mt-0.5 leading-snug">{act.whenToBuy || 'Por confirmar'}</div>
                </div>
              </div>

              {/* Plataforma */}
              {act.platform && (
                <div className="mx-4 mb-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Dónde: </span>{act.platform}
                </div>
              )}

              {/* Botón comprar */}
              {act.bookingUrl && (
                <div className="px-4 pb-3">
                  <a
                    href={act.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 active:opacity-80 transition-opacity"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Comprar entrada
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                </div>
              )}

              {/* Pie: lo que hay dentro de la ficha */}
              <div className="border-t border-border bg-accent/20 px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                  {guideSections > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <Compass className="h-3.5 w-3.5" />
                      Guía local · {guideSections} bloques
                    </span>
                  )}
                  {cityTipsCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Video className="h-3.5 w-3.5" />
                      {cityTipsCount} {cityTipsCount === 1 ? 'vídeo' : 'vídeos'}
                    </span>
                  )}
                  {guideSections === 0 && cityTipsCount === 0 && <span>Ver ficha completa</span>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          );
        })}
    </div>
  );
}
