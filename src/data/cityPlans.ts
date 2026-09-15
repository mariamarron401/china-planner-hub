/**
 * Planning definitivo de cada ciudad.
 *
 * Es la ÚNICA fuente de verdad de "qué hacemos en esta ciudad". Sustituye a las
 * antiguas listas sueltas de "Sitios por ciudad" (cafeterías, tiendas, POVs...),
 * que había que rellenar a mano y estaban vacías.
 *
 * Regla al ampliarlo: los textos de tarjeta van cortos (una línea se lee de un
 * vistazo en el móvil). Lo largo —el porqué, los avisos, la letra pequeña— va en
 * `more`, que la pantalla pinta plegado.
 */

/** 🔴 imprescindible · 🟡 muy recomendable · ⚪ solo si sobra tiempo · ❌ no lo metería */
export type PlanPriority = 'must' | 'nice' | 'optional' | 'skip';

/** Qué tipo de momento es, para el icono y el color de la línea del día. */
export type PlanBlockKind = 'move' | 'visit' | 'food' | 'rest' | 'ticket' | 'shop';

export interface PlanBlock {
  /** "08:15", "Mañana", "Final de tarde" */
  time: string;
  title: string;
  /** Una o dos frases como mucho. */
  detail: string;
  kind: PlanBlockKind;
  /** true = pinta la tarjeta en rojo (hora crítica o reserva obligatoria). */
  alert?: boolean;
  more?: string;
}

export interface PlanDay {
  id: string;
  /** "Sábado 10 de octubre" */
  dateText: string;
  /** "Llegada + Templo del Cielo + Beijing contemporáneo" */
  title: string;
  /** "Sur + este" */
  zone: string;
  blocks: PlanBlock[];
}

export interface PlanHighlight {
  name: string;
  nameZh?: string;
  what: string;
  /** "Centro, ~3,5 km del hotel" */
  zone: string;
  time: string;
  ticket: string;
  priority: PlanPriority;
  more?: string;
}

export interface PlanPlace {
  name: string;
  nameZh?: string;
  address?: string;
  phone?: string;
  /** Qué es y por qué está en la lista. */
  what: string;
  price?: string;
  /** Cuándo encaja en nuestro planning. */
  when?: string;
  priority: PlanPriority;
  more?: string;
}

export interface PlanFood {
  name: string;
  pinyin: string;
  what: string;
  kind: 'salado' | 'dulce';
}

export interface PlanPhotoSpot {
  name: string;
  nameZh?: string;
  /** Dónde colocarse y hacia dónde disparar. */
  how: string;
  when?: string;
}

export interface PlanTrend {
  name: string;
  verdict: 'si' | 'quizas' | 'no';
  why: string;
}

export interface PlanBooking {
  /** Con qué actividad de la app se corresponde, si la tiene. */
  activityId?: string;
  title: string;
  /** "4 de octubre, 14:00 hora española" */
  when: string;
  price: string;
  /** Dónde y cómo se compra. */
  how: string;
  alert?: string;
  url?: string;
}

export interface CityPlan {
  cityId: string;
  /** Una frase que resume el plan de la ciudad. */
  headline: string;
  /** Lo que hay que saber sí o sí antes de nada. Máximo 3-4. */
  keyNotes: string[];
  /** Dónde estamos: qué tenemos cerca del hotel. */
  base: string[];
  days: PlanDay[];
  highlights: PlanHighlight[];
  restaurants: PlanPlace[];
  markets: PlanPlace[];
  food: PlanFood[];
  photoSpots: PlanPhotoSpot[];
  shopping: PlanPlace[];
  trends: PlanTrend[];
  bookings: PlanBooking[];
  /** Jerarquía final para ESTE viaje, no para la ciudad en abstracto. */
  ranking: { must: string[]; nice: string[]; optional: string[]; skip: string[] };
}

