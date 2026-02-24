import { Home, CalendarDays, Building2, Train, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/itinerario', label: 'Itinerario', icon: CalendarDays },
  { path: '/hoteles', label: 'Hoteles', icon: Building2 },
  { path: '/transportes', label: 'Transportes', icon: Train },
  { path: '/presupuesto', label: 'Presupuesto', icon: Wallet },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const active = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
