import { useParams, Navigate } from 'react-router-dom';
import PageShell, { ShellSection } from '@/components/PageShell';
import PendingView from '@/views/PendingView';
import AppsView from '@/views/AppsView';
import BudgetView from '@/views/BudgetView';
import { useTrip } from '@/context/TripContext';
import { usePendingItems } from '@/hooks/usePendingItems';
import { isAppTaskComplete } from '@/lib/calculations';

const SUBTITLES: Record<string, string> = {
  pendientes: 'Lo que queda por decidir o reservar',
  apps: 'Todo se configura desde España',
  dinero: 'Presupuesto y saldo que hay que llevar',
};

/** Los deberes: pendientes, apps del móvil y dinero. */
export default function Gestiones() {
  const { section } = useParams<{ section?: string }>();
  const { data } = useTrip();
  const { items } = usePendingItems();

  const openPending = items.filter(p => p.status === 'open').length;
  const appsTasks = data.appSetup.tasks.filter(t => t.group !== 'descartada');
  const appsPending = appsTasks.filter(t => !isAppTaskComplete(t)).length;

  const sections: ShellSection[] = [
    { key: 'pendientes', label: 'Pendientes', badge: openPending },
    { key: 'apps', label: 'Apps del móvil', badge: appsPending },
    { key: 'dinero', label: 'Dinero' },
  ];

  if (!section || !sections.some(s => s.key === section)) {
    return <Navigate to="/gestiones/pendientes" replace />;
  }

  return (
    <PageShell
      title="Por hacer"
      subtitle={SUBTITLES[section]}
      basePath="/gestiones"
      sections={sections}
      active={section}
    >
      {section === 'pendientes' && <PendingView />}
      {section === 'apps' && <AppsView />}
      {section === 'dinero' && <BudgetView />}
    </PageShell>
  );
}
