import { describe, it, expect } from 'vitest';
import { buildCalendar, parseLooseDate } from '@/lib/calendar';
import { initialTripData } from '@/data/initialData';

const days = buildCalendar(initialTripData);
const at = (iso: string) => days.find(d => d.iso === iso)!;

describe('calendario día a día', () => {
  it('cubre del 8 oct al 2 nov sin huecos', () => {
    expect(days).toHaveLength(26); // 24 días de octubre (8-31) + 1 y 2 de nov
    expect(days[0].iso).toBe('2026-10-08');
    expect(days[days.length - 1].iso).toBe('2026-11-02');
    // no se repite ni se salta ningún día
    expect(new Set(days.map(d => d.iso)).size).toBe(26);
  });

  it('el 2 de nov cierra el viaje sin hotel y con la nota de festivo', () => {
    const d = at('2026-11-02');
    expect(d.hotel).toBeNull();
    expect(d.weekday).toBe('lunes');
    expect(d.notes.join()).toContain('festivo');
  });

  it('acierta los días de la semana', () => {
    expect(at('2026-10-10').weekday).toBe('sábado');
    expect(at('2026-10-25').weekday).toBe('domingo');
    expect(at('2026-11-01').weekday).toBe('domingo');
  });

  it('asigna a cada noche el hotel correcto', () => {
    // Beijing: check-in 10 oct, check-out 13 oct → duermen 10, 11 y 12
    expect(at('2026-10-10').hotel?.name).toContain('Liveforturna');
    expect(at('2026-10-12').hotel?.name).toContain('Liveforturna');
    // la noche del 13 ya es Xi'an, no Beijing
    expect(at('2026-10-13').hotel?.name).toContain('Center Hotel');
    // última noche en Shanghái es la del 31 oct; el 1 nov ya no hay hotel
    expect(at('2026-10-31').hotel?.name).toContain('Meta Tree');
    expect(at('2026-11-01').hotel).toBeNull();
  });

  it('las 22 noches del viaje tienen hotel asignado', () => {
    expect(days.filter(d => d.hotel !== null)).toHaveLength(22);
  });

  it('marca entradas y salidas de hotel', () => {
    expect(at('2026-10-10').isCheckIn).toBe(true);
    expect(at('2026-10-13').isCheckIn).toBe(true); // sale de Beijing y entra en Xi'an
    expect(at('2026-10-13').isCheckOut).toBe(true);
    expect(at('2026-11-01').isCheckOut).toBe(true); // check-out de Shanghái
  });

  it('coloca las excursiones en su día', () => {
    expect(at('2026-10-11').activities.map(a => a.title).join()).toContain('Ciudad Prohibida');
    expect(at('2026-10-12').activities.map(a => a.title).join()).toContain('Muralla');
    expect(at('2026-10-14').activities.map(a => a.title).join()).toContain('Terracota');
    expect(at('2026-10-17').activities.map(a => a.title).join()).toContain('Pandas');
  });

  it('coloca los trenes y los traslados de aeropuerto en su día', () => {
    expect(at('2026-10-13').transportLegs).toHaveLength(1);
    expect(at('2026-10-10').airportTransfers).toHaveLength(1); // PEK → hotel
    expect(at('2026-11-01').airportTransfers).toHaveLength(2); // Shanghái y bus a Zaragoza
  });

  it('ancla los traslados nocturnos al día en que hay que actuar, no al que dice el texto', () => {
    // "noche del jue 8 al vie 9 oct": el bus se coge el 8, aunque el texto acabe en "9 oct"
    const ida = at('2026-10-08').airportTransfers;
    expect(ida).toHaveLength(1);
    expect(ida[0].fromText).toContain('Zaragoza');
    expect(at('2026-10-09').airportTransfers).toHaveLength(0);
    // "noche del dom 1 al lun 2 nov": el bus se coge el 1, no el 2
    expect(at('2026-11-02').airportTransfers).toHaveLength(0);
    expect(at('2026-11-01').airportTransfers.some(t => t.toText.includes('Zaragoza'))).toBe(true);
  });

  it('marca el cambio de hora del 25 oct', () => {
    expect(at('2026-10-25').isDstChange).toBe(true);
    expect(at('2026-10-24').isDstChange).toBe(false);
    // ese día están en Wulingyuan
    expect(at('2026-10-25').cityName).toContain('Wulingyuan');
  });

  it('parsea los formatos de fecha del proyecto', () => {
    expect(parseLooseDate('10 oct')).toEqual({ day: 10, month: 10 });
    expect(parseLooseDate('13 oct 2026 (martes)')).toEqual({ day: 13, month: 10 });
    expect(parseLooseDate('Domingo 11 oct (mañana temprano)')).toEqual({ day: 11, month: 10 });
    expect(parseLooseDate('1 nov 2026 (domingo) — noche')).toEqual({ day: 1, month: 11 });
    expect(parseLooseDate(undefined)).toBeNull();
    expect(parseLooseDate('sin fecha')).toBeNull();
  });
});
