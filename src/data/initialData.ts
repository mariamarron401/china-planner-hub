import { TripData } from '@/types/trip';

export const initialTripData: TripData = {
  trip: {
    title: 'Viaje a China 🇨🇳',
    travelers: 2,
    dateRangeText: '10 OCT – 1 NOV 2025',
    totalNights: 22,
    primaryCurrency: 'EUR',
  },
  cities: [
    { id: 'beijing', cityName: 'Beijing', startDateText: '10 oct', endDateText: '13 oct', nights: 3, notes: [], flags: [], order: 1 },
    { id: 'xian', cityName: "Xi'an", startDateText: '13 oct', endDateText: '16 oct', nights: 3, notes: [], flags: [], order: 2 },
    { id: 'chengdu', cityName: 'Chengdu', startDateText: '16 oct', endDateText: '19 oct', nights: 3, notes: [], flags: ['duda'], order: 3 },
    { id: 'chongqing', cityName: 'Chongqing', startDateText: '19 oct', endDateText: '21 oct', nights: 2, notes: [], flags: [], order: 4 },
    { id: 'fenghuang', cityName: 'Fenghuang', startDateText: '21 oct', endDateText: '22 oct', nights: 1, notes: [], flags: [], order: 5 },
    { id: 'furong', cityName: 'Furong', startDateText: '22 oct', endDateText: '23 oct', nights: 1, notes: [], flags: [], order: 6 },
    { id: 'zhangjiajie', cityName: 'Zhangjiajie', startDateText: '23 oct', endDateText: '24 oct', nights: 1, notes: [], flags: [], order: 7 },
    { id: 'wulingyuan', cityName: 'Wulingyuan', startDateText: '24 oct', endDateText: '26 oct', nights: 2, notes: [], flags: [], order: 8 },
    { id: 'shangrao', cityName: 'Wangxian Valley (Shangrao)', startDateText: '26 oct', endDateText: '27 oct', nights: 1, notes: ['Queremos alojarnos dentro de Wangxian Valley para pasear cuando cierre al turismo general, evitar pagar entrada adicional, y disfrutar del ambiente nocturno.'], flags: ['importante'], order: 9 },
    { id: 'shanghai', cityName: 'Shanghai', startDateText: '27 oct', endDateText: '1 nov', nights: 5, notes: [], flags: [], order: 10 },
  ],
  hotels: [
    // Beijing
    { id: 'h-bj-1', cityId: 'beijing', provider: 'Trip.com', totalPrice: 216, currency: 'EUR', link: 'https://es.trip.com/hotels/Pek%C3%ADn-hotel-detail-821303/Livefortuna-Hotel/', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-bj-2', cityId: 'beijing', provider: 'Trip.com', totalPrice: 171, currency: 'EUR', link: 'https://www.trip.com/w/7FGtCdoNYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-bj-3', cityId: 'beijing', provider: 'Trip.com', totalPrice: 221, currency: 'EUR', link: 'https://www.trip.com/w/xkA9fIyNYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Xi'an
    { id: 'h-xa-1', cityId: 'xian', provider: 'Booking', totalPrice: 161, currency: 'EUR', link: 'https://www.trip.com/w/E5tH7hzNYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-xa-2', cityId: 'xian', provider: 'Trip.com', totalPrice: 104, currency: 'EUR', link: 'https://www.trip.com/w/OphxhKCOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-xa-3', cityId: 'xian', provider: 'Trip.com', totalPrice: 178, currency: 'EUR', link: 'https://www.trip.com/w/ewFa9IEOYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Chengdu
    { id: 'h-cd-1', cityId: 'chengdu', provider: 'Trip.com', totalPrice: 151, currency: 'EUR', link: 'https://www.trip.com/w/w5p0zWKOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cd-1b', cityId: 'chengdu', provider: 'Booking', totalPrice: 142, currency: 'EUR', link: 'https://www.booking.com/Share-ys6MNzA', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cd-2', cityId: 'chengdu', provider: 'Trip.com', totalPrice: 104, currency: 'EUR', link: 'https://www.trip.com/w/J10KRbTOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cd-3', cityId: 'chengdu', provider: 'Trip.com', totalPrice: 86, currency: 'EUR', link: 'https://www.trip.com/w/BJlEsLVOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cd-4', cityId: 'chengdu', provider: 'Trip.com', totalPrice: 135, currency: 'EUR', link: 'https://www.trip.com/w/TQzllDaOYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Chongqing
    { id: 'h-cq-1', cityId: 'chongqing', provider: 'Trip.com', totalPrice: 117, currency: 'EUR', link: 'https://www.trip.com/w/5h1tvibOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cq-2', cityId: 'chongqing', provider: 'Trip.com', totalPrice: 122, currency: 'EUR', link: 'https://www.trip.com/w/h61P9vlOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cq-3', cityId: 'chongqing', provider: 'Trip.com', totalPrice: 80, currency: 'EUR', link: 'https://www.trip.com/w/BLNyQGnOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cq-4', cityId: 'chongqing', provider: 'Trip.com', totalPrice: 126, currency: 'EUR', link: 'https://www.trip.com/w/i740APpOYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-cq-5', cityId: 'chongqing', provider: 'Trip.com', totalPrice: 66, currency: 'EUR', link: 'https://www.trip.com/w/m7bYP9rOYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Fenghuang
    { id: 'h-fh-1', cityId: 'fenghuang', provider: 'Trip.com', totalPrice: 24, currency: 'EUR', link: 'https://hotelsapp.onelink.me/fSyN/jmzfiqmj', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-fh-2', cityId: 'fenghuang', provider: 'Trip.com', totalPrice: 73, currency: 'EUR', link: 'https://www.trip.com/w/IvZnNt5PYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-fh-3', cityId: 'fenghuang', provider: 'Trip.com', totalPrice: 21, currency: 'EUR', link: 'https://www.trip.com/w/3flXoF8PYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-fh-4', cityId: 'fenghuang', provider: 'Trip.com', totalPrice: 53, currency: 'EUR', link: 'https://www.trip.com/w/08v358BPYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Furong
    { id: 'h-fr-1', cityId: 'furong', provider: 'Trip.com', totalPrice: 62, currency: 'EUR', link: 'https://www.trip.com/w/1fCLOFIPYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-fr-2', cityId: 'furong', provider: 'Trip.com', totalPrice: 40, currency: 'EUR', link: 'https://www.trip.com/w/lqqRdDPPYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Zhangjiajie
    { id: 'h-zj-1', cityId: 'zhangjiajie', provider: 'Trip.com', totalPrice: 21, currency: 'EUR', link: 'https://www.trip.com/w/vPzza0jPYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-zj-2', cityId: 'zhangjiajie', provider: 'Trip.com', totalPrice: 46, currency: 'EUR', link: 'https://www.trip.com/w/yBJsyOkPYT2', breakfastIncluded: true, priceStatus: 'known' },
    // Wulingyuan
    { id: 'h-wl-1', cityId: 'wulingyuan', provider: 'Trip.com', totalPrice: 73, currency: 'EUR', link: 'https://www.trip.com/w/AgqY9N8BeT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-wl-2', cityId: 'wulingyuan', provider: 'Trip.com', totalPrice: null, currency: 'EUR', link: 'https://www.trip.com/w/MiVqXEZBeT2', breakfastIncluded: true, priceStatus: 'pending' },
    // Shangrao
    { id: 'h-sr-1', cityId: 'shangrao', provider: 'Trip.com', totalPrice: 99, currency: 'EUR', link: 'https://www.trip.com/w/FQ9hm1kAeT2', breakfastIncluded: true, priceStatus: 'known' },
    // Shanghai
    { id: 'h-sh-1', cityId: 'shanghai', provider: 'Trip.com', totalPrice: 338, currency: 'EUR', link: 'https://www.trip.com/w/PdYbda5QYT2', breakfastIncluded: true, priceStatus: 'known' },
    { id: 'h-sh-2', cityId: 'shanghai', provider: 'Trip.com', totalPrice: 339, currency: 'EUR', link: 'https://www.trip.com/w/sJlQdO8QYT2', breakfastIncluded: true, priceStatus: 'known' },
  ],
  selectedHotels: {},
  transportLegs: [
    { id: 'tl-1', fromCityId: 'beijing', toCityId: 'xian', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-2', fromCityId: 'xian', toCityId: 'chengdu', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-3', fromCityId: 'chengdu', toCityId: 'chongqing', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-4', fromCityId: 'chongqing', toCityId: 'fenghuang', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-5', fromCityId: 'fenghuang', toCityId: 'furong', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-6', fromCityId: 'furong', toCityId: 'zhangjiajie', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-7', fromCityId: 'zhangjiajie', toCityId: 'shangrao', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
    { id: 'tl-8', fromCityId: 'shangrao', toCityId: 'shanghai', mode: 'Tren bala', durationMinutes: null, price: null, currency: 'EUR', status: 'pending', notes: '' },
  ],
  localTransports: [
    { id: 'lt-1', cityId: 'shangrao', fromText: 'Estación Shangrao', toText: 'Wangxian Valley', mode: 'Didi', durationMinutes: null, price: null, currency: 'EUR', notes: '' },
    { id: 'lt-2', cityId: 'zhangjiajie', fromText: 'Zhangjiajie ciudad', toText: 'Wulingyuan', mode: 'Didi', durationMinutes: null, price: null, currency: 'EUR', notes: 'Con maletas' },
    { id: 'lt-3', cityId: 'chengdu', fromText: 'Hotel Chengdu', toText: 'Base de Pandas', mode: 'Didi', durationMinutes: null, price: null, currency: 'EUR', notes: '' },
    { id: 'lt-4', cityId: 'chengdu', fromText: 'Estación Leshan', toText: 'Recinto Buda Gigante', mode: 'Didi', durationMinutes: null, price: null, currency: 'EUR', notes: '' },
  ],
  activities: [
    { id: 'act-1', cityId: 'beijing', title: 'Gran Muralla China', type: 'Excursión', duration: null, price: null, currency: 'EUR', status: 'Por reservar', notes: '' },
    { id: 'act-2', cityId: 'chengdu', title: 'Base de Pandas de Chengdu', type: 'Día completo', duration: null, price: null, currency: 'EUR', status: 'Por reservar', notes: '' },
    { id: 'act-3', cityId: 'chengdu', title: 'Buda Gigante de Leshan', type: 'Excursión', duration: null, price: null, currency: 'EUR', status: 'Por reservar', notes: 'Excursión de un día desde Chengdu' },
    { id: 'act-4', cityId: 'shanghai', title: 'Shanghai Disneyland', type: 'Día completo', duration: null, price: null, currency: 'EUR', status: 'Por reservar', notes: '' },
  ],
  pendingItems: [
    { id: 'pi-1', title: 'Precio pendiente hotel Wulingyuan (opción 2)', description: 'Falta el precio del segundo hotel en Wulingyuan', relatedType: 'hotel', relatedId: 'h-wl-2', priority: 'high', status: 'open' },
    { id: 'pi-2', title: 'Confirmar alojamiento dentro de Wangxian Valley', description: 'Confirmar si alojarse dentro evita entrada y permite acceso nocturno', relatedType: 'note', relatedId: 'shangrao', priority: 'high', status: 'open' },
    { id: 'pi-3', title: 'Duda: ¿3 noches en Chengdu es lo ideal?', description: 'Revisar viabilidad y logística de 3 noches en Chengdu', relatedType: 'note', relatedId: 'chengdu', priority: 'medium', status: 'open' },
    { id: 'pi-4', title: 'Duración y precio de todos los tramos en tren', description: 'Buscar precios y duración de los 8 trayectos en tren bala', relatedType: 'transport', relatedId: '', priority: 'high', status: 'open' },
    { id: 'pi-5', title: 'Precio y duración traslados Didi', description: 'Estimar precios y duración de los traslados locales en Didi/taxi', relatedType: 'transport', relatedId: '', priority: 'medium', status: 'open' },
  ],
  versions: [],
};
