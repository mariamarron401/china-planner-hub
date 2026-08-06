import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, Share, PlusSquare, AlertTriangle } from 'lucide-react';
import MoreInfo from '@/components/MoreInfo';

/**
 * Tarjeta "¿Se abrirá esta app en China?".
 *
 * La app se sirve desde GitHub Pages (github.io), que a través del Gran Cortafuegos va lento o
 * no responde. Para que eso deje de importar, la app se guarda entera en el móvil (service
 * worker, ver `public/sw.js`) y se instala en la pantalla de inicio. Esta tarjeta dice si ese
 * guardado ya ha ocurrido EN ESTE MÓVIL — que es el único sitio donde se puede comprobar.
 */

type Status = 'checking' | 'ready' | 'pending' | 'unsupported';

export default function OfflineReadyCard() {
  const [status, setStatus] = useState<Status>('checking');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // ¿Está abierta desde el icono de la pantalla de inicio (standalone) o desde el navegador?
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // Safari en iOS no soporta display-mode: standalone; usa esta propiedad propia.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(Boolean(standalone));

    if (!('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    let cancelled = false;
    navigator.serviceWorker
      .getRegistration()
      .then(reg => {
        if (cancelled) return;
        setStatus(reg && (reg.active || navigator.serviceWorker.controller) ? 'ready' : 'pending');
      })
      .catch(() => !cancelled && setStatus('pending'));
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = status === 'ready';

  return (
    <div className="px-4 mt-4">
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex items-start gap-2">
          {ready ? (
            <CheckCircle2 className="h-5 w-5 text-travel-confirmed shrink-0 mt-0.5" />
          ) : (
            <CloudOff className="h-5 w-5 text-travel-important shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="font-bold text-foreground leading-tight">¿Se abrirá esta app en China?</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-snug">
              {ready ? (
                <>
                  <span className="font-medium text-foreground">Sí. En este móvil ya está guardada.</span> La app se abre
                  aunque no haya internet o no funcione la VPN: el plan, los días, los hoteles, los trenes, los vuelos,
                  las actividades y el chat del viaje están dentro del teléfono.
                </>
              ) : status === 'checking' ? (
                'Comprobando…'
              ) : (
                <>
                  <span className="font-medium text-foreground">Todavía no.</span> Dejad esta pantalla abierta unos
                  segundos con internet y volved a entrar: la app se guarda sola en el móvil la primera vez.
                </>
              )}
            </p>
          </div>
        </div>

        {!installed && (
          <div className="mt-3 rounded-lg bg-muted p-3">
            <div className="text-xs font-bold text-foreground uppercase tracking-wide">
              Hacedlo en los dos iPhone antes de volar
            </div>
            <ol className="mt-2 space-y-1.5 text-sm text-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Abrid esta app en <span className="font-medium">Safari</span> (no dentro de otra app).</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span className="flex items-center gap-1">
                  Pulsad <Share className="h-4 w-4 inline" /> (Compartir), abajo en el centro.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span className="flex items-center gap-1">
                  <PlusSquare className="h-4 w-4 inline" /> «Añadir a pantalla de inicio» → Añadir.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>
                  Abridla una vez <span className="font-medium">desde el icono nuevo</span> y pasad por todas las
                  pestañas, para que se descarguen también las fotos.
                </span>
              </li>
            </ol>
          </div>
        )}

        <MoreInfo label="Qué funciona sin VPN y qué no">
          <p>
            ✅ <span className="font-medium text-foreground">Funciona siempre, aunque no haya red:</span> Inicio, Plan
            (días, ciudades, hoteles), Moverse (trayectos, trenes, traslados, vuelos), las fichas de actividades con sus
            guías, Dinero, Apps y el chat del viaje. Todo eso viaja dentro del móvil.
          </p>
          <p>
            🔄 <span className="font-medium text-foreground">Necesita VPN:</span> solo lo que se sincroniza entre vuestros
            dos móviles — «Pendientes», «Qué hacer» (los sitios que añadís), los tips de vídeo y que una casilla marcada
            en un móvil aparezca en el otro. Sin VPN cada teléfono sigue viendo su última copia; no se pierde nada, solo
            deja de actualizarse.
          </p>
          <p>
            🖼️ <span className="font-medium text-foreground">Las fotos de ciudades</span> vienen de Wikimedia, que está
            bloqueado en China. Las que se hayan visto alguna vez quedan guardadas; por eso el paso 4.
          </p>
          <p className="flex gap-1.5">
            <AlertTriangle className="h-4 w-4 text-travel-important shrink-0 mt-0.5" />
            <span>
              No borréis el icono ni «Datos de sitios web» de Safari durante el viaje: eso sí borraría la copia guardada,
              y volver a descargarla en China puede no ser posible sin VPN.
            </span>
          </p>
        </MoreInfo>
      </div>
    </div>
  );
}
