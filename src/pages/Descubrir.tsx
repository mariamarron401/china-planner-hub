import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import PlacesView from '@/views/PlacesView';
import ActivitiesView from '@/views/ActivitiesView';
import VideoTipsView from '@/views/VideoTipsView';
import { useTrip } from '@/context/TripContext';

const SUBTITLES: Record<string, string> = {
  actividades: 'Toca una para ver la guía y cuándo comprarla',
  sitios: 'Cafeterías, restaurantes y spots por ciudad',
  videos: 'Consejos sacados de vídeos, por ciudad',
};

/** Qué ver y qué hacer: entradas, sitios guardados y tips de vídeos. */
export default function Descubrir() {
  const { section } = useParams<{ section?: string }>();
  const { data } = useTrip();

  const sections: ShellSection[] = [
    { key: 'actividades', label: `Actividades (${data.activities.length})` },
    { key: 'sitios', label: 'Sitios por ciudad' },
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
      {section === 'sitios' && <PlacesView />}
      {section === 'videos' && <VideoTipsView />}
    </PageShell>
  );
}
