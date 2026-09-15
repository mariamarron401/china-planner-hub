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

const chengdu: CityPlan = {
  cityId: 'chengdu',
  headline: 'Pandas, vida local, gastronomía y Leshan. No es una ciudad de encadenar monumentos: aquí se viene a estar.',
  keyNotes: [
    '🆕 El crucero de Leshan YA se compra online (miniprograma 大佛旅游 en WeChat o Alipay), 70 CNY. Teníamos apuntado que solo se pagaba en el muelle y ha dejado de ser cierto.',
    '🆕 Muelle nuevo desde julio de 2026: se sale de 嘉州渡码头 (Jiazhoudu) y se desembarca en 八仙渡码头 (Baxian-du). Reconfirmad el muelle operativo 48-24 h antes: los barcos se suspenden por nivel del agua o meteorología.',
    '🔲 Los trenes Chengdu ↔ Leshan del 18 NO están comprados. Son aparte de los 7 tramos entre ciudades. Se venden con 15 días, o sea sobre el 3-4 de octubre.',
    'Pandas: salid del hotel a las 06:50-07:00, no a las 07:15. La puerta abre a las 07:30 y las primeras horas son las buenas.',
  ],
  base: [
    'Anshun Bridge y el río a 5-10 min',
    'Taikoo Li y Daci Temple a 10-15 min',
    'Chunxi Road e IFS a 10-15 min',
    'Wuhou y Jinli a 15-20 min',
    'People’s Park a 15-20 min',
    'Kuanzhai a ~20 min · Panda Base a 30-40 min',
  ],

  days: [
    {
      id: 'cd-d1',
      dateText: 'Viernes 16 de octubre',
      title: 'Llegada, Chengdu moderno y noche junto al río',
      zone: 'Taikoo Li, Chunxi y Jinjiang',
      blocks: [
        {
          time: '13:12',
          title: 'Llegada a Chengdu East',
          detail: 'Didi al hotel, ~13:45. Check-in a las 14:00.',
          kind: 'move',
        },
        {
          time: '15:00-15:30',
          title: 'Salir sin prisas',
          detail: 'Un rato para instalarse. Hoy no hay que cruzar Chengdu: todo queda en línea.',
          kind: 'rest',
        },
        {
          time: 'Tarde',
          title: 'Daci Temple y Taikoo Li',
          detail: 'El mejor primer contacto con la ciudad: templo histórico metido entre arquitectura contemporánea.',
          kind: 'visit',
          more: 'Para mí es la zona comercial más bonita de Chengdu, y la gracia no es comprar: es cómo se mezclan las casas bajas, los patios, el templo y las flagships.',
        },
        {
          time: 'Tarde',
          title: 'IFS y Chunxi Road',
          detail: 'El panda de la fachada desde la calle, y luego la terraza para verle la cara.',
          kind: 'shop',
          more: 'Son dos fotos distintas: desde abajo se ve la espalda del panda escalando, y subiendo a la terraza aparece la cabeza asomando por la cubierta. Las dos merecen la pena. Después, paseo por Chunxi.',
        },
        {
          time: 'Cena',
          title: 'Hotpot o cocina de Sichuan',
          detail: 'Hotpot cerca de Chunxi, o una cena clásica sichuanesa en el distrito de Jinjiang.',
          kind: 'food',
          more: 'Si os lanzáis al hotpot, pedid 鸳鸯锅 (yuānyāng guō), la olla dividida con una mitad picante y otra suave, salvo que toleréis muy bien el picante. Calculad 80-150 CNY por persona y contad con cola en viernes o sábado.',
        },
        {
          time: 'Noche',
          title: 'Anshun Bridge 安顺廊桥',
          detail: 'La imagen nocturna clásica de Chengdu. Paseo por el Jinjiang y vuelta al hotel.',
          kind: 'visit',
          more: 'De día no vale la pena venir expresamente. Y la foto buena no es encima del puente: es desde la ribera de enfrente, para meter el puente entero, su iluminación dorada y el reflejo en el río.',
        },
      ],
    },
    {
      id: 'cd-d2',
      dateText: 'Sábado 17 de octubre',
      title: 'Pandas por la mañana y Chengdu tradicional por la tarde',
      zone: 'Panda Base y centro-oeste',
      blocks: [
        {
          time: '06:50-07:00',
          title: 'Salir del hotel',
          detail: 'Didi a 成都大熊猫繁育研究基地. 30-40 min a esa hora.',
          kind: 'move',
          alert: true,
          more: 'No salgáis a las 07:15 si queréis pillar a los pandas activos. La dirección oficial es 四川省成都市成华区熊猫大道1375号. El desayuno del hotel abre a las 07:30, así que hay que pedirlo para llevar la noche antes.',
        },
        {
          time: '07:30-11:30',
          title: 'Base de Pandas',
          detail: 'Franja de mañana. Pagad el bus interno (30 CNY): el complejo es mucho mayor de lo que parece.',
          kind: 'ticket',
          alert: true,
          more: 'Orden: nada más entrar, a los recintos exteriores de pandas gigantes — cuando sube la temperatura muchos se meten dentro o se quedan quietos. Después los pandas rojos y, si queda tiempo, las zonas de crías y juveniles. La Panda Tower (09:00-17:00, con reserva gratuita aparte) es opcional: yo no sacrificaría tiempo de pandas por subir. Llevad zoom óptico si el móvil lo tiene, batería y algo para limpiar la lente.',
        },
        {
          time: '11:00-11:30',
          title: 'Salir de la base',
          detail: 'No esperéis a las 12:00: a esa hora se llena y ya habréis visto lo esencial.',
          kind: 'move',
        },
        {
          time: 'Comida',
          title: 'Comer volviendo al centro',
          detail: 'Sin encadenar cinco visitas detrás de los pandas.',
          kind: 'food',
        },
        {
          time: 'Tarde',
          title: 'People’s Park y una casa de té',
          detail: 'Heming Teahouse 鹤鸣茶社 o cualquier terraza del parque. Aquí no hay que "hacer" nada.',
          kind: 'rest',
          more: 'La experiencia es exactamente esa: gente jugando al mahjong, cartas, familias, conversaciones. Es de las cosas que más diferencian Chengdu de cualquier otra ciudad china.',
        },
        {
          time: 'Tarde',
          title: 'Kuanzhai Alley 宽窄巷子',
          detail: 'Las tres callejuelas (宽, 窄, 井). No le dedicaría más de 1-1,5 h.',
          kind: 'visit',
          more: 'Alternativa si os tira mucho la historia: cambiad Kuanzhai por Wuhou Shrine y Jinli. Wuhou merece más la pena culturalmente; Jinli, visualmente. Lo que NO haría es intentar meter pandas + Wuhou + Jinli + People’s Park + Kuanzhai + Chunxi en un día: eso es justo el viaje que queréis evitar.',
        },
        {
          time: 'Cena',
          title: 'Kuixinglou Street 奎星楼街',
          detail: 'Aquí sí cenaría. Está al lado de Kuanzhai y se come mucho mejor.',
          kind: 'food',
          more: 'Boboji, chuanchuan, noodles, tianshuimian, snacks y pequeñas tabernas, con mucho ambiente joven y local. Las tres zonas de la tarde están cerca entre sí, así que el día encaja sin dar vueltas.',
        },
      ],
    },
    {
      id: 'cd-d3',
      dateText: 'Domingo 18 de octubre',
      title: 'Buda Gigante de Leshan',
      zone: 'Leshan, día completo',
      blocks: [
        {
          time: 'Mañana',
          title: 'Didi a Chengdu East',
          detail: '20-30 min, más el margen de acceso a la estación.',
          kind: 'move',
          more: 'No me complicaría con metro a primera hora. En la estación hay control con pasaporte, seguridad y buscar la sala de embarque.',
        },
        {
          time: '~1 h de tren',
          title: 'Chengdu East → Leshan',
          detail: 'Tren rápido, 50-70 min según el servicio. 🔲 Todavía por comprar.',
          kind: 'move',
          alert: true,
          more: 'Estos dos trenes (ida y vuelta) no están entre los 7 comprados: son aparte. La venta de 12306 abre 15 días antes, o sea sobre el 3-4 de octubre. Al elegir el de vuelta, coged uno que os deje en Chengdu entre las 18:00 y las 20:00, no uno pegado al cierre.',
        },
        {
          time: '~09:00-09:30',
          title: 'Didi de la estación al muelle',
          detail: '~10 km, 20 min, ~30-35 CNY.',
          kind: 'move',
          more: 'No pidáis simplemente "Leshan Giant Buddha": comprobad antes qué muelle figura en vuestra reserva. Desde julio de 2026 la ruta es 嘉州渡码头 (Jiazhoudu) → el Buda → 八仙渡码头 (Baxian-du).',
        },
        {
          time: '10:00-11:30',
          title: 'Crucero frente al Buda',
          detail: '70 CNY. Es la opción recomendada: vista frontal completa y sin escaleras.',
          kind: 'ticket',
          alert: true,
          more: 'El Buda mide 71 metros y desde tierra es prácticamente imposible verlo entero de una vez: por eso el barco gana. Buscad sitio en la parte exterior, con visión frontal o lateral. La alternativa terrestre son 80 CNY, permite ver la cabeza desde arriba y los templos, pero la escalera de bajada puede tener 2-4 h de cola un domingo. Horario de invierno: barco 08:00-17:00, recinto 08:00-17:30.',
        },
        {
          time: 'Comida',
          title: 'Comer en el centro de Leshan',
          detail: 'Leshan es destino gastronómico por derecho propio. No os vayáis justo después del Buda.',
          kind: 'food',
          more: 'Lo que buscaría: 跷脚牛肉 (qiaojiao niurou), carne y vísceras de ternera en caldo aromático, que es el plato emblemático de la ciudad. Y además 甜皮鸭 (pato de piel dulce), 钵钵鸡, el 豆腐脑 de Leshan y 冰粉 de postre.',
        },
        {
          time: '18:00-20:00',
          title: 'Vuelta a Chengdu',
          detail: 'Didi a la estación de Leshan, tren y Didi al hotel.',
          kind: 'move',
        },
        {
          time: 'Noche',
          title: 'Nada importante',
          detail: 'Si volvéis pronto, cena cerca del hotel y paseo corto por el río.',
          kind: 'rest',
        },
      ],
    },
    {
      id: 'cd-d4',
      dateText: 'Lunes 19 de octubre',
      title: 'Salida hacia Chongqing',
      zone: 'Chengdu East',
      blocks: [
        {
          time: 'Desayuno',
          title: 'No contéis con el del hotel',
          detail: 'Abre a las 07:30 y salís a las 07:45: son 18 minutos.',
          kind: 'rest',
          alert: true,
          more: 'La noche antes comprad bebida, fruta, algo de pan o bollo, yogur y algún snack para el tren. Así no empezáis el día mirando el reloj. Es el tercer día seguido que este hotel complica el desayuno.',
        },
        {
          time: '07:45',
          title: 'Didi a Chengdu East',
          detail: '~9 km, 20-30 min.',
          kind: 'move',
          alert: true,
        },
        {
          time: '09:18',
          title: 'Tren G8685 a Chongqing',
          detail: 'Llegada a Chongqing North a las 10:59.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    {
      name: 'Base de Pandas',
      nameZh: '成都大熊猫繁育研究基地',
      what: 'La visita emblemática de Chengdu. Gran complejo de conservación y cría.',
      zone: '30-40 min en Didi',
      time: '3-4 h',
      ticket: 'Reserva imprescindible',
      priority: 'must',
      more: 'Entrada 55 CNY, bus interno 30 CNY. Franja de mañana 07:30-12:00 en octubre. Reserva nominal con 14 días de antelación y pasaporte de la compra.',
    },
    {
      name: 'Taikoo Li y Daci Temple',
      nameZh: '成都太古里 · 大慈寺',
      what: 'Mezcla espectacular de arquitectura contemporánea, tiendas y templo histórico.',
      zone: '10-15 min',
      time: '1,5-2 h',
      ticket: 'No',
      priority: 'must',
    },
    {
      name: 'Chengdu IFS',
      nameZh: '成都IFS',
      what: 'El panda gigante escalando la fachada, "I AM HERE". Icono moderno de la ciudad.',
      zone: 'Junto a Taikoo Li',
      time: '45-90 min',
      ticket: 'No',
      priority: 'must',
    },
    {
      name: 'People’s Park',
      nameZh: '人民公园',
      what: 'La mejor forma de ver la vida cotidiana de Chengdu: té, mahjong, familias, jardines.',
      zone: '15-20 min',
      time: '1,5-2 h',
      ticket: 'No',
      priority: 'must',
    },
    {
      name: 'Anshun Bridge',
      nameZh: '安顺廊桥',
      what: 'La imagen nocturna clásica sobre el Jinjiang. Solo de noche.',
      zone: 'Muy cerca del hotel',
      time: '30-60 min',
      ticket: 'No',
      priority: 'must',
    },
    {
      name: 'Buda Gigante de Leshan',
      nameZh: '乐山大佛',
      what: '71 metros excavados en la roca. Día completo desde Chengdu, mejor en barco.',
      zone: '~1 h en tren',
      time: 'Día completo',
      ticket: 'Entrada y barco',
      priority: 'must',
    },
    {
      name: 'Kuanzhai Alley',
      nameZh: '宽窄巷子',
      what: 'Tres callejuelas históricas rehabilitadas. Bonitas, aunque bastante turísticas.',
      zone: '~20 min',
      time: '1-1,5 h',
      ticket: 'No',
      priority: 'nice',
    },
    {
      name: 'Wuhou Shrine',
      nameZh: '武侯祠',
      what: 'El principal lugar de Chengdu ligado al periodo de los Tres Reinos.',
      zone: '15-20 min',
      time: '1,5-2 h',
      ticket: '50 CNY, reserva recomendable',
      priority: 'nice',
      more: 'Venta nominal que admite pasaporte, con hasta 14 días de antelación. Los horarios han tenido ampliaciones estacionales: comprobadlo la semana del viaje. Sube a imprescindible si os interesa la historia.',
    },
    {
      name: 'Jinli',
      nameZh: '锦里古街',
      what: 'Calle tradicional iluminada junto a Wuhou. Muy fotogénica y muy turística.',
      zone: 'Junto a Wuhou',
      time: '45-90 min',
      ticket: 'No',
      priority: 'nice',
    },
    {
      name: 'Eastern Suburb Memory',
      nameZh: '东郊记忆',
      what: 'Antigua zona industrial convertida en distrito creativo. Muy fotogénica.',
      zone: 'Al este, lejos',
      time: '2-3 h',
      ticket: 'No',
      priority: 'skip',
      more: 'Queda hacia el este y vais justos de tiempo. Junto con Wenshu, Du Fu Cottage, Jinsha, el Museo de Chengdu, Yulin y SKP, es de lo que dejaría fuera sin remordimiento.',
    },
  ],

  restaurants: [
    {
      name: 'Hotpot de Sichuan',
      nameZh: '四川火锅',
      what: 'La experiencia gastronómica fundamental: caldo de grasa de vaca, chile y pimienta de Sichuan.',
      price: '80-150 CNY por persona',
      when: 'Viernes 16 por la noche, cerca de Chunxi',
      priority: 'must',
      more: 'Pedid 鸳鸯锅 (olla dividida) salvo que aguantéis muy bien el picante. Qué echar: 毛肚 (callos de ternera, lo más típico), 黄喉 (aorta, crujiente), 肥牛 (ternera laminada), 虾滑 (pasta de gamba), 莴笋 (tallo de lechuga), tofu y setas. Contad con cola viernes y sábado.',
    },
    {
      name: 'Long Chaoshou',
      nameZh: '龙抄手（春熙路总店）',
      what: 'Los wontons de Chengdu, en caldo o en aceite picante. El clásico de Chunxi Road.',
      when: 'Encaja perfecto el primer día',
      priority: 'must',
    },
    {
      name: 'Chenmapo',
      nameZh: '陈麻婆豆腐',
      what: 'La casa histórica del mapo tofu, desde el siglo XIX. Aquí no pidáis una versión suavizada.',
      priority: 'nice',
      more: 'Su local de Qinghua Road encaja sobre todo si fuerais a Du Fu Cottage, que no es el caso. No cruzaría Chengdu solo por comer allí: el mapo tofu bueno se encuentra en muchos sitios.',
    },
  ],

  markets: [
    {
      name: 'Kuixinglou Street',
      nameZh: '奎星楼街',
      what: 'Boboji, chuanchuan, noodles, tianshuimian y tabernas pequeñas. Ambiente joven y local.',
      when: 'Sábado por la noche, después de Kuanzhai',
      priority: 'must',
      more: 'Está muy cerca de Kuanzhai y se come bastante mejor que allí.',
    },
    {
      name: 'Jinli',
      nameZh: '锦里',
      what: 'Visualmente estupendo con los faroles encendidos, pero pensado para visitantes.',
      priority: 'nice',
      more: 'Para pasear y picar una cosa, sí. Para la comida importante del viaje, no: precios turísticos y puestos orientados al visitante.',
    },
    {
      name: 'Tangba Street',
      nameZh: '镗钯街',
      what: 'Tiendas pequeñas, cafés, grafitis y paseo junto al Jinjiang. Al sureste de Taikoo.',
      priority: 'nice',
      more: 'Encaja bastante mejor con vuestro hotel que Yulin, el barrio de bares y cafeterías que sale en todas las listas pero que queda lejos para el tiempo que tenéis.',
    },
    {
      name: 'Hehuachi',
      nameZh: '荷花池',
      what: 'Gran mercado mayorista de ropa y accesorios, hacia el norte.',
      priority: 'optional',
      more: 'Solo si queréis específicamente compras de mercado: perderíais bastante tiempo en ir y volver. Lo mismo vale para Songxianqiao (送仙桥), el mercado de arte y antigüedades.',
    },
  ],

  food: [
    { name: '四川火锅', pinyin: 'Hotpot de Sichuan', what: 'La experiencia fundamental. Olla dividida (鸳鸯锅) si no coméis muy picante.', kind: 'salado' },
    { name: '麻婆豆腐', pinyin: 'Mapo tofu', what: 'Tofu sedoso con carne, doubanjiang, chile y pimienta de Sichuan.', kind: 'salado' },
    { name: '龙抄手', pinyin: 'Long chaoshou', what: 'Wontons de Chengdu, en caldo o en aceite picante.', kind: 'salado' },
    { name: '钟水饺', pinyin: 'Zhong shuijiao', what: 'Dumplings bañados en una salsa dulce, picante y aromática.', kind: 'salado' },
    { name: '担担面', pinyin: 'Dandan mian', what: 'Fideos con carne picada, chile, aceite, sésamo y pimienta de Sichuan.', kind: 'salado' },
    { name: '甜水面', pinyin: 'Tianshui mian', what: 'Fideos gruesos, algo dulces, picantes y muy masticables. Muy particulares.', kind: 'salado' },
    { name: '钵钵鸡', pinyin: 'Boboji', what: 'Brochetas frías en caldo aromático con chile y sésamo. Hay decenas de ingredientes.', kind: 'salado' },
    { name: '串串香', pinyin: 'Chuanchuanxiang', what: 'Brochetas cocinadas en caldo tipo hotpot. Informal y perfecto para picar.', kind: 'salado' },
    { name: '锅盔', pinyin: 'Guokui', what: 'Pan plano crujiente relleno. Street food puro.', kind: 'salado' },
    { name: '兔头', pinyin: 'Tutou — cabeza de conejo', what: 'Muy típica de Chengdu. Experiencia local curiosa, no obligatoria.', kind: 'salado' },
    { name: '跷脚牛肉', pinyin: 'Qiaojiao niurou', what: 'El plato emblemático de Leshan: ternera y vísceras en caldo aromático.', kind: 'salado' },
    { name: '赖汤圆', pinyin: 'Lai tangyuan', what: 'Bolas de arroz glutinoso rellenas de sésamo negro. Hay local histórico junto a Chunxi.', kind: 'dulce' },
    { name: '红糖糍粑', pinyin: 'Hongtang ciba', what: 'Arroz glutinoso blandito con azúcar moreno. El postre típico tras el hotpot.', kind: 'dulce' },
    { name: '冰粉', pinyin: 'Bingfen', what: 'Gelatina ligera con azúcar moreno, frutos secos y pasas. Después del picante, gloria.', kind: 'dulce' },
    { name: '蛋烘糕', pinyin: 'Danhonggao', what: 'Mini pancake esponjoso relleno, dulce o salado. Mejor en la calle que en restaurante.', kind: 'dulce' },
    { name: '甜皮鸭', pinyin: 'Tianpi ya', what: 'Pato de piel dulce, típico de Leshan.', kind: 'dulce' },
  ],

  photoSpots: [
    {
      name: 'Panda de IFS, desde la calle',
      nameZh: '成都IFS',
      how: 'Enfrente del centro comercial, buscando la fachada donde se ve la espalda del panda subiendo.',
    },
    {
      name: 'Panda de IFS, la cara',
      how: 'Subid a la terraza de IFS: desde arriba aparece la cabeza asomándose por la cubierta. Es otra foto distinta de la anterior.',
    },
    {
      name: 'Daci Temple con los rascacielos',
      nameZh: '大慈寺',
      how: 'Buscad un encuadre con los tejados tradicionales abajo y las torres de Taikoo e IFS detrás. Es la imagen que mejor explica Chengdu.',
    },
    {
      name: 'Anshun Bridge',
      nameZh: '安顺廊桥',
      how: 'Desde la ribera opuesta, no desde encima del puente: así entra el puente entero, su luz dorada y el reflejo en el río.',
      when: 'Después de que oscurezca',
    },
    {
      name: 'Muro rojo de Wuhou',
      nameZh: '武侯祠',
      how: 'El corredor rojo entre bambúes, en el pasillo sinuoso cercano a Huiling. Solo si acabáis metiendo Wuhou.',
    },
    {
      name: 'Buda de Leshan desde el barco',
      how: 'Sitio exterior, con visión frontal o lateral. Cuando el barco se planta delante se ve cabeza, cuerpo, pies y la pared de roca de una vez.',
      when: 'Domingo 18, es la foto del día',
    },
  ],

  shopping: [
    {
      name: 'Taikoo Li',
      nameZh: '成都太古里',
      what: 'La zona comercial más bonita de la ciudad. Diseño, flagships y patios.',
      when: 'Viernes 16 por la tarde',
      priority: 'must',
    },
    {
      name: 'Chunxi Road',
      nameZh: '春熙路',
      what: 'El gran eje comercial: moda, cosmética, grandes almacenes, sneakers y souvenirs de panda.',
      priority: 'must',
      more: 'Lo vais a atravesar sí o sí.',
    },
    {
      name: 'Chengdu IFS',
      nameZh: '成都IFS',
      what: 'Centro comercial premium: lujo, moda, beauty y restauración.',
      priority: 'nice',
    },
    {
      name: 'Chengdu SKP',
      what: 'La Torre de la Vitalidad (生机之塔) y sus columnas de agua luminosas son un spot viral de 2026.',
      priority: 'optional',
      more: 'Queda al sur de la ciudad. Muy vistoso, pero prescindible con el tiempo que tenéis.',
    },
  ],

  trends: [
    { name: 'El panda gigante de IFS', verdict: 'si', why: 'Turístico, sí, pero es un icono real de Chengdu y son dos fotos distintas.' },
    { name: 'Taikoo Li con Daci Temple', verdict: 'si', why: 'No es solo fotogénico: urbanísticamente merece muchísimo la pena.' },
    { name: 'Anshun Bridge de noche', verdict: 'si', why: 'La imagen nocturna clásica de la ciudad, y os pilla al lado del hotel.' },
    { name: 'People’s Park y el té', verdict: 'si', why: 'Menos espectacular en redes, pero mucho más Chengdu que cualquier otra cosa.' },
    { name: 'Pantallas 3D y pandas de Chunxi', verdict: 'quizas', why: 'Divertidas fotográficamente, pero no organizaría nada alrededor de ellas.' },
    { name: 'Eastern Suburb Memory', verdict: 'quizas', why: 'Muy mencionado en redes en 2026, pero queda al este y vais justos.' },
    { name: 'SKP Tower of Vitality', verdict: 'quizas', why: 'Visualmente potente, pero está al sur y es una única foto.' },
    { name: 'Jiaozi Bridge y las torres gemelas', verdict: 'quizas', why: 'Otro desplazamiento largo para una sola imagen.' },
    { name: 'Cafés cuyo único atractivo es una ventana', verdict: 'no', why: 'Con dos tardes en Chengdu, eso es tiempo que le quitáis a lo bueno.' },
  ],

  bookings: [
    {
      activityId: 'act-2',
      title: 'Base de Pandas',
      when: '3 de octubre (ventana de 14 días)',
      price: '55 CNY la entrada + 30 CNY el bus interno',
      how: 'Web oficial o Trip.com, que la propia Panda Base reconoce como canal autorizado para extranjeros.',
      alert: 'Reservad la franja de mañana (07:30-12:00) y llevad el pasaporte de la compra.',
      url: 'https://www.panda.org.cn/en/service/ticket/',
    },
    {
      title: '🔲 Trenes Chengdu ↔ Leshan del 18',
      when: '3-4 de octubre (la venta abre 15 días antes)',
      price: 'Por confirmar, trayecto de 50-70 min',
      how: 'Trip.com. Son dos billetes aparte de los 7 tramos entre ciudades ya comprados.',
      alert: 'Esto no estaba comprado ni apuntado. Al elegir el de vuelta, que os deje en Chengdu entre las 18:00 y las 20:00.',
    },
    {
      activityId: 'act-3',
      title: 'Buda de Leshan: entrada y crucero',
      when: 'Seguimiento desde mediados de septiembre',
      price: '70 CNY el barco · 80 CNY la entrada terrestre',
      how: '🆕 El crucero YA se vende online, por el miniprograma 大佛旅游 en WeChat o Alipay. Ya no hay que pagarlo solo en el muelle.',
      alert: 'Comprobad el muelle operativo 48-24 h antes: desde julio se sale de Jiazhoudu (嘉州渡码头) y los barcos se suspenden por nivel del agua o mal tiempo.',
    },
  ],

  ranking: {
    must: ['Pandas', 'Taikoo Li y Daci', 'El panda de IFS', 'People’s Park', 'Anshun Bridge de noche', 'Leshan'],
    nice: ['Kuanzhai', 'Kuixinglou Street', 'Wuhou Shrine', 'Jinli si encaja'],
    optional: ['Wenshu', 'Du Fu Cottage', 'Museo de Chengdu', 'Eastern Suburb Memory', 'SKP', 'Yulin', 'Jinsha'],
    skip: ['Intentar meter los opcionales a presión'],
  },
};

const chongqing: CityPlan = {
  cityId: 'chongqing',
  headline: 'Poco tiempo, pero el hotel está extraordinariamente bien situado. Una tarde-noche potentísima en Yuzhong y un día completo de oeste a sur, sin cruzar la ciudad una y otra vez.',
  keyNotes: [
    'La primera noche prácticamente no necesitáis transporte: Hongyadong lo tenéis a unos minutos andando y Jiefangbei a 8-12 min.',
    '🚨 Se llega por Chongqing North y se sale por Chongqing EAST (重庆东站), que es otra estación y está a 21 km. Ni North ni West.',
    'No intentéis ver Chongqing entero. Con una tarde, un día y una mañana, la selección corta enseña mucho mejor la ciudad que diez atracciones a la carrera.',
    'Chongqing engaña con las distancias: 800 metros pueden ser muchísimas escaleras. Es una ciudad vertical de verdad.',
  ],
  base: [
    'Hongyadong a unos minutos andando',
    'Jiefangbei a 8-12 min a pie',
    'Kuixinglou y Bayi Road, al lado',
    'Raffles y Chaotianmen a 15-20 min andando',
    'Shibati a ~2 km',
    'Liziba a 5-6 km · Ciqikou a 17-20 km',
  ],

  days: [
    {
      id: 'cq-d1',
      dateText: 'Lunes 19 de octubre',
      title: 'Llegada y el Chongqing más espectacular',
      zone: 'Yuzhong, casi todo andando',
      blocks: [
        {
          time: '10:59',
          title: 'Llegada a Chongqing North',
          detail: 'Salís por el North Square (北广场). Didi al hotel: en la puerta sobre las 12:00-12:15.',
          kind: 'move',
          more: 'El check-in es a las 15:00, así que dejad maletas y a la calle. En transporte público serían L10 + L6 hasta Xiaoshizi más caminata: con equipaje, Didi.',
        },
        {
          time: '12:30-13:30',
          title: 'Comer por Jiefangbei',
          detail: 'Algo ligero: xiaomian o chaoshou. El hotpot lo dejamos para la noche.',
          kind: 'food',
        },
        {
          time: 'Primera tarde',
          title: 'Kuixinglou 魁星楼',
          detail: 'Primer contacto con la ciudad vertical. 30-45 min.',
          kind: 'visit',
          more: 'La gracia es salir a una plaza que parece estar a ras de suelo y descubrir que en realidad estáis a varias decenas de metros sobre otra calle. Es el ejemplo más claro de la "ciudad 8D".',
        },
        {
          time: 'Tarde',
          title: 'Jiefangbei y Bayi Road',
          detail: 'Paseo por el centro y snack en la calle de comida. No hay que comer por obligación: una o dos cosas.',
          kind: 'shop',
          more: 'En Bayi Road (八一路好吃街) hay suanlafen, brochetas, patatas, dumplings, postres y snacks locales. Turístico, sí, pero está pegado a Jiefangbei y funciona.',
        },
        {
          time: 'Última tarde',
          title: 'Shibati 十八梯',
          detail: 'Llegáis con buena luz. 60-90 min.',
          kind: 'visit',
          more: 'Calles escalonadas reconstruidas con el carácter del Chongqing histórico. Si vais sobrados de tiempo, se puede encadenar con Mountain City Trail (山城巷), que está al lado y donde se entiende lo de la ciudad vertical mejor que en muchas atracciones de pago.',
        },
        {
          time: 'Cena',
          title: 'Hotpot de Chongqing',
          detail: 'Volviendo andando hacia Jiefangbei. 80-150 CNY por persona.',
          kind: 'food',
          more: 'Hay uno literalmente en vuestra calle, Cangbai Road. El hotpot de aquí es más intenso, aceitoso y picante que el de Chengdu, y el caldo tradicional lleva grasa de vacuno. Pedid ternera, maodu (tripa), tofu, setas y verduras.',
        },
        {
          time: 'Noche',
          title: 'Hongyadong 洪崖洞',
          detail: 'Esto NO antes de que anochezca. Bajáis andando desde el hotel.',
          kind: 'visit',
          alert: true,
          more: 'Recorrido: interior brevemente → bajad al nivel inferior (嘉陵江滨江路) y fotografiad hacia arriba, que es donde se entienden los 11 niveles → salid hacia el puente Qiansimen para la foto de la fachada entera iluminada. Esa será probablemente una de las imágenes del viaje. El acceso es gratuito, aunque en días de mucha afluencia puede implantarse control: comprobadlo unos días antes.',
        },
      ],
    },
    {
      id: 'cq-d2',
      dateText: 'Martes 20 de octubre',
      title: 'El día estrella: Ciqikou, monorraíl y orilla sur',
      zone: 'Oeste → centro → sur',
      blocks: [
        {
          time: '09:00-09:30',
          title: 'Ciqikou 磁器口',
          detail: 'Pronto, antes de que lleguen los grupos. 2-2,5 h, no más.',
          kind: 'visit',
          more: 'Calle principal, pero salíos por alguna lateral: casas tradicionales y el río. Probad el Chen Mahua (陈麻花), la masa frita trenzada típica de aquí. Es el mayor núcleo histórico conservado de la ciudad, y también muy turístico: cambia muchísimo cuando se llena.',
        },
        {
          time: 'Mediodía',
          title: 'Liziba 李子坝',
          detail: 'El monorraíl que atraviesa un edificio. Mirador inferior, 30-45 min.',
          kind: 'visit',
          more: 'Bajad en la estación de Liziba (línea 2) y al mirador oficial: esperad un par de trenes y disparad cuando el tren esté ENTRANDO, no cuando ya ha desaparecido dentro. El zoom 2x o 3x del móvil funciona mejor. Y no os quedéis solo en la foto: montad en el propio monorraíl, es de los mejores ejemplos de lo maravillosamente absurda que es la infraestructura de aquí.',
        },
        {
          time: 'Comida',
          title: 'Comer volviendo al centro',
          detail: 'Xiaomian o algo rápido. No busquéis restaurante concreto en Ciqikou.',
          kind: 'food',
        },
        {
          time: 'Tarde',
          title: 'Teleférico del Yangtsé 长江索道',
          detail: 'Desde Xiaoshizi (salida 5B) hacia la orilla sur. Horario hasta las 22:30 en octubre.',
          kind: 'ticket',
          more: '⚠️ Regla clara: si la cola pasa de 60-90 min, saltadlo sin dudar y coged la línea 6 hasta Shangxinjie. No merece la pena sacrificar la tarde por esto. Se compra por canales oficiales y OTAs autorizadas (Trip.com, entre otras). Ha tenido cierres puntuales de mantenimiento en 2026: comprobad el estado unos días antes.',
        },
        {
          time: 'Tarde',
          title: 'Longmenhao y Xiahaoli',
          detail: 'Barrios en pendiente al otro lado del Yangtsé. 2-3 h tranquilas.',
          kind: 'visit',
          more: 'Casas tradicionales, escaleras, terrazas, cafés y vistas hacia Yuzhong con el puente Dongshuimen. Están uno frente al otro y se recorren como una sola visita, aunque tienen ambientes distintos. La referencia para llegar es la estación de Shangxinjie (上新街站).',
        },
        {
          time: 'Atardecer',
          title: 'Que os pille aquí',
          detail: 'Mucho mejor que llegar a las 14:00 con pleno sol.',
          kind: 'visit',
        },
        {
          time: 'Noche',
          title: 'Skyline de Yuzhong desde la orilla sur',
          detail: 'Quedaos cuando enciendan edificios y puentes.',
          kind: 'visit',
          more: 'Es justo la perspectiva contraria a la de anoche: ayer visteis Hongyadong de cerca, hoy veis toda la península iluminada desde enfrente. Así no repetís experiencia.',
        },
        {
          time: 'Cena',
          title: 'Volver a Jiefangbei',
          detail: 'Línea 6: Shangxinjie → Xiaoshizi. También podéis cenar en Longmenhao.',
          kind: 'food',
        },
      ],
    },
    {
      id: 'cq-d3',
      dateText: 'Miércoles 21 de octubre',
      title: 'Mañana tranquila y salida',
      zone: 'Jiefangbei y Chongqing East',
      blocks: [
        {
          time: 'Mañana',
          title: 'Desayuno y poco más',
          detail: 'Si acaso, 20-30 min por Jiefangbei y compras de snacks o regalos.',
          kind: 'rest',
          more: 'Aquí sería conservador: nada de Baixiangju, Shibati, el mirador de Raffles ni ningún desplazamiento fuera de Yuzhong. El tren de hoy es demasiado importante.',
        },
        {
          time: '11:10',
          title: 'Didi a Chongqing East 重庆东站',
          detail: '21 km, 35-50 min según tráfico. NO es North ni West.',
          kind: 'move',
          alert: true,
          more: 'Es una estación nueva, abierta en junio de 2025, y uno de los mayores hubs del oeste de China. Llega la línea 6, pero con maletas y con este tren no me pondría a hacer conexiones. Con salida a las 11:10 tenéis margen para tráfico, encontrar la entrada correcta, control de pasaporte, seguridad y localizar el andén.',
        },
        {
          time: '12:55',
          title: 'Tren G2321 a Fenghuang',
          detail: 'Llegada a Fenghuang Gucheng a las 16:46.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    { name: 'Hongyadong', nameZh: '洪崖洞', what: 'Los edificios diaojiaolou escalonados sobre el Jialing. Lo bueno es verlo iluminado desde fuera, no las tiendas de dentro.', zone: 'Minutos andando', time: '45-90 min', ticket: 'Gratis', priority: 'must' },
    { name: 'Longmenhao y Xiahaoli', nameZh: '龙门浩老街 · 下浩里', what: 'Barrios en pendiente con casas tradicionales, escaleras, cafés y vistas al skyline.', zone: 'Orilla sur', time: '2-3 h', ticket: 'Gratis', priority: 'must' },
    { name: 'Liziba', nameZh: '李子坝', what: 'El monorraíl que atraviesa un edificio de viviendas.', zone: '5-6 km', time: '30-45 min', ticket: 'Gratis', priority: 'must' },
    { name: 'Jiefangbei', nameZh: '解放碑', what: 'El corazón comercial y vuestro centro de operaciones. Lo interesante es la arquitectura vertical, no el monumento.', zone: '8-12 min andando', time: '45 min-1 h', ticket: 'Gratis', priority: 'must' },
    { name: 'Vista nocturna desde la orilla sur', what: 'Toda la península de Yuzhong iluminada, desde enfrente.', zone: 'Longmenhao', time: '30-45 min', ticket: 'Gratis', priority: 'must' },
    { name: 'Ciqikou', nameZh: '磁器口古镇', what: 'El casco histórico más conocido: más de mil años, arquitectura Bayu y comida callejera. Muy turístico.', zone: '17-20 km', time: '2-3 h', ticket: 'Gratis', priority: 'nice' },
    { name: 'Teleférico del Yangtsé', nameZh: '长江索道', what: 'Cruzar el río por el aire. Merece la pena si no hay cola larga.', zone: 'Xiaoshizi', time: '30-60 min', ticket: 'Con entrada', priority: 'nice' },
    { name: 'Shibati', nameZh: '十八梯', what: 'Calles escalonadas reconstruidas con el carácter del Chongqing histórico.', zone: '~2 km', time: '1 h', ticket: 'Gratis', priority: 'nice' },
    { name: 'Kuixinglou', nameZh: '魁星楼', what: 'La plaza que parece estar a ras de suelo y está a decenas de metros sobre otra calle.', zone: 'Al lado del hotel', time: '30-45 min', ticket: 'Gratis', priority: 'nice' },
    { name: 'Chaotianmen y Raffles', nameZh: '朝天门 · 重庆来福士', what: 'La confluencia de los dos ríos y el complejo con la pasarela horizontal a 250 m.', zone: '15-20 min andando', time: '1 h', ticket: 'El mirador, de pago', priority: 'nice', more: 'No subiría al Exploration Deck: Chongqing regala tantas vistas gratis que no lo considero prioritario.' },
    { name: 'Baixiangju', nameZh: '白象居', what: 'Urbanización residencial famosa por sus niveles y pasarelas. Muy Chongqing visualmente.', zone: 'Yuzhong', time: '20-45 min', ticket: 'Gratis', priority: 'optional', more: '⚠️ Vive gente allí y algunos puntos virales han tenido barreras o cambios de acceso. Visita corta y respetando las zonas privadas: no entréis en zonas cerradas aunque lo hayáis visto en tutoriales antiguos.' },
    { name: 'Zoo de Chongqing', what: 'Los pandas. Venís de Chengdu, así que es redundante y os come horas valiosas.', zone: 'Lejos', time: 'Media jornada', ticket: 'Con entrada', priority: 'skip' },
  ],

  restaurants: [
    { name: 'Hotpot junto al hotel', nameZh: '重庆火锅', what: 'Hotpot tradicional de Chongqing, en Cangbai Road, vuestra propia calle.', price: '80-150 CNY por persona', when: 'La noche de llegada, sin moverse', priority: 'must' },
    { name: 'Wuchaoshou', nameZh: '吴抄手', what: 'Los wonton locales (抄手), en Jiefangbei. Fácil de encajar como comida rápida.', when: 'Mediodía del día de llegada', priority: 'nice' },
    { name: 'Pangmei Noodle', nameZh: '胖妹面庄', what: 'Uno de los nombres conocidos del xiaomian de Chongqing.', when: 'Un desayuno o una comida rápida', priority: 'nice' },
    { name: 'Pipa Yuan Shiweixian', nameZh: '枇杷园食为鲜火锅', what: 'El hotpot espectacular que ocupa una ladera entera, en Nanshan.', price: '100-160 CNY por persona', priority: 'skip', more: 'Viral y realmente curioso, pero supone dos desplazamientos en Didi solo para cenar. Con dos noches, prefiero que disfrutéis Hongyadong y Longmenhao tranquilos.' },
  ],

  markets: [
    { name: 'Bayi Road / Haochi Street', nameZh: '八一路好吃街', what: 'Suanlafen, brochetas, patatas, dumplings, postres y snacks. Pegada a Jiefangbei.', when: 'Tarde-noche del día 19', priority: 'must' },
    { name: 'Ciqikou', nameZh: '磁器口', what: 'Más que mercado, calles con productos y snacks. Buscad el Chen Mahua (陈麻花).', priority: 'nice' },
    { name: 'Chaotianmen / IMIX+', nameZh: '朝天门大融汇', what: 'El viejo mayorista de ropa convertido en boutiques independientes y rooftop.', priority: 'nice', more: 'Interesante y poco típica si tenéis 45-60 min libres: moda china, diseño joven y vistas hacia Raffles. La calle de boutiques de la planta 12 abrió en 2025 y sigue creciendo.' },
    { name: 'The Ring', nameZh: '重庆光环购物公园', what: 'El mall famoso por su enorme jardín interior.', priority: 'skip', more: 'Viral pero prescindible: está lejos del centro y no sacrificaría Chongqing auténtico por un centro comercial, por espectacular que sea.' },
  ],

  food: [
    { name: '重庆火锅', pinyin: 'Chongqing hotpot', what: 'Más intenso, aceitoso y picante que el de Chengdu. Caldo con grasa de vacuno.', kind: 'salado' },
    { name: '重庆小面', pinyin: 'Chongqing xiaomian', what: 'Fideos con chile, ajo y soja. Es desayuno y comida cotidiana, no plato turístico.', kind: 'salado' },
    { name: '酸辣粉', pinyin: 'Suanlafen', what: 'Fideos de boniato, ácidos y picantes.', kind: 'salado' },
    { name: '抄手', pinyin: 'Chaoshou', what: 'Wonton estilo Sichuan y Chongqing.', kind: 'salado' },
    { name: '毛血旺', pinyin: 'Mao xue wang', what: 'Guiso picante con varios ingredientes en caldo rojo.', kind: 'salado' },
    { name: '豆花饭', pinyin: 'Douhua fan', what: 'Tofu muy suave con arroz y salsa picante.', kind: 'salado' },
    { name: '烤苕皮', pinyin: 'Kao shaopi', what: 'Lámina de almidón de boniato a la parrilla. Street food puro.', kind: 'salado' },
    { name: '烧烤', pinyin: 'Shaokao', what: 'Brochetas y parrilla nocturna.', kind: 'salado' },
    { name: '冰粉', pinyin: 'Bingfen', what: 'Gelatina fría con sirope de azúcar moreno y frutos secos. Perfecta tras el hotpot.', kind: 'dulce' },
    { name: '陈麻花', pinyin: 'Chen mahua', what: 'Masa frita trenzada, típica de Ciqikou.', kind: 'dulce' },
    { name: '凉虾', pinyin: 'Liangxia', what: 'Bebida-postre fresca. Con ciba y mihuatang, de lo más típico.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'Hongyadong desde el puente Qiansimen', how: 'No os quedéis con las fotos de dentro: salid y alejaos hacia el puente, dejando la fachada escalonada entera de frente. Con las luces encendidas es espectacular.', when: 'Noche del 19' },
    { name: 'Hongyadong desde abajo', nameZh: '嘉陵江滨江路', how: 'Bajad al nivel inferior y disparad hacia arriba: es otra foto totalmente distinta y ahí se entienden los 11 niveles.' },
    { name: 'Liziba desde la plataforma', how: 'Frente al edificio, disparando cuando el tren está entrando, no cuando ya ha desaparecido. Mejor con zoom 2x o 3x.' },
    { name: 'Dentro del propio monorraíl', how: 'Para vídeo: haced un tramo de la línea 2 pasando por Liziba.' },
    { name: 'Longmenhao hacia Yuzhong', how: 'Buscad huecos entre casas y terrazas mirando al puente Dongshuimen y al skyline.', when: 'Al atardecer' },
    { name: 'Kuixinglou', nameZh: '魁星楼', how: 'La plaza y el vacío de varias decenas de metros bajo vuestros pies. Merece la pena de verdad.' },
    { name: 'Hongyadong con el monorraíl en la misma foto', how: '⚠️ Cuidado: circulan imágenes muy editadas que hacen parecer que Liziba está al lado de Hongyadong. NO están juntos. No diseñéis la ruta esperando reproducir esas fotos.' },
  ],

  shopping: [
    { name: 'Jiefangbei', nameZh: '解放碑', what: 'Grandes almacenes, moda internacional y china, cosmética y electrónica. Ya vais a estar allí.', priority: 'must' },
    { name: 'IMIX+', nameZh: '朝天门大融汇', what: 'Moda china, diseño joven y boutiques independientes con rooftop.', priority: 'nice', more: 'Lo más interesante si queréis algo menos estándar. Su transformación seguía siendo noticia en septiembre de 2026.' },
    { name: 'Raffles City', nameZh: '重庆来福士', what: 'Muy grande y moderno, cómodo para combinar turismo, comida y compras.', priority: 'nice' },
    { name: 'Chongqing Times Square', nameZh: '重庆时代广场', what: 'Más premium. Horario orientativo 10:00-22:00.', priority: 'optional' },
  ],

  trends: [
    { name: 'Longmenhao y Xiahaoli', verdict: 'si', why: 'No es solo TikTok: es bonito incluso sin hacer fotos.' },
    { name: 'Kuixinglou', verdict: 'si', why: 'Una experiencia que solo tiene sentido en una ciudad como esta.' },
    { name: 'Liziba', verdict: 'si', why: 'Sí, aunque con 30 minutos basta.' },
    { name: 'El rooftop de IMIX+', verdict: 'si', why: 'Bastante más reciente que los spots virales clásicos, y sigue creciendo en 2026.' },
    { name: 'Baixiangju', verdict: 'quizas', why: 'Visualmente muy interesante, pero la viralidad ha convertido un edificio residencial real en atracción. Opcional y con respeto.' },
    { name: 'Pipa Yuan, el hotpot de la ladera', verdict: 'quizas', why: 'Espectacular, pero no merece dos desplazamientos solo para cenar.' },
    { name: 'El mirador de Raffles', verdict: 'quizas', why: 'Las vistas son buenas, pero aquí hay vistas increíbles gratis por todas partes.' },
    { name: 'The Ring', verdict: 'no', why: 'Bonito centro comercial y poco más. Lejos y prescindible.' },
    { name: 'Two Rivers Cruise', verdict: 'no', why: 'Con el tiempo que tenéis, la orilla sur de noche os da más.' },
  ],

  bookings: [
    {
      title: 'Teleférico del Yangtsé',
      when: 'Mirarlo unos días antes, no meses',
      price: 'Entrada sencilla, por canales oficiales',
      how: 'WeChat, venta presencial o OTAs autorizadas como Trip.com.',
      alert: 'No es por planificar: es por evitar colas y comprobar que no está en mantenimiento. Ha tenido cierres puntuales durante 2026.',
    },
    {
      title: 'Todo lo demás',
      when: 'Nada que reservar',
      price: 'Gratis',
      how: 'Liziba, Jiefangbei, Ciqikou, Longmenhao, Xiahaoli, Shibati, Kuixinglou y Mountain City Trail no necesitan reserva.',
      alert: 'Chongqing es la ciudad del viaje donde menos os tenéis que preocupar por entradas.',
    },
  ],

  ranking: {
    must: ['Hongyadong de noche', 'Longmenhao y Xiahaoli', 'Liziba', 'Jiefangbei', 'Hotpot', 'Vista nocturna desde la orilla sur'],
    nice: ['Ciqikou', 'Teleférico del Yangtsé', 'Shibati', 'Kuixinglou', 'Bayi Road'],
    optional: ['Baixiangju', 'Mountain City Trail', 'Mirador de Raffles', 'IMIX+'],
    skip: ['Zoo y pandas', 'The Ring', 'Pipa Yuan solo para cenar', 'Excursiones fuera de Chongqing', 'Two Rivers Cruise'],
  },
};

const fenghuang: CityPlan = {
  cityId: 'fenghuang',
  headline: 'Nada de turismo de checklist: aquí se viene a recorrer el río, los puentes y las casas colgantes, y a ver cómo cambia todo entre el día y la noche.',
  keyNotes: [
    '🏨 El hotel anuncia recogida gratuita en la estación. Escribidles antes con los datos: 21/10/2026, G2321, llegada 16:46, dos personas. Mejor que buscar taxi.',
    'El casco antiguo es GRATIS. Solo se pagan algunos interiores y los paseos en barco. No compraría el pase de las nueve atracciones (125-128 CNY): no da tiempo a amortizarlo sin convertir Fenghuang en una carrera.',
    'El 21 el sol se pone a las 18:04 y llegáis al hotel sobre las 17:20-17:35. Salid enseguida: pilláis justo la transición de luz de tarde a iluminación nocturna. No vayáis a cenar nada más llegar.',
    'El hotel está a 84 m del Snow Bridge y a 92 m de la casa de Xiong Xiling. Todo se hace andando.',
  ],
  base: [
    'Snow Bridge a 84 m',
    'Stepping stones y North Gate a 5-8 min',
    'Hongqiao a 10-15 min siguiendo el río',
    'Wanming Pagoda a 15-20 min',
    'La estación, a 10 km',
  ],

  days: [
    {
      id: 'fh-d1',
      dateText: 'Miércoles 21 de octubre',
      title: 'Llegada y Fenghuang nocturno',
      zone: 'Todo el casco antiguo, a pie',
      blocks: [
        {
          time: '16:46',
          title: 'Llegada a 凤凰古城站',
          detail: 'Si el hotel confirma la recogida gratis, mejor que taxi. Si no, Didi: 10 km, 20-30 min.',
          kind: 'move',
        },
        {
          time: '17:20-17:35',
          title: 'Dejar maletas y salir ya',
          detail: 'Sin pararse a visitar interiores. Lo que interesa ahora es la luz.',
          kind: 'rest',
          alert: true,
        },
        {
          time: 'Atardecer',
          title: 'Snow Bridge y la ribera del Tuojiang',
          detail: 'Snow Bridge → ribera → stepping stones → North Gate. Despacio.',
          kind: 'visit',
          more: 'Vais a pillar exactamente el cambio de luz: tarde, blue hour y primeras luces. El Snow Bridge, diseñado por Huang Yongyu, lo tenéis a 84 metros del hotel: probablemente sea lo primero que veáis al salir.',
        },
        {
          time: 'Noche',
          title: 'Río abajo hasta Shawan',
          detail: 'North Gate → casas colgantes → Hongqiao → Wanming Pagoda → Shawan.',
          kind: 'visit',
          more: 'Es el mejor tramo nocturno de Fenghuang. Y no pasa nada si no llegáis hasta el final: no hay ningún objetivo que cerrar.',
        },
        {
          time: 'Cena',
          title: 'Por Hongqiao o una calle hacia dentro',
          detail: 'Probad ya el 血粑鸭 (blood cake duck) con una verdura, arroz y 米酒.',
          kind: 'food',
          more: 'Regla práctica de Fenghuang: cuanto más exactamente sobre el paseo del río, más pagáis por las vistas. Para comer mejor, moveos una o dos calles hacia el interior.',
        },
        {
          time: 'Después',
          title: 'Dongzheng Street 东正街',
          detail: 'Ginger candy, tiendas pequeñas y vuelta tranquila al hotel.',
          kind: 'shop',
          more: 'Esta noche NO haría: museos, el pase de nueve atracciones, excursiones ni perseguir ningún must-see más. Esta es la noche que justifica dormir en Fenghuang.',
        },
      ],
    },
    {
      id: 'fh-d2',
      dateText: 'Jueves 22 de octubre',
      title: 'Fenghuang de día, el río y las callejuelas',
      zone: 'Ambas orillas del Tuojiang',
      blocks: [
        {
          time: '07:30-08:00',
          title: 'Los stepping stones sin gente',
          detail: 'Snow Bridge → 跳岩 → North Gate. La misma zona de anoche, transformada.',
          kind: 'visit',
          more: 'No hace falta madrugar a las 05:30, pero a esta hora las piedras están despejadas y la luz es la buena. Buscad el ángulo que incluya persona + piedras + North Gate + casas.',
        },
        {
          time: 'Desayuno',
          title: '牛肉粉 en una tienda local',
          detail: 'Fideos de arroz con ternera. Mucho más apropiado que buscar una cafetería.',
          kind: 'food',
        },
        {
          time: 'Media mañana',
          title: 'Calles interiores',
          detail: 'North Gate → calles antiguas → Dongzheng Street → East Gate → Hongqiao.',
          kind: 'visit',
          more: 'Opcionalmente, la casa de Shen Congwen (~45 CNY, 08:00-18:00): merece la pena si conocéis Border Town o queréis entender la cultura de Xiangxi. Si lo vuestro es el paisaje y la fotografía, dedicad ese rato a las callejuelas y ya está.',
        },
        {
          time: 'Antes o después de comer',
          title: 'Paseo en barco por el Tuojiang',
          detail: 'La única actividad de pago que me plantearía. 20-30 min.',
          kind: 'ticket',
          more: 'Da una perspectiva de las casas colgantes que desde tierra no se consigue. De día el 22, no la noche del 21. No hace falta reservarlo con antelación: comprobad primero el tiempo, porque el servicio se suspende por meteorología o nivel del río.',
        },
        {
          time: 'Comida',
          title: 'Zona de Hongqiao',
          detail: 'Si anoche probasteis el pato, hoy 酸汤鱼 (pescado en caldo agrio) o 湘西腊肉.',
          kind: 'food',
        },
        {
          time: 'Primera tarde',
          title: 'Hongqiao → Wanming Pagoda → Shawan',
          detail: 'Y volver por la otra orilla: así no repetís camino.',
          kind: 'visit',
          more: 'Si os gusta la fotografía, guardad aquí un rato extra: es donde mejor se entiende Fenghuang como paisaje, con río, pagoda, casas colgantes y puentes a la vez.',
        },
        {
          time: '14:30-15:30',
          title: 'Compras volviendo al hotel',
          detail: 'Ginger candy, batik, bordados Miao y té de Xiangxi.',
          kind: 'shop',
        },
        {
          time: '16:00',
          title: 'Salir hacia la estación',
          detail: '10 km. En la estación sobre las 16:25-16:35, con una hora larga de margen.',
          kind: 'move',
          alert: true,
          more: 'Teníamos apuntado salir a las 16:15. Por ganar 15 minutos en Fenghuang no reduciría el margen: después de comer tenéis tiempo de sobra igualmente.',
        },
        {
          time: '17:35',
          title: 'Tren G5666 a Furong',
          detail: 'Llegada a Furongzhen a las 18:09.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    { name: 'Snow Bridge', nameZh: '雪桥', what: 'Uno de los puentes más reconocibles, diseñado por Huang Yongyu. A 84 m del hotel.', zone: 'En la puerta', time: '10-20 min', ticket: 'Gratis', priority: 'must', more: 'Vedlo la noche del 21 y otra vez de día el 22: el contraste merece la pena.' },
    { name: 'Tuojiang Stepping Stones', nameZh: '沱江跳岩', what: 'Las plataformas de piedra que cruzan el río junto al North Gate. Merece más la pena que muchos interiores de pago.', zone: '5-8 min', time: '15-30 min', ticket: 'Gratis', priority: 'must' },
    { name: 'North Gate', nameZh: '北门城楼', what: 'Muralla, puerta, río, stepping stones y casas: la imagen más clásica. Lo importante es el conjunto, no el interior.', zone: '5-10 min', time: '20-30 min', ticket: 'Exterior gratis', priority: 'must' },
    { name: 'Casas colgantes', nameZh: '吊脚楼', what: 'No son una atracción concreta: son el paisaje que hace especial a Fenghuang.', zone: 'Ambas riberas', time: 'Todo el paseo', ticket: 'Gratis', priority: 'must', more: 'No busquéis "una casa": recorred las dos orillas. Las mejores concentraciones están junto a Hongqiao y hacia Shawan.' },
    { name: 'Hongqiao, el Puente del Arcoíris', nameZh: '虹桥风雨楼', what: 'Puente cubierto de origen Ming con estructura de pabellón. Símbolo absoluto de la ciudad.', zone: '10-15 min', time: '20-30 min', ticket: 'Exterior gratis', priority: 'must', more: 'La parte inferior se atraviesa libremente. Hay zonas interiores dentro del pase de atracciones, pero no pagaría el pase solo por subir.' },
    { name: 'Wanming Pagoda', nameZh: '万名塔', what: 'Pequeña pagoda junto al río. No hay que "visitarla": hay que fotografiarla con el reflejo.', zone: '15-20 min', time: '15 min', ticket: 'Exterior gratis', priority: 'must' },
    { name: 'Shawan', nameZh: '沙湾', what: 'El tramo aguas abajo donde mejor se entiende Fenghuang como paisaje.', zone: 'Tras Hongqiao', time: '30-45 min', ticket: 'Gratis', priority: 'must' },
    { name: 'Casa de Shen Congwen', nameZh: '沈从文故居', what: 'Casa natal del escritor más asociado a Xiangxi y a la imagen literaria de la región.', zone: 'Casco antiguo', time: '25-40 min', ticket: '~45 CNY', priority: 'nice', more: 'Depende totalmente de vuestro interés: imprescindible si conocéis Border Town, prescindible si venís por el paisaje.' },
    { name: 'East Gate', nameZh: '东门城楼', what: 'Parte de la antigua línea defensiva, bien integrada con Dongzheng Street.', zone: 'Casco antiguo', time: '10-15 min', ticket: 'Exterior gratis', priority: 'nice', more: 'No haría un desplazamiento específico: pasad por allí dentro del recorrido.' },
    { name: 'Casa de Xiong Xiling', nameZh: '熊希龄故居', what: 'A 92 m del hotel. Visita rápida si sobra tiempo.', zone: 'En la puerta', time: '20-30 min', ticket: 'Con entrada', priority: 'optional' },
    { name: 'Excursiones de los alrededores', what: 'Pueblos Miao, Gran Muralla del Sur, Huangsiqiao, espectáculos nocturnos de gran formato.', zone: 'Fuera', time: 'Medio día', ticket: 'Varias', priority: 'skip', more: 'No porque sean malos, sino porque os quitarían el tiempo de lo que hace especial Fenghuang. Tenéis justo la duración adecuada para el casco antiguo.' },
  ],

  restaurants: [
    { name: 'Junzi Restaurant', what: 'En Hongqiao Middle Road, conocido por el 血粑鸭 (blood cake duck). Negocio de dos generaciones.', price: '40-80 CNY por persona', when: 'El 22, después de recorrer Hongqiao', priority: 'must', more: 'No hace falta reservar.' },
    { name: 'Shi Er Wei', nameZh: '食贰味', what: 'Cerca de Nanbian Street. Blood cake duck, pescado en olla de piedra y vino de arroz.', price: '50-100 CNY por persona', when: 'Si os coincide por ruta', priority: 'nice' },
  ],

  markets: [
    { name: 'Dongzheng Street', nameZh: '东正街', what: 'Comida callejera, ginger candy, tiendas tradicionales y souvenirs. Tofu, brochetas, pescaditos, dulces y ciba.', when: 'Tarde-noche', priority: 'must' },
    { name: 'Mercado de la mañana', what: 'Producto fresco y desayuno local, por el North Gate y la parte exterior del casco antiguo.', when: 'Temprano el 22, antes del paseo', priority: 'nice', more: 'Más interesante por ver vida cotidiana que por comprar.' },
    { name: 'Puestos del paseo del río', what: 'Bonitos para picar mientras paseáis, pero más turísticos y algo más caros.', priority: 'optional', more: 'Cuanto más exactamente sobre el paseo del Tuojiang, más pagáis por las vistas. Una o dos calles hacia dentro se come mejor.' },
  ],

  food: [
    { name: '血粑鸭', pinyin: 'Xuèbā yā — blood cake duck', what: 'El plato más característico: pato con arroz glutinoso y sangre, chile y especias. Potente y muy distinto de todo.', kind: 'salado' },
    { name: '酸汤鱼', pinyin: 'Suāntāng yú', what: 'Pescado en caldo agrio fermentado, típico de la cocina Miao.', kind: 'salado' },
    { name: '湘西腊肉', pinyin: 'Xiāngxī làròu', what: 'Cerdo curado y ahumado, salteado con verduras o brotes de bambú.', kind: 'salado' },
    { name: '牛肉粉', pinyin: 'Niúròu fěn', what: 'Fideos de arroz con ternera. El desayuno de aquí.', kind: 'salado' },
    { name: '米豆腐', pinyin: 'Mǐ dòufu', what: '"Tofu de arroz", suave, con salsa picante y vinagre.', kind: 'salado' },
    { name: '臭豆腐', pinyin: 'Chòu dòufu', what: 'El tofu fermentado de Hunan. Aquí suele ser crujiente por fuera.', kind: 'salado' },
    { name: '烤小鱼', pinyin: 'Kǎo xiǎoyú', what: 'Pescaditos del río a la parrilla, muy típicos de los puestos del Tuojiang.', kind: 'salado' },
    { name: '姜糖', pinyin: 'Jiāngtáng — ginger candy', what: 'El souvenir gastronómico típico: azúcar con jengibre estirada a mano en la puerta de las tiendas.', kind: 'dulce' },
    { name: '糍粑', pinyin: 'Cíbā', what: 'Tortas de arroz glutinoso.', kind: 'dulce' },
    { name: '米酒', pinyin: 'Mǐjiǔ', what: 'Vino dulce de arroz local. Fácil de beber, pero lleva alcohol aunque parezca suave.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'Nanhua Bridge', nameZh: '南华桥', how: 'Una de las mejores perspectivas elevadas: colocaos sobre el puente mirando aguas abajo, con el río como eje. Las guías chinas lo llaman el punto protagonista del skyline.', when: 'Final de la tarde o noche' },
    { name: 'Stepping stones con el North Gate', how: 'En vez de disparar solo al río, buscad el ángulo con persona + piedras + puerta + casas.', when: '07:00-08:00' },
    { name: 'Hongqiao desde la orilla opuesta', how: 'La mejor foto NO se hace encima del puente: cruzad y alejaos unos metros por la ribera para incluir el puente entero, los arcos y el reflejo.', when: 'De noche queda especialmente bien' },
    { name: 'Wanming Pagoda reflejada', how: 'Colocaos enfrente, en la orilla opuesta, y usad el río para el reflejo.' },
    { name: 'Shawan mirando aguas arriba', how: 'Desde Shawan, girad la cámara hacia el centro: río, casas colgantes, pagoda y puentes en una sola imagen. Probablemente el mejor POV para vosotros.' },
    { name: 'Calles de detrás del río', how: 'No os quedéis en la primera línea: Dongzheng Street, Qingxi Lane y las callejuelas interiores dan fotos mucho más "China antigua" y menos parque turístico.' },
  ],

  shopping: [
    { name: 'Ginger candy', nameZh: '姜糖', what: 'Mejor si veis cómo la hacen en el propio taller.', priority: 'must' },
    { name: 'Batik Miao', nameZh: '苗族蜡染', what: 'Tejidos teñidos con reserva de cera. Mucho mejor recuerdo que un souvenir genérico.', priority: 'must' },
    { name: 'Bordados Miao', nameZh: '苗绣', what: 'Bolsos pequeños, piezas textiles y accesorios.', priority: 'nice' },
    { name: 'Plata Miao', nameZh: '苗银', what: 'Bonita, pero ojo: "plata Miao" no significa necesariamente plata de ley.', priority: 'nice', more: 'Si queréis joyería de valor, comprobad material y contraste. Y guardad las compras de marcas, tecnología o cosmética para las ciudades grandes: aquí no es el sitio.' },
    { name: 'Té de Xiangxi', nameZh: '湘西茶', what: 'Compra ligera y fácil de transportar.', priority: 'nice' },
  ],

  trends: [
    { name: 'Sesión de fotos con ropa Miao', verdict: 'si', why: 'Fenghuang vive un boom de 旅拍 que sigue creciendo en 2026: ropa Miao, tocados de plata, maquillaje y fotos junto al río. Si os gusta haceros fotos, sí — pero máximo 1-1,5 h, no media jornada. Preguntad SIEMPRE por escrito precio total, maquillaje, ropa, tocado, número de fotos retocadas y entrega de originales: hay mucha competencia y precios de entrada bajos con suplementos después.' },
    { name: 'Ver encenderse la ciudad el día de llegada', verdict: 'si', why: 'Coincide casi perfectamente con vuestra llegada. Es de las mejores experiencias posibles aquí.' },
    { name: 'Las diaojiaolou desde la barca', verdict: 'si', why: 'La perspectiva que desde tierra no se consigue.' },
    { name: 'Sesión con traje de fantasía wuxia', verdict: 'quizas', why: 'Se ve mucho por la relación visual de Fenghuang con esa estética, pero si vais a hacer una sesión elegiría ropa Miao, que tiene que ver con Xiangxi de verdad.' },
    { name: 'El pase de las nueve atracciones', verdict: 'no', why: 'Con una noche y un día no da tiempo a amortizarlo sin convertir la visita en una carrera.' },
  ],

  bookings: [
    {
      title: '🏨 Recogida gratuita en la estación',
      when: 'Escribir al hotel antes del viaje',
      price: 'Gratis, según anuncia el alojamiento',
      how: 'Mandadles: 21/10/2026, tren G2321, llegada 16:46, dos personas.',
      alert: 'Es lo único que gestionaría con antelación en Fenghuang. Si lo confirman, os ahorra buscar taxi al llegar de noche.',
    },
    {
      title: 'Paseo en barco por el Tuojiang',
      when: 'Sobre la marcha, el mismo 22',
      price: 'Actividad de pago, sin necesidad de reserva previa',
      how: 'Comprobad antes el tiempo: el servicio se suspende por meteorología o por el nivel del río.',
    },
    {
      title: 'Todo lo demás',
      when: 'Nada que reservar',
      price: 'El casco antiguo es gratis',
      how: 'Solo se pagan algunos interiores y los barcos. Ninguna atracción de vuestra ruta hay que comprarla con meses de antelación.',
    },
  ],

  ranking: {
    must: ['Snow Bridge', 'Stepping stones temprano', 'North Gate', 'Hongqiao', 'Wanming Pagoda', 'Shawan', 'Las casas colgantes'],
    nice: ['Casa de Shen Congwen', 'East Gate', 'Paseo en barco', 'Dongzheng Street', 'Sesión con ropa Miao'],
    optional: ['Casa de Xiong Xiling', 'Mercado de la mañana'],
    skip: ['El pase de nueve atracciones', 'Pueblos Miao', 'Gran Muralla del Sur', 'Huangsiqiao', 'Espectáculos de gran formato'],
  },
};

const furong: CityPlan = {
  cityId: 'furong',
  headline: 'Quince horas, y están bien planteadas: llegar cuando empieza a oscurecer, vivir el pueblo iluminado y repetir el paseo por la mañana casi vacío. Aquí más no significa mejor.',
  keyNotes: [
    '🎟️ RESUELTO el aviso de la reserva: el hotel está DENTRO del recinto de pago, así que SÍ hace falta entrada. Presupuestad ~108 CNY por persona (~14 €), válida 3 días y con la iluminación nocturna incluida. Algunas webs aún ponen 100: confirmad el precio unos días antes.',
    '🏨 El hotel anuncia recogida gratuita en la estación de Furongzhen. Escribidles antes y sustituid el taxi por eso.',
    'No penséis en Furong como una ciudad por zonas: es un circuito peatonal de 2-3 h alrededor del hotel, con escaleras y bastante desnivel.',
    '🚗 Confirmad el coche a Zhangjiajie al hacer el check-in, y preguntad DÓNDE os recoge exactamente: el hotel está en zona peatonal y "la puerta del hotel" puede ser un punto accesible cercano.',
  ],
  base: [
    'La gran cascada, a menos de 100 m',
    'El hotel está EN la Wuli Stone Street',
    'Tuwang Bridge y Tusi Palace a ~5 min',
    'Wangcun Wharf a 10-15 min bajando',
    'La entrada del recinto, a ~4 min andando',
  ],

  days: [
    {
      id: 'fr-d1',
      dateText: 'Jueves 22 de octubre',
      title: 'Llegada y Furong iluminado',
      zone: 'Todo el pueblo, a pie',
      blocks: [
        {
          time: '18:09',
          title: 'Llegada a 芙蓉镇站',
          detail: 'Si el hotel confirma la recogida gratuita, mejor que taxi. 10-15 min.',
          kind: 'move',
          more: 'Desde la estación hay transfers oficiales hacia el recinto, pero la recogida del hotel os deja la llegada resuelta y llegáis de noche.',
        },
        {
          time: '18:30-18:45',
          title: 'Check-in y cinco preguntas',
          detail: 'Dejad equipaje y resolved todo de golpe en recepción.',
          kind: 'rest',
          alert: true,
          more: 'Preguntad: 1) hasta qué hora sirven cena; 2) qué actuaciones hay esta noche; 3) confirmad el coche a Zhangjiajie de mañana a las 09:30; 4) dónde os recoge exactamente ese coche; 5) si os han gestionado la entrada al recinto. No dejéis la salida de mañana dependiendo de encontrar un Didi a las 09:20.',
        },
        {
          time: '~19:00',
          title: 'Primer paseo, sin cenar todavía',
          detail: 'Wuli Stone Street → Tuwang Bridge → Tusi Palace → miradores de arriba.',
          kind: 'visit',
          more: 'Así pilláis la transición de las últimas luces a la noche. La iluminación suele arrancar sobre las 19:30, aunque la hora varía según temporada.',
        },
        {
          time: '19:30-21:00',
          title: 'La cascada y el pueblo iluminado',
          detail: 'Esto es Furong. No importa tardar hora y media o dos horas.',
          kind: 'visit',
          alert: true,
          more: 'Orden: Tuwang Bridge → mirador panorámico → exterior del Tusi Palace → bajada a la gran cascada → base de la cascada → pasarela DETRÁS del agua → Wangcun Wharf y miradores de abajo → subida otra vez por la Wuli Stone Street. La pasarela de detrás de la cortina de agua es la experiencia más característica del pueblo: no os quedéis viéndola solo desde arriba, junto al hotel.',
        },
        {
          time: 'Cena',
          title: 'En el propio hotel, tarde',
          detail: 'Tiene restaurante y zona panorámica. 湘西腊肉 + verduras + pescado o un plato Tujia.',
          kind: 'food',
          more: 'Es la decisión más inteligente: llegáis cansados y la prioridad es la iluminación, no sentaros pronto a cenar. No pidáis rice tofu esta noche si queréis probarlo mañana en el puesto 113.',
        },
        {
          time: '21:30-22:00',
          title: 'Segundo paseo, ya sin gente',
          detail: 'Salid otra vez por la Wuli Stone Street: a esa hora se vacía.',
          kind: 'visit',
          more: 'Las excursiones de un día ya se han ido y el paseo puede ser muchísimo mejor que el primero.',
        },
      ],
    },
    {
      id: 'fr-d2',
      dateText: 'Viernes 23 de octubre',
      title: 'Furong vacío, rice tofu y salida',
      zone: 'El casco antiguo',
      blocks: [
        {
          time: '07:15-07:30',
          title: 'Paseo temprano',
          detail: 'Hotel → Wuli Stone Street → Tuwang Bridge → la cascada de día → callejones.',
          kind: 'visit',
          more: 'No es por ver más cosas: es por ver el mismo pueblo prácticamente vacío. La misma calle que anoche estaba abarrotada cambia por completo. No bajaría otra vez al embarcadero salvo que os quedara una foto pendiente.',
        },
        {
          time: '08:00-08:30',
          title: 'Rice tofu en el puesto 113',
          detail: 'Pedid 咸米豆腐 (salado). ¥5-15. Es EL alimento de Furong.',
          kind: 'food',
          more: 'Buscad el 正宗113号米豆腐店: hay muchísimas imitaciones que usan el nombre "Liu Xiaoqing". Si queréis compartir algo más, 蒿子粑粑 o 冰米酒. Sin convertirlo en un desayuno enorme.',
        },
        {
          time: '08:30-09:00',
          title: 'Vuelta al hotel y maletas',
          detail: 'Comprobad que el conductor está en camino.',
          kind: 'rest',
        },
        {
          time: '09:30',
          title: 'Coche a Zhangjiajie',
          detail: '~1h30. Llegada al hotel de Zhangjiajie sobre las 11:00.',
          kind: 'move',
          alert: true,
          more: 'Reservado la noche anterior en recepción, con el precio cerrado: ~250-300 CNY. No lo busquéis en Didi esa mañana, en el Xiangxi rural la cobertura es mala.',
        },
      ],
    },
  ],

  highlights: [
    { name: 'Cascada de Furong', nameZh: '芙蓉镇大瀑布', what: 'Unos 60 m de caída atravesando el pueblo. El icono absoluto.', zone: 'A menos de 100 m', time: '30-45 min', ticket: 'Dentro del recinto', priority: 'must' },
    { name: 'Pasarela detrás de la cascada', nameZh: '水帘洞', what: 'El camino que pasa prácticamente por detrás de la cortina de agua.', zone: '3-8 min', time: '15-25 min', ticket: 'Incluida', priority: 'must', more: 'Es probablemente la experiencia más característica de Furong. De noche, el POV más distinto que os vais a traer.' },
    { name: 'Wuli Stone Street', nameZh: '五里石板街', what: 'La antigua calle empedrada, con casas de madera, tiendas y puestos. El hotel está en ella.', zone: 'En la puerta', time: '30-45 min', ticket: 'Incluida', priority: 'must' },
    { name: 'Tuwang Bridge', nameZh: '土王桥', what: 'Puente tradicional de madera y uno de los mejores puntos panorámicos.', zone: '~5 min', time: '10-20 min', ticket: 'Incluida', priority: 'must' },
    { name: 'Tusi Palace', nameZh: '土王行宫 / 酉阳宫', what: 'Arquitectura Tujia sobre el acantilado, justo enfrente del hotel.', zone: '~5 min', time: '15-30 min', ticket: 'Incluida', priority: 'nice' },
    { name: 'Wangcun Wharf', nameZh: '王村码头', what: 'La parte baja junto al río: desde ahí se ve que todo el pueblo trepa por el acantilado.', zone: '10-15 min bajando', time: '15-20 min', ticket: 'Incluida', priority: 'nice' },
    { name: 'Xizhou Copper Pillar', nameZh: '溪州铜柱', what: 'Elemento histórico ligado al pasado Tusi.', zone: '~10 min', time: '5-10 min', ticket: 'Incluida', priority: 'optional' },
    { name: 'Tusi Square', nameZh: '土司广场', what: 'La plaza donde se hacen algunas actuaciones.', zone: '~10 min', time: 'Según espectáculo', ticket: 'Incluida', priority: 'optional' },
    { name: 'Excursiones de alrededor', what: 'Red Stone Forest, Mengdong River y demás.', zone: 'Fuera', time: 'Medio día', ticket: 'Aparte', priority: 'skip', more: 'Tenéis 15 horas entre llegada y salida, y buena parte son noche y sueño. Furong es de esos sitios donde más no significa mejor.' },
  ],

  restaurants: [
    { name: 'Restaurante del propio hotel', what: 'Comida local y zona panorámica, sin moverse. La opción más lógica para la noche.', when: 'Cena tardía del 22, después del paseo', priority: 'must', more: 'Preguntad al llegar hasta qué hora sirven. Así no perdéis la mejor parte de la noche sentados en un restaurante.' },
    { name: 'Puesto 113 de rice tofu', nameZh: '正宗113号米豆腐店', what: 'El famoso 米豆腐 de Furong, ligado a la película que dio nombre al pueblo.', price: '¥5-15', when: 'Desayuno del 23', priority: 'must', more: 'Ojo con las imitaciones que usan el nombre "Liu Xiaoqing": buscad el número 113.' },
    { name: 'Tuwang Yuchu', nameZh: '土王御厨湘菜馆', what: 'Cocina de Hunan dentro del recinto: pescado Tujia y pato xueba.', price: '~¥57 por persona', priority: 'nice' },
    { name: 'Xiangla Gancai', nameZh: '湘腊干菜馆', what: 'Especializado en carnes curadas de Xiangxi.', price: '~¥57 por persona', priority: 'nice' },
  ],

  markets: [
    { name: 'Wuli Stone Street', nameZh: '五里石板街', what: 'Aquí no hay night market: la propia calle hace de comida callejera, comercio y souvenirs.', priority: 'must', more: 'Rice tofu, carnes ahumadas, encurtidos, salchichas, dulces, té, plata Miao, bordados Tujia y artesanía.' },
  ],

  food: [
    { name: '米豆腐', pinyin: 'Mǐdòufu — rice tofu', what: 'EL alimento de Furong: arroz convertido en una especie de tofu muy blando. Salado, ácido-picante o con arroz dulce fermentado.', kind: 'salado' },
    { name: '湘西腊肉', pinyin: 'Xiāngxī làròu', what: 'Cerdo ahumado y curado de Xiangxi.', kind: 'salado' },
    { name: '土家腊肠', pinyin: 'Tǔjiā làcháng', what: 'Salchicha curada Tujia.', kind: 'salado' },
    { name: '血粑鸭', pinyin: 'Xuèbā yā', what: 'Pato con torta de arroz glutinoso y sangre, típico del oeste de Hunan.', kind: 'salado' },
    { name: '干锅腊味', pinyin: 'Gānguō làwèi', what: 'Olla seca con embutidos y carnes curadas.', kind: 'salado' },
    { name: '苗鱼 / 河鱼', pinyin: 'Miáo yú', what: 'Pescado local de río.', kind: 'salado' },
    { name: '酸萝卜', pinyin: 'Suān luóbo', what: 'Rábano encurtido, ácido y picante.', kind: 'salado' },
    { name: '蒿子粑粑', pinyin: 'Hāozi bābā', what: 'Tortita de arroz glutinoso con hierbas.', kind: 'dulce' },
    { name: '冰米酒', pinyin: 'Bīng mǐjiǔ', what: 'Arroz fermentado dulce y frío.', kind: 'dulce' },
    { name: '葛根粉', pinyin: 'Gěgēn fěn', what: 'Preparación de raíz de kudzu.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'La postal clásica', how: 'Desde el mirador de enfrente de la cascada, en la orilla opuesta al conjunto de casas: cascada + casas Tujia sobre pilotes. De noche es muchísimo mejor que de día.', when: 'Noche del 22' },
    { name: 'Tuwang Bridge', nameZh: '土王桥', how: 'Desde el puente o justo al lado: composición más elevada con cascada, río y casas escalonadas.', when: 'Por la mañana hay mucha menos gente' },
    { name: 'Detrás de la cascada', how: 'Dentro de la pasarela, disparando hacia FUERA: la cortina de agua hace de marco y al otro lado quedan las luces del pueblo.', when: 'De noche' },
    { name: 'La base de la cascada', how: 'Funciona mejor con una persona delante y la cascada iluminada enorme detrás.' },
    { name: 'Wangcun Wharf', nameZh: '王村码头', how: 'Desde abajo se aprecia que el pueblo entero está construido verticalmente sobre el acantilado.' },
    { name: 'Wuli Stone Street vacía', how: 'La misma calle que de noche está abarrotada, a primera hora. Es otra foto y otro pueblo.', when: '07:15-07:30 del 23' },
    { name: 'Desde vuestra propia habitación', how: 'El hotel anuncia vistas panorámicas sobre el pueblo y zonas orientadas a la cascada. Antes de salir, mirad qué vista tenéis.' },
  ],

  shopping: [
    { name: 'Brocado Tujia', nameZh: '土家织锦', what: 'Si encontráis una pieza auténtica que os guste, es el mejor recuerdo de aquí.', priority: 'nice' },
    { name: 'Productos locales envasados', what: 'Carnes curadas, encurtidos, té. Fáciles de traer.', priority: 'nice' },
    { name: 'Plata Miao', nameZh: '苗银', what: 'Bonita como recuerdo, pero no compraría una pieza cara sin garantías.', priority: 'optional', more: 'Abundan artículos industriales vendidos como artesanía tradicional. Aquí no hay centros comerciales ni tecnología: eso, para Shanghái.' },
  ],

  trends: [
    { name: 'Furong iluminado', verdict: 'si', why: 'Sigue siendo la razón principal para dormir aquí. La iluminación arranca sobre las 19:30.' },
    { name: 'Pasar detrás de la cascada de noche', verdict: 'si', why: 'La experiencia más característica del pueblo.' },
    { name: 'El pueblo desde la orilla contraria', verdict: 'si', why: 'La postal clásica, y de noche es otra cosa.' },
    { name: 'Verlo vacío a primera hora', verdict: 'si', why: 'No es espectacular en TikTok, pero para vosotros puede ser de lo mejor de la parada.' },
    { name: 'Trajes tradicionales Tujia o Miao', verdict: 'quizas', why: 'Hay alquileres desde unos ¥50/h, pero con maquillaje y sesión la tarifa sube bastante. Con una noche, yo priorizaría la cascada.' },
    { name: 'Cafés con "mesa con vistas" a precio premium', verdict: 'no', why: 'Vuestro hotel ya está mejor colocado que muchos de ellos. Explorad primero los miradores públicos.' },
  ],

  bookings: [
    {
      title: '🏨 Escribir al hotel una semana antes',
      when: '~15 de octubre',
      price: 'La recogida, gratuita',
      how: 'Preguntad de una vez: recogida en 芙蓉镇站 con el tren G5666 y la hora 18:09; si gestionan ellos la entrada al recinto; cómo se accede al hotel con equipaje; precio del coche a Zhangjiajie del día 23; y qué actuaciones hay la noche del 22.',
      alert: 'Frase lista para mandar: 我们10月22日18:09到芙蓉镇站。请问可以安排免费接站吗？入住酒店需要提前购买芙蓉镇景区门票吗？酒店可以帮我们购买吗？',
    },
    {
      title: '🎟️ Entrada al recinto de Furong',
      when: 'No hace falta con meses. Sí dejar claro cómo entráis al llegar',
      price: '~108 CNY por persona (~14 €), válida 3 días',
      how: 'El hotel está dentro de la zona de pago, así que la entrada es obligatoria para llegar a él. La iluminación nocturna va incluida.',
      alert: 'Esto resuelve el aviso que traía la reserva del hotel. Algunas webs aún ponen 100 CNY: confirmad el precio unos días antes.',
    },
    {
      title: '🚗 Coche a Zhangjiajie',
      when: 'Al hacer el check-in, la noche del 22',
      price: '~250-300 CNY (32-38 €), se paga allí',
      how: 'En recepción, con el precio cerrado antes de subir a la habitación.',
      alert: 'Preguntad dónde os recoge exactamente: el hotel está en zona peatonal.',
    },
  ],

  ranking: {
    must: ['Furong iluminado', 'La cascada desde enfrente', 'Caminar detrás de la cascada', 'Tuwang Bridge', 'Wuli Stone Street de noche y de día', 'Rice tofu'],
    nice: ['Tusi Palace', 'Wangcun Wharf', 'Segundo paseo nocturno sin gente'],
    optional: ['Copper Pillar', 'Tusi Square', 'Traje tradicional para fotos'],
    skip: ['Red Stone Forest', 'Mengdong River', 'Cualquier excursión de los alrededores'],
  },
};

/** Planning por ciudad. Se va llenando a medida que se cierra cada una. */
export const cityPlans: Record<string, CityPlan> = {
  beijing,
  xian,
  chengdu,
  chongqing,
  fenghuang,
  furong,
};

export function getCityPlan(cityId?: string): CityPlan | undefined {
  return cityId ? cityPlans[cityId] : undefined;
}
