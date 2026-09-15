import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CalendarView from '@/views/CalendarView';

/**
 * El día a día, a pantalla completa.
 *
 * Dejó de ser una sub-pestaña de Plan (sesión 2026-09-15): ahora se abre con el
 * botón del calendario de la cabecera de Plan, para que las pestañas de arriba
 * sean solo el planning de cada ciudad y los hoteles.
 */
export default function Calendario() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 pt-11 pb-2.5">
          <button
            onClick={() => navigate('/plan/planning')}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground active:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" />
            Plan
          </button>
          <h1 className="text-xl font-bold text-foreground leading-tight mt-1">Día a día</h1>
          <p className="text-[11px] text-muted-foreground leading-snug">Del 8 oct al 2 nov, día por día</p>
        </div>
      </div>
      <div className="pt-3">
        <CalendarView />
      </div>
    </div>
  );
}
