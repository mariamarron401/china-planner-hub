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

/** Planning por ciudad. Se va llenando a medida que se cierra cada una. */
export const cityPlans: Record<string, CityPlan> = {
  beijing,
};

export function getCityPlan(cityId?: string): CityPlan | undefined {
  return cityId ? cityPlans[cityId] : undefined;
}
