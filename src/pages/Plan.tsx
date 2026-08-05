import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import CalendarView from '@/views/CalendarView';
import ItineraryView from '@/views/ItineraryView';
import HotelsView from '@/views/HotelsView';

const SECTIONS: ShellSection[] = [
  { key: 'dias', label: 'Día a día' },
  { key: 'ciudades', label: 'Por ciudades' },
  { key: 'hoteles', label: 'Hoteles' },
];

const SUBTITLES: Record<string, string> = {
  dias: 'Del 8 oct al 2 nov, día por día',
  ciudades: '10 ciudades · 22 noches',
  hoteles: 'Los 10, todos con desayuno incluido',
};

/** El plan: qué pasa cada día, en qué ciudad y en qué hotel. */
export default function Plan() {
  const { section } = useParams<{ section?: string }>();
  if (!section) return <Navigate to="/plan/dias" replace />;
  if (!SECTIONS.some(s => s.key === section)) return <Navigate to="/plan/dias" replace />;

  return (
    <PageShell
      title="Plan del viaje"
      subtitle={SUBTITLES[section]}
      basePath="/plan"
      sections={SECTIONS}
      active={section}
    >
      {section === 'dias' && <CalendarView />}
      {section === 'ciudades' && <ItineraryView />}
      {section === 'hoteles' && <HotelsView />}
    </PageShell>
  );
}
