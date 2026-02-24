import { HotelOption, CityStop } from '@/types/trip';

export function getHotelCalcs(hotel: HotelOption, nights: number) {
  if (hotel.priceStatus === 'pending' || hotel.totalPrice === null) return null;
  const perNight = Math.round((hotel.totalPrice / nights) * 100) / 100;
  const perPersonPerNight = Math.round((hotel.totalPrice / nights / 2) * 100) / 100;
  return { total: hotel.totalPrice, perNight, perPersonPerNight };
}

export function getCityHotelStats(hotels: HotelOption[], nights: number) {
  const valid = hotels.filter(h => h.priceStatus === 'known' && h.totalPrice !== null);
  if (valid.length === 0) return null;
  const prices = valid.map(h => h.totalPrice!);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  return {
    min, max, avg,
    minPerNight: Math.round((min / nights) * 100) / 100,
    maxPerNight: Math.round((max / nights) * 100) / 100,
    avgPerNight: Math.round((avg / nights) * 100) / 100,
    minPerPersonPerNight: Math.round((min / nights / 2) * 100) / 100,
    maxPerPersonPerNight: Math.round((max / nights / 2) * 100) / 100,
    avgPerPersonPerNight: Math.round((avg / nights / 2) * 100) / 100,
  };
}

export function getGlobalBudget(
  cities: CityStop[],
  hotels: HotelOption[],
  selectedHotels: Record<string, string>
) {
  let minTotal = 0, maxTotal = 0, avgTotal = 0, selectedTotal = 0;
  let allSelected = true;
  let totalNightsWithData = 0;

  for (const city of cities) {
    const cityHotels = hotels.filter(h => h.cityId === city.id);
    const stats = getCityHotelStats(cityHotels, city.nights);

    if (selectedHotels[city.id]) {
      const selected = cityHotels.find(h => h.id === selectedHotels[city.id]);
      if (selected?.totalPrice != null) selectedTotal += selected.totalPrice;
    } else {
      allSelected = false;
    }

    if (stats) {
      minTotal += stats.min;
      maxTotal += stats.max;
      avgTotal += stats.avg;
      totalNightsWithData += city.nights;
    }
  }

  const totalNights = cities.reduce((s, c) => s + c.nights, 0);

  return {
    minTotal, maxTotal, avgTotal, selectedTotal, allSelected,
    avgPerNight: totalNightsWithData > 0 ? Math.round(avgTotal / totalNightsWithData) : 0,
    avgPerPersonPerNight: totalNightsWithData > 0 ? Math.round(avgTotal / totalNightsWithData / 2) : 0,
    totalNights,
  };
}
