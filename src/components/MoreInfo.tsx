import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Bloque de texto largo que empieza plegado.
 *
 * Regla de la app: en pantalla solo se ve lo que hay que hacer; el "por qué",
 * las advertencias largas y las notas de verificación viven aquí dentro. Así no
 * se pierde ni un dato, pero la pantalla se lee de un vistazo.
 */
export default function MoreInfo({
  label = 'Ver explicación',
  children,
  tone = 'muted',
}: {
  label?: string;
  children: React.ReactNode;
  tone?: 'muted' | 'warn';
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[11px] font-medium ${
          tone === 'warn' ? 'text-travel-pending' : 'text-primary'
        }`}
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? 'Ocultar' : label}
      </button>
      {open && (
        <div className="mt-1.5 rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground space-y-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
