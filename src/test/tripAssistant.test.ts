import { describe, it, expect } from 'vitest';
import { answerQuestion } from '@/lib/tripAssistant';
import { initialTripData } from '@/data/initialData';

const ask = (q: string) => answerQuestion(q, initialTripData);

describe('tripAssistant', () => {
  it('hotel de una ciudad', () => {
    const a = ask('¿Qué hotel tenemos en Xi\'an?');
    expect(a).toContain('Center Hotel');
    expect(a).toContain('Check-in');
  });

  it('tren entre dos ciudades', () => {
    const a = ask('¿Qué tren cojo de Beijing a Xi\'an?');
    expect(a).toContain('Beijing → Xi');
    expect(a).toContain('09:55');
  });

  it('actividad por palabra clave', () => {
    const a = ask('entradas de los pandas');
    expect(a.toLowerCase()).toContain('panda');
    expect(a).toContain('Cuándo comprar');
  });

  it('vuelos', () => {
    const a = ask('¿a qué hora salen los vuelos?');
    expect(a).toContain('SN3732');
    expect(a).toContain('CA897');
  });

  it('cuando comprar', () => {
    const a = ask('¿cuándo compro los trenes?');
    expect(a).toContain('venta abre');
  });

  it('presupuesto', () => {
    const a = ask('¿cuánto cuesta el viaje?');
    expect(a).toContain('Hoteles');
    expect(a).toContain('2022');
  });

  it('apps', () => {
    const a = ask('¿qué apps necesito?');
    expect(a).toContain('Alipay');
    expect(a).toContain('VPN');
  });

  it('seguro', () => {
    const a = ask('teléfono del seguro en una emergencia');
    expect(a).toContain('91 000 19 49');
  });

  it('resumen de ciudad solo con el nombre', () => {
    const a = ask('Chengdu');
    expect(a).toContain('Chengdu');
    expect(a).toContain('Hotel');
  });

  it('fallback ante algo raro', () => {
    const a = ask('asdfqwer zzz');
    expect(a).toContain('No estoy seguro');
  });
});
