import { TripData, HotelOption, TransportLeg, Activity } from '@/types/trip';

/**
 * Asistente local del viaje: responde preguntas sobre el viaje usando exclusivamente
 * los datos que ya viven en la app (TripContext) + una base de conocimiento estática
 * (apps de China, seguro, consejos). No hace ninguna llamada a internet ni a ninguna IA
 * externa: funciona sin cobertura y sin VPN, algo imprescindible dentro de China.
 *
 * IMPORTANTE (guardrail del repo público): aquí NUNCA deben aparecer números de póliza,
 * de billete, de reserva, direcciones exactas ni datos de pago. Solo información operativa.
 */

// ---------- utilidades de texto ----------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[¿?¡!.,;:()"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function has(q: string, words: string[]): boolean {
  return words.some((w) => q.includes(w));
}

// ---------- catálogo de ciudades y alias ----------

interface CityAlias {
  id: string;
  aliases: string[];
}

const CITY_ALIASES: CityAlias[] = [
  { id: 'beijing', aliases: ['beijing', 'pekin', 'peking'] },
  { id: 'xian', aliases: ['xian', "xi'an", 'xi an'] },
  { id: 'chengdu', aliases: ['chengdu'] },
  { id: 'chongqing', aliases: ['chongqing'] },
  { id: 'fenghuang', aliases: ['fenghuang', 'fenix'] },
  { id: 'furong', aliases: ['furong'] },
  { id: 'zhangjiajie', aliases: ['zhangjiajie'] },
  { id: 'wulingyuan', aliases: ['wulingyuan'] },
  { id: 'shangrao', aliases: ['shangrao', 'wangxian', 'wang xian', 'valle de los deseos'] },
  { id: 'shanghai', aliases: ['shanghai', 'shangai'] },
];

function detectCities(q: string): string[] {
  const found: string[] = [];
  for (const c of CITY_ALIASES) {
    if (c.aliases.some((a) => q.includes(a)) && !found.includes(c.id)) {
      found.push(c.id);
    }
  }
  return found;
}

function cityName(data: TripData, cityId: string): string {
  return data.cities.find((c) => c.id === cityId)?.cityName ?? cityId;
}

function shortCity(name: string): string {
  return name.split(' (')[0];
}

// ---------- helpers de datos ----------

function selectedHotelFor(data: TripData, cityId: string): HotelOption | undefined {
  const hid = data.selectedHotels[cityId];
  return hid ? data.hotels.find((h) => h.id === hid) : undefined;
}

function legsForCity(data: TripData, cityId: string): TransportLeg[] {
  return data.transportLegs.filter((t) => t.fromCityId === cityId || t.toCityId === cityId);
}

function activitiesForCity(data: TripData, cityId: string): Activity[] {
  return data.activities.filter((a) => a.cityId === cityId);
}

// ---------- base de conocimiento estática (no está en TripContext) ----------

const APPS_INFO = `📱 **Apps imprescindibles para China** (instálalas y configúralas ANTES de salir de España):

- **Alipay** y **WeChat Pay** — pago móvil, se usa para casi todo. Hay que vincular una tarjeta Visa/Mastercard desde la app internacional.
- **Amap Global** (高德地图, versión internacional) — mapas y navegación; Google Maps no va bien en China.
- **Didi** — el "Uber" chino, para taxis.
- **Trip.com** — billetes de tren bala (ya la usáis para los hoteles).
- **Dianping** — reseñas de restaurantes (el TripAdvisor chino).
- **Meituan** — comida a domicilio.
- **Holafly (e-SIM + VPN)** — conectividad y acceso a apps bloqueadas (Google, WhatsApp...). Actívala justo antes de aterrizar en Beijing.

⚠️ **La VPN es obligatoria** para que carguen las secciones "Qué hacer" y "Pendientes" de esta app dentro de China. El resto de la app (hoteles, vuelos, itinerario, trenes, presupuesto) funciona sin internet.`;

