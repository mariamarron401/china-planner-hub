import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import CityPlansView from '@/views/CityPlansView';
import ActivitiesView from '@/views/ActivitiesView';
import VideoTipsView from '@/views/VideoTipsView';
import { useTrip } from '@/context/TripContext';

const SUBTITLES: Record<string, string> = {
  actividades: 'Toca una para ver la guía y cuándo comprarla',
  planning: 'El plan cerrado de cada ciudad, día a día',
  videos: 'Consejos sacados de vídeos, por ciudad',
};

/** Qué ver y qué hacer: entradas, el planning de cada ciudad y tips de vídeos. */
export default function Descubrir() {
  const { section } = useParams<{ section?: string }>();
  const { data } = useTrip();

  const sections: ShellSection[] = [
    { key: 'actividades', label: `Actividades (${data.activities.length})` },
    { key: 'planning', label: 'Planning por ciudad' },
    { key: 'videos', label: 'Tips de vídeos' },
  ];

  if (!section || !sections.some(s => s.key === section)) {
    return <Navigate to="/descubrir/actividades" replace />;
  }

  return (
    <PageShell
      title="Qué hacer"
      subtitle={SUBTITLES[section]}
      basePath="/descubrir"
      sections={sections}
      active={section}
    >
      {section === 'actividades' && <ActivitiesView />}
      {section === 'planning' && <CityPlansView />}
      {section === 'videos' && <VideoTipsView />}
    </PageShell>
  );
}
