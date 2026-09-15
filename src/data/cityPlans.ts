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

const zhangjiajie: CityPlan = {
  cityId: 'zhangjiajie',
  headline: 'No es una ciudad que visitar: es la base de Tianmen. Hotel → comida local → la montaña → atardecer → la Puerta del Cielo iluminada → hotel. Nada más.',
  keyNotes: [
    '⚠️ OJO con el tour nocturno: existen productos de día + noche en 2026, pero NO hay una norma oficial publicada que diga que con la entrada diurna os podáis quedar por vuestra cuenta hasta las 21:00. Hay que contratar el producto nocturno concreto. Es el único punto logístico que queda por cerrar de esta parada.',
    '🗣️ Al preguntar en el hotel, no confundáis dos cosas distintas: 天门山夜游 / 天门洞夜景 es visitar la montaña iluminada; 天门狐仙 es un espectáculo teatral en el teatro del cañón, que empieza sobre las 20:20. Vosotros preguntáis por lo primero.',
    '🚡 Las rutas A/B/C están alteradas por las obras del tramo superior: NO las elijáis con guías antiguas. Cuando abráis la reserva el 23 de septiembre, mirad el esquema operativo que aparezca ese día.',
    '🌉 La pasarela de cristal de la East Line cerró por mantenimiento en mayo de 2026; Panlong (Coiling Dragon) y la West Line seguían abiertas. Reconfirmadlo justo antes de ir.',
  ],
  base: [
    'Estación baja del teleférico a ~1 km, 10-15 min andando',
    'Restaurantes Tujia justo enfrente del teleférico',
    '72 Qilou a 15-20 min en Didi',
    'El centro (Jiefang Road) no os hace falta',
    'Wulingyuan y el Gran Cañón son la base siguiente: aquí no se mezclan',
  ],

  days: [
    {
      id: 'zj-d1',
      dateText: 'Viernes 23 de octubre',
      title: 'Tianmen Mountain, de día y de noche',
      zone: 'Todo alrededor del teleférico',
      blocks: [
        {
          time: '~11:00',
          title: 'Llegada al Thousand Hotel',
          detail: 'En coche desde Furong. Maletas dentro y check-in si ya se puede.',
          kind: 'move',
        },
        {
          time: '11:45-12:45',
          title: 'Comer antes de subir',
          detail: 'En la zona del teleférico, sin coger Didi ni bajar al centro.',
          kind: 'food',
          more: 'La opción más cómoda es Gongpopo (龚婆婆土厨), prácticamente enfrente de la estación del teleférico, a unos 50 m. 40-60 CNY por persona. Pedid 土家三下锅 (Tujia Sanxiaguo). Y comed bien ahora: arriba no contéis con sentaros 45-60 min a comer, la montaña se disfruta mejor sin eso.',
        },
        {
          time: '13:15-13:30',
          title: 'Andando al teleférico',
          detail: '~1 km. En la estación sobre las 13:30-13:40 para la franja de las 14:00.',
          kind: 'move',
          more: 'No merece la pena pedir Didi salvo lluvia fuerte.',
        },
        {
          time: '14:00',
          title: 'Subida a Tianmen',
          detail: 'Franja reservada. Teleférico hasta la estación intermedia, bus por las 99 curvas y escaleras mecánicas.',
          kind: 'ticket',
          alert: true,
          more: 'El tramo superior del teleférico principal sigue en reconstrucción en 2026 y la operativa está adaptada. Por eso no sirven las guías anteriores a 2026 para decidir la ruta: comprobad el esquema del día al reservar.',
        },
        {
          time: 'Tarde',
          title: 'Arriba: la Puerta del Cielo y las pasarelas',
          detail: '99 curvas → Tianmen Cave → cumbre → West Cliff y Valle de los Fantasmas → una pasarela de cristal.',
          kind: 'visit',
          more: 'No intentéis completar todos los caminos del borde. Con una entrada a las 14:00, elegid: los 999 escalones y la cueva de frente, el sector del Guigu Zhandao (鬼谷栈道), UNA pasarela de cristal buena —Panlong si sigue abierta— y el templo si sobra tiempo. Las pasarelas pueden cerrarse por mal tiempo, y el enemigo real no es la lluvia sino la niebla: si está cubierto, algunas vistas desaparecen del todo.',
        },
        {
          time: '~18:00',
          title: 'Atardecer',
          detail: 'El sol se pone sobre las 18:00 ese día. Buscad un punto despejado del sector oeste.',
          kind: 'visit',
        },
        {
          time: '19:30-20:30',
          title: 'Tianmen Cave iluminada (si hay tour)',
          detail: 'Solo con un producto nocturno contratado. No contéis con quedaros por vuestra cuenta.',
          kind: 'ticket',
          alert: true,
          more: 'La secuencia que merece la pena es luz de tarde → blue hour → iluminación. Si el tour no se confirma o sale muy caro, el plan B es bajar, cenar y hacer 72 Qilou.',
        },
        {
          time: 'Plan B',
          title: '72 Qilou 七十二奇楼',
          detail: 'Complejo nocturno iluminado de estilo Tujia. 1,5-2 h, en Didi.',
          kind: 'visit',
          more: '~48 CNY antes de las 16:30 y ~88 CNY después; la iluminación arranca sobre las 19:30. No es un casco histórico: abrió en 2022 y es una experiencia visual nocturna, no patrimonio. ⛔ Lo que NO haría es Tianmen de día + Tianmen de noche + 72 Qilou: eso convierte un día espectacular en una carrera.',
        },
      ],
    },
    {
      id: 'zj-d2',
      dateText: 'Sábado 24 de octubre',
      title: 'Salida hacia Wulingyuan',
      zone: 'Sin añadir nada',
      blocks: [
        {
          time: '08:00',
          title: 'Despertar y desayunar',
          detail: 'El desayuno cierra a las 09:00, así que despertador.',
          kind: 'rest',
        },
        {
          time: '09:00',
          title: 'Didi a Wulingyuan',
          detail: '~33 km. Contad hasta 1 h, no 45 min, para no condicionar el Gran Cañón.',
          kind: 'move',
          alert: true,
          more: 'Aquí no añadiría absolutamente nada: nada de "ver algo rápido" en Yongding antes de salir. Y confirmad el 23 en recepción a qué hora es exactamente vuestro check-out, que es un rango de 12:00 a 14:00 según habitación.',
        },
      ],
    },
  ],

  highlights: [
    { name: 'Tianmen Mountain', nameZh: '天门山国家森林公园', what: 'El motivo entero de dormir aquí. Montaña independiente del parque de Wulingyuan, con la Puerta del Cielo, las 99 curvas y las pasarelas sobre el acantilado.', zone: '1 km andando', time: '4-6 h', ticket: '~288 CNY, reserva con franja', priority: 'must' },
    { name: 'Tianmen Cave', nameZh: '天门洞', what: 'La Puerta del Cielo. La foto clásica es desde la base de los 999 escalones, de frente.', zone: 'Dentro', time: '45-60 min', ticket: 'Incluida', priority: 'must' },
    { name: 'Carretera de las 99 curvas', nameZh: '通天大道', what: 'Buscad durante el recorrido alto la vista con la carretera serpenteando debajo.', zone: 'Dentro', time: 'En el trayecto', ticket: 'Incluida', priority: 'must' },
    { name: 'Guigu Zhandao', nameZh: '鬼谷栈道', what: 'El sector de pasarela del West Cliff y el Valle de los Fantasmas. De lo mejor de la montaña.', zone: 'Dentro', time: '1-1,5 h', ticket: 'Incluida', priority: 'must' },
    { name: 'Pasarela de cristal de Panlong', nameZh: '盘龙崖玻璃栈道', what: 'Cristal, vacío y las curvas de la carretera debajo. No hace falta hacerlas todas: con una buena basta.', zone: 'Dentro', time: '20-30 min', ticket: 'Incluida', priority: 'nice', more: '⚠️ No es lo mismo que el puente de cristal del Gran Cañón, que veréis el día 24: son atracciones completamente distintas. Y la East Line cerró por mantenimiento en mayo de 2026.' },
    { name: 'Templo de Tianmen', nameZh: '天门山寺', what: 'Interesante si vais bien de tiempo.', zone: 'Dentro', time: '30 min', ticket: 'Incluida', priority: 'nice' },
    { name: '72 Qilou', nameZh: '七十二奇楼', what: 'Complejo nocturno iluminado inspirado en las casas sobre pilotes Tujia. Espectáculos y puestos de comida.', zone: '15-20 min en Didi', time: '1,5-2 h', ticket: '48-88 CNY', priority: 'nice', more: 'Muy recomendable SOLO si no hacéis Tianmen nocturno. Abrió en 2022: es experiencia visual, no patrimonio.' },
    { name: 'Centro de Yongding', nameZh: '解放路', what: 'La zona urbana de restaurantes y comercios. Más cotidiana que Wulingyuan.', zone: 'Centro', time: '1 h', ticket: 'Gratis', priority: 'optional', more: 'No hay ningún monumento que justifique sacrificar Tianmen por esto. Solo para cenar si acabáis pronto.' },
    { name: 'El parque de Wulingyuan', what: 'Yuanjiajie, Tianzi, Golden Whip Stream, Baofeng Lake, el Gran Cañón.', zone: 'Otra base', time: 'Días', ticket: 'Aparte', priority: 'skip', more: 'Es otro bloque geográfico, el de los días 24 y 25. Mezclarlo con Tianmen sería perder muchísimo tiempo.' },
  ],

  restaurants: [
    { name: 'Gongpopo Tujia Kitchen', nameZh: '龚婆婆土厨', what: 'Cocina Hunan y Tujia a unos 50 m de la estación del teleférico. Abre de 10:00 a 23:00.', price: '40-60 CNY por persona', when: 'Comida del 23, antes de subir', priority: 'must', more: 'Es la opción número uno porque no exige ningún desplazamiento. Pedid 土家三下锅 y el pastel Tujia de artemisa.' },
    { name: 'Zhaisao Dangjia', nameZh: '寨嫂当家', what: 'Sanxiaguo, cerdo de granja y pollo en cazuela. Cocina Tujia local.', price: '~49 CNY por persona', priority: 'nice' },
    { name: 'Fuzhengyi Sanxiaguo', nameZh: '富正毅三下锅', what: 'Cadena local conocida, práctica porque trabaja con carta visual. Sucursal en Dayong Road.', price: '40-70 CNY por persona', priority: 'nice', more: 'Su especialidad es el 干锅三下锅, el sanxiaguo seco, eligiendo ingredientes.' },
  ],

  markets: [
    { name: 'Yanhuo Old Street', nameZh: '烟火老街', what: 'La calle de street food dentro de 72 Qilou: snacks de Hunan, carnes, arroz glutinoso y especialidades Tujia.', priority: 'nice', more: 'Merece la pena si vais a 72 Qilou. Ir expresamente solo por el "mercado", no: es muy turístico y forma parte de la atracción.' },
    { name: 'Jiefang Road', nameZh: '解放路步行街', what: 'Mucho más local: pequeños restaurantes y puestos.', priority: 'optional', more: 'Mejor si buscáis ambiente urbano real, pero por sí solo no es una visita imprescindible.' },
  ],

  food: [
    { name: '土家三下锅', pinyin: 'Tujia Sanxiaguo', what: 'El plato obligatorio: cazuela con tres ingredientes principales (panceta, cerdo, callos, tofu, ternera). Pedid 微辣 si no queréis nivel Hunan.', kind: 'salado' },
    { name: '腊肉', pinyin: 'Làròu', what: 'Cerdo ahumado y curado de las montañas de Xiangxi, salteado con chile y verduras.', kind: 'salado' },
    { name: '岩耳炖土鸡', pinyin: 'Yan’er dun tuji', what: 'Pollo guisado con un hongo que crece en las paredes rocosas. Buena opción si queréis algo más suave.', kind: 'salado' },
    { name: '合渣', pinyin: 'Hézhā', what: 'Preparación Tujia de soja molida y verduras. Comida de casa, poco conocida fuera de la región.', kind: 'salado' },
    { name: '葛根粉', pinyin: 'Gěgēn fěn', what: 'Raíz de kudzu: en fideos, en preparados calientes o como postre espeso y translúcido.', kind: 'dulce' },
    { name: '糍粑', pinyin: 'Cíbā', what: 'Pastel de arroz glutinoso machacado, tostado o frito y con azúcar. El snack dulce local.', kind: 'dulce' },
    { name: '甜米酒', pinyin: 'Tián mǐjiǔ', what: 'Arroz fermentado dulce, muy habitual acompañando la cocina regional.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'Tianmen Cave de frente', nameZh: '天门洞', how: 'Desde la base de los 999 escalones, mirando frontalmente al arco. La gente subiendo da la escala y hace que parezca todavía más enorme.' },
    { name: 'Las 99 curvas', nameZh: '通天大道', how: 'Desde el recorrido alto, buscando el ángulo donde se ve la carretera serpenteando por debajo. Es uno de los planos más reconocibles.' },
    { name: 'Pasarela de Panlong', nameZh: '盘龙崖玻璃栈道', how: 'Cristal, vacío y las curvas de la carretera al fondo. La más interesante de las de cristal.' },
    { name: 'La Puerta del Cielo al anochecer', how: 'La secuencia buena es luz de tarde → blue hour → iluminación. El sol se pone sobre las 18:00 el 23 de octubre.' },
    { name: '72 Qilou', how: 'Si vais, NO hagáis la foto pegados al edificio: cruzad Wulingshan Avenue y alejaos unos 100 m para que entre toda la estructura vertical.' },
  ],

  shopping: [
    { name: 'Nada específico', what: 'Aquí no dedicaría tiempo a comprar: no hay nada comparable a lo que vais a encontrar en Shanghái.', priority: 'optional', more: 'Si aparece durante la ruta: productos de kudzu (葛根), té, snacks Tujia y el brocado 西兰卡普 si encontráis una pieza que os guste de verdad. 72 Qilou tiene zona de artesanía, pero planteada para visitantes.' },
  ],

  trends: [
    { name: '72 Qilou de noche', verdict: 'si', why: 'Sigue muy popular en 2026 y merece la pena visualmente, pero nunca por encima de Tianmen nocturno.' },
    { name: 'Tianmen Cave iluminada', verdict: 'si', why: 'Muy interesante justamente porque ya vais a estar ahí. Pero necesita producto nocturno contratado.' },
    { name: 'La foto en los 999 escalones', verdict: 'si', why: 'Viral, sí, pero forma parte natural de la visita.' },
    { name: 'Hacer varias pasarelas de cristal', verdict: 'quizas', why: 'Muy virales, pero no dedicaría una hora de cola a repetir. Elegid una buena.' },
  ],

  bookings: [
    {
      activityId: 'act-6',
      title: 'Entrada de Tianmen Mountain',
      when: 'Desde el 23 de septiembre (ventana de 30 días)',
      price: '~288 CNY, con los transportes principales incluidos',
      how: 'Trip.com o Klook, con pasaporte. Franja horaria: reservad la vuestra en cuanto se abra.',
      alert: 'La venta regular termina a las 16:00 y el parque abre a las 08:00. Al reservar, comprobad el esquema de rutas del día: están alteradas por las obras.',
    },
    {
      title: '🔲 Tour nocturno de Tianmen — lo único por cerrar',
      when: 'Cuanto antes',
      price: 'Producto organizado, la entrada va aparte',
      how: 'Preguntad en el Thousand Hotel por 天门山夜游 o 天门洞夜景. Y aclarad que NO preguntáis por 天门狐仙.',
      alert: 'No hay norma oficial publicada que permita a un visitante con entrada diurna quedarse hasta las 21:00 por su cuenta: lo que existe son productos nocturnos organizados. No contéis con quedaros arriba sin contratarlo.',
    },
  ],

  ranking: {
    must: ['Tianmen de día', 'La Puerta del Cielo y los 999 escalones', 'Las 99 curvas', 'Una buena pasarela de cristal', 'Tianmen nocturno si se confirma'],
    nice: ['72 Qilou como plan B', 'Sanxiaguo', 'Templo de Tianmen'],
    optional: ['Centro y Jiefang Road'],
    skip: ['El parque de Wulingyuan ese mismo día', 'Tianmen nocturno Y 72 Qilou a la vez', 'Dedicar tiempo a compras'],
  },
};

const wulingyuan: CityPlan = {
  cityId: 'wulingyuan',
  headline: 'Dos noches y dos excursiones grandes. El mejor Wulingyuan no es el que acumula puntos, sino el que os deja hacer bien el Gran Cañón y el Parque Avatar sin llegar destrozados al tren del 26.',
  keyNotes: [
    '🆕 ESPECTÁCULO DE DRONES: en 2026 hay exhibiciones habituales de 1.500 drones sobre el río Suoxi, y el periodo previsto cubre vuestras fechas. Está en Wulingyuan, así que no quita tiempo de montaña. NO fijéis hora todavía: en agosto pasó de las 20:30 a las 19:50 y hubo cancelaciones por viento. Comprobadlo 2-3 días antes en WeChat, buscando 武陵源发布.',
    '🔄 MEMORIZAD EL PLAN B del domingo: si al llegar el Bailong tiene más de 60 min de cola, NO esperéis. Subid por el teleférico de Tianzi, haced Tianzi primero, luego Yuanjiajie, y bajad por el Bailong. Es el mismo recorrido al revés y os puede salvar el día.',
    '🎟️ En el Gran Cañón, coged la LÍNEA B completa (puente + descenso + cañón + barco), no la B1, que se salta buena parte del recorrido inferior.',
    '⚠️ Xibu Street: sigue muy promocionada, pero hay reseñas de julio-agosto de 2026 que dicen que la parte histórica principal está cerrada. Como está a 1,3 km, si está abierta bien y si no, no habéis perdido nada.',
  ],
  base: [
    'East Gate del parque a ~1 km',
    'Estación de autobuses a 680 m',
    'Teatro de Charming Xiangxi a 620 m',
    'Xibu Street a 1,3 km',
    'Gran Cañón a ~30 km (35-45 min)',
    'Zhangjiajie West a 26-28 km',
  ],

  days: [
    {
      id: 'wl-d1',
      dateText: 'Sábado 24 de octubre',
      title: 'Gran Cañón y Puente de Cristal',
      zone: 'Cañón por el día, Wulingyuan por la noche',
      blocks: [
        {
          time: '~09:45',
          title: 'Llegada al hotel',
          detail: 'Maletas o early check-in (abre a las 10:00) y pedid el Didi inmediatamente.',
          kind: 'move',
          alert: true,
          more: 'No os entretengáis desayunando ni buscando transporte público: hoy la hora manda.',
        },
        {
          time: '~10:05',
          title: 'Didi al Gran Cañón',
          detail: 'Pedidlo a 张家界大峡谷景区 o 张家界大峡谷游客中心. ~30 km, 35-45 min, ~55-70 CNY.',
          kind: 'move',
          more: 'La alternativa es andar 680 m a la estación de autobuses y coger el bus (¥12, ~30 min), pero sale cada 40 min y perder una salida os destroza el margen.',
        },
        {
          time: '~11:00',
          title: 'Entrada al cañón, línea B',
          detail: 'Puente de Cristal → pasarela → descenso → Rainbow Square → sendero → Touch Cave → lago → barco.',
          kind: 'ticket',
          alert: true,
          more: 'Son 3-4 h dentro. Coged la línea B completa, no la B1. El recinto abre de 08:00 a 16:00. Llevad el pasaporte original: la entrada es nominal. Nada de mochilas grandes, trípodes, drones ni palo selfie — hay restricciones y taquillas. El puente puede cerrarse por viento o tormenta, y en octubre el fondo del cañón se siente bastante más fresco: llevad una capa fina.',
        },
        {
          time: 'Comida',
          title: 'No perdáis una hora comiendo',
          detail: 'Llevad agua, fruta y algo de picar. Ya comeréis bien en Wulingyuan al volver.',
          kind: 'food',
        },
        {
          time: 'Tarde',
          title: 'Vuelta al hotel y descanso',
          detail: 'Didi de vuelta, ducha y parar. Mañana es el día grande.',
          kind: 'rest',
          more: 'Este descanso es importante de verdad: el domingo son 8-9 horas de parque.',
        },
        {
          time: 'Noche',
          title: 'Elegid UNA cosa, no tres',
          detail: 'Cena local + drones si los hay, o Charming Xiangxi, o Xibu Street y night market.',
          kind: 'food',
          more: 'Mi favorita: cena local, comprobar si hay show de drones y paseo tranquilo. Charming Xiangxi (魅力湘西) está a 620 m del hotel, con sesiones sobre las 18:00, 19:20 y 20:40 y desde ~168 CNY — buena opción solo si volvéis del cañón con ganas. Lo que NO haría es encadenar Charming Xiangxi + drones + Xibu + mercado.',
        },
      ],
    },
    {
      id: 'wl-d2',
      dateText: 'Domingo 25 de octubre',
      title: 'Parque Avatar: la jornada a proteger',
      zone: 'Zhangjiajie National Forest Park',
      blocks: [
        {
          time: '06:40-06:50',
          title: 'Salir del hotel',
          detail: 'East Gate (武陵源标志门) está a 1 km: Didi de 3-5 min o 10-15 andando.',
          kind: 'move',
          alert: true,
          more: 'A esa hora yo cogería Didi para empezar descansados. Objetivo: estar en la entrada sobre las 06:45-06:55. El desayuno del hotel abre a las 06:30, así que entra justo.',
        },
        {
          time: 'Primera franja',
          title: 'Eco-bus y ascensor Bailong',
          detail: '15-20 min de bus y subida en el Bailong (~65 CNY).',
          kind: 'ticket',
          alert: true,
          more: '🔄 Si os dicen que el Bailong tiene más de 60 min de cola, aplicad el plan B: bus al teleférico de Tianzi, subís por ahí, hacéis Tianzi, luego Yuanjiajie y bajáis en Bailong. El domingo es justo el peor día para el Bailong en sentido ascendente.',
        },
        {
          time: '~2 h',
          title: 'Yuanjiajie 袁家界',
          detail: 'Mihun Terrace → Back Garden → Qiankun Pillar (la montaña Avatar) → Primer Puente bajo el Cielo.',
          kind: 'visit',
          more: 'Es el núcleo imprescindible. Mihun Terrace (迷魂台) es probablemente vuestro mejor mirador de todo Zhangjiajie.',
        },
        {
          time: 'Mediodía',
          title: 'Bus a Tianzi y comer algo rápido',
          detail: '20-30 min de bus. No busquéis "el mejor restaurante" ahí arriba.',
          kind: 'food',
          more: 'Las zonas de restauración de dentro son caras y funcionales. La comida Tujia de verdad, para la cena en Wulingyuan.',
        },
        {
          time: '1-1,5 h',
          title: 'Tianzi Mountain 天子山',
          detail: 'He Long Park → Yubi Peak (御笔峰) → Fairy Scattering Flowers → miradores.',
          kind: 'visit',
        },
        {
          time: 'Bajada',
          title: 'Teleférico de Tianzi (~72 CNY)',
          detail: 'Precioso. Intentad sitio con ventana o delante.',
          kind: 'move',
        },
        {
          time: 'Noche',
          title: 'Cena de Sanxiaguo y a dormir pronto',
          detail: 'Esa noche no añadiría espectáculo: mañana os levantáis antes de las 05:30.',
          kind: 'food',
          alert: true,
          more: 'Dejad preparadas las dos gestiones: coche o Didi programado para las 05:35-05:45 y el check-out anticipado avisado en recepción. Y pedid el desayuno para llevar: 可以帮我们准备打包早餐吗？',
        },
      ],
    },
    {
      id: 'wl-d3',
      dateText: 'Lunes 26 de octubre',
      title: 'El traslado más frágil del viaje',
      zone: 'Zhangjiajie West',
      blocks: [
        {
          time: '05:35-05:45',
          title: 'Salir del hotel',
          detail: '10 minutos antes de lo previsto. 26-28 km, 25-40 min según tráfico, ~55-100 CNY.',
          kind: 'move',
          alert: true,
          more: 'Teníamos apuntado salir a las 05:48 y es viable, pero aquí prefiero regalarle 10 minutos al viaje. No confiéis en encontrar un Didi espontáneo a las 05:40 como único plan: dejadlo programado y pedid ayuda en recepción la noche antes.',
        },
        {
          time: '07:28',
          title: 'Tren G1367 a Shangrao',
          detail: 'Llegada a las 13:39.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    { name: 'Parque Nacional de Zhangjiajie', nameZh: '张家界国家森林公园', what: 'El imprescindible absoluto. Vuestra puerta es la East Gate, justo al lado del hotel.', zone: '~1 km', time: '8-9 h', ticket: '~236 CNY, 4 días, nominal', priority: 'must', more: 'Los buses internos van incluidos; el Bailong y los teleféricos se pagan aparte.' },
    { name: 'Yuanjiajie', nameZh: '袁家界', what: 'Las montañas flotantes: Mihun Terrace, Qiankun Pillar y el Primer Puente bajo el Cielo.', zone: 'Dentro del parque', time: '~2 h', ticket: 'Incluida', priority: 'must' },
    { name: 'Tianzi Mountain', nameZh: '天子山', what: 'He Long Park, Yubi Peak y Fairy Scattering Flowers. Las agujas verticales de piedra.', zone: 'Dentro del parque', time: '1-1,5 h', ticket: 'Incluida', priority: 'must' },
    { name: 'Ascensor Bailong', nameZh: '百龙天梯', what: '88 segundos y sale de dentro de la montaña al vacío. Es una atracción en sí.', zone: 'Dentro del parque', time: '15 min + cola', ticket: '~65 CNY', priority: 'must' },
    { name: 'Gran Cañón y Puente de Cristal', nameZh: '张家界大峡谷玻璃桥', what: 'Independiente del parque: puente, descenso al cañón, sendero y barco.', zone: '~30 km', time: '3-4 h', ticket: 'Nominal, con franja', priority: 'must' },
    { name: 'Charming Xiangxi', nameZh: '魅力湘西', what: 'Espectáculo de cultura de las minorías: danzas, boda Tujia, percusión Miao y acrobacias.', zone: '620 m', time: '1,5 h', ticket: 'Desde ~168 CNY', priority: 'nice', more: 'Sesiones sobre las 18:00, 19:20 y 20:40 en temporada alta; confirmad las de octubre. Plan opcional del sábado, solo si volvéis con ganas.' },
    { name: 'Espectáculo de drones', what: '1.500 drones sobre el río Suoxi formando Tianzi Mountain, diseños Tujia y águilas.', zone: 'En Wulingyuan', time: '20-30 min', ticket: 'Gratis', priority: 'nice', more: 'Novedad de 2026 y con mucha repercusión. No exige sacrificar tiempo de montaña. Comprobad horario y cancelaciones 2-3 días antes en WeChat: 武陵源发布.' },
    { name: 'Baofeng Lake', nameZh: '宝峰湖', what: 'Lago encajado entre montañas con paseo en barco. ~110 CNY, incluye barco y eco-bus.', zone: '10 min en taxi', time: '2-3 h', ticket: '~110 CNY', priority: 'optional', more: 'Bonito, pero después del Parque Avatar y el Gran Cañón no sacrificaría descanso por él.' },
    { name: 'Yellow Dragon Cave', nameZh: '黄龙洞', what: 'Gran cueva kárstica, de las más conocidas de China. ~118 CNY con barco.', zone: '9 km pasada la East Gate', time: '2 h', ticket: '~118 CNY', priority: 'optional' },
    { name: 'Golden Whip Stream, Huangshi, Yangjiajie', what: 'Los otros grandes sectores del parque.', zone: 'Dentro', time: 'Medio día cada uno', ticket: 'Incluida', priority: 'skip', more: 'No caben en un solo día. La planificación sensata de una jornada es Yuanjiajie + Tianzi y reservar 8-9 h contando colas y transportes.' },
  ],

  restaurants: [
    { name: 'Tangshifu', nameZh: '唐师傅湘西名菜', what: 'De los locales con más referencias, en Wuling Road. Pato aromático, ternera salteada, pescado con chile picado y fideos de kudzu.', price: '50-100 CNY por persona', when: 'Cena del 24 o del 25', priority: 'must' },
    { name: 'Fu Zheng Yi Sanxiaguo', nameZh: '富正毅三下锅', what: 'Para el plato emblemático: la cazuela local de tres ingredientes. Sucursal junto a Charming Xiangxi.', price: '80-150 CNY los dos', when: 'Cena del domingo, tras el parque', priority: 'must', more: 'Pedid 微辣 (poco picante): en Hunan, "poco picante" sigue picando bastante.' },
    { name: 'Zhai Zi Li De Bo Bo Cai', what: 'Cocina local bien valorada, también en Wuling Road.', when: 'Comodín si hay cola en las otras', priority: 'nice' },
  ],

  markets: [
    { name: 'Old Place Night Market', what: 'Street food de verdad en Jundi Road: parrillas, brochetas, tofu y noodles. Suele funcionar de 17:00 a 23:00.', priority: 'nice', more: 'Mejor entenderlo como cena informal que como atracción. Los puestos aceptan Alipay y WeChat.' },
    { name: 'Xibu Street', nameZh: '溪布街', what: 'Restaurantes, tiendas y ambiente nocturno a 1,3 km.', priority: 'optional', more: '⚠️ Muy promocionada todavía, pero reseñas de julio-agosto de 2026 dicen que la parte histórica principal está cerrada y solo funcionan los alrededores. Como está cerquísima: si abre, paseo de 30-45 min; si no, no habéis perdido nada.' },
  ],

  food: [
    { name: '三下锅', pinyin: 'Sānxiàguō', what: 'El plato número uno de Zhangjiajie: cazuela seca o semiseca de varios ingredientes, bastante picante.', kind: 'salado' },
    { name: '土家腊肉', pinyin: 'Tǔjiā làròu', what: 'Cerdo curado y ahumado Tujia. Probadlo salteado con bambú (腊肉炒笋).', kind: 'salado' },
    { name: '岩耳炖土鸡', pinyin: 'Yan’er dun tuji', what: 'Pollo guisado con un hongo de montaña. Más suave y reconfortante.', kind: 'salado' },
    { name: '酸汤鱼', pinyin: 'Suāntāng yú', what: 'Pescado en caldo ácido y ligeramente picante, con verduras fermentadas.', kind: 'salado' },
    { name: '臭豆腐', pinyin: 'Chòu dòufu', what: 'Tofu fermentado y frito, muy fácil de encontrar en los puestos nocturnos.', kind: 'salado' },
    { name: '烤豆腐', pinyin: 'Kǎo dòufu', what: 'Tofu a la brasa con chile, comino y pimienta. ¥3-5 la brocheta.', kind: 'salado' },
    { name: '葛根粉', pinyin: 'Gégēnfěn', what: 'Kudzu, muy típico de estas montañas. Lo veréis dulce y salado.', kind: 'dulce' },
    { name: '糍粑', pinyin: 'Cíbā', what: 'Pastelito de arroz glutinoso, a veces asado y con azúcar o sésamo.', kind: 'dulce' },
    { name: '糯米粑粑', pinyin: 'Nuòmǐ bābā', what: 'Pastelitos de arroz glutinoso. Aquí hay mucha menos tradición de postres que en el resto del viaje.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'Mihun Terrace', nameZh: '迷魂台', how: 'Vuestro POV número uno. Poneos hacia el lateral derecho del mirador, con una persona en primer plano y la masa de pilares detrás. Con bruma parecen montañas flotantes.' },
    { name: 'Qiankun Pillar', nameZh: '乾坤柱', how: 'No fotografiéis solo "la roca Avatar": buscad capas sucesivas de pilares y dejad el pilar ligeramente descentrado.' },
    { name: 'Primer Puente bajo el Cielo', nameZh: '天下第一桥', how: 'Primero el puente natural desde el mirador, después una foto del vacío entre los dos macizos.' },
    { name: 'Ascensor Bailong', nameZh: '百龙天梯', how: 'Grabad VÍDEO vertical justo cuando sale de la montaña y aparece el valle de golpe: la transición vale más que una foto fija. Dura unos 88 segundos.' },
    { name: 'Yubi Peak', nameZh: '御笔峰', how: 'Las agujas de piedra ocupando los dos tercios inferiores y cielo o bruma en el tercio de arriba. Con nubes bajas es espectacular.' },
    { name: 'Puente de Cristal', how: 'Dos fotos: una persona caminando de espaldas por el centro del puente, y otra desde el sendero del fondo del cañón incluyendo el puente arriba — así se entiende la escala real.' },
  ],

  shopping: [
    { name: 'Nada importante', what: 'Wulingyuan no es una parada de compras. No más de 30-45 min.', priority: 'optional', more: 'Si os apetece algo local: productos de kudzu (葛根), té y snacks de Hunan, bordados y tejidos Tujia, y carne curada envasada solo si sabéis que podéis llevarla al resto del viaje. Lo demás, para Shanghái.' },
  ],

  trends: [
    { name: 'El espectáculo de 1.500 drones', verdict: 'si', why: 'La novedad de 2026 y con mucha repercusión en redes chinas. Y lo mejor: está en Wulingyuan, así que no quita tiempo de montaña.' },
    { name: 'Fotos estilo "inmortal" en Mihun Terrace', verdict: 'si', why: 'Merece la pena por el punto fotográfico. Pero no alquilaría hanfu ni montaría una sesión con el tiempo que tenéis.' },
    { name: 'Xibu Street', verdict: 'quizas', why: 'Muy promocionada, pero con cierres recientes en la parte histórica. Está al lado: id si os apetece, sin contar con ella.' },
  ],

  bookings: [
    {
      activityId: 'act-10',
      title: 'Gran Cañón y Puente de Cristal',
      when: 'Reservar con 3-5 días, nunca el mismo día',
      price: '~178 CNY como cifra de trabajo',
      how: 'Entrada nominal con pasaporte y franja horaria. Pedid la LÍNEA B completa y una franja sobre las 11:00.',
      alert: 'Los precios no son consistentes entre canales: comprobad el importe final en el canal de compra al reservar. El recinto abre de 08:00 a 16:00.',
    },
    {
      activityId: 'act-7',
      title: 'Parque Avatar / Forest Park',
      when: 'Entre el 26 de septiembre y el 18 de octubre',
      price: '~236 CNY la entrada de 4 días + 65 del Bailong + 72 del teleférico de Tianzi',
      how: 'Entrada nominal vinculada al pasaporte, por puerta y franja. La vuestra es East Gate (武陵源标志门), primera franja disponible.',
      alert: 'Pedid la franja de 06:30-07:00 o la de 07:00-07:30.',
    },
    {
      title: 'Charming Xiangxi y el show de drones',
      when: 'Cerca del viaje',
      price: 'Charming Xiangxi desde ~168 CNY · drones, gratis',
      how: 'El teatro se puede decidir al llegar. Los drones NO se reservan.',
      alert: 'Comprobad los drones 24-48 h antes por meteorología, en WeChat: 武陵源发布.',
    },
  ],

  ranking: {
    must: ['Parque Avatar (Yuanjiajie y Tianzi)', 'Gran Cañón y Puente de Cristal', 'Ascensor Bailong', 'Mihun Terrace'],
    nice: ['Espectáculo de drones', 'Charming Xiangxi', 'Sanxiaguo', 'Night market de Jundi Road'],
    optional: ['Baofeng Lake', 'Yellow Dragon Cave', 'Xibu Street'],
    skip: ['Golden Whip Stream completo', 'Huangshi Village', 'Yangjiajie a fondo', 'Encadenar teatro + drones + Xibu la misma noche'],
  },
};

const shangrao: CityPlan = {
  cityId: 'shangrao',
  headline: 'Dormir dentro del valle os da justo los dos mejores momentos: la iluminación de la tarde y la mañana temprana con las calles vacías. Aquí no hay que rellenar huecos.',
  keyNotes: [
    '🌅 El 26 el sol se pone a las 17:36. Ese es el momento que manda: hay que estar en Baiheya o Baige Bridge desde las 17:00, y NO cenando. La secuencia día → hora dorada → hora azul → encendido es lo que habéis venido a ver.',
    '🌄 El 27 amanece a las 06:21. De 07:00 a 08:30 el valle está prácticamente vacío: es la ventaja real de dormir dentro y probablemente la experiencia más especial de la parada.',
    '❌ No salgáis a Shangrao a cenar ni a comprar. Tenéis unas 20 horas y todo lo bueno está dentro del recinto, que abre hasta las 23:00.',
    '🎭 Los horarios de espectáculos de octubre no están publicados y han ido cambiando. Fotografiad el tablón del Visitor Center al llegar. Si un espectáculo os obliga a dejar el mejor punto del atardecer, quedaos con el atardecer.',
  ],
  base: [
    'El hotel está dentro del Visitor Service Center',
    'Baiheya a 15-25 min de paseo',
    'Todo el valle se recorre andando',
    'Estación de Shangrao a ~40 km, 1 hora',
  ],

  days: [
    {
      id: 'sr-d1',
      dateText: 'Lunes 26 de octubre',
      title: 'Llegada, el valle de día y el encendido',
      zone: 'Wangxian Valley entero',
      blocks: [
        {
          time: '13:39',
          title: 'Llegada a Shangrao',
          detail: 'Didi directo al Visitor Service Center: ~1 h, 150-200 CNY el coche.',
          kind: 'move',
          more: 'Hay bus directo desde la estación, pero el horario publicado es de verano y puede cambiar. Con dos personas y maletas, el Didi os quita incertidumbre.',
        },
        {
          time: '~15:00',
          title: 'Llegada al hotel',
          detail: 'El check-in es a las 17:00: dejad maletas y empezad el recorrido ya.',
          kind: 'rest',
          more: 'Confirmad el procedimiento de acceso como huéspedes y fotografiad el horario de espectáculos del día.',
        },
        {
          time: '15:15-17:00',
          title: 'El valle con luz',
          detail: 'Qingyun Bridge → cascadas 三叠水 → pasarela del acantilado → mirador de cristal → Baiheya.',
          kind: 'visit',
          more: 'Sin correr. La idea es acabar arriba, en la parte panorámica, justo antes del atardecer.',
        },
        {
          time: '17:00-18:00',
          title: 'El momento importante',
          detail: 'Baiheya y Baige Bridge. Puesta de sol a las 17:36.',
          kind: 'visit',
          alert: true,
          more: 'No cenéis ahora. Haced la foto con algo de luz y repetidla 20-30 min después, con las casas ya encendidas. El encendido de Lanyue Bridge suele ser sobre las 18:00.',
        },
        {
          time: '18:00-20:00',
          title: 'El valle iluminado',
          detail: 'Baige Bridge → Lanyue Bridge → Zuixian Street → Baiwei Street, picoteando.',
          kind: 'food',
          more: 'Aquí es cuando aparece el sitio que habéis visto en redes. Para cenar, picoteo de 3-4 especialidades mientras paseáis (30-50 CNY por persona) me parece mejor que sentaros. Si preferís mesa, Baiweixian está frente a Lanyue Bridge, ~60 CNY por persona: comed pronto o tarde, nunca en el atardecer.',
        },
        {
          time: 'Desde las 20:00',
          title: 'Espectáculo y segundo paseo',
          detail: 'Si hay 望仙燃梦 o 仙火惊焰, uno de los dos. Luego volved a los puentes sin prisa.',
          kind: 'visit',
          more: 'Dormís dentro: no tenéis que salir con la masa de visitantes hacia Shangrao. Esa es toda la ventaja.',
        },
      ],
    },
    {
      id: 'sr-d2',
      dateText: 'Martes 27 de octubre',
      title: 'El valle vacío y salida',
      zone: 'Wangxian Valley',
      blocks: [
        {
          time: '07:00-08:30',
          title: 'El valle para vosotros solos',
          detail: 'Calles antiguas → Qingyun Bridge → cascadas → orilla del río.',
          kind: 'visit',
          more: 'Volved a los puntos que ayer estaban abarrotados. Si hay niebla sobre el valle, mejor todavía. No hace falta levantarse a las 6:00, pero esta franja es oro.',
        },
        {
          time: '08:30-10:00',
          title: 'Desayuno y segunda vuelta',
          detail: 'Sin intentar cubrirlo todo sistemáticamente.',
          kind: 'food',
        },
        {
          time: '10:00-11:15',
          title: 'Último paseo',
          detail: 'Repetid Baiheya o Lanyue si os encantaron, o entrad en los talleres.',
          kind: 'shop',
        },
        {
          time: '11:30-11:40',
          title: 'Salir hacia Shangrao',
          detail: '~40 km, 1 hora. En la estación sobre las 12:35-12:45.',
          kind: 'move',
          alert: true,
          more: 'Teníamos apuntado salir a las 11:45; yo saldría 5-15 min antes. Pedid en recepción la noche anterior que os dejen el coche preparado. Destino para copiar: 上饶站.',
        },
        {
          time: '13:48',
          title: 'Tren G1370 a Shanghái',
          detail: 'Llegada a Hongqiao a las 16:25.',
          kind: 'move',
          alert: true,
        },
      ],
    },
  ],

  highlights: [
    { name: 'Baiheya', nameZh: '白鹤崖', what: 'La imagen del valle: los edificios escalonados colgados del acantilado. Imprescindible de día y encendido.', zone: '15-25 min de paseo', time: '30-45 min', ticket: 'Incluida en el hotel', priority: 'must' },
    { name: 'Baige Bridge', nameZh: '百舸桥', what: 'Más interesante fotográficamente que Lanyue: entra puente, valle, río, casas y acantilado iluminado.', zone: 'Dentro', time: '15-20 min', ticket: 'Incluida', priority: 'must' },
    { name: 'Lanyue Bridge', nameZh: '揽月桥', what: 'De los puntos más reconocibles, sobre todo cuando se enciende y aparecen las luces del acantilado detrás.', zone: 'Dentro', time: '15-30 min', ticket: 'Incluida', priority: 'must' },
    { name: 'Qingyun Bridge y las cascadas', nameZh: '青云桥 · 三叠水', what: 'Puente, agua y cascadas. Funciona mucho mejor de día o a primera hora.', zone: 'Dentro', time: '30-45 min', ticket: 'Incluida', priority: 'must', more: 'Imprescindible, pero no sacrifiquéis el atardecer del lunes por verlo: dejadlo para la mañana del martes.' },
    { name: 'Pasarela del acantilado y mirador de cristal', nameZh: '悬崖栈道 · 玻璃眺台', what: 'Perspectivas altas y distintas del valle y los edificios.', zone: 'Dentro', time: '30-40 min', ticket: 'Incluida', priority: 'nice' },
    { name: 'Las calles del pueblo', nameZh: '百味街 · 醉仙街 · 岩铺街', what: 'La parte más animada: comida, talleres, farolillos y ambiente de fantasía china.', zone: 'Dentro', time: 'De paso', ticket: 'Incluida', priority: 'nice', more: 'No son tres visitas: las vais a atravesar mientras recorréis el valle.' },
    { name: 'Yangfu Square', nameZh: '杨府广场', what: 'Más interesante por los espectáculos que por la plaza en sí.', zone: 'Dentro', time: 'Según programa', ticket: 'Incluida', priority: 'nice' },
    { name: 'Salir a Shangrao', what: 'Cenar, comprar o ver algo fuera del recinto.', zone: 'Fuera', time: 'Horas', ticket: '—', priority: 'skip', more: 'Con 20 horas, cada salida son 20-40 minutos de gestión y desplazamiento para algo que resolvéis dentro.' },
  ],

  restaurants: [
    { name: 'Picoteo por las calles', nameZh: '百味街 · 醉仙街', what: 'Tres o cuatro especialidades pequeñas mientras seguís paseando. Es lo que menos interfiere con el encendido.', price: '30-50 CNY por persona', when: 'Cena del 26', priority: 'must', more: 'Dentro del recinto hay unos 13 establecimientos y alrededor de 80 tipos de snacks.' },
    { name: 'Baiweixian', nameZh: '百味鲜', what: 'Si preferís sentaros. Está frente a Lanyue Bridge, así que encaja con la ruta. Pollo tres tazas, pescado al vino y tortilla de boniato.', price: '~60 CNY por persona', priority: 'nice', more: 'Sin reserva. Comed pronto o tarde, evitando el momento del atardecer.' },
  ],

  markets: [
    { name: 'Las calles de snacks y talleres', nameZh: '百味街 · 醉仙街 · 作坊街', what: 'Street food, puestos pequeños, artesanía, talleres y farolillos. Lo más animado al caer la tarde.', priority: 'must', more: 'Merece la pena porque forma parte de vuestra ruta, no como visita aparte. No hay ningún mercado fuera por el que valga la pena abandonar el valle.' },
  ],

  food: [
    { name: '灯盏粿', pinyin: 'Dēngzhǎn guǒ', what: 'Masa de arroz típica del noreste de Jiangxi, rellena de verduras, bambú seco o carne. De lo que sí probaría.', kind: 'salado' },
    { name: '铅山烫粉', pinyin: 'Yanshan tangfen', what: 'Fideos de arroz calientes típicos del área de Shangrao. Muy local.', kind: 'salado' },
    { name: '江西炒粉', pinyin: 'Jiangxi chaofen', what: 'Fideos de arroz salteados. Sencillo pero muy de Jiangxi.', kind: 'salado' },
    { name: '芋饺', pinyin: 'Yùjiǎo', what: 'Dumplings cuya envoltura lleva taro.', kind: 'salado' },
    { name: '酒糟鱼', pinyin: 'Jiǔzāo yú', what: 'Pescado preparado con arroz fermentado. Sabor particular.', kind: 'salado' },
    { name: '三杯鸡', pinyin: 'Sānbēi jī', what: 'Pollo "tres tazas", un clásico del repertorio de Jiangxi.', kind: 'salado' },
    { name: '麻糍', pinyin: 'Mácí', what: 'Masa de arroz glutinoso, parecida a un mochi.', kind: 'dulce' },
    { name: '桂花凉粉', pinyin: 'Guìhuā liángfěn', what: 'Gelatina fría aromatizada con osmanthus.', kind: 'dulce' },
    { name: '冬瓜茶', pinyin: 'Dōngguā chá', what: 'Bebida dulce de calabaza de invierno. Hay un local acristalado que circula mucho en redes.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'Baige Bridge hacia Baiheya', nameZh: '百舸桥', how: 'Vuestro POV prioritario. Desde el puente, mirando hacia Baiheya y la parte escalonada. Hacedla con algo de luz y repetidla 20-30 min después, ya encendida.' },
    { name: 'Mirador de Baiheya', nameZh: '白鹤崖观景台', how: 'Vista elevada hacia el fondo del valle: tejados, puentes y luces acumulados.' },
    { name: 'Lanyue Bridge', nameZh: '揽月桥', how: 'Alejaos un poco en vez de disparar desde encima: así entra el puente iluminado, el reflejo y los edificios del acantilado.' },
    { name: 'La orilla del arroyo', nameZh: '溪流浅滩', how: 'Bajad el móvil casi al nivel del agua para coger el reflejo completo de las casas iluminadas. Funciona especialmente bien con móvil.' },
    { name: 'Ventana de Fujia Courtyard', nameZh: '福家小院', how: 'Desde la ventana del segundo piso, enmarcando el acantilado. Muy compartido en redes: merece la pena si no hay cola absurda.' },
    { name: 'Pared de farolillos de Zuixian', nameZh: '醉仙街灯笼墙', how: 'Más para retrato que para paisaje. Bonito, pero prescindible si hay cola: aquí hay rincones parecidos por todas partes.' },
  ],

  shopping: [
    { name: 'Artesanía y productos de Jiangxi', what: 'Talleres tradicionales, accesorios hanfu, snacks y productos tematizados del valle.', priority: 'optional', more: 'No es destino de compras: mirar, quizá un recuerdo, y seguir disfrutando. Lo serio, en Shanghái.' },
  ],

  trends: [
    { name: 'Baiheya iluminado', verdict: 'si', why: 'Es el gran motivo visual para venir.' },
    { name: 'Baige Bridge en hora azul', verdict: 'si', why: 'Probablemente vuestra mejor panorámica del viaje.' },
    { name: 'La mañana con las calles vacías', verdict: 'si', why: 'Paradójicamente, lo más especial de dormir dentro. Y no sale en ningún vídeo.' },
    { name: 'La ventana de Fujia Courtyard', verdict: 'quizas', why: 'Muy de Xiaohongshu, pero tiene sentido si no hay cola.' },
    { name: 'Alquilar hanfu para las fotos', verdict: 'quizas', why: 'Queda espectacular, pero entre elección, maquillaje y devolución se os va media estancia.' },
    { name: 'Esperar mucho por recrear una foto exacta', verdict: 'no', why: 'El valle tiene tantos encuadres que no hace ninguna falta.' },
  ],

  bookings: [
    {
      title: 'Nada que reservar',
      when: 'La entrada ya va incluida en el hotel',
      price: 'La entrada normal ronda los 140 CNY',
      how: 'Vuestra estancia la incorpora, que era justo lo que buscabais al elegir dormir dentro.',
      alert: 'No hace falta reservar restaurantes.',
    },
    {
      title: 'Lo que sí comprobaría 7-10 días antes',
      when: '~17-20 de octubre',
      price: '—',
      how: 'Horario de espectáculos de octubre, horario exacto de acceso para huéspedes, si hay acceso especial matinal o nocturno para los que dormís dentro, y hora de la iluminación.',
      alert: 'Mirad también los buses Shangrao ↔ Wangxian, pero solo como plan B: el horario publicado es de verano.',
    },
  ],

  ranking: {
    must: ['Baiheya de día y de noche', 'La hora azul y el encendido', 'Baige Bridge', 'Lanyue Bridge iluminado', 'Pasear de noche sin volver a Shangrao', 'La mañana temprano'],
    nice: ['Qingyun Bridge y cascadas', 'Pasarela del acantilado', 'Street food de las calles', 'Un espectáculo nocturno'],
    optional: ['Hanfu', 'Spots virales con cola', 'Compras'],
    skip: ['Salir a Shangrao durante la estancia', 'Añadir cualquier otra excursión'],
  },
};

const shanghai: CityPlan = {
  cityId: 'shanghai',
  headline: 'Cinco noches y cada día con identidad propia: el Shanghái histórico, Disney, el futurista, y el creativo y de diseño. Sin cruzar la ciudad continuamente.',
  keyNotes: [
    '❤️ El mercado de las bodas de People’s Park es en sábado, y vosotros tenéis el sábado 31 con el hotel a 10 minutos andando. La franja activa es de 11:00 a 16:00. Es una actividad social real, no una atracción: fotos de ambiente, nada de primeros planos de la gente ni de las fichas.',
    '🥟 Qiao Ai Lai Lai Xiao Long (Tianjin Road, Huangpu) está en la guía Michelin y cae de camino entre Yuyuan y el Bund. Vais en temporada de cangrejo peludo: pedid el xiaolongbao de huevas de cangrejo. Michelin avisa de más afluencia justo por eso, así que id pronto y asumid cola.',
    '🌿 Novedad de septiembre de 2026: ya existe un paseo ribereño continuo por Suzhou Creek que conecta M50 con 1000 Trees. Ese bloque del sábado tiene ahora más sentido que nunca: se llega andando viendo cómo el paisaje industrial se convierte en el edificio de Heatherwick.',
    '🎟️ Disney es de nombre real: pasaporte FÍSICO original, con nombre y número idénticos a la compra. No valen fotos ni copias. Y comprad por canales oficiales o partners autorizados, comparando siempre con el precio de Disney.',
  ],
  base: [
    'People’s Park y el mercado de bodas, a 10 min andando',
    'Nanjing East Road empieza al lado',
    'Huanghe Road, la calle gastronómica, en la puerta',
    'El Bund a ~2 km',
    'Yuyuan a ~2,5 km',
    'Wukang y la concesión francesa a ~5 km',
  ],

  days: [
    {
      id: 'sh-d1',
      dateText: 'Martes 27 de octubre',
      title: 'Llegada y primer contacto',
      zone: 'People’s Square y Nanjing Road',
      blocks: [
        { time: '16:25', title: 'Llegada a Hongqiao', detail: 'Didi al hotel: 30-45 min según tráfico. En el hotel sobre las 18:00.', kind: 'move' },
        { time: 'Tarde', title: 'Andad, sin checklist', detail: 'Hotel → People’s Square → Nanjing East Road. Hoy toca aterrizar en Shanghái.', kind: 'visit', more: 'Si tenéis energía, seguid por Nanjing hasta el Bund y ved el primer skyline nocturno. Si estáis cansados, dad media vuelta: el Bund lo veréis bien mañana.' },
        { time: 'Cena', title: 'Shengjianbao o Huanghe Road', detail: 'Yang’s Fried Dumpling (178 Ningbo Rd) o cualquier sitio de la calle gastronómica de al lado.', kind: 'food', more: 'No gastaría hoy el Michelin: mejor que sea una comida con margen y no dependiendo de la hora a la que lleguéis.' },
      ],
    },
    {
      id: 'sh-d2',
      dateText: 'Miércoles 28 de octubre',
      title: 'El Shanghái histórico y el Bund',
      zone: 'Huangpu',
      blocks: [
        { time: '09:00-09:30', title: 'Yu Garden 豫园', detail: 'Jardín Ming. 1-1,5 h. ¥40 en temporada alta.', kind: 'ticket', alert: true, more: 'Abre de 09:00 a 16:30, última entrada a las 16:00, y CIERRA LOS LUNES — por eso va hoy. Ojo con la distinción: el jardín histórico es de pago; el bazar exterior es gratis.' },
        { time: 'Mañana', title: 'Puente de los Nueve Recodos y bazar', detail: 'Otra hora y media. Turístico, sí, pero aquí turístico no significa prescindible.', kind: 'visit' },
        { time: 'Mediodía', title: 'Qiao Ai Lai Lai Xiao Long', detail: 'Tianjin Road, Huangpu. Xiaolongbao de cerdo y, sobre todo, de huevas de cangrejo.', kind: 'food', alert: true, more: '~30-70 CNY por persona. Está en la guía Michelin (no es estrella: es selección y Bib Gourmand). En los mapas aparece en el 504 y Michelin da el 506 de Tianjin Road: buscadlo por el nombre en Amap, no por el número.' },
        { time: 'Tarde', title: 'Nanjing Road hacia el río', detail: 'Desde Tianjin Road estáis perfectamente colocados. No volvemos al hotel.', kind: 'shop' },
        { time: 'Atardecer', title: 'El Bund', detail: 'Estad antes de la puesta de sol: Pudong con luz → hora azul → skyline encendido.', kind: 'visit', alert: true, more: 'Encuadrad la Perla de Oriente, la Jin Mao, la SWFC y la Shanghai Tower juntas. No miréis mucho el reloj.' },
        { time: 'Noche', title: 'Vuelta natural', detail: 'Bund → Nanjing East Road → People’s Square → hotel.', kind: 'move' },
      ],
    },
    {
      id: 'sh-d3',
      dateText: 'Jueves 29 de octubre',
      title: 'Shanghai Disneyland',
      zone: 'Día completo, nada más',
      blocks: [
        { time: '06:30-07:00', title: 'Didi al parque', detail: '40-55 min. Objetivo: estar antes de la apertura.', kind: 'move', alert: true, more: 'Ajustad la hora exacta cuando Disney publique el horario del 29. La alternativa es metro: línea 2 hasta Jiangsu Road y línea 11 hasta Disney Resort, 55-70 min puerta a puerta, pero para la ida prefiero Didi.' },
        { time: 'Día', title: 'Las cuatro que priorizaría', detail: 'Zootopia: Hot Pursuit · TRON · Piratas del Caribe · Soaring Over the Horizon.', kind: 'visit', more: 'Recorred también el área de Zootopia entera, no solo la atracción. Y no penséis "Piratas ya lo conocemos": esta versión es distinta tecnológica y narrativamente. El Mine Train queda por debajo de esas cuatro si hay que elegir.' },
        { time: 'Colas', title: 'La regla del Premier Access', detail: 'Si TRON está en 45 min y Zootopia en 55, esperad. Si están en 100 y 120 y se mantiene, comprad uno o dos sueltos.', kind: 'ticket', more: 'Nada de paquete grande por adelantado. Se vincula al billete y se compra desde los canales oficiales.' },
        { time: 'Comida', title: 'Una comida sentados a mediodía', detail: 'Y luego snacks. No crucéis el parque por un restaurante concreto.', kind: 'food', more: 'La gastronomía china ya la tenéis fuera: aquí lo que importa es no perder tiempo ni piernas.' },
        { time: 'Noche', title: 'Quedaos al espectáculo final', detail: 'No me iría antes salvo agotamiento real. Es el año del 10º aniversario.', kind: 'visit', more: 'TRON y Zootopia ganan muchísimo de noche. Para la foto del castillo, retroceded lo suficiente para que entre el castillo entero con las proyecciones.' },
      ],
    },
    {
      id: 'sh-d4',
      dateText: 'Viernes 30 de octubre',
      title: 'El Shanghái futurista y las compras curiosas',
      zone: 'Pudong, todo al este del río',
      blocks: [
        { time: 'Mañana', title: 'AP Plaza 亚太盛汇', detail: 'Línea 2 hasta 上海科技馆站. El mercado de imitaciones, bajo el metro. ~2 h.', kind: 'shop', more: 'Bolsos, zapatillas, ropa, gafas, maletas, relojes y confección a medida. Nunca aceptéis el primer precio y comparad puestos. Antes de pagar, mirad costuras, cremalleras, talla y defectos. Y evitaría cantidades múltiples de imitaciones: al volver a la UE, el volumen importa.' },
        { time: 'Comida', title: 'Comer ya en Lujiazui', detail: 'Línea 2 y coméis en el distrito financiero.', kind: 'food' },
        { time: 'Tarde', title: 'Lujiazui', detail: 'La Perla de Oriente POR FUERA, paseo entre rascacielos y ribera.', kind: 'visit', more: 'No subiría a la Perla: si solo pagáis un mirador, que sea la Shanghai Tower.' },
        { time: 'Final de tarde', title: 'Shanghai Tower', detail: 'Entrad 45-60 min antes de la puesta de sol: día → crepúsculo → noche desde 546 m.', kind: 'ticket', alert: true, more: 'Intentad no comprar la entrada demasiado pronto si el tipo de billete permite esperar: subir a 500 m sin visibilidad no tiene ningún sentido. Mirad nubes y niebla antes.' },
        { time: 'Noche', title: 'Cena en Pudong y vuelta', detail: 'Día bastante completo: mercado, Pudong, torre y vistas.', kind: 'food' },
      ],
    },
    {
      id: 'sh-d5',
      dateText: 'Sábado 31 de octubre',
      title: 'El Shanghái más particular y creativo',
      zone: 'Centro, Xuhui y Putuo',
      blocks: [
        { time: '11:00-11:30', title: 'Mercado de las bodas', detail: 'People’s Park, a 10 min andando. 45-60 min, no hacen falta tres horas.', kind: 'visit', alert: true, more: 'Los padres ponen fichas de sus hijos —edad, estudios, profesión, altura, vivienda, ingresos— en tablones, cuerdas y sobre paraguas abiertos. La zona habitual es la parte norte y noreste del parque. ⚠️ Discreción: foto de ambiente general, nunca primeros planos de personas o fichas sin permiso.' },
        { time: 'Mediodía', title: 'Wukang Mansion y Wukang Road', detail: 'Didi 15-20 min. La foto clásica es desde el lado contrario del cruce con Huaihai, apuntando a la punta del edificio.', kind: 'visit', more: 'Después de la foto famosa, SEGUID ANDANDO: ahí está lo bueno. Fachadas art déco, plátanos, portales, villas pequeñas y cafeterías.' },
        { time: 'Comida', title: 'En la propia zona', detail: 'Old Jesse (41 Tianping Rd) para cocina shanghainesa, o lo que os apetezca del paseo.', kind: 'food', more: 'En Old Jesse pedid hongshao rou, pescado, gambas y verduras de temporada: ~150-250 CNY por persona. Hoy no quiero que vayáis detrás de reservas.' },
        { time: 'Primera tarde', title: 'Anfu Road', detail: 'Tiendas conceptuales, diseño, moda y marcas chinas.', kind: 'shop', more: 'Regla para los cafés virales de Anfu: si hay poca cola, entrad; si hay 45 minutos, seguid andando.' },
        { time: '15:00-15:30', title: 'M50 Creative Park', detail: 'Didi 20-30 min. Antigua fábrica textil: galerías, murales y arte contemporáneo. 45-75 min.', kind: 'visit' },
        { time: 'Final de tarde', title: '1000 Trees, andando por Suzhou Creek', detail: 'El nuevo paseo ribereño conecta M50 con el edificio. Quedaos hasta las primeras luces.', kind: 'visit', alert: true, more: 'No lo fotografiéis de frente como un centro comercial: desde el paseo, con el río en primer plano y la masa escalonada con sus columnas vegetales detrás. No vais por las tiendas, vais por la arquitectura.' },
        { time: 'Noche', title: 'Última cena', detail: 'Cerca de People’s Square si queréis tranquilidad, o Xintiandi si aún hay ganas.', kind: 'food', more: '🎃 Es Halloween y habrá ambiente en Xintiandi, Huaihai y la concesión francesa, pero no montaría el día alrededor de una fiesta concreta: la programación y los controles cambian. Miradlo esa semana.' },
      ],
    },
    {
      id: 'sh-d6',
      dateText: 'Domingo 1 de noviembre',
      title: 'Vuelta a casa',
      zone: 'Hongqiao T2',
      blocks: [
        { time: '06:00-06:15', title: 'Didi al aeropuerto', detail: 'Destino: 上海虹桥国际机场2号航站楼. En el T2 sobre las 06:55.', kind: 'move', alert: true, more: '🔴 HONGQIAO (SHA), NO Pudong (PVG): hay 60 km entre los dos. Avisad en recepción el 31 y dejad la cuenta pagada: el check-out es a las 14:00 y vosotros salís a las 06:00.' },
        { time: '08:55', title: 'Vuelo CA1590 a Pekín', detail: 'Y enlace CA897 a Madrid. Nada de "nos da tiempo a".', kind: 'move', alert: true },
      ],
    },
  ],

  highlights: [
    { name: 'The Bund', nameZh: '外滩', what: 'Arquitectura europea, el río y el skyline de Pudong enfrente. El contraste que define la ciudad.', zone: '~2 km', time: '1-2 h', ticket: 'Gratis', priority: 'must' },
    { name: 'Yu Garden', nameZh: '豫园', what: 'Jardín clásico Ming. Cierra los lunes, ¥40 en temporada alta.', zone: '~2,5 km', time: '1-1,5 h', ticket: '¥40, mejor online', priority: 'must' },
    { name: 'Bazar de Yuyuan y Puente de los Nueve Recodos', nameZh: '九曲桥', what: 'Linternas, tiendas y arquitectura tradicional. Turístico, pero no prescindible.', zone: 'Junto al jardín', time: '1-1,5 h', ticket: 'Gratis', priority: 'must' },
    { name: 'Mercado de las bodas', nameZh: '人民公园相亲角', what: 'Padres buscando pareja para sus hijos con fichas sobre paraguas. Sábados, 11:00-16:00.', zone: '10 min andando', time: '30-60 min', ticket: 'Gratis', priority: 'must' },
    { name: 'Wukang Road y Wukang Mansion', nameZh: '武康路 · 武康大楼', what: 'Art déco, mansiones, plátanos, cafeterías y diseño. El gran paseo urbano.', zone: '~5 km', time: '2,5-3 h', ticket: 'Gratis', priority: 'must' },
    { name: 'Nanjing East Road', nameZh: '南京东路', what: 'El gran eje comercial, que empieza al lado del hotel.', zone: 'En la puerta', time: 'De paso', ticket: 'Gratis', priority: 'must' },
    { name: 'Shanghai Disneyland', what: 'Día completo el 29. Entrada nominal de fecha fija.', zone: 'Sureste', time: 'Día completo', ticket: 'Reserva obligatoria', priority: 'must' },
    { name: 'Shanghai Tower', nameZh: '上海中心大厦', what: 'El mirador que elegiría si solo pagáis uno: 632 m de edificio y plataforma a 546.', zone: 'Lujiazui', time: '1,5-2 h', ticket: 'Con entrada', priority: 'nice' },
    { name: 'AP Plaza', nameZh: '亚太盛汇', what: 'El mercado de imitaciones, bajo la estación del Museo de Ciencia y Tecnología. Cientos de puestos.', zone: 'Pudong', time: '1,5-2,5 h', ticket: 'Gratis', priority: 'nice' },
    { name: 'M50', nameZh: '莫干山路50号', what: 'Fábrica textil convertida en galerías, talleres y arte contemporáneo.', zone: 'Putuo', time: '1-1,5 h', ticket: 'Gratis', priority: 'nice' },
    { name: '1000 Trees', nameZh: '天安千树', what: 'El edificio-montaña de Heatherwick: columnas rematadas con jardineras sobre Suzhou Creek.', zone: 'Putuo', time: '1-1,5 h', ticket: 'Gratis', priority: 'nice' },
    { name: 'Xintiandi', nameZh: '新天地', what: 'Shikumen rehabilitado, con restauración y ambiente. Agradable de noche.', zone: '~2 km', time: '1-2 h', ticket: 'Gratis', priority: 'nice' },
    { name: 'Tianzifang', nameZh: '田子坊', what: 'Callejuelas shikumen con tiendas y talleres.', zone: 'Xuhui', time: '1-1,5 h', ticket: 'Gratis', priority: 'optional', more: 'Baja de prioridad: prefiero conservar Wukang, Anfu, el mercado de bodas, M50 y 1000 Trees antes que correr para poder decir que también visteis Tianzifang.' },
    { name: 'Zhujiajiao', what: 'El pueblo de agua de los alrededores.', zone: 'Fuera', time: 'Medio día', ticket: 'Con entrada', priority: 'skip', more: 'Después de Fenghuang, Furong y Wangxian, quitarle medio día a Shanghái por otra localidad histórica os aporta muchísimo menos.' },
  ],

  restaurants: [
    { name: 'Qiao Ai Lai Lai Xiao Long', what: 'Xiaolongbao de cerdo y de huevas de cangrejo. En la guía Michelin.', address: 'Tianjin Rd, Huangpu (504 en mapas, 506 según Michelin)', price: '¥30-70 por persona', when: 'Comida del 28, entre Yuyuan y el Bund', priority: 'must', more: 'Buscadlo por nombre en Amap, no por el número. Vais en temporada de cangrejo peludo, que es justo cuando Michelin avisa de más afluencia: id pronto.' },
    { name: 'Yang’s Fried Dumpling', nameZh: '小杨生煎', what: 'Shengjianbao: dumpling relleno de carne y caldo, frito por la base. Crujiente abajo, jugoso dentro.', address: '178 Ningbo Rd, Huangpu', price: '¥20-40 por persona', when: 'La noche de llegada', priority: 'must' },
    { name: 'Jia Jia Tang Bao', nameZh: '佳家汤包', what: 'Otro clásico del xiaolongbao, en Huanghe Road, al lado del hotel.', address: '90 Huanghe Rd, People’s Square', price: 'Económico', when: 'Como segunda cata, para comparar', priority: 'nice' },
    { name: 'Old Jesse', nameZh: '老吉士酒家', what: 'Referencia de cocina benbang tradicional shanghainesa. Hongshao rou, pescado y gambas.', address: '41 Tianping Rd, Xuhui', price: '¥150-250 por persona', when: 'El sábado, en la zona de Wukang', priority: 'nice' },
    { name: 'Nanxiang Steamed Bun', nameZh: '南翔馒头店', what: 'La institución histórica del xiaolongbao, en Yuyuan.', price: 'Medio', priority: 'optional', more: 'No diría que son los mejores dumplings de la ciudad, pero estáis delante de una institución. Para una ración pequeña, no para la comida principal.' },
  ],

  markets: [
    { name: 'Huanghe Road', nameZh: '黄河路', what: 'Calle gastronómica histórica al lado del hotel. Dumplings y establecimientos pequeños.', priority: 'must', more: 'No es un mercado nocturno: es una food street tradicional.' },
    { name: 'Bazar de Yuyuan', what: 'Té, snacks, dulces, souvenirs y artesanía. Turístico pero visualmente espectacular.', priority: 'must' },
    { name: 'AP Plaza', what: 'Ropa, complementos, imitaciones y regalos. El sitio para regatear.', priority: 'nice' },
    { name: 'South Bund Fabric Market', nameZh: '南外滩轻纺面料市场', what: 'Telas, camisas, trajes, abrigos y qipao a medida.', priority: 'optional', more: 'Solo si queréis encargar algo de verdad: la confección puede exigir prueba y recogida posterior, y no os sobra tiempo.' },
    { name: 'Dongtai Road', what: 'El viejo mercado de antigüedades por el que era famosa.', priority: 'skip', more: 'Cuidado con las guías antiguas: ya no sirve como referencia de mercado activo.' },
  ],

  food: [
    { name: '小笼包', pinyin: 'Xiaolongbao', what: 'Dumpling al vapor con relleno y caldo dentro. El de Shanghái.', kind: 'salado' },
    { name: '生煎包', pinyin: 'Shengjianbao', what: 'Más grueso, con la base frita y crujiente y el interior con carne y caldo.', kind: 'salado' },
    { name: '大闸蟹', pinyin: 'Dàzháxiè — cangrejo peludo', what: 'El producto estrella del otoño, y vais justo en temporada.', kind: 'salado' },
    { name: '蟹粉', pinyin: 'Xièfěn', what: 'Carne y huevas de cangrejo desmenuzadas: en fideos, arroz, dumplings o wontons. Muy recomendable por vuestra fecha.', kind: 'salado' },
    { name: '葱油拌面', pinyin: 'Congyou banmian', what: 'Fideos con aceite aromatizado de cebolleta. Simple y muy shanghainés.', kind: 'salado' },
    { name: '葱油饼', pinyin: 'Congyou bing', what: 'Torta de cebolleta a la plancha. Street food.', kind: 'salado' },
    { name: '红烧肉', pinyin: 'Hongshao rou', what: 'Panceta cocinada lentamente con soja, vino y azúcar. Dulce-salado, el plato más reconocible de aquí.', kind: 'salado' },
    { name: '排骨年糕', pinyin: 'Paigu niangao', what: 'Costilla de cerdo con pastel de arroz. Muy asociado a la ciudad.', kind: 'salado' },
    { name: '粢饭团', pinyin: 'Cifantuan', what: 'Rollo de arroz glutinoso relleno, a veces con youtiao dentro. Buen desayuno.', kind: 'salado' },
    { name: '蝴蝶酥', pinyin: 'Húdiésū', what: 'Palmera de hojaldre. Las del histórico Park Hotel (国际饭店) son famosas y os quedan al lado.', kind: 'dulce' },
    { name: '条头糕', pinyin: 'Tiaotou gao', what: 'Pastelito de arroz glutinoso con pasta de judía roja.', kind: 'dulce' },
    { name: '八宝饭', pinyin: 'Eight Treasure Rice', what: 'Arroz glutinoso dulce con frutos, semillas y judía roja.', kind: 'dulce' },
    { name: '青团', pinyin: 'Qingtuan', what: 'Bola verde de arroz glutinoso rellena. Lo encontraréis, aunque su temporada es primavera.', kind: 'dulce' },
  ],

  photoSpots: [
    { name: 'El skyline desde el Bund', how: 'Desde el paseo mirando al este: Perla de Oriente, Jin Mao, SWFC y Shanghai Tower en el mismo encuadre.', when: 'Desde las 17:00 hasta que se encienden' },
    { name: 'Wukang Mansion', nameZh: '武康大楼', how: 'Desde el lado contrario del cruce de Wukang con Huaihai, apuntando a la punta estrecha. Es el efecto Flatiron.' },
    { name: 'Wukang Road', how: 'Después de la foto famosa, seguid andando: fachadas art déco, vegetación, bicicletas, portales y villas.' },
    { name: 'Puente de los Nueve Recodos', how: 'Agua, pabellones, tejados y linternas. Y repetidlo iluminado por la tarde-noche.' },
    { name: '1000 Trees', how: 'Desde el paseo de Suzhou Creek, con el río en primer plano y la masa escalonada detrás. Acercaos al extremo que cae hacia M50: ahí se entiende lo de la montaña.', when: 'Antes de ponerse el sol y con las primeras luces' },
    { name: 'M50', how: 'No hay una foto concreta: es sitio para callejear entre ladrillo, estructuras industriales y murales.' },
    { name: 'El Bund desde Pudong', how: 'El 30, la foto inversa: desde Lujiazui mirando al oeste, al skyline histórico. Así tenéis las dos caras.' },
    { name: 'Mercado de las bodas', how: 'Filas de paraguas, fichas y padres conversando. ⚠️ Ambiente general, sin meter la cámara en la cara de nadie.' },
  ],

  shopping: [
    { name: 'Huaihai Middle Road', nameZh: '淮海中路', what: 'Ahora mismo más interesante que Nanjing para moda y diseño, sobre todo marcas chinas.', priority: 'must', more: 'En 2026 tienen mucho tirón entre visitantes extranjeros marcas como Pane, Mason Prince y Songmont. Calzado, bolsos, moda, belleza y lifestyle.' },
    { name: 'Wukang y Anfu', what: 'Probablemente vuestra zona favorita: tiendas conceptuales, flagships pequeños, pop-ups, librerías y cosmética.', priority: 'must' },
    { name: 'Nanjing East Road', what: 'Grandes tiendas, flagships, marcas internacionales y souvenirs. Vivís al lado.', priority: 'must' },
    { name: 'AP Plaza', what: 'El extremo opuesto: regateo, gangas, copias y caos. Merece la pena justo por ser otra cosa.', priority: 'nice' },
  ],

  trends: [
    { name: 'Wukang Mansion', verdict: 'si', why: 'Viral y bueno. De las pocas veces que coinciden.' },
    { name: 'El citywalk de Wukang y Anfu', verdict: 'si', why: 'Si mañana desaparecieran las redes sociales, os lo seguiría recomendando igual.' },
    { name: 'El mercado de las bodas', verdict: 'si', why: 'Muy reconocible en vídeos, pero no es una experiencia montada: es una práctica social activa. Con respeto.' },
    { name: '1000 Trees', verdict: 'si', why: 'Arquitectura genuinamente singular, no "un centro comercial viral".' },
    { name: 'AP Plaza', verdict: 'si', why: 'No es bonito, es viral por ser el mercado de falsificaciones bajo el metro. A vosotros os interesa este tipo de sitio; a otra persona con tres días le diría que lo saltara.' },
    { name: 'Fideos y dumplings de huevas de cangrejo', verdict: 'si', why: 'Viral, sí, pero además es producto estacional real y vais en su momento.' },
    { name: 'Los cafés de Anfu Road', verdict: 'quizas', why: 'Si hay poca cola, entrad. Si hay 45 minutos, seguid andando.' },
    { name: 'El mirador de la Perla de Oriente', verdict: 'no', why: 'Si solo pagáis un mirador, que sea la Shanghai Tower. La Perla, por fuera.' },
  ],

  bookings: [
    {
      activityId: 'act-4',
      title: 'Shanghai Disneyland',
      when: 'Ya, es de fecha fija',
      price: 'Variable según el día',
      how: 'Canales oficiales de Disney o partners autorizados. Comparad siempre el precio final con el de Disney antes de comprar.',
      alert: '📕 Pasaporte FÍSICO original, con nombre y número idénticos a la compra. No valen fotos ni copias digitales.',
    },
    {
      title: 'Yu Garden',
      when: 'Recomendable comprarla antes',
      price: '¥40 en temporada alta',
      how: 'Online o en taquilla. Abre 09:00-16:30, última entrada 16:00.',
      alert: 'Cierra los lunes: por eso va el miércoles 28.',
    },
    {
      title: 'Shanghai Tower',
      when: 'Sí, pero sin comprarla demasiado pronto',
      price: 'Con entrada',
      how: 'Si el tipo de billete lo permite, esperad a tener una idea de la visibilidad.',
      alert: 'Subir a más de 500 m con niebla o nubes bajas no tiene ningún sentido.',
    },
    {
      title: 'Sin reserva',
      when: '—',
      price: 'Gratis',
      how: 'Mercado de las bodas, Bund, Nanjing Road, Wukang, Anfu, M50, 1000 Trees, AP Plaza, Tianzifang y Xintiandi.',
    },
  ],

  ranking: {
    must: ['Yu Garden y Yuyuan', 'El Bund de noche', 'Nanjing Road', 'Qiao Ai Lai Lai', 'Disneyland', 'Wukang y Anfu', 'Mercado de las bodas', 'Lujiazui'],
    nice: ['AP Plaza', 'Shanghai Tower', 'M50', '1000 Trees', 'Xintiandi', 'Huanghe Road'],
    optional: ['Tianzifang', 'South Bund Fabric Market', 'Mercados de antigüedades', 'North Bund'],
    skip: ['Zhujiajiao', 'El mirador de la Perla de Oriente', 'Dongtai Road'],
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
  zhangjiajie,
  wulingyuan,
  shangrao,
  shanghai,
};

export function getCityPlan(cityId?: string): CityPlan | undefined {
  return cityId ? cityPlans[cityId] : undefined;
}
