import { Home, CalendarRange, Route, Compass, ListTodo } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Cinco pestañas y ninguna más: caben en pantalla sin deslizar, así que no hay
 * secciones escondidas. Todo lo que antes era una pestaña propia (13 en total)
 * es ahora una sub-pestaña dentro de una de estas cinco.
 */
const tabs = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/plan', label: 'Plan', icon: CalendarRange },
  { path: '/moverse', label: 'Moverse', icon: Route },
  { path: '/descubrir', label: 'Qué hacer', icon: Compass },
  { path: '/gestiones', label: 'Por hacer', icon: ListTodo },
];

/** Las pantallas de detalle marcan la pestaña de la que cuelgan. */
const OWNED_BY: { prefix: string; tab: string }[] = [
  { prefix: '/actividades', tab: '/descubrir' },
  { prefix: '/que-hacer', tab: '/descubrir' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const activeTab =
    OWNED_BY.find(o => pathname.startsWith(o.prefix))?.tab ??
    (pathname === '/' ? '/' : tabs.slice(1).find(t => pathname.startsWith(t.path))?.path);

  return (
    // z-40 a propósito, por debajo de los paneles (chat y diálogos van en z-50):
    // con el mismo z-index la barra se dibujaba encima y tapaba justo la caja de
    // escribir del chat y los botones del final de los diálogos.
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-stretch h-16 px-1">
        {tabs.map(tab => {
          const active = tab.path === activeTab;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