const beijing: CityPlan = {
  cityId: 'beijing',
  headline: 'Tres días con personalidad propia: ritual el sábado, corazón histórico el domingo y Gran Muralla el lunes.',
  keyNotes: [
    'Ciudad Prohibida: la venta abre el 4 de octubre a las 14:00 hora española (7 días antes, 20:00 en Pekín). ¥60, nominal y con el pasaporte original.',
    'Tiananmen: ventana de 1 a 7 días, así que el 4 de octubre es también el primer día. Es otro sistema: no des por hecho que abre a la misma hora que la Ciudad Prohibida.',
    'Mutianyu: se puede reservar hasta 30 días antes, o sea que ya está dentro de ventana desde el 12 de septiembre. Resérvala ya y olvídate.',
    'La bajada de bandera del 11 de octubre debería rondar las 17:41, algo antes de lo que teníamos calculado. Reconfirmar el horario oficial 24-48 h antes.',
  ],
  base: [
    'Ritan Park a 400 m andando',
    'Wangfujing a 2-2,5 km',
    'Ciudad Prohibida y Tiananmen a ~3,5 km',
    'Templo del Cielo a ~4 km',
    'Sanlitun y el CBD al este, el Pekín histórico al oeste: estamos en medio',
  ],

  days: [
    {
      id: 'bj-d1',
      dateText: 'Sábado 10 de octubre',
      title: 'Llegada + Templo del Cielo + Pekín contemporáneo',
      zone: 'Sur y este',
      blocks: [
        {
          time: '04:45',
          title: 'Aterrizaje en PEK T3',
          detail: 'Salir de la terminal 06:00-06:15 y taxi oficial al hotel, ~07:00. Unos ¥120-160.',
          kind: 'move',
          more: 'El aeropuerto está a unos 23 km en línea recta del hotel y a esa hora evitáis buena parte del tráfico. Dejad las maletas y no intentéis nada ambicioso todavía. Si estáis sorprendentemente despiertos, Ritan Park (日坛公园) está a pocos minutos andando y sirve para un paseo corto mientras desayunáis.',
        },
        {
          time: '08:15-08:30',
          title: 'Didi al Templo del Cielo',
          detail: 'Pedirlo a 天坛东门 — Temple of Heaven East Gate. Es la puerta que conviene.',
          kind: 'move',
        },
        {
          time: 'Mañana',
          title: 'Templo del Cielo',
          detail: 'East Gate → Hall of Prayer for Good Harvests → Imperial Vault y Echo Wall → Circular Mound Altar. 2½-3 h.',
          kind: 'visit',
          more: 'No lo sustituiría por otra visita. Abre desde primera hora y los edificios principales funcionan hasta las 18:00 en octubre. Los edificios históricos cierran los lunes, así que el sábado es justo el día que nos cuadra.',
        },
        {
          time: 'Mediodía',
          title: 'Mercado de Hongqiao y comer por la zona',
          detail: 'Está literalmente pegado a la salida este. 45-60 min si os apetece.',
          kind: 'shop',
        },
        {
          time: '14:00',
          title: 'Check-in y descanso de verdad',
          detail: 'Didi al hotel y 1½-2 h parados. Habéis pasado la noche volando.',
          kind: 'rest',
          more: 'Este hueco es deliberado. Cargar demasiado el primer día probablemente os pase factura el domingo, que es el día que más precisión necesita.',
        },
        {
          time: 'Final de tarde',
          title: 'Sanlitun y Taikoo Li',
          detail: 'Tiendas, paseo y ambiente. Está cerca del hotel.',
          kind: 'shop',
        },
        {
          time: 'Noche',
          title: 'Pato pekinés en Siji Minfu',
          detail: 'Aquí es donde encajaría el pato, no el domingo. ¥150-220 por persona.',
          kind: 'food',
        },
        {
          time: 'Opcional',
          title: 'Liangma River iluminado',
          detail: 'Si quedan fuerzas. Si no, Didi directo al hotel y no pondría nada más.',
          kind: 'visit',
        },
      ],
    },
    {
      id: 'bj-d2',
      dateText: 'Domingo 11 de octubre',
      title: 'El gran día histórico',
      zone: 'Centro histórico',
      blocks: [
        {
          time: '07:30-07:40',
          title: 'Salir del hotel',
          detail: 'Didi a la zona de Donghuamen (东华门) y andar por el foso hasta la Puerta del Mediodía.',
          kind: 'move',
          more: 'No os mando por Tiananmen a propósito: entrando por los corredores este/oeste no mezcláis los controles de la plaza con vuestra entrada al palacio. La información oficial contempla estos accesos laterales cuando solo se visita el Museo.',
        },
        {
          time: '08:30',
          title: 'Ciudad Prohibida',
          detail: 'Entrada única por Meridian Gate / 午门. Unas 4 horas.',
          kind: 'visit',
          alert: true,
          more: 'Ruta: Meridian Gate → eje imperial central → Taihe Hall y grandes salas ceremoniales → palacios interiores → Imperial Garden → salida por Shenwumen (神武门). Y solo UNA zona lateral, la que más os llame. No intentéis ver cada pabellón. Aviso 2026: hay trabajos en la zona de Taihemen (Gate of Supreme Harmony); comprobad los avisos oficiales unos días antes por si hay desvío.',
        },
        {
          time: 'Mediodía',
          title: 'Jingshan Park',
          detail: 'Justo enfrente de la salida norte. Subir al Wanchun Pavilion. 45-60 min.',
          kind: 'visit',
          more: 'Para mí es obligatorio: es la foto de la Ciudad Prohibida entera desde arriba, con el eje central de Pekín detrás. No suele necesitar reserva previa y la entrada cuesta muy poco.',
        },
        {
          time: 'Tarde',
          title: 'Qianmen y Dashilan',
          detail: 'Didi hasta Qianmen. Comer algo, calle principal y callejuelas laterales.',
          kind: 'food',
          more: 'Aquí no metería otro monumento. Venís del norte del centro y tenéis que acabar al sur, así que Qianmen es el puente natural hacia Tiananmen.',
        },
        {
          time: '16:15-16:30',
          title: 'Al control sur de Tiananmen',
          detail: 'Se va andando desde Qianmen. No cojáis transporte.',
          kind: 'move',
          alert: true,
          more: 'No es que la ceremonia dure una hora: es la seguridad, la comprobación de reserva y pasaporte, las colas, el cierre de accesos y la cantidad de gente buscando sitio.',
        },
        {
          time: '~17:41',
          title: 'Bajada de bandera',
          detail: 'Reserva obligatoria en la franja 降旗. Plaza, Tiananmen Gate y Monumento a los Héroes.',
          kind: 'ticket',
          alert: true,
        },
        {
          time: 'Noche',
          title: 'Cena en Qianmen o vuelta al hotel',
          detail: 'No añadiría Wangfujing después. Sobre el mapa parece cerca, pero lleváis 9-10 horas.',
          kind: 'food',
        },
      ],
    },
    {
      id: 'bj-d3',
      dateText: 'Lunes 12 de octubre',
      title: 'Gran Muralla de Mutianyu',
      zone: 'Mutianyu, ~60 km al noreste',
      blocks: [
        {
          time: '06:30-06:45',
          title: 'Salir de Pekín en Didi o coche',
          detail: 'Directo a 慕田峪长城. 1h30-2h según tráfico.',
          kind: 'move',
          more: 'Con solo tres días en Pekín no compensan varios cambios de autobús. Un Didi puede rondar ¥200-400 por trayecto según demanda; mirad la cotización real en la app la víspera. El lunes es perfecto: la Ciudad Prohibida y los museos cierran, y Mutianyu abre.',
        },
        {
          time: '08:00-08:30',
          title: 'Entrar al recinto',
          detail: 'Centro de visitantes → shuttle interno → telesilla.',
          kind: 'move',
        },
        {
          time: 'Mañana',
          title: 'Telesilla a Torre 6 y paseo a Torre 4',
          detail: 'Ida y vuelta tranquila, 2½-3 h de muralla. Sin objetivo competitivo.',
          kind: 'visit',
          more: 'La Torre 4 (Zhengguantai 正关台) es especialmente característica por sus tres torres conectadas. No diseñaría la ruta para llegar a la Torre 20: durante 2026 ha habido cierres parciales en tramos altos (16-17 y 19-20). Revisad el aviso oficial justo antes del día 12.',
        },
        {
          time: '~12:30-13:30',
          title: 'Tobogán hacia abajo',
          detail: 'Se baja desde la Torre 6, que es justo donde sube la telesilla.',
          kind: 'visit',
          more: 'Si llueve o hay viento fuerte el tobogán puede suspenderse: comprobadlo la misma mañana.',
        },
        {
          time: 'Comida',
          title: 'Comer en el área base de Mutianyu',
          detail: 'Algo sencillo y paseo por la zona de abajo.',
          kind: 'food',
        },
        {
          time: '14:30-15:30',
          title: 'Regreso a Pekín',
          detail: 'Llegada al hotel entre las 16:00 y las 17:30 según tráfico.',
          kind: 'move',
          more: 'No dependáis de encontrar coche al azar al final de la tarde. Al llegar por la mañana, mirad disponibilidad de Didi y programad el regreso si la app os deja.',
        },
        {
          time: 'Noche',
          title: 'Nada importante',
          detail: 'Ducha, descanso y cena. Como mucho, Guijie o un paseo por Ritan.',
          kind: 'rest',
        },
      ],
    },
    {
      id: 'bj-d4',
      dateText: 'Martes 13 de octubre',
      title: 'Salida hacia Xi’an',
      zone: 'Beijing West',
      blocks: [
        {
          time: '05:50-06:00',
          title: 'Últimas cosas y check-out',
          detail: 'El desayuno abre a las 06:30 y no llegáis: pedid 打包早餐 la noche antes.',
          kind: 'rest',
        },
        {
          time: '06:10-06:15',
          title: 'Didi a Beijing West',
          detail: '10-12 km. En la estación sobre las 06:50.',
          kind: 'move',
          alert: true,
        },
        {
          time: '07:55',
          title: 'Tren G351 a Xi’an',
          detail: 'No reduciría ese margen.',
          kind: 'move',
          alert: true,
          more: 'Una estación china de alta velocidad implica localizar la entrada, control de identidad con pasaporte, seguridad, encontrar la sala y esperar a que abran el embarque. El objetivo no es llegar una hora antes porque el tren lo exija, sino no empezar el trayecto a Xi’an con estrés.',
        },
      ],
    },
  ],

  highlights: [
    {
      name: 'Ciudad Prohibida',
      nameZh: '故宫博物院',
      what: 'El gran imprescindible histórico. Complejo imperial Ming-Qing.',
      zone: 'Centro, ~3,5 km',
      time: '4-5 h',
      ticket: 'Reserva imprescindible',
      priority: 'must',
    },
    {
      name: 'Mutianyu',
      nameZh: '慕田峪长城',
      what: 'Gran Muralla restaurada y bastante más agradable que Badaling.',
      zone: '~60 km al noreste',
      time: 'Prácticamente el día',
      ticket: 'Reserva recomendable',
      priority: 'must',
    },
    {
      name: 'Templo del Cielo',
      nameZh: '天坛公园',
      what: 'De los conjuntos imperiales más bonitos y muy distinto de la Ciudad Prohibida.',
      zone: 'Sur-centro, ~4-5 km',
      time: '2,5-3 h',
      ticket: 'Recomendable',
      priority: 'must',
      more: 'Los edificios históricos cierran los lunes, así que solo nos cuadra el sábado 10.',
    },
    {
      name: 'Jingshan Park',
      nameZh: '景山公园',
      what: 'El mejor mirador de la Ciudad Prohibida completa desde arriba.',
      zone: 'Justo al norte de la Ciudad Prohibida',
      time: '45-60 min',
      ticket: 'No suele hacer falta',
      priority: 'must',
    },
    {
      name: 'Tiananmen',
      nameZh: '天安门广场',
      what: 'Interesa por simbolismo, escala y ceremonia más que por cosas que ver.',
      zone: 'Centro, ~4 km',
      time: '1-2 h más controles',
      ticket: 'Reserva obligatoria',
      priority: 'must',
    },
    {
      name: 'Qianmen y Dashilan',
      nameZh: '前门·大栅栏',
      what: 'Pekín comercial tradicional: fachadas históricas, comida y ambiente.',
      zone: 'Al sur de Tiananmen',
      time: '1,5-2 h',
      ticket: 'No',
      priority: 'nice',
    },
    {
      name: 'Sanlitun',
      nameZh: '三里屯',
      what: 'Pekín contemporáneo: moda, gente joven, restaurantes y marcas chinas.',
      zone: 'Este, cerca del hotel',
      time: '2-3 h',
      ticket: 'No',
      priority: 'nice',
    },
    {
      name: 'Liangma River',
      nameZh: '亮马河',
      what: 'Paseo urbano iluminado, ahora mismo muy popular para salir de noche.',
      zone: 'Este',
      time: '1-2 h',
      ticket: 'No',
      priority: 'nice',
    },
    {
      name: 'Templo de los Lamas',
      nameZh: '雍和宫',
      what: 'De los templos budistas tibetanos más importantes fuera del Tíbet.',
      zone: 'Norte-centro, ~4 km',
      time: '1,5-2 h',
      ticket: 'Conveniente',
      priority: 'nice',
    },
    {
      name: 'Torres del Tambor y la Campana',
      nameZh: '鼓楼·钟楼',
      what: 'Buen complemento para hutongs y Pekín tradicional. Reabiertas en 2026.',
      zone: 'Norte histórico',
      time: '1-1,5 h',
      ticket: 'No crítica',
      priority: 'nice',
    },
    {
      name: 'Palacio de Verano',
      nameZh: '颐和园',
      what: 'Enorme jardín imperial y lago. En otro viaje sería casi imprescindible.',
      zone: 'Noroeste, ~17 km',
      time: '3-5 h más trayecto',
      ticket: 'Sí',
      priority: 'skip',
      more: 'Es la gran víctima de tener poco tiempo. No lo metería a la fuerza: necesitaríais medio día y os rompe toda la lógica geográfica del viaje.',
    },
    {
      name: 'Shougang Park',
      nameZh: '首钢园',
      what: 'Pekín industrial y futurista, muy fotogénico.',
      zone: 'Extremo oeste',
      time: '3 h más desplazamiento',
      ticket: 'No',
      priority: 'skip',
    },
  ],

  restaurants: [
    {
      name: 'Siji Minfu',
      nameZh: '四季民福',
      address: '32 Dengshikou W St, Dongcheng, Beijing 100006',
      phone: '+86 10 6513 5141',
      what: 'La opción de pato pekinés. Alternativa contemporánea al histórico Quanjude.',
      price: '¥150-220 por persona',
      when: 'Sábado por la noche, junto a Sanlitun',
      priority: 'must',
      more: 'Pedid pato laqueado, tortitas, puerro y pepino, salsa tianmian y algún plato vegetal. El problema son las colas: varias sucursales no funcionan bien con reservas y en hora punta la espera puede ser importante. No lo pondría el domingo, que vais más justos.',
    },
    {
      name: 'No. 69 Fangzhuanchang Zhajiangmian',
      what: 'Local conocido por los 炸酱面: fideos con pasta de soja fermentada y verduras.',
      address: '69 Fangzhuanchang Hutong, Dongcheng',
      price: 'Barato',
      when: 'Solo si acabáis pasando por hutongs o Drum Tower',
      priority: 'nice',
      more: 'Sencillo y muy local, pero no desviaría el recorrido expresamente para venir.',
    },
    {
      name: 'Donglaishun',
      what: 'Hot pot de cordero en olla de cobre (涮羊肉), finísimas lonchas.',
      address: '198 Wangfujing Ave, Dongcheng, Beijing 100006',
      phone: '+86 10 6513 9661',
      price: '¥100-200 por persona',
      when: 'Si una noche acabáis en Wangfujing',
      priority: 'nice',
    },
    {
      name: 'Huguosi Snack Bar',
      what: 'Para probar muchos snacks tradicionales de golpe sin buscarlos uno a uno.',
      address: '180 Di’anmenwai Ave, Shichahai, Dongcheng, Beijing 100009',
      phone: '+86 10 6404 2946',
      when: 'Aiwowo, wandouhuang, jiaoquan, douzhi…',
      priority: 'nice',
    },
    {
      name: 'Quanjude Qianmen',
      what: 'La institución histórica del pato pekinés, en su sucursal de Qianmen.',
      address: '30 Qianmen St, Dongcheng, Beijing 100051',
      phone: '+86 10 6511 2418',
      priority: 'optional',
      more: 'Interesante como experiencia, pero elegiría Siji Minfu si priorizáis comer mejor y la relación calidad-precio. Quanjude tiene sentido si os hace ilusión precisamente el restaurante histórico.',
    },
  ],

  markets: [
    {
      name: 'Hongqiao / Pearl Market',
      nameZh: '红桥市场',
      address: 'Dongcheng, Beijing 100062',
      phone: '+86 10 6713 3354',
      what: 'Perlas, joyería, souvenirs y artesanía. Enfocado al visitante y con regateo.',
      when: 'Sábado, al salir del Templo del Cielo',
      priority: 'must',
      more: 'Está pegado al Templo del Cielo, así que es el mercado más fácil de incorporar. No iría exclusivamente a verlo, pero sí lo aprovecharía porque literalmente está en la ruta.',
    },
    {
      name: 'Panjiayuan',
      nameZh: '潘家园旧货市场',
      what: 'Antigüedades, jade, caligrafía, porcelana, carteles, libros y monedas.',
      priority: 'nice',
      more: 'El sábado es de los mejores días, pero las sesiones nocturnas y la programación especial cambian con frecuencia: comprobad el horario oficial esa semana. Solo lo incluiría si os encantan este tipo de mercados.',
    },
    {
      name: 'Silk Street',
      nameZh: '秀水街',
      address: 'Dongdaqiao Rd 8, Chaoyang, Beijing 100020',
      what: 'Ropa, bolsos, souvenirs, sastres y gafas. Todo a base de regateo.',
      priority: 'nice',
      more: 'Está bastante cerca del hotel. No es una experiencia de mercado chino tradicional, pero puede ser divertida si queréis comprar.',
    },
    {
      name: 'Guijie',
      nameZh: '簋街',
      what: 'No es un night market: es una calle de restaurantes con farolillos rojos.',
      when: 'Funciona de noche. Hotpot, cangrejo de río picante, pescado',
      priority: 'nice',
    },
    {
      name: 'Wangfujing Snack Street',
      nameZh: '王府井小吃街',
      what: 'CERRADA PERMANENTEMENTE. Siguen circulando vídeos antiguos.',
      priority: 'skip',
      more: 'Mucho cuidado con vídeos viejos de TikTok, YouTube o blogs. Wangfujing sigue siendo una gran zona comercial, pero no planifiquéis nada alrededor del viejo mercado de comida.',
    },
  ],

  food: [
    { name: '北京烤鸭', pinyin: 'Běijīng kǎoyā — pato pekinés', what: 'El gran plato local: piel crujiente, carne, tortitas, salsa, pepino y puerro.', kind: 'salado' },
    { name: '炸酱面', pinyin: 'Zhajiangmian', what: 'Fideos con salsa intensa de soja fermentada y carne, con verduras frescas.', kind: 'salado' },
    { name: '涮羊肉', pinyin: 'Shuàn yángròu', what: 'Hot pot de cordero en olla tradicional de cobre.', kind: 'salado' },
    { name: '爆肚', pinyin: 'Bàodǔ', what: 'Tripa cortada fina y escaldada muy rápido, con salsa de sésamo. Muy Pekín.', kind: 'salado' },
    { name: '炒肝', pinyin: 'Chǎogān', what: 'Guiso espeso de hígado e intestino de cerdo. Tradicionalmente, desayuno.', kind: 'salado' },
    { name: '焦圈', pinyin: 'Jiāoquān', what: 'Aro de masa frito y crujiente, normalmente acompañando al douzhi.', kind: 'salado' },
    { name: '豆汁', pinyin: 'Dòuzhī', what: 'Bebida fermentada de judía mungo. Ácida, intensa y divisiva: es casi una prueba de valor.', kind: 'salado' },
    { name: '糖葫芦', pinyin: 'Tánghúlu', what: 'Frutas cubiertas de caramelo duro, tradicionalmente espino chino. Muy fotogénico.', kind: 'dulce' },
    { name: '驴打滚', pinyin: 'Lǘdǎgǔn', what: 'Rollito de arroz glutinoso con pasta dulce y harina de soja.', kind: 'dulce' },
    { name: '豌豆黄', pinyin: 'Wāndòuhuáng', what: 'Dulce de guisante amarillo, suave y compacto, de cocina imperial.', kind: 'dulce' },
    { name: '艾窝窝', pinyin: 'Àiwōwo', what: 'Bolita de arroz glutinoso con relleno dulce.', kind: 'dulce' },
    { name: '糖火烧', pinyin: 'Tánghuǒshāo', what: 'Bollito horneado con azúcar o melaza y sésamo.', kind: 'dulce' },
    { name: '老北京酸奶', pinyin: 'Lǎo Běijīng suānnǎi', what: 'Yogur de Pekín, servido muchas veces en tarritos.', kind: 'dulce' },
    { name: '北冰洋', pinyin: 'Běibīngyáng', what: 'Refresco de naranja clásico de Pekín. Aparece en todos los restaurantes tradicionales.', kind: 'dulce' },
  ],

  photoSpots: [
    {
      name: 'Wanchun Pavilion, Jingshan Park',
      nameZh: '万春亭',
      how: 'Subid al pabellón central y poneos en la terraza sur mirando al sur: Jingshan → tejados de la Ciudad Prohibida → eje central de Pekín.',
      when: 'Domingo, al salir por Shenwumen',
    },
    {
      name: 'Corner Tower con el foso',
      nameZh: '故宫角楼',
      how: 'Se hace desde FUERA de la Ciudad Prohibida. El spot reconocible es la torre nordeste, en diagonal a través del agua.',
      when: 'Ideal al final de la tarde, aunque el domingo la prioridad es Tiananmen',
    },
    {
      name: 'Templo del Cielo',
      nameZh: '祈年殿',
      how: 'Foto frontal desde el eje principal al sur del edificio, disparando hacia el norte. Buscad también encuadres a través de las puertas rojas abiertas.',
    },
    {
      name: 'Qianmen',
      nameZh: '正阳门',
      how: 'Desde Qianmen Street mirando al norte, con la torre Zhengyangmen de fondo.',
      when: 'Muy bonito cuando empieza a encenderse la iluminación',
    },
    {
      name: 'Tiananmen',
      how: 'Desde la parte sur o central de la plaza, hacia el norte, con Tiananmen Gate y el retrato al fondo.',
      when: 'Sin confiar en buscar el sitio: los controles y las zonas de circulación cambian',
    },
    {
      name: 'Mutianyu',
      how: 'Torre 6 y el tramo hacia la Torre 4. Desde las zonas elevadas, mirad al oeste y noroeste: la muralla serpenteando por las crestas.',
    },
  ],

  shopping: [
    {
      name: 'Taikoo Li Sanlitun',
      address: '19 Sanlitun Rd, Chaoyang, Beijing 100027',
      phone: '+86 10 6417 6110',
      what: 'La mejor zona para vosotros: moda internacional y china, tecnología, diseño y cafeterías.',
      when: 'Sábado por la tarde, está cerca del hotel',
      priority: 'must',
      more: 'Miraría especialmente marcas chinas de moda y lifestyle, Xiaomi y electrónica, beauty y skincare, tiendas conceptuales, juguetes y coleccionables, y ópticas.',
    },
    {
      name: 'Wangfujing',
      nameZh: '王府井',
      what: 'Zona clásica y turística: grandes almacenes y tiendas insignia.',
      priority: 'optional',
      more: 'Si ya vais a Qianmen y Tiananmen, no me parece imprescindible añadirlo esa misma tarde.',
    },
    {
      name: 'Silk Street',
      what: 'Interesante si buscáis compra-negociación más que una zona bonita.',
      priority: 'optional',
    },
    {
      name: 'Tecnología: Xiaomi y DJI',
      what: 'En 2026 son lo que más se está destacando entre visitantes extranjeros.',
      priority: 'nice',
      more: 'Están en los grandes distritos comerciales, y además hay un sistema nuevo de devolución inmediata de impuestos en muchos comercios.',
    },
  ],

  trends: [
    { name: 'Jingshan y la Ciudad Prohibida desde arriba', verdict: 'si', why: 'Viral, sí, pero absolutamente justificado.' },
    { name: 'Rooftops con vistas al eje central', verdict: 'si', why: 'Tendencia muy fuerte en 2026: terrazas sobre hutongs, Jingshan y el palacio. Si tuvierais otra noche libre, buscaría una.' },
    { name: 'Liangma River de noche', verdict: 'si', why: 'De los paseos nocturnos más agradables ahora mismo, y está en nuestro lado de la ciudad.' },
    { name: 'Corner Tower reflejada en el foso', verdict: 'si', why: 'Sigue siendo uno de los POV más bonitos de Pekín.' },
    { name: 'Shougang Park', verdict: 'quizas', why: 'Espectacular —hornos, patrimonio industrial, Big Air olímpico— pero demasiado lejos al oeste para este viaje.' },
    { name: 'Sesión de fotos con hanfu', verdict: 'quizas', why: 'Queda increíble, pero entre maquillaje, vestuario y sesión se van varias horas.' },
    { name: 'Cafetería rooftop solo por la foto', verdict: 'quizas', why: 'Si coincide, sí. Desplazarse y hacer una hora de cola solo por ella, no.' },
    { name: 'Panjiayuan night market de TikTok', verdict: 'quizas', why: 'El mercado merece la pena, pero la programación nocturna ha cambiado varias veces. No diseñaría el día alrededor de un vídeo.' },
    { name: 'Wangfujing Snack Street', verdict: 'no', why: 'Tendencia desactualizada: la calle de snacks está cerrada y los vídeos siguen circulando.' },
  ],

  bookings: [
    {
      activityId: 'act-8',
      title: 'Ciudad Prohibida',
      when: '4 de octubre, 14:00 hora española (20:00 en Pekín)',
      price: '¥60 en temporada alta, más galerías opcionales de ~¥10',
      how: 'Web o mini-programa oficial del Museo del Palacio. Nominal y con pasaporte original; cupo diario limitado y sin venta presencial garantizada.',
      alert: 'Poned alarma: se agota el mismo día que se libera.',
      url: 'https://intl.dpm.org.cn/ticket_details.html',
    },
    {
      activityId: 'act-9',
      title: 'Tiananmen y bajada de bandera',
      when: 'Desde el 4 de octubre (ventana de 1 a 7 días)',
      price: 'Gratis, pero obligatoria',
      how: 'Mini-programa de WeChat 天安门广场预约参观, eligiendo la franja 降旗. Nominal, con pasaporte admitido para extranjeros.',
      alert: 'Es otro sistema que el del palacio: no asumáis la misma hora de apertura. Y aunque tengáis reserva, los flujos de acceso pueden cambiar por seguridad o actos oficiales.',
    },
    {
      activityId: 'act-1',
      title: 'Gran Muralla de Mutianyu',
      when: 'Ya se puede: la ventana es de 30 días y se abrió el 12 de septiembre',
      price: '~¥40 entrada + ~¥15 shuttle + ~¥140 telesilla y tobogán',
      how: 'Sistema oficial de Mutianyu o Trip.com, con pasaporte.',
      alert: 'Tratad los precios como aproximados: los remontes los opera otra empresa y las combinaciones cambian.',
      url: 'https://en.mutianyugreatwall.com/',
    },
  ],

  ranking: {
    must: ['Ciudad Prohibida', 'Jingshan', 'Tiananmen', 'Mutianyu', 'Templo del Cielo'],
    nice: ['Qianmen y Dashilan', 'Sanlitun', 'Pato pekinés', 'Liangma River si hay energía'],
    optional: ['Silk Street', 'Panjiayuan', 'Wangfujing', 'Templo de los Lamas', 'Torres del Tambor y la Campana', 'Rooftops'],
    skip: ['Palacio de Verano', '798', 'Shougang Park'],
  },
};

