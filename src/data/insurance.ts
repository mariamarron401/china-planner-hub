/**
 * Seguro de viaje contratado por la agencia (ARAG · Insurance Travel).
 *
 * Fuente: certificado del seguro, modalidad BASE con anulación, ámbito Mundo.
 * Es información CERRADA (la gestiona la agencia), así que vive aquí como dato
 * estático y de solo lectura: no pasa por TripContext ni por Supabase.
 *
 * ⚠️ El repo es público: aquí NO van el número de póliza ni el de certificado.
 * Están en el correo de la agencia y en el PDF del certificado.
 */

export interface CoverageItem {
  /** La cifra, tal cual la pinta la tarjeta: "500.000 €", "Ilimitado", "150 €/día · 10 días" */
  amount: string;
  /** Qué cubre, en pocas palabras */
  label: string;
}

export interface CoverageGroup {
  id: string;
  emoji: string;
  title: string;
  /** Una frase de qué va el bloque */
  hint: string;
  items: CoverageItem[];
}

export const INSURANCE = {
  insurer: 'ARAG',
  brand: 'Insurance Travel',
  plan: 'BASE con anulación',
  scope: 'Mundo',
  validFrom: '9 oct 2026',
  validTo: '1 nov 2026',
  insured: ['María', 'José Miguel'],
  contractedBy: 'Zafiro Tours Zaragoza (la agencia de los vuelos)',

  emergency: {
    phoneAbroadDisplay: '+34 91 000 19 49',
    phoneAbroadTel: '+34910001949',
    whatsappDisplay: '+34 666 14 26 01',
    whatsappNumber: '34666142601',
    claimsEmail: 'siniestros.i4t@arag.es',
    customerPhones: '93 485 89 07 · 91 566 16 01',
    customerEmail: 'atencioncliente@arag.es',
  },

  /** Lo que hay que decir al llamar, en el orden en que lo piden */
  sayWhenCalling: [
    'Vuestro nombre',
    'Que tenéis póliza de Insurance Travel / ARAG (el nº está en el correo de la agencia)',
    'Dónde estáis y un teléfono al que llamaros',
    'Qué ha pasado',
  ],

  /** Las 6 cifras que hay que tener en la cabeza */
  headline: [
    { amount: '500.000 €', label: 'Médico en el extranjero' },
    { amount: 'Ilimitado', label: 'Repatriación' },
    { amount: '1.500 €', label: 'Robo o daños al equipaje' },
    { amount: '3.500 €', label: 'Anulación del viaje' },
    { amount: '500 €', label: 'Transporte alternativo si perdéis un enlace' },
    { amount: '60.000 €', label: 'Responsabilidad civil' },
  ] as CoverageItem[],

  groups: [
    {
      id: 'salud',
      emoji: '🏥',
      title: 'Salud',
      hint: 'Médico, hospital y volver a casa si hace falta',
      items: [
        { amount: '500.000 €', label: 'Asistencia médica en el extranjero' },
        { amount: 'Ilimitado', label: 'Repatriación o transporte sanitario' },
        { amount: '20.000 €', label: 'Enfermedad preexistente, solo urgencia vital' },
        { amount: '150 €', label: 'Dentista' },
        { amount: '120 €/día · 10 días', label: 'Hotel si hay que quedarse convaleciente' },
        { amount: '120 €/día · 10 días', label: 'Hotel del acompañante' },
        { amount: 'Incluido', label: 'Viaje de un familiar si hay hospitalización' },
        { amount: 'Incluido', label: 'Envío de medicamentos' },
        { amount: 'Incluido', label: 'Regreso anticipado (familiar grave o siniestro en casa)' },
        { amount: '2.000 €', label: 'Búsqueda y rescate' },
      ],
    },
    {
      id: 'equipaje',
      emoji: '🧳',
      title: 'Equipaje y documentos',
      hint: 'Las 4 maletas y los pasaportes',
      items: [
        { amount: '1.500 €', label: 'Robo o daños al equipaje' },
        { amount: '150 €', label: 'Si la maleta facturada llega tarde' },
        { amount: 'Incluido', label: 'Búsqueda y envío de equipaje perdido' },
        { amount: '60 €', label: 'Gestiones por pérdida o robo de documentos' },
        { amount: '125 €', label: 'Envío de objetos olvidados o robados' },
        { amount: '60 €', label: 'Pérdida de las llaves de casa' },
      ],
    },
    {
      id: 'retrasos',
      emoji: '⏱️',
      title: 'Retrasos y enlaces',
      hint: 'Los 4 vuelos y los 7 trenes',
      items: [
        { amount: '15 € cada 6 h · máx. 450 €', label: 'Retraso en la salida del vuelo o tren' },
        { amount: '300 €', label: 'Pérdida de un enlace' },
        { amount: '500 €', label: 'Transporte alternativo por enlace perdido' },
        { amount: '150 €/día · 7 días', label: 'Hotel si el viaje se alarga' },
        { amount: '200 €', label: 'Anulación de la salida por huelga' },
        { amount: '200-250 €', label: 'Servicios contratados que se pierden (médico, hospital…)' },
      ],
    },
    {
      id: 'anulacion',
      emoji: '❌',
      title: 'Anulación',
      hint: 'Si el viaje no se puede hacer o hay que volver antes',
      items: [
        { amount: '3.500 €', label: 'Anulación del viaje (44 causas, ámbito Mundo)' },
        { amount: '2.000 €', label: 'Vacaciones no disfrutadas (ámbito Mundo)' },
      ],
    },
    {
      id: 'legal',
      emoji: '⚖️',
      title: 'Legal y accidentes',
      hint: 'Por si hay un problema serio',
      items: [
        { amount: '60.000 €', label: 'Responsabilidad civil privada' },
        { amount: '6.000 €', label: 'Defensa penal en el extranjero' },
        { amount: '3.000 €', label: 'Adelanto de dinero en el extranjero' },
        { amount: '10.000 €', label: 'Accidentes en viaje, 24 h' },
        { amount: '35.000 €', label: 'Accidentes en transporte público' },
      ],
    },
    {
      id: 'mascotas',
      emoji: '🐾',
      title: 'Mascotas',
      hint: 'Solo si dejáis alguna en casa',
      items: [
        { amount: '30 h', label: 'Cuidado de perros y gatos' },
        { amount: '150 €', label: 'Veterinario' },
        { amount: '300 €', label: 'Residencia si os hospitalizan' },
      ],
    },
  ] as CoverageGroup[],

  /** Lo que NO cubre, en corto */
  exclusions: [
    'Senderismo, trekking y deportes de aventura',
    'Rescate en montaña (fuera del límite de 2.000 €)',
    'Enfermedades crónicas o previas (salvo urgencia vital)',
    'Accidentes con alcohol o drogas',
    'Gafas, lentillas, prótesis y audífonos',
    'Embarazo y tratamientos estéticos',
    'Gastos médicos de menos de 9 €',
    'Catástrofes naturales, disturbios, terrorismo',
  ],

  /** Cómo aplica a este viaje en concreto */
  tripNotes: [
    'Zhangjiajie, Wulingyuan y Tianmen son turismo por pasarelas, teleférico y escaleras: no es "trekking", pero si os salís de los senderos marcados el seguro no responde.',
    'El seguro cubre del 9 de octubre al 1 de noviembre, o sea desde el vuelo de ida hasta llegar a casa. El tren a Madrid del día 8 va fuera de la póliza.',
    'Las entradas y trenes ya pagados entran en "anulación" si hay una causa de las 44 (enfermedad grave, hospitalización, etc.). Guardad todos los justificantes.',
  ],

  /** Qué hacer si pasa algo, en orden */
  steps: [
    { title: 'Llamad o escribid ANTES de ir al médico', detail: 'Ellos os dicen a qué hospital ir y abren el expediente. Si vais por vuestra cuenta, luego toca adelantar el dinero y reclamar.' },
    { title: 'Guardad todo el papel', detail: 'Informes médicos, facturas, tickets y el parte de la policía si hay robo. Sin papel no hay reembolso.' },
    { title: 'Reembolso por correo', detail: 'A siniestros.i4t@arag.es con los justificantes. La atención al cliente (no urgencias) es el 93 485 89 07.' },
  ],
};