const INSURANCE_INFO = `🛡️ **Seguro de viaje** (contratado por la agencia, ARAG / Insurance Travel, cubre todo el viaje 9 oct – 1 nov 2026):

**Teléfono de asistencia 24h** (apúntalo por si acaso):
- Desde España: **91 000 19 49**
- Desde el extranjero: **+34 91 000 19 49**
- WhatsApp: **+34 666 14 26 01**

Al llamar, di tu nombre, que tienes póliza con Insurance Travel/ARAG, dónde estás y qué pasa.

Coberturas clave: asistencia médica hasta 500.000 €, repatriación ilimitada, equipaje hasta 1.500 €, anulación hasta 3.500 €.

⚠️ Ojo: el seguro NO cubre "deportes de aventura" ni trekking/rescate en montaña. Las visitas a Zhangjiajie, Wulingyuan y Tianmen son turismo normal por senderos y teleférico, no las trates como trekking extremo.

Los números de póliza y certificado no están en la app por seguridad — los tienes en el correo de la agencia (Zafiro Tours Zaragoza, 976 302 157).`;

const SPAIN_INFO = `🚄 **Transporte España ↔ Madrid** (a organizar por vuestra cuenta):

**IDA:** el vuelo sale de Madrid el **9 oct a las 06:20** (muy temprano) → hay que estar en Madrid la **noche anterior (8 oct)**. Necesitáis AVE a Madrid el 8 oct + 1 noche de hotel cerca de Barajas o del centro.

**VUELTA:** llegáis a Madrid el **1 nov a las 20:10**. A esa hora quizá no llegáis a un AVE de vuelta a casa el mismo día → valorad si hacéis noche en Madrid y volvéis el 2 nov.

👉 Consejo: reservad el AVE con antelación (Renfe abre venta ~2-3 meses antes) para mejor precio, y elegid asientos juntos.`;

const GENERAL_TIPS = `💡 **Consejos generales para China:**

- Lleva el **pasaporte siempre encima**: en China se entra a muchos sitios (Guerreros de Terracota, Base de Pandas, museos, trenes) escaneando el pasaporte, sin taquilla física.
- **Efectivo casi no se usa**, pero lleva algo de yuanes (CNY) por si acaso (barcos, mercados pequeños).
- Cada entrada/tren suele ser **"real-name"**: se compra con el pasaporte de cada persona. Comprad una por cada uno.
- Descarga mapas y traductor **offline** por si falla la VPN.
- Los trenes internos aún NO están comprados: hay que comprarlos cuando abra la venta (pregúntame "¿cuándo compro los trenes?").`;

// ---------- generadores de respuesta por tema ----------

function answerHotel(data: TripData, cities: string[]): string {
  if (cities.length === 0) {
    const lines = data.cities
      .map((c) => {
        const h = selectedHotelFor(data, c.id);
        if (!h) return `- **${shortCity(c.cityName)}**: hotel por confirmar`;
        return `- **${shortCity(c.cityName)}**: ${h.name} (${c.nights} ${c.nights === 1 ? 'noche' : 'noches'}${h.totalPrice ? `, ${h.totalPrice}€` : ''})`;
      })
      .join('\n');
    return `🏨 **Vuestros 10 hoteles** (todos reservados vía Trip.com):\n\n${lines}\n\nPregúntame por una ciudad concreta para ver check-in, check-out y detalles.`;
  }

  return cities
    .map((cid) => {
      const c = data.cities.find((x) => x.id === cid)!;
      const h = selectedHotelFor(data, cid);
      if (!h) return `En ${shortCity(c.cityName)} el hotel aún está por confirmar.`;
      const parts = [
        `🏨 **${shortCity(c.cityName)} — ${h.name}**`,
        `📅 Entrada ${h.checkInText} · Salida ${h.checkOutText} (${c.nights} ${c.nights === 1 ? 'noche' : 'noches'})`,
      ];
      if (h.checkInTime || h.checkOutTime) {
        parts.push(`🕐 Check-in desde las ${h.checkInTime ?? '—'} · Check-out hasta las ${h.checkOutTime ?? '—'}`);
      }
      if (h.totalPrice != null) parts.push(`💶 ${h.totalPrice}€ en total${h.breakfastIncluded ? ' · desayuno incluido' : ''}`);
      if (h.paymentNote) parts.push(`💳 ${h.paymentNote}`);
      if (h.link) parts.push(`🔗 ${h.link}`);
      return parts.join('\n');
    })
    .join('\n\n');
}