const xian: CityPlan = {
  cityId: 'xian',
  headline: 'Cada día, una Xi’an distinta: la Ming y Hui el 13, la Qin el 14 y la Tang el 15. Y por zonas, no por monumentos sueltos.',
  keyNotes: [
    'Xi’an no se organiza por monumentos, sino por tres zonas: casco histórico intramuros, Lintong (Guerreros) y la zona sur Tang-Pagoda-Museo. Así se evitan casi todos los desplazamientos absurdos.',
    'Museo de Historia de Shaanxi: entrada gratis pero con cupo de 12.000 plazas y ventana de 5 días. Para el jueves 15, alarma el 10 de octubre — las franjas se liberan a las 17:00 en China, o sea las 11:00 en España.',
    'Guerreros de Terracota: ventana de 7 días, o sea el 7 de octubre. Reserva nominal y con el pasaporte físico encima.',
    'Grand Tang Ever-Bright City no es un parque con entrada: es una avenida peatonal gratis. De día no tiene gracia — hay que ir entre las 19:00 y las 22:30.',
  ],
  base: [
    'Barrio Musulmán a 5-10 min andando, detrás de la Torre del Tambor',
    'Campanario y Torre del Tambor, en la puerta',
    'Puerta Sur de la muralla a 1-1,5 km',
    'Kaiyuan Mall (la foto del Campanario) al lado',
    'Gran Pagoda y zona Tang a 5-6 km al sur',
    'Guerreros de Terracota a ~40 km al este',
  ],

  days: [
    {
      id: 'xa-d1',
      dateText: 'Martes 13 de octubre',
      title: 'Centro histórico, muralla al atardecer y Barrio Musulmán',
      zone: 'Intramuros, todo a pie',
      blocks: [
        {
          time: '12:05',
          title: 'Llegada a Xi’an North',
          detail: 'Didi al hotel: en la habitación o dejando maletas sobre las 12:45-13:00.',
          kind: 'move',
          more: 'Dejad las maletas aunque la habitación no esté lista todavía: el check-in es a las 14:00 y no merece la pena esperar sentados.',
        },
        {
          time: 'Comida',
          title: 'Algo rápido cerca del hotel',
          detail: 'Nada pesado: el día de hoy es largo pero todo andando.',
          kind: 'food',
        },
        {
          time: 'Primera tarde',
          title: 'Shuyuanmen 书院门',
          detail: 'Calle de caligrafía junto a la Puerta Sur: pinceles, papel, tinta, abanicos y sellos.',
          kind: 'shop',
          more: 'Es el mejor sitio de Xi’an para un recuerdo de verdad: os pueden grabar vuestro nombre en un sello chino de piedra mientras esperáis. Gratis entrar, tiendas de 9:00 a 19:00 más o menos. Si os gusta la idea, encargadlo hoy.',
        },
        {
          time: '16:00-16:30',
          title: 'Subir a la muralla por Yongningmen 永宁门',
          detail: 'La Puerta Sur es el acceso que os queda mejor. ~54 CNY, sin reserva.',
          kind: 'visit',
          more: 'No hace falta dar los 14 km enteros: un tramo bueno en bici o andando y vuelta a Yongningmen. La gracia es encadenar luz de día → atardecer → primeras luces. El 13 de octubre el sol se pone poco después de las 18:00.',
        },
        {
          time: 'Blue hour',
          title: 'Foto del Campanario desde Kaiyuan Mall',
          detail: 'Entrad en 开元商城 y subid a la zona exterior de la 5ª planta.',
          kind: 'visit',
          more: 'No intentéis la foto desde la rotonda: el tráfico os tapa. Desde la quinta planta tenéis el Campanario de frente, y justo después del atardecer es cuando mejor está. Además os pilla al lado del hotel.',
        },
        {
          time: 'Noche',
          title: 'Torre del Tambor y Barrio Musulmán',
          detail: 'Entrad por la calle principal por el ambiente, pero luego tirad a Xiyangshi y Dapiyuan.',
          kind: 'food',
          more: 'Beiyuanmen (la calle famosa) merece la pena una vez por las luces y los puestos, pero para comer bien hay que meterse en las laterales. Cenad picando cinco cosas distintas en vez de sentaros a un solo sitio: es la gracia del barrio.',
        },
      ],
    },
    {
      id: 'xa-d2',
      dateText: 'Miércoles 14 de octubre',
      title: 'Centro por la mañana y Guerreros de Terracota por la tarde',
      zone: 'Intramuros y Lintong',
      blocks: [
        {
          time: 'Mañana',
          title: 'Campanario, Torre del Tambor y Gran Mezquita',
          detail: 'Si solo entráis a una torre, la del Tambor. El Campanario ya lo visteis iluminado anoche.',
          kind: 'visit',
          more: 'Torre del Tambor: ~30 CNY, o ~50 el combinado con el Campanario, horario aproximado de 8:30 a 18:00, con actuaciones de tambores durante el día. La Gran Mezquita (化觉巷清真大寺, ~25 CNY, sin reserva) está escondida en el Barrio Musulmán y es más interesante de lo que parece: mezquita islámica con arquitectura tradicional china. 45-60 min.',
        },
        {
          time: 'Comida',
          title: 'Comer pronto y cerca',
          detail: 'Nada pesado ni lejos: en un rato hay 40 km por delante.',
          kind: 'food',
        },
        {
          time: '12:15-12:30',
          title: 'Didi a los Guerreros',
          detail: 'Pedirlo a 秦始皇帝陵博物院（兵马俑）. 40-60 min, ~100-150 CNY el coche.',
          kind: 'move',
          more: 'Para dos personas y yendo por la tarde, el Didi compensa de largo. La alternativa barata es metro línea 9 hasta Huaqingchi (salida C) y bus 602 o 613, pero es ~1h30 desde el centro; y los buses turísticos desde Bell Tower concentran las salidas por la mañana, hasta las 14:00.',
        },
        {
          time: '~13:30',
          title: 'Guerreros de Terracota',
          detail: 'Llegar a esta hora es la jugada: el pico de grupos es de 10:00 a 14:30.',
          kind: 'ticket',
          alert: true,
          more: 'Orden recomendado, y va al revés que la mayoría: Foso 2 primero (pequeño, se entienden las unidades del ejército) → Foso 3 (el puesto de mando) → Foso 1 al final, que es el espectacular. Si entráis por el 1, todo lo demás parece menor. Entrada 120 CNY, incluye los fosos y el área de Lishan. En temporada alta se entra hasta las 17:00 y el recinto cierra sobre las 18:30.',
        },
        {
          time: 'Si da tiempo',
          title: 'Lishan Garden 丽山园',
          detail: 'Va incluido en la entrada. Se coge el shuttle.',
          kind: 'visit',
          more: 'Es la zona del mausoleo y otras excavaciones. El túmulo del emperador no está excavado ni se puede entrar. Si vais justos de tiempo, prioridad absoluta a los tres fosos.',
        },
        {
          time: '19:30-20:00',
          title: 'Vuelta al hotel en Didi',
          detail: 'Pedidlo a 西安钟楼森德酒店. 50-70 min según tráfico.',
          kind: 'move',
        },
        {
          time: 'Noche',
          title: 'Nada obligatorio',
          detail: 'Cena cerca del hotel y, si acaso, paseo corto por el Campanario iluminado.',
          kind: 'rest',
        },
      ],
    },
    {
      id: 'xa-d3',
      dateText: 'Jueves 15 de octubre',
      title: 'Museo de Shaanxi, Gran Pagoda y la Xi’an Tang de noche',
      zone: 'Sur de la ciudad, una sola zona',
      blocks: [
        {
          time: 'Mañana',
          title: 'Museo de Historia de Shaanxi',
          detail: 'Coged una de las primeras franjas. 2,5-3 h y sin intentar verlo todo.',
          kind: 'ticket',
          alert: true,
          more: 'Es gratis y complementa muchísimo a los Guerreros: ellos son el periodo Qin, y aquí recorréis Zhou → Qin → Han → Tang. En vuestras fechas tiene horario ampliado, de 8:30 a 19:00 hasta el 14 de noviembre. Lo difícil es la entrada: cupo de 12.000 plazas al día y ventana de 5 días.',
        },
        {
          time: 'Mediodía',
          title: 'Comer en Joy City 大悦城',
          detail: 'Está junto a la Pagoda. Opción concreta: Chang’an Da Pai Dang, cocina Shaanxi.',
          kind: 'food',
          more: 'Aquí es donde encaja el 毛笔酥, el dulce con forma de pincel de caligrafía. Divertido y muy fotogénico, aunque no es ninguna maravilla gastronómica. Puede formar bastante cola.',
        },
        {
          time: 'Tarde',
          title: 'Templo Da Ci’en y Gran Pagoda del Ganso Salvaje',
          detail: 'Entrada al templo ~10 CNY. Subir a la pagoda se paga aparte.',
          kind: 'visit',
          more: 'Subid solo si no hay una cola absurda. Conviene comprobar unos días antes si la reserva nominal sigue siendo necesaria.',
        },
        {
          time: 'Última tarde',
          title: 'Pausa en Joy City',
          detail: 'Compras y café. Así no encadenáis museo, templo y noche del tirón.',
          kind: 'shop',
        },
        {
          time: '~19:00',
          title: 'Fuente de la Plaza Norte',
          detail: 'Suele haber sesiones sobre las 19:00 y las 21:00, pero cambian: mirad el cartel del día.',
          kind: 'visit',
        },
        {
          time: '19:30-22:00',
          title: 'Grand Tang Ever-Bright City 大唐不夜城',
          detail: 'Rodead la pagoda hacia el sur, estatua de Xuanzang y a la avenida. 1,5-2 h.',
          kind: 'visit',
          more: 'Es gratis. Pasead, parad en los espectáculos que pillen de paso y mirad los hanfu, sin intentar perseguir todos los shows. Es una recreación moderna, sí, pero merece muchísimo la pena de noche.',
        },
        {
          time: 'Vuelta',
          title: 'Metro desde Dayanta 大雁塔',
          detail: 'Mejor metro que Didi: después de las 22:00 la zona se colapsa.',
          kind: 'move',
          more: 'Las líneas 3 y 4 conectan la zona y el metro funciona hasta las 23:00-23:30 según línea. Alrededor de 大唐不夜城 las colas de taxi a esa hora se ponen feas.',
        },
      ],
    },
    {
      id: 'xa-d4',
      dateText: 'Viernes 16 de octubre',
      title: 'Salida hacia Chengdu',
      zone: 'Xi’an North',
      blocks: [
        {
          time: 'Desayuno',
          title: 'Sin prisa',
          detail: 'El desayuno abre a las 07:00 y salís a las 08:00: cabe justo.',
          kind: 'rest',
        },
        {
          time: '08:00',
          title: 'Didi a Xi’an North',
          detail: 'No programaría nada más esta mañana.',
          kind: 'move',
          alert: true,
          more: 'Plan B si esa mañana hay tráfico: la línea 2 del metro conecta Zhonglou (钟楼, justo en el hotel) directamente con Xi’an North y se salta cualquier atasco. Con las maletas el Didi es más cómodo, pero el metro es una red de seguridad real.',
        },
        {
          time: '09:36',
          title: 'Tren G2201 a Chengdu',
          detail: 'Llegada a Chengdu East a las 13:12.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    {
      name: 'Guerreros de Terracota',
      nameZh: '秦始皇帝陵博物院 / 兵马俑',
      what: 'La visita número uno fuera del centro. Entrar en el Foso 1 y ver aparecer las filas completas.',
      zone: '~40 km al este',
      time: '3-5 h',
      ticket: 'Reserva imprescindible',
      priority: 'must',
      more: 'Entrada 120 CNY, incluye los fosos principales y el área de Lishan. Reserva nominal con el documento con el que se compró, y pasaporte físico en el acceso.',
    },
    {
      name: 'Muralla de Xi’an',
      nameZh: '西安城墙',
      what: '14 km de perímetro que se recorren andando o en bici. La pondría por delante del interior de las torres.',
      zone: 'Puerta Sur a 1-1,5 km',
      time: '1,5-3 h',
      ticket: '~54 CNY, sin reserva',
      priority: 'must',
      more: 'Lo ideal es subir a última hora de la tarde y quedarse hasta que anochezca. Yongningmen (永宁门), la Puerta Sur, es el mejor acceso desde el hotel.',
    },
    {
      name: 'Barrio Musulmán',
      nameZh: '回民街',
      what: 'Ambiente, luces y puestos. Está literalmente detrás de la Torre del Tambor.',
      zone: '5-10 min a pie',
      time: '2-3 h',
      ticket: 'Gratis',
      priority: 'must',
      more: 'Beiyuanmen es la parte más turística. Para comer mejor, meteos en Xiyangshi (西羊市), Dapiyuan (大皮院) y sobre todo Sajinqiao (洒金桥), que es bastante más local.',
    },
    {
      name: 'Gran Pagoda del Ganso Salvaje',
      nameZh: '大雁塔',
      what: 'Uno de los símbolos de la ciudad. Merece la pena por toda la secuencia de tarde-noche que genera.',
      zone: '5-6 km al sur',
      time: '1,5-2,5 h',
      ticket: '~10 CNY el templo',
      priority: 'must',
      more: 'Templo → pagoda → plaza → fuente → 大唐不夜城, todo encadenado. Subir a la pagoda se paga aparte y conviene comprobar si hace falta reserva nominal.',
    },
    {
      name: 'Grand Tang Ever-Bright City',
      nameZh: '大唐不夜城',
      what: 'Avenida peatonal enorme iluminada, arquitectura Tang, hanfu y pequeños espectáculos.',
      zone: 'Junto a la Pagoda',
      time: '1,5-2,5 h',
      ticket: 'Gratis',
      priority: 'must',
      more: 'El nombre engaña: no es un parque temático con entrada. Y NO vayáis de día, no tiene ninguna gracia: la franja buena es de 19:00 a 22:30.',
    },
    {
      name: 'Museo de Historia de Shaanxi',
      nameZh: '陕西历史博物馆',
      what: 'Una de las grandes colecciones históricas de China, y gratis. Complementa muchísimo a los Guerreros.',
      zone: 'Sur, zona Xiaozhai',
      time: '2,5-3 h',
      ticket: 'Gratis, pero con reserva',
      priority: 'nice',
      more: 'Casi imprescindible. Horario ampliado de 8:30 a 19:00 hasta el 14 de noviembre. El problema es la entrada: cupo de 12.000 plazas al día y ventana de 5 días.',
    },
    {
      name: 'Torre del Tambor',
      nameZh: '西安鼓楼',
      what: 'De las dos torres centrales, si solo entráis a una, esta. Vistas sobre el Barrio Musulmán.',
      zone: 'En la puerta del hotel',
      time: '45-60 min',
      ticket: '~30 CNY, ~50 con el Campanario',
      priority: 'nice',
    },
    {
      name: 'Gran Mezquita',
      nameZh: '化觉巷清真大寺',
      what: 'Mezquita islámica con arquitectura tradicional china. Más interesante de lo que aparenta.',
      zone: 'Dentro del Barrio Musulmán',
      time: '45-60 min',
      ticket: '~25 CNY, sin reserva',
      priority: 'nice',
    },
    {
      name: 'Shuyuanmen',
      nameZh: '书院门',
      what: 'Calle de caligrafía: pinceles, papel, tinta, abanicos, grabados y sellos.',
      zone: 'Junto a la Puerta Sur',
      time: '45-60 min',
      ticket: 'Gratis',
      priority: 'nice',
      more: 'Encaja justo antes de subir a la muralla. Tiendas de 9:00 a 19:00 aproximadamente.',
    },
    {
      name: 'Bosque de Estelas',
      nameZh: '西安碑林博物馆',
      what: 'Muy importante históricamente, pero para disfrutarlo hay que tener interés por la caligrafía.',
      zone: 'Intramuros, sur',
      time: '1,5-2 h',
      ticket: 'Con entrada',
      priority: 'optional',
    },
    {
      name: 'Tang Paradise',
      nameZh: '大唐芙蓉园',
      what: 'Bonito de noche, pero es una recreación moderna y cuesta ~120 CNY.',
      zone: 'Sur, junto a la Pagoda',
      time: '2-4 h',
      ticket: '~120 CNY',
      priority: 'optional',
      more: 'Con solo dos días reales en la ciudad, prefiero que esa noche se la lleve Grand Tang Ever-Bright City, que es gratis y encaja mejor con la Pagoda.',
    },
  ],

  restaurants: [
    {
      name: 'Tong Sheng Xiang',
      nameZh: '同盛祥',
      what: 'Fundado en 1920 y especializado en yangrou paomo. Pedid 羊肉泡馍.',
      price: '25-45 CNY el paomo',
      when: 'Está cerca del Campanario: comodísimo para nosotros',
      priority: 'must',
    },
    {
      name: 'Chang’an Da Pai Dang',
      nameZh: '长安大牌档',
      what: 'Cocina Shaanxi en ambientación Tang. Es donde está el famoso 毛笔酥.',
      when: 'El día de la Pagoda, en la sucursal de Joy City',
      priority: 'must',
      more: 'Merece la pena por el conjunto de experiencia y comida, no solo por el postre. Puede formar bastante cola: si queréis una hora concreta, mejor reservar o ir fuera del pico.',
    },
    {
      name: 'Jia San',
      nameZh: '贾三灌汤包',
      what: 'Clásico del Barrio Musulmán. Dumplings de sopa de ternera y cordero.',
      when: 'Mientras recorréis el barrio, sin desviar la ruta',
      priority: 'nice',
    },
  ],

  markets: [
    {
      name: 'Muslim Quarter',
      nameZh: '回民街',
      what: 'Turístico, pero imprescindible una vez. Mejor de noche.',
      when: 'Martes 13 por la noche',
      priority: 'must',
    },
    {
      name: 'Xiyangshi',
      nameZh: '西羊市',
      what: 'Mucho mejor para comer que la calle principal.',
      priority: 'must',
    },
    {
      name: 'Dapiyuan',
      nameZh: '大皮院',
      what: 'Otra de las calles donde ya empiezan a aparecer más locales.',
      priority: 'nice',
    },
    {
      name: 'Sajinqiao',
      nameZh: '洒金桥',
      what: 'La favorita si queréis algo bastante más auténtico.',
      when: 'De mañana para hulatang y zenggao; de noche para paomo y brochetas',
      priority: 'nice',
    },
    {
      name: 'Yongxingfang',
      nameZh: '永兴坊',
      what: 'Zona gastronómica que reúne especialidades de toda la provincia. Turística, pero bien hecha.',
      priority: 'optional',
      more: 'Aquí está el famoso 摔碗酒, el "vino de romper el cuenco": bebes y estrellas el cuenco contra el suelo. Viral y totalmente prescindible — no lo metería en la ruta salvo que sobre tiempo.',
    },
  ],

  food: [
    { name: '肉夹馍', pinyin: 'Roujiamo', what: 'Pan crujiente relleno de carne. En el Barrio Musulmán, de ternera o cordero; fuera, de cerdo.', kind: 'salado' },
    { name: '羊肉泡馍', pinyin: 'Yangrou paomo', what: 'De los platos más representativos: os dan un pan, lo rompéis vosotros en trocitos y en cocina lo convierten en sopa de cordero.', kind: 'salado' },
    { name: 'Biangbiang面', pinyin: 'Biangbiang mian', what: 'Fideos gigantes, planos y muy anchos, con chile y vinagre.', kind: 'salado' },
    { name: '凉皮', pinyin: 'Liangpi', what: 'Fideos fríos con vinagre, chile y verduras. Perfectos para acompañar.', kind: 'salado' },
    { name: '灌汤包', pinyin: 'Guantang baozi', what: 'Dumplings rellenos de carne y caldo. Los de Jia San son los famosos.', kind: 'salado' },
    { name: '羊肉串', pinyin: 'Yangrou chuan', what: 'Brochetas de cordero con comino y chile. Ideales de noche.', kind: 'salado' },
    { name: '肉丸胡辣汤', pinyin: 'Hulatang', what: 'Sopa especiada con albóndigas de ternera. Más de desayuno.', kind: 'salado' },
    { name: '柿子饼', pinyin: 'Shizibing', what: 'Tortita frita de caqui. Viajáis en octubre, justo en temporada.', kind: 'dulce' },
    { name: '甑糕', pinyin: 'Zenggao', what: 'Arroz glutinoso al vapor con dátiles y azufaifas. Muy popular para desayunar.', kind: 'dulce' },
    { name: '石榴汁', pinyin: 'Zumo de granada', what: 'Lintong, la zona de los Guerreros, es famosa por sus granadas.', kind: 'dulce' },
    { name: '酸梅汤', pinyin: 'Suanmeitang', what: 'Bebida dulce y ácida de ciruela ahumada. Perfecta con comida especiada.', kind: 'dulce' },
    { name: '毛笔酥', pinyin: 'Maobisu', what: 'El pastel con forma de pincel de caligrafía. Muy fotogénico, en Chang’an Da Pai Dang.', kind: 'dulce' },
  ],

  photoSpots: [
    {
      name: 'Campanario desde Kaiyuan Mall',
      nameZh: '开元商城',
      how: 'No lo intentéis desde la rotonda. Entrad en el centro comercial, al sureste del Campanario, y subid a la zona exterior de la 5ª planta: lo tenéis de frente y sin tráfico delante.',
      when: 'Blue hour, justo después del atardecer',
    },
    {
      name: 'Muralla desde Yongningmen',
      how: 'Subid con luz y quedaos: sol bajo → blue hour → puertas iluminadas. Probablemente la mejor secuencia del viaje en Xi’an.',
      when: 'Martes 13, desde las 16:00-16:30',
    },
    {
      name: 'Gran Pagoda desde la estatua de Xuanzang',
      nameZh: '大雁塔南广场',
      how: 'En la plaza sur, con la estatua delante y la pagoda alineada detrás. Es la composición más reconocible de la ciudad.',
    },
    {
      name: 'Pagoda con la fuente',
      how: 'Desde el extremo norte de la plaza de la fuente, mirando al sur.',
      when: 'De noche es mucho mejor',
    },
    {
      name: 'Grand Tang Ever-Bright City',
      how: 'Aquí no busquéis un punto único: la gracia es pagoda, estatuas, arquitectura iluminada y gente vestida de hanfu.',
    },
    {
      name: 'Muro de caracteres 长安',
      nameZh: '顺城巷',
      how: 'En Shuncheng Alley, cerca de la muralla, hay uno de los muros con los caracteres grandes que salen en redes.',
      when: 'Si os pilla de paso. No cruzaría la ciudad por ello',
    },
  ],

  shopping: [
    {
      name: 'Shuyuanmen',
      nameZh: '书院门',
      what: 'El mejor sitio de Xi’an para un recuerdo especial.',
      when: 'Martes 13, antes de la muralla',
      priority: 'must',
      more: 'Mi elección: un sello personal grabado con vuestro nombre y una cajita de tinta. Mucho más memorable que un souvenir normal. También pinceles, papel y productos culturales.',
    },
    {
      name: 'Joy City',
      nameZh: '西安大悦城',
      what: 'Moda, lifestyle, restauración y cosmética. Junto a la Gran Pagoda.',
      when: 'Jueves 15, conecta con el día de la zona Tang',
      priority: 'nice',
    },
    {
      name: 'SKP Xi’an',
      nameZh: '西安SKP',
      what: 'Lujo, cosmética y marcas internacionales. Frente a la Puerta Sur.',
      priority: 'optional',
      more: 'No iría expresamente, pero os queda literalmente al terminar la muralla.',
    },
    {
      name: 'Saige International',
      nameZh: '赛格国际购物中心',
      what: 'El gran mall chino: electrónica, móviles, moda y la enorme escalera mecánica interior.',
      when: 'En Xiaozhai, cerca del Museo de Shaanxi',
      priority: 'optional',
    },
  ],

  trends: [
    { name: 'Grand Tang Ever-Bright City de noche', verdict: 'si', why: 'Es una recreación moderna, pero merece muchísimo la pena y encima es gratis.' },
    { name: 'Foto del Campanario desde Kaiyuan Mall', verdict: 'si', why: 'El mejor dato fotográfico de la ciudad, y os pilla al lado del hotel.' },
    { name: 'Vestirse de hanfu en la zona de la Pagoda', verdict: 'si', why: 'Si os hace gracia hacer fotos, ahí es donde tiene sentido.' },
    { name: 'Rooftop y fotos 长安 de Shuyuanmen', verdict: 'si', why: 'Wanfeng Coffee (万风咖啡) sale mucho en 2026 y Shuyuanmen ya está en la ruta.' },
    { name: 'Chang’an Da Pai Dang', verdict: 'si', why: 'Por el conjunto de experiencia y comida, más que solo por el postre viral.' },
    { name: '毛笔酥, el pastel-pincel', verdict: 'quizas', why: 'Divertido y fotogénico, pero no es ninguna maravilla gastronómica.' },
    { name: 'Alquilar hanfu horas para recorrer localizaciones', verdict: 'quizas', why: 'Entre vestuario y sesión se va media tarde. Con dos días reales, no compensa.' },
    { name: 'Ir buscando diez paredes de 长安 distintas', verdict: 'quizas', why: 'Si una os pilla de paso, bien. Cruzar la ciudad por ellas, no.' },
    { name: '摔碗酒, romper el cuenco en Yongxingfang', verdict: 'no', why: 'Viral y totalmente prescindible. Solo si os sobra tiempo.' },
  ],

  bookings: [
    {
      activityId: 'act-5',
      title: 'Guerreros de Terracota',
      when: '7 de octubre (ventana de 7 días)',
      price: '120 CNY por persona (~16 €)',
      how: 'Trip.com, que no exige teléfono chino. Reserva nominal con el documento de la compra.',
      alert: 'Pasaporte físico encima: se entra escaneándolo y no hay taquilla desde 2023.',
    },
    {
      activityId: 'act-11',
      title: 'Museo de Historia de Shaanxi',
      when: '10 de octubre, 11:00 hora española (las franjas se liberan a las 17:00 en China)',
      price: 'Gratis, pero con reserva obligatoria',
      how: 'Web oficial del museo. Entrada vinculada al documento, cupo de 12.000 plazas al día.',
      alert: 'Ventana de solo 5 días y se agota. Poned alarma: es la reserva nueva que no estaba en el plan.',
      url: 'https://en.sxhm.com/en/new/visit.html',
    },
    {
      title: 'Gran Pagoda del Ganso Salvaje',
      when: 'Comprobar unos días antes',
      price: '~10 CNY el templo; subir a la pagoda aparte',
      how: 'Reserva nominal recomendada. Confirmad si sigue siendo obligatoria para vuestra fecha.',
    },
  ],

  ranking: {
    must: ['Guerreros de Terracota', 'Muralla al atardecer', 'Barrio Musulmán', 'Gran Pagoda', 'Grand Tang Ever-Bright City'],
    nice: ['Museo de Historia de Shaanxi', 'Torre del Tambor', 'Gran Mezquita', 'Shuyuanmen'],
    optional: ['Bosque de Estelas', 'Tang Paradise', 'Yongxingfang', 'Saige', 'SKP'],
    skip: ['Romper el cuenco en Yongxingfang'],
  },
};

/** Planning por ciudad. Se va llenando a medida que se cierra cada una. */
export const cityPlans: Record<string, CityPlan> = {
  beijing,
  xian,
};

export function getCityPlan(cityId?: string): CityPlan | undefined {
  return cityId ? cityPlans[cityId] : undefined;
}
