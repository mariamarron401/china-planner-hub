import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import ActivitiesView from '@/views/ActivitiesView';
import VideoTipsView from '@/views/VideoTipsView';
import { useTrip } from '@/context/TripContext';

const SUBTITLES: Record<string, string> = {
  actividades: 'Toca una para ver la guía y cuándo comprarla',
  videos: 'Consejos sacados de vídeos, por ciudad',
};

/** Qué ver y qué hacer: entradas y tips de vídeos. El planning de cada ciudad vive en Plan. */
export default function Descubrir() {
  const { section } = useParams<{ section?: string }>();
  const { data } = useTrip();

  const sections: ShellSection[] = [
    { key: 'actividades', label: `Actividades (${data.activities.length})` },
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
      {section === 'videos' && <VideoTipsView />}
    </PageShell>
  );
}