function answerCheckTimes(data: TripData, cities: string[]): string {
  const target = cities.length > 0 ? cities : data.cities.map((c) => c.id);
  const lines = target
    .map((cid) => {
      const c = data.cities.find((x) => x.id === cid)!;
      const h = selectedHotelFor(data, cid);
      if (!h) return `- **${shortCity(c.cityName)}**: hotel por confirmar`;
      return `- **${shortCity(c.cityName)}**: check-in desde ${h.checkInTime ?? '—'} (${h.checkInText}) · check-out hasta ${h.checkOutTime ?? '—'} (${h.checkOutText})`;
    })
    .join('\n');
  return `🕐 **Horarios de check-in / check-out:**\n\n${lines}`;
}

function answerTrain(data: TripData, cities: string[]): string {
  let legs: TransportLeg[] = [];

  if (cities.length >= 2) {
    // buscar el tramo que conecte dos de las ciudades mencionadas
    legs = data.transportLegs.filter(
      (t) =>
        (cities.includes(t.fromCityId) && cities.includes(t.toCityId))
    );
    if (legs.length === 0) {
      legs = data.transportLegs.filter((t) => cities.includes(t.fromCityId) || cities.includes(t.toCityId));
    }
  } else if (cities.length === 1) {
    legs = legsForCity(data, cities[0]);
  } else {
    // resumen de todos los tramos
    const summary = data.transportLegs
      .map(
        (t) =>
          `- **${shortCity(cityName(data, t.fromCityId))} → ${shortCity(cityName(data, t.toCityId))}** (${t.travelDate ?? ''}): ${t.suggestedDeparture ?? t.mode}`
      )
      .join('\n');
    return `🚄 **Vuestros 8 trayectos en tren bala** (aún por comprar):\n\n${summary}\n\nPregúntame por un tramo concreto (ej. "tren de Beijing a Xi'an") para ver estaciones, horarios y cuándo abre la venta.`;
  }

  if (legs.length === 0) return 'No encuentro ese trayecto en tren. Los trayectos van entre ciudades consecutivas de la ruta.';

  return legs
    .map((t) => {
      const parts = [
        `🚄 **${shortCity(cityName(data, t.fromCityId))} → ${shortCity(cityName(data, t.toCityId))}** (${t.travelDate ?? ''})`,
      ];
      if (t.suggestedDeparture) parts.push(`🕘 Salida sugerida: ${t.suggestedDeparture}`);
      if (t.estimatedArrival) parts.push(`🏁 Llegada: ${t.estimatedArrival}`);
      if (t.fromStation) parts.push(`📍 Desde: ${t.fromStation}`);
      if (t.toStation) parts.push(`📍 Hasta: ${t.toStation}`);
      if (t.transferBefore) parts.push(`➡️ Antes del tren: ${t.transferBefore}`);
      if (t.transferAfter) parts.push(`➡️ Después del tren: ${t.transferAfter}`);
      if (t.saleOpensOn) parts.push(`🎟️ La venta abre aprox. el ${t.saleOpensOn} — hay que comprarlo entonces.`);
      if (t.alertNote) parts.push(`⚠️ ${t.alertNote}`);
      return parts.join('\n');
    })
    .join('\n\n');
}

function answerFlights(data: TripData): string {
  const out = data.flights.filter((f) => f.direction === 'outbound');
  const ret = data.flights.filter((f) => f.direction === 'return');
  const fmt = (f: (typeof data.flights)[number]) => {
    const dep = f.departureDateTime.replace('T', ' ');
    const arr = f.arrivalDateTime.replace('T', ' ');
    return `- ${f.airline} ${f.flightNumber}: ${f.fromAirport} ${dep} → ${f.toAirport} ${arr}`;
  };
  return [
    `✈️ **Vuelos** (cerrados por la agencia, 2 maletas facturadas por persona):`,
    '',
    '**IDA — 9 oct 2026** (Madrid → Beijing):',
    ...out.map(fmt),
    'Llegáis a Beijing de madrugada del 10 oct.',
    '',
    '**VUELTA — 1 nov 2026** (Shanghai → Madrid):',
    ...ret.map(fmt),
    '',
    '⚠️ La ida sale de Madrid a las 06:20 → hay que dormir en Madrid la noche del 8 oct.',
  ].join('\n');
}

