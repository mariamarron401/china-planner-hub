import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import RouteSchemeView from '@/views/RouteSchemeView';
import TrainsView from '@/views/TrainsView';
import TransfersView from '@/views/TransfersView';
import FlightsView from '@/views/FlightsView';

const SECTIONS: ShellSection[] = [
  { key: 'trayectos', label: 'Puerta a puerta' },
  { key: 'trenes', label: 'Trenes' },
  { key: 'traslados', label: 'Traslados' },
  { key: 'vuelos', label: 'Vuelos' },
];

const SUBTITLES: Record<string, string> = {
  trayectos: 'Hotel → estación → tren → hotel, con horas',
  trenes: 'Los 8 trenes bala y cuándo comprarlos',
  traslados: 'Aeropuertos y coches dentro de la ciudad',
  vuelos: 'Air China · Economy · 2 piezas de equipaje',
};

/** Todo lo que es moverse: trenes, coches y aviones. */
export default function Moverse() {
  const { section } = useParams<{ section?: string }>();
  if (!section || !SECTIONS.some(s => s.key === section)) {
    return <Navigate to="/moverse/trayectos" replace />;
  }

  return (
    <PageShell
      title="Cómo nos movemos"
      subtitle={SUBTITLES[section]}
      basePath="/moverse"
      sections={SECTIONS}
      active={section}
    >
      {section === 'trayectos' && <RouteSchemeView />}
      {section === 'trenes' && <TrainsView />}
      {section === 'traslados' && <TransfersView />}
      {section === 'vuelos' && <FlightsView />}
    </PageShell>
  );
}
