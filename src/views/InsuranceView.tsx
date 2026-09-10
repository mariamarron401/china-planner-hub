import { ShieldCheck, Phone, MessageCircle, Mail, Ban, CalendarRange, Users } from 'lucide-react';
import MoreInfo from '@/components/MoreInfo';
import { INSURANCE, CoverageItem } from '@/data/insurance';

/**
 * El seguro de viaje de un vistazo: a quién llamar, qué cubre (en cifras) y qué no.
 * Todo es de solo lectura, lo contrató la agencia. Regla de la pantalla: número
 * grande + etiqueta corta; lo largo va plegado.
 */
export default function InsuranceView() {
  const e = INSURANCE.emergency;

  return (
    <div className="px-4 space-y-4">
      {/* Cabecera: qué seguro es y que ya está */}
      <div className="gradient-hero rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide mb-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Seguro de viaje · ✅ contratado
        </div>
        <div className="text-2xl font-bold text-primary-foreground leading-tight">
          {INSURANCE.insurer} · {INSURANCE.brand}
        </div>
        <div className="text-sm text-primary-foreground/80 mt-0.5">{INSURANCE.plan} · ámbito {INSURANCE.scope}</div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-primary-foreground/90">
          <div className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-lg px-2.5 py-1.5">
            <CalendarRange className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{INSURANCE.validFrom} → {INSURANCE.validTo}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-lg px-2.5 py-1.5">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{INSURANCE.insured.join(' y ')}</span>
          </div>
        </div>
        <div className="text-[11px] text-primary-foreground/70 mt-2">Lo contrató {INSURANCE.contractedBy}. No hay nada que hacer.</div>
      </div>

      {/* Emergencia: lo primero que se busca si pasa algo */}
      <div className="rounded-xl border-2 border-travel-important/40 bg-travel-important-bg p-4">
        <div className="text-sm font-bold text-travel-important mb-1">🆘 Si pasa algo, llamad ANTES de ir al médico</div>
        <div className="text-[11px] text-muted-foreground mb-3">Asistencia 24 h, los 365 días. Desde China marcad siempre con el +34.</div>
        <div className="grid grid-cols-1 gap-2">
          <a href={`tel:${e.phoneAbroadTel}`} className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3 active:scale-[0.99]">
            <div className="h-9 w-9 rounded-full bg-travel-important/15 text-travel-important flex items-center justify-center flex-shrink-0">
              <Phone className="h-[18px] w-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Llamar</div>
              <div className="text-lg font-bold text-foreground leading-tight">{e.phoneAbroadDisplay}</div>
            </div>
          </a>
          <a href={`https://wa.me/${e.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3 active:scale-[0.99]">
            <div className="h-9 w-9 rounded-full bg-travel-confirmed/15 text-travel-confirmed flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-[18px] w-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</div>
              <div className="text-lg font-bold text-foreground leading-tight">{e.whatsappDisplay}</div>
            </div>
          </a>
        </div>
        <div className="mt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Qué decir, en este orden</div>
          <ol className="space-y-1">
            {INSURANCE.sayWhenCalling.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="h-[18px] w-[18px] min-w-[18px] rounded-full bg-travel-important text-primary-foreground text-[10px] font-bold flex items-center justify-center mt-px">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Las 6 cifras */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">Lo importante, en 6 cifras</h2>
        <div className="grid grid-cols-2 gap-2">
          {INSURANCE.headline.map(item => (
            <Tile key={item.label} item={item} big />
          ))}
        </div>
      </section>

      {/* Todo lo que cubre, por bloques */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">Todo lo que cubre</h2>
        <div className="space-y-3">
          {INSURANCE.groups.map(g => (
            <div key={g.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-travel-confirmed-bg flex items-center gap-2">
                <span className="text-lg leading-none">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground leading-tight">{g.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{g.hint}</div>
                </div>
                <span className="text-[10px] font-semibold text-travel-confirmed bg-card border border-travel-confirmed/30 rounded-full px-2 py-0.5">{g.items.length}</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {g.items.map(item => (
                  <Tile key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lo que NO cubre */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Ban className="h-4 w-4 text-travel-important" />
          <h2 className="text-sm font-bold text-foreground">Lo que NO cubre</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INSURANCE.exclusions.map(x => (
            <span key={x} className="text-[11px] font-medium text-travel-important bg-travel-important-bg border border-travel-important/20 rounded-full px-2.5 py-1">
              {x}
            </span>
          ))}
        </div>
        <MoreInfo label="Qué significa esto en nuestro viaje" tone="warn">
          {INSURANCE.tripNotes.map((n, i) => <p key={i}>{n}</p>)}
        </MoreInfo>
      </section>

      {/* Qué hacer si pasa algo */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground mb-2">Si hay que usarlo, 3 pasos</h2>
        <ol className="space-y-2.5">
          {INSURANCE.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="h-6 w-6 min-w-[24px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground leading-tight">{s.title}</div>
                <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>
        <a href={`mailto:${e.claimsEmail}`} className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
          <Mail className="h-3.5 w-3.5" /> {e.claimsEmail}
        </a>
        <MoreInfo label="Datos de la póliza y atención al cliente">
          <p>Los números de póliza y de certificado no están en la app (es pública): están en el correo de la agencia y en el PDF del certificado. Llevad una captura de ese PDF en el móvil.</p>
          <p>Para consultas que no sean urgencias (no para pedir asistencia): {e.customerPhones} o {e.customerEmail}.</p>
          <p>Las 44 causas de anulación y las condiciones completas están en el PDF de condiciones generales que mandó la agencia.</p>
        </MoreInfo>
      </section>
    </div>
  );
}

/** Cifra grande + etiqueta corta. Es la unidad visual de toda la pantalla. */
function Tile({ item, big = false }: { item: CoverageItem; big?: boolean }) {
  const unlimited = /ilimitad|incluido/i.test(item.amount);
  return (
    <div className={`rounded-lg border border-border px-2.5 py-2 ${big ? 'bg-card shadow-sm' : 'bg-muted/50'}`}>
      <div className={`font-bold leading-tight ${unlimited ? 'text-travel-confirmed' : 'text-foreground'} ${big ? 'text-lg' : 'text-sm'}`}>
        {item.amount}
      </div>
      <div className={`text-muted-foreground leading-snug mt-0.5 ${big ? 'text-[11px]' : 'text-[10px]'}`}>{item.label}</div>
    </div>
  );
}