// palabras clave que apuntan a una actividad concreta
const ACTIVITY_KEYWORDS: { words: string[]; match: (a: Activity) => boolean }[] = [
  { words: ['muralla', 'tobogan', 'mutianyu', 'gran muralla'], match: (a) => a.title.toLowerCase().includes('muralla') },
  { words: ['guerreros', 'terracota'], match: (a) => a.title.toLowerCase().includes('terracota') },
  { words: ['panda', 'pandas'], match: (a) => a.title.toLowerCase().includes('panda') },
  { words: ['buda', 'leshan'], match: (a) => a.title.toLowerCase().includes('buda') },
  { words: ['tianmen'], match: (a) => a.title.toLowerCase().includes('tianmen') },
  { words: ['avatar', 'yuanjiajie'], match: (a) => a.title.toLowerCase().includes('avatar') },
  { words: ['disney', 'disneyland'], match: (a) => a.title.toLowerCase().includes('disney') },
];

function formatActivity(a: Activity): string {
  const parts = [`🎫 **${a.title}**`];
  if (a.recommendedDate) parts.push(`📅 Día recomendado: ${a.recommendedDate}`);
  if (a.priceText) parts.push(`💶 ${a.priceText}`);
  else if (a.price != null) parts.push(`💶 ~${a.price}€/persona`);
  if (a.whenToBuy) parts.push(`🎟️ Cuándo comprar: ${a.whenToBuy}`);
  if (a.platform) parts.push(`🛒 Dónde: ${a.platform}`);
  if (a.notes) parts.push(`ℹ️ ${a.notes}`);
  if (a.bookingUrl) parts.push(`🔗 ${a.bookingUrl}`);
  return parts.join('\n');
}

function answerActivities(data: TripData, q: string, cities: string[]): string {
  // 1) actividad concreta por palabra clave
  for (const kw of ACTIVITY_KEYWORDS) {
    if (has(q, kw.words)) {
      const act = data.activities.find(kw.match);
      if (act) return formatActivity(act);
    }
  }
  // 2) actividades de una ciudad
  if (cities.length > 0) {
    const acts = cities.flatMap((cid) => activitiesForCity(data, cid));
    if (acts.length > 0) return acts.map(formatActivity).join('\n\n');
    return `En ${cities.map((c) => shortCity(cityName(data, c))).join(', ')} no hay actividades con entrada registradas en la app.`;
  }
  // 3) listado general
  const list = data.activities
    .map((a) => `- **${a.title}** (${shortCity(cityName(data, a.cityId))}) — ${a.priceText ?? (a.price != null ? `~${a.price}€` : '')}`)
    .join('\n');
  return `🎫 **Actividades y entradas del viaje:**\n\n${list}\n\nPregúntame por una concreta (ej. "entradas de los pandas") para ver precio, cuándo comprarla y detalles.`;
}

function answerWhenToBuy(data: TripData): string {
  const trains = data.transportLegs
    .filter((t) => t.saleOpensOn)
    .map((t) => `- 🚄 ${shortCity(cityName(data, t.fromCityId))} → ${shortCity(cityName(data, t.toCityId))}: venta abre ~${t.saleOpensOn}`)
    .join('\n');
  const acts = data.activities
    .filter((a) => a.whenToBuy)
    .map((a) => `- 🎫 ${a.title}: ${a.whenToBuy}`)
    .join('\n');
  return `⏰ **Cuándo comprar cada cosa:**\n\n**Trenes bala** (comprar en cuanto abra la venta, se agotan en Golden Week):\n${trains}\n\n**Entradas de actividades:**\n${acts}\n\n👉 Los trenes de Xi'an→Chengdu, Chongqing→Fenghuang y Zhangjiajie→Shangrao son los más críticos: cómpralos el primer día que se pueda.`;
}

function answerBudget(data: TripData): string {
  const hotelTotal = data.cities.reduce((sum, c) => {
    const h = selectedHotelFor(data, c.id);
    return sum + (h?.totalPrice ?? 0);
  }, 0);
  const actTotal = data.activities.reduce((sum, a) => sum + (a.price ?? 0) * 2, 0); // precio suele ser por persona
  const flights = data.budgetExtras.flightsInsurance;

  return [
    `💶 **Presupuesto aproximado del viaje** (2 personas):`,
    '',
    `🏨 Hoteles (10 ciudades, ya reservados): **${Math.round(hotelTotal)}€**`,
    `✈️ Vuelos + seguro (ya pagados): **${flights}€**`,
    `🎫 Actividades/entradas (estimado, aún por comprar): **~${Math.round(actTotal)}€**`,
    '',
    `➡️ Falta sumar: trenes internos (aún sin precio), traslados locales (Didi), comidas y compras.`,
    '',
    'Puedes ver el desglose completo en la pestaña **Presupuesto**.',
  ].join('\n');
}

