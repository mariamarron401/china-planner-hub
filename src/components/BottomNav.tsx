import { Home, CalendarDays, Building2, Wallet, MapPinned, MoreHorizontal, Train, Plane, ListTodo, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mainTabs = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/itinerario', label: 'Itinerario', icon: CalendarDays },
  { path: '/que-hacer', label: 'Qué hacer', icon: MapPinned },
  { path: '/hoteles', label: 'Hoteles', icon: Building2 },
  { path: '/mas', label: 'Más', icon: MoreHorizontal },
];

const moreTabs = [
  { path: '/transportes', label: 'Transportes', icon: Train },
  { path: '/presupuesto', label: 'Presupuesto', icon: Wallet },
  { path: '/vuelos', label: 'Vuelos', icon: Plane },
  { path: '/actividades', label: 'Actividades', icon: Compass },
  { path: '/pendientes', label: 'Pendientes', icon: ListTodo },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreTabs.some(t => pathname.startsWith(t.path));

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 right-2 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[160px] animate-fade-in" onClick={e => e.stopPropagation()}>
            {moreTabs.map(tab => {
              const active = pathname.startsWith(tab.path);
              return (
                <Link key={tab.path} to={tab.path} onClick={() => setShowMore(false)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                    active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted")}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {mainTabs.map(tab => {
            if (tab.path === '/mas') {
              return (
                <button key="mas" onClick={() => setShowMore(v => !v)}
                  className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1",
                    isMoreActive || showMore ? "text-primary" : "text-muted-foreground")}>
                  <tab.icon className={cn("h-5 w-5", (isMoreActive || showMore) && "stroke-[2.5]")} />
                  <span className="text-[10px] font-medium truncate">{tab.label}</span>
                </button>
              );
            }
            const active = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
            return (
              <Link key={tab.path} to={tab.path}
                className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1",
                  active ? "text-primary" : "text-muted-foreground")}>
                <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
