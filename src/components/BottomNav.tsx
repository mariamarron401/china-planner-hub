import { Home, CalendarDays, Building2, Wallet, MapPinned, Train, Plane, ListTodo, Compass, Video, Waypoints, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

const tabs = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/itinerario', label: 'Itinerario', icon: CalendarDays },
  { path: '/que-hacer', label: 'Qué hacer', icon: MapPinned },
  { path: '/hoteles', label: 'Hoteles', icon: Building2 },
  { path: '/trayectos', label: 'Trayectos', icon: Waypoints },
  { path: '/transportes', label: 'Transportes', icon: Train },
  { path: '/vuelos', label: 'Vuelos', icon: Plane },
  { path: '/actividades', label: 'Actividades', icon: Compass },
  { path: '/presupuesto', label: 'Presupuesto', icon: Wallet },
  { path: '/pendientes', label: 'Pendientes', icon: ListTodo },
  { path: '/tips-videos', label: 'Tips de vídeos', icon: Video },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollHints();
    window.addEventListener('resize', updateScrollHints);
    return () => window.removeEventListener('resize', updateScrollHints);
  }, []);

  // Desplaza para que el botón activo quede visible al cambiar de página.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]') as HTMLElement | null;
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    updateScrollHints();
  }, [pathname]);

  const scrollByDir = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="relative max-w-lg mx-auto">
        {/* Pista izquierda: hay botones ocultos hacia la izquierda */}
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-card to-transparent transition-opacity",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Pista derecha: hay más botones, con flecha parpadeante que invita a deslizar */}
        <button
          type="button"
          aria-label="Ver más secciones"
          onClick={() => scrollByDir(1)}
          className={cn(
            "absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pr-1 w-10 bg-gradient-to-l from-card via-card/90 to-transparent transition-opacity",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="h-5 w-5 text-primary animate-pulse" />
        </button>

        <div
          ref={scrollRef}
          onScroll={updateScrollHints}
          className="flex items-center h-16 px-1 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {tabs.map(tab => {
            const active = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
            return (
              <Link key={tab.path} to={tab.path} data-active={active}
                className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors shrink-0 w-[64px]",
                  active ? "text-primary" : "text-muted-foreground")}>
                <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium truncate max-w-full">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