function answerItinerary(data: TripData): string {
  const rows = [...data.cities]
    .sort((a, b) => a.order - b.order)
    .map((c) => `**${c.order}. ${shortCity(c.cityName)}** — ${c.startDateText} a ${c.endDateText} (${c.nights} ${c.nights === 1 ? 'noche' : 'noches'})`)
    .join('\n');
  return `🗺️ **Vuestra ruta** (${data.trip.totalNights} noches, ${data.trip.dateRangeText}):\n\n${rows}\n\nPregúntame por cualquier ciudad para ver hotel, tren y actividades.`;
}

function answerCityOverview(data: TripData, cityId: string): string {
  const c = data.cities.find((x) => x.id === cityId)!;
  const h = selectedHotelFor(data, cityId);
  const acts = activitiesForCity(data, cityId);
  const arrival = data.transportLegs.find((t) => t.toCityId === cityId);
  const departure = data.transportLegs.find((t) => t.fromCityId === cityId);

  const parts = [`📍 **${shortCity(c.cityName)}** — ${c.startDateText} a ${c.endDateText} (${c.nights} ${c.nights === 1 ? 'noche' : 'noches'})`];
  if (c.notes.length > 0) parts.push(`📝 ${c.notes.join(' ')}`);
  if (h) {
    parts.push(`\n🏨 **Hotel:** ${h.name}\n   Check-in ${h.checkInText} (${h.checkInTime ?? '—'}) · Check-out ${h.checkOutText} (${h.checkOutTime ?? '—'})${h.totalPrice ? ` · ${h.totalPrice}€` : ''}`);
  }
  if (arrival) parts.push(`\n🚄 **Llegada:** desde ${shortCity(cityName(data, arrival.fromCityId))} — ${arrival.suggestedDeparture ?? arrival.mode}`);
  if (departure) parts.push(`🚄 **Salida:** hacia ${shortCity(cityName(data, departure.toCityId))} — ${departure.suggestedDeparture ?? departure.mode}`);
  if (acts.length > 0) parts.push(`\n🎫 **Actividades:** ${acts.map((a) => a.title).join(', ')}`);
  parts.push(`\n¿Quieres el detalle del hotel, del tren o de las actividades de ${shortCity(c.cityName)}?`);
  return parts.join('\n');
}

const GREETING = `¡Hola! 👋 Soy vuestro asistente del viaje a China. Tengo TODOS los datos de vuestro viaje y respondo al instante, incluso sin internet.

Puedo ayudaros con:
🏨 Hoteles y horarios de check-in/check-out
🚄 Trenes internos (horarios, estaciones, cuándo comprarlos)
✈️ Vuelos
🎫 Entradas y actividades (muralla, pandas, Disney...)
💶 Presupuesto
📱 Apps de China · 🛡️ Seguro · 🚄 AVE a Madrid

Escríbeme algo como: "¿Qué hotel tenemos en Xi'an?", "¿Qué tren cojo de Beijing a Xi'an?" o "¿Cuándo compro las entradas de los pandas?"`;

function answerHelp(): string {
  return GREETING;
}

// ---------- función principal ----------

