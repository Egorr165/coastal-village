// src/services/availabilityService.ts
import api from './api';
import type { House, HouseType } from '../types/house';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const SEARCH_DAYS_LIMIT = 730;

const toUtcDate = (dateString: string): Date => new Date(`${dateString}T00:00:00.000Z`);

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * MS_IN_DAY);

export const getNightsCount = (startDate: string, endDate: string): number => {
  const start = toUtcDate(startDate).getTime();
  const end = toUtcDate(endDate).getTime();
  const diffInDays = Math.floor((end - start) / MS_IN_DAY);

  return Math.max(0, diffInDays);
};

export const isRangeOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean => {
  // ISO-даты 'YYYY-MM-DD' отлично сравниваются строками (намного быстрее)
  return aStart < bEnd && bStart < aEnd;
};

// =============================================
// API Вызовы
// =============================================

/**
 * Загрузить список домиков с бэкенда
 */
export const fetchHouses = async (): Promise<House[]> => {
  const response = await api.get('/api/cottages/');
  return response.data.map((c: any) => ({
    id: String(c.id),
    title: c.title,
    type: c.type,
    pricePerNight: Number(c.pricePerNight),
    capacity: c.capacity,
    area: c.area,
    bedrooms: c.bedrooms,
    description: c.description,
    images: c.images || [],
    amenities: c.amenities || [],
    bookedRanges: c.bookedRanges || []
  }));
};

// =============================================
// Локальные вычисления (работают со списком houses)
// =============================================

export const isHouseAvailable = (house: House, startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true;
  if (startDate >= endDate) return false;

  return !house.bookedRanges.some((range) =>
    isRangeOverlap(startDate, endDate, range.startDate, range.endDate),
  );
};

export const getAvailability = (houses: House[], startDate: string, endDate: string) => {
  const availableHouses = houses.filter((house) => isHouseAvailable(house, startDate, endDate));

  return {
    availableBig: availableHouses.filter((house) => house.type === 'big').length,
    availableSmall: availableHouses.filter((house) => house.type === 'small').length,
  };
};

export const getAvailableHouseTypes = (
  houses: House[],
  startDate?: string | null,
  endDate?: string | null,
): HouseType[] => {
  if (!startDate || !endDate) {
    return ['big', 'small'];
  }

  const { availableBig, availableSmall } = getAvailability(houses, startDate, endDate);

  if (availableBig > 0 && availableSmall > 0) {
    return ['big', 'small'];
  }

  if (availableBig > 0) {
    return ['big'];
  }

  if (availableSmall > 0) {
    return ['small'];
  }

  return [];
};

export const calculateStayPrice = (
  pricePerNight: number,
  startDate: string,
  endDate: string,
): number => {
  const nights = getNightsCount(startDate, endDate);
  return nights * pricePerNight;
};

export const findNearestAvailableDate = (houses: House[], houseType: HouseType): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const typeHouses = houses.filter((house) => house.type === houseType);

  for (let dayOffset = 0; dayOffset <= SEARCH_DAYS_LIMIT; dayOffset += 1) {
    const start = new Date(today);
    start.setDate(today.getDate() + dayOffset);
    const startDate = start.toISOString().split('T')[0];
    
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const endDate = end.toISOString().split('T')[0];

    // Очень быстрая проверка
    const hasAvailableHouse = typeHouses.some((house) => isHouseAvailable(house, startDate, endDate));

    if (hasAvailableHouse) {
      return startDate;
    }
  }

  return null;
};

export const getBookedDatesForMonth = (
  houses: House[],
  houseType: HouseType,
  year: number,
  month: number
): string[] => {
  const typeHouses = houses.filter(h => h.type === houseType);
  const totalHouses = typeHouses.length;
  
  if (totalHouses === 0) return [];
  
  const dateCounts: Record<string, number> = {};
  
  typeHouses.forEach(house => {
    house.bookedRanges.forEach(range => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      
      // Бронируем только "ночи" (d < end), так как в день выезда (end) может заехать другой гость
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
      }
    });
  });
  
  const bookedDates: string[] = [];
  for (const [dateStr, count] of Object.entries(dateCounts)) {
    // Дата считается недоступной для бронирования ТОЛЬКО если ВСЕ домики этого типа заняты
    if (count >= totalHouses) {
      bookedDates.push(dateStr);
    }
  }
  
  return bookedDates;
};

export const checkTypeAvailability = (
  houses: House[],
  houseType: HouseType,
  checkIn: string,
  checkOut: string
) => {
  const { availableBig, availableSmall } = getAvailability(houses, checkIn, checkOut);
  
  const availableCount = houseType === 'big' ? availableBig : availableSmall;
  const totalCount = houseType === 'big' 
    ? houses.filter(h => h.type === 'big').length 
    : houses.filter(h => h.type === 'small').length;
  
  const available = availableCount > 0;

  let message = '';
  if (available) {
    message = `✅ Доступно ${availableCount} из ${totalCount} ${houseType === 'big' ? 'больших' : 'малых'} домов`;
  } else {
    message = `❌ На эти даты все дома заняты`;
    
    const nextDate = findNearestAvailableDate(houses, houseType);
    if (nextDate) {
      const formatted = new Date(nextDate).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      message += `\nБлижайшая свободная дата: ${formatted}`;
    }
  }

  return {
    available,
    availableCount,
    totalCount,
    message
  };
};

export const getPriceByType = (houses: House[], houseType: HouseType): number => {
  const house = houses.find(h => h.type === houseType);
  return house?.pricePerNight || (houseType === 'big' ? 14000 : 10000);
};

export const getHouseCountByType = (houses: House[], houseType: HouseType): number => {
  return houses.filter(h => h.type === houseType).length;
};

export const getFirstAvailableHouse = (
  houses: House[],
  houseType: HouseType,
  startDate?: string | null,
  endDate?: string | null
): House | null => {
  if (!startDate || !endDate) {
    return null;
  }
  const typeHouses = houses.filter(h => h.type === houseType);
  const availableHouse = typeHouses.find(house => isHouseAvailable(house, startDate, endDate));
  return availableHouse || null;
};