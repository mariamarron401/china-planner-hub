import { useParams, Navigate, Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';
import PageShell, { ShellSection } from '@/components/PageShell';
import CityPlansView from '@/views/CityPlansView';
import HotelsView from '@/views/HotelsView';

const SECTIONS: ShellSection[] = [
  { key: 'planning', label: 'Planning por ciudad' },
  { key: 'hoteles', label: 'Hoteles' },
];

const SUBTITLES: Record<string, string> = {
  planning: 'El plan cerrado de cada ciudad, día a día',
  hoteles: 'Los 10, todos con desayuno incluido',
};

/** El plan: qué hacemos en cada ciudad y en qué hotel dormimos. */
export default function Plan() {
  const { section } = useParams<{ section?: string }>();
  if (!section) return <Navigate to="/plan/planning" replace />;
  if (!SECTIONS.some(s => s.key === section)) return <Navigate to="/plan/planning" replace />;

  return (
    <PageShell
      title="Plan del viaje"
      subtitle={SUBTITLES[section]}
      basePath="/plan"
      sections={SECTIONS}
      active={section}
      action={
        <Link
          to="/calendario"
          aria-label="Ver el día a día"
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-2 rounded-full active:opacity-80"
        >
          <CalendarRange className="h-4 w-4" />
          Día a día
        </Link>
      }
    >
      {section === 'planning' && <CityPlansView />}
      {section === 'hoteles' && <HotelsView />}
    </PageShell>
  );
}
