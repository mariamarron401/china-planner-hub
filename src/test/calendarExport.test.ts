import { describe, it, expect } from 'vitest';
import { buildTripIcs, countTripAlerts } from '@/lib/calendarExport';
import { parseLooseDate } from '@/lib/calendar';
import { initialTripData } from '@/data/initialData';

const legs = initialTripData.transportLegs;
const cityName = (id: string) =>
  initialTripData.cities.find(c => c.id === id)?.cityName?.split(' (')[0] ?? id;

const ics = buildTripIcs(legs, cityName);
const lines = ics.split('\r\n');

describe('avisos de calendario (.ics)', () => {
  it('genera un archivo iCalendar bien formado', () => {
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines).toContain('VERSION:2.0');
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    // Cada BEGIN tiene su END
    const count = (re: RegExp) => (ics.match(re) || []).length;
    expect(count(/BEGIN:VEVENT/g)).toBe(count(/END:VEVENT/g));
    expect(count(/BEGIN:VALARM/g)).toBe(count(/END:VALARM/g));
  });

  it('cubre los 8 trenes: pre-reserva, comprobación y día del viaje', () => {
    const trenes = legs.filter(l => l.trainNumber);
    expect(trenes).toHaveLength(8);
    expect((ics.match(/UID:prebook-/g) || []).length).toBe(8);
    expect((ics.match(/UID:checkticket-/g) || []).length).toBe(8);
    // 9 tramos con día de viaje: los 8 trenes + el cambio de hotel en Didi del 24 oct
    expect((ics.match(/UID:leg-/g) || []).length).toBe(9);
  });

  it('pone dos alarmas en cada día de trayecto: la noche antes y al salir del hotel', () => {
    // 8 pre-reservas + 8 comprobaciones + 9 trayectos x 2 alarmas = 34
    expect((ics.match(/BEGIN:VALARM/g) || []).length).toBe(34);
    expect(countTripAlerts(legs)).toBe(34);
  });

  it('ninguna alarma cae después de su evento', () => {
    // Un TRIGGER positivo (PT30M en vez de -PT30M) sonaría DESPUÉS de salir el tren.
    const posteriores = ics.match(/TRIGGER:PT\d+M/g) || [];
    expect(posteriores).toHaveLength(0);
  });

  it('no emite el -PT0M que rechaza iOS', () => {
    expect(ics).not.toContain('TRIGGER:-PT0M');
    expect(ics).toContain('TRIGGER:PT0S');
  });

  it('pliega todas las líneas a 75 octetos, contando el chino como 3 bytes', () => {
    const enc = new TextEncoder();
    const largas = lines.filter(l => enc.encode(l).length > 75);
    expect(largas).toHaveLength(0);
  });

  it('usa hora local flotante, sin Z ni TZID', () => {
    const fechas = lines.filter(l => l.startsWith('DTSTART:') || l.startsWith('DTEND:'));
    expect(fechas.length).toBeGreaterThan(0);
    fechas.forEach(l => {
      expect(l).toMatch(/^DT(START|END):\d{8}T\d{6}$/);
      expect(l).not.toContain('Z');
      expect(l).not.toContain('TZID');
    });
  });

  it('el primer tren lleva el G365 y su hora real', () => {
    const bloque = ics.split('BEGIN:VEVENT').find(b => b.includes('UID:leg-tl-1'))!;
    expect(bloque).toContain('DTSTART:20261013T095500');
    expect(bloque).toContain('DTEND:20261013T140500');
    expect(bloque).toContain('G365');
    // Aviso la noche antes a las 20:00 → 13h55 antes de las 09:55
    expect(bloque).toContain('TRIGGER:-PT835M');
    // Aviso al salir del hotel a las 08:15 → 100 min antes
    expect(bloque).toContain('TRIGGER:-PT100M');
  });

  it('el tramo del 24 oct no inventa un tren, porque es un Didi', () => {
    const bloque = ics.split('BEGIN:VEVENT').find(b => b.includes('UID:leg-tl-6b'))!;
    expect(bloque).toContain('Didi');
    expect(bloque).not.toMatch(/Tren [GD]\d/);
    // Y no genera avisos de compra de billete
    expect(ics).not.toContain('UID:prebook-tl-6b');
    expect(ics).not.toContain('UID:checkticket-tl-6b');
  });

  it('escapa las comas de las descripciones', () => {
    // Si una coma sin escapar se colara, iOS cortaría la descripción por ahí.
    const descripciones = lines.filter(l => l.startsWith('DESCRIPTION:'));
    descripciones.forEach(l => {
      const cuerpo = l.slice('DESCRIPTION:'.length);
      expect(cuerpo).not.toMatch(/(^|[^\\]),/);
    });
  });

  it('travelDateIso concuerda con la fecha escrita en travelDate', () => {
    // Guardia contra desincronización: son dos campos que describen el mismo día.
    legs.forEach(leg => {
      if (!leg.travelDateIso || !leg.travelDate) return;
      const suelta = parseLooseDate(leg.travelDate)!;
      const [, mes, dia] = leg.travelDateIso.split('-').map(Number);
      expect({ id: leg.id, dia, mes }).toEqual({ id: leg.id, dia: suelta.day, mes: suelta.month });
    });
  });
});
