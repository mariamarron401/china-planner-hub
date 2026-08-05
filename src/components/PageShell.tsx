import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export interface ShellSection {
  /** Trozo de URL: /plan/dias → 'dias' */
  key: string;
  label: string;
  /** Número en rojo (cosas por hacer). 0 o undefined = no se pinta. */
  badge?: number;
}

/**
 * Cabecera común de las 4 secciones grandes de la app.
 *
 * Antes había 13 pestañas abajo. Ahora hay 5, y lo que era una pestaña propia
 * es una sub-pestaña de aquí. La sub-pestaña va en la URL (/plan/hoteles) para
 * que se pueda enlazar y para que el botón "atrás" del móvil funcione.
 */
export default function PageShell({
  title,
  subtitle,
  basePath,
  sections,
  active,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  basePath: string;
  sections: ShellSection[];
  active: string;
  /** Botón opcional a la derecha del título (p. ej. "+"). */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Al cambiar de sub-pestaña, la deja visible y sube arriba del todo.
  useEffect(() => {
    const el = scrollRef.current;
    const btn = el?.querySelector('[data-active="true"]') as HTMLElement | null;
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    window.scrollTo({ top: 0 });
  }, [active]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 pt-11 pb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-muted-foreground leading-snug">{subtitle}</p>}
          </div>
          {action}
        </div>

        {sections.length > 1 && (
          <div ref={scrollRef} className="px-4 pb-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
            {sections.map(s => {
              const isActive = s.key === active;
              return (
                <Link
                  key={s.key}
                  to={`${basePath}/${s.key}`}
                  data-active={isActive}
                  className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.label}
                  {!!s.badge && (
                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-90' : 'text-travel-important'}`}>
                      {s.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3">{children}</div>
    </div>
  );
}