export function answerQuestion(rawQuestion: string, data: TripData): string {
  const q = normalize(rawQuestion);
  if (!q) return answerHelp();

  const cities = detectCities(q);

  // saludos / ayuda
  if (has(q, ['hola', 'buenas', 'hey', 'que tal', 'ayuda', 'que puedes hacer', 'que sabes'])) {
    if (q.split(' ').length <= 4) return answerHelp();
  }

  // cuándo comprar / apertura de venta
  if (has(q, ['cuando compr', 'cuando reserv', 'apertura', 'abre la venta', 'cuando abre', 'ventana de compra', 'fecha limite'])) {
    return answerWhenToBuy(data);
  }

  // apps de China
  if (has(q, ['app', 'aplicacion', 'alipay', 'wechat', 'wechat pay', 'amap', 'mapa', 'didi', 'holafly', 'vpn', 'esim', 'e-sim', 'sim', 'dianping', 'meituan', 'pagar', 'pago movil', 'internet'])) {
    return APPS_INFO;
  }

  // seguro / emergencias
  if (has(q, ['seguro', 'poliza', 'arag', 'medic', 'emergencia', 'hospital', 'asistencia', 'cobertura', 'accidente'])) {
    return INSURANCE_INFO;
  }

  // AVE / Madrid / España
  if (has(q, ['ave', 'renfe', 'madrid', 'barajas', 'noche en madrid', 'desde casa', 'a casa'])) {
    return SPAIN_INFO;
  }

  // equipaje
  if (has(q, ['maleta', 'equipaje', 'baggage', 'facturar', 'facturad'])) {
    return `🧳 **Equipaje:** en los vuelos tenéis **2 maletas facturadas por persona** (4 en total) + equipaje de mano. El seguro cubre robo/daños de equipaje hasta 1.500 € y demora hasta 150 €.\n\n👉 Ojo con las maletas en los trayectos de tren: por eso hemos cuadrado cada tren con el check-out del hotel de origen y el check-in del destino, para no quedaros tirados con el equipaje. Pregúntame por un tramo concreto.`;
  }

  // trenes internos
  if (has(q, ['tren', 'trenes', 'bala', 'ave interno', 'estacion', 'trayecto', 'traslado', 'como voy', 'como llego', 'como vamos'])) {
    return answerTrain(data, cities);
  }

  // check-in / check-out
  if (has(q, ['check in', 'checkin', 'check-in', 'check out', 'checkout', 'check-out', 'entrada al hotel', 'salida del hotel', 'a que hora'])) {
    if (has(q, ['hotel', 'check in', 'checkin', 'check-in', 'check out', 'checkout', 'check-out']) || cities.length > 0) {
      return answerCheckTimes(data, cities);
    }
  }

  // hoteles
  if (has(q, ['hotel', 'hoteles', 'alojamiento', 'dormir', 'donde nos quedamos', 'donde dormimos', 'habitacion', 'reserva'])) {
    return answerHotel(data, cities);
  }

  // vuelos
  if (has(q, ['vuelo', 'vuelos', 'avion', 'flight', 'aeropuerto', 'brussels', 'air china', 'escala'])) {
    return answerFlights(data);
  }

  // actividades / entradas
  if (
    has(q, ['actividad', 'actividades', 'entrada', 'entradas', 'ticket', 'que hacer', 'que ver', 'visitar', 'excursion']) ||
    ACTIVITY_KEYWORDS.some((kw) => has(q, kw.words))
  ) {
    return answerActivities(data, q, cities);
  }

  // presupuesto
  if (has(q, ['presupuesto', 'coste', 'cuesta', 'cuanto', 'precio', 'gasto', 'dinero', 'euros', 'total'])) {
    return answerBudget(data);
  }

  // itinerario / ruta
  if (has(q, ['itinerario', 'ruta', 'plan', 'dias', 'fechas', 'noches', 'orden', 'ciudades', 'cuando vamos'])) {
    return answerItinerary(data);
  }

  // consejos generales
  if (has(q, ['consejo', 'consejos', 'tip', 'tips', 'recomend', 'pasaporte', 'efectivo', 'yuan', 'dinero chino', 'traductor'])) {
    return GENERAL_TIPS;
  }

  // si solo mencionó una ciudad, dar resumen de la ciudad
  if (cities.length === 1) {
    return answerCityOverview(data, cities[0]);
  }
  if (cities.length > 1) {
    return cities.map((c) => answerCityOverview(data, c)).join('\n\n———\n\n');
  }

  // fallback
  return `No estoy seguro de haber entendido 🤔. Puedo ayudarte con:

🏨 Hoteles · 🕐 Check-in/out · 🚄 Trenes · ✈️ Vuelos · 🎫 Entradas · 💶 Presupuesto · 📱 Apps de China · 🛡️ Seguro · 🚄 AVE a Madrid

Prueba con algo como:
· "¿Qué hotel tenemos en Chengdu?"
· "¿Qué tren cojo de Xi'an a Chengdu?"
· "¿Cuándo compro las entradas de los pandas?"
· "¿Cuánto nos cuesta el viaje?"`;
}

// sugerencias rápidas para la interfaz
export const QUICK_SUGGESTIONS = [
  '¿Qué hotel tenemos en Xi\'an?',
  '¿Qué tren cojo de Beijing a Xi\'an?',
  '¿Cuándo compro los trenes?',
  'Entradas de los pandas',
  '¿Cuánto cuesta el viaje?',
  '¿Qué apps necesito?',
];
