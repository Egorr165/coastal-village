// src/services/availabilityService.ts

import { houses } from '../data/houses';
import type { House, HouseAvailabilityResult, HouseType } from '../types/house';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const SEARCH_DAYS_LIMIT = 730;

const toUtcDate = (dateString: string): Date => new Date(`${dateString}T00:00:00.000Z`);

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * MS_IN_DAY);

const getNightsCount = (startDate: string, endDate: string): number => {
  const start = toUtcDate(startDate).getTime();
  const end = toUtcDate(endDate).getTime();
  const diffInDays = Math.floor((end - start) / MS_IN_DAY);

  return Math.max(0, diffInDays);
};

export const isRangeOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean => {
  const firstStart = toUtcDate(aStart).getTime();
  const firstEnd = toUtcDate(aEnd).getTime();
  const secondStart = toUtcDate(bStart).getTime();
  const secondEnd = toUtcDate(bEnd).getTime();

  return firstStart < secondEnd && secondStart < firstEnd;
};

export const isHouseAvailable = (house: House, startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) {
    return true;
  }

  if (getNightsCount(startDate, endDate) <= 0) {
    return false;
  }

  return !house.bookedRanges.some((range) =>
    isRangeOverlap(startDate, endDate, range.startDate, range.endDate),
  );
};

export const getAvailability = (startDate: string, endDate: string): HouseAvailabilityResult => {
  const availableHouses = houses.filter((house) => isHouseAvailable(house, startDate, endDate));

  return {
    availableBig: availableHouses.filter((house) => house.type === 'big').length,
    availableSmall: availableHouses.filter((house) => house.type === 'small').length,
  };
};

export const getAvailableHouseTypes = (
  startDate?: string | null,
  endDate?: string | null,
): HouseType[] => {
  if (!startDate || !endDate) {
    return ['big', 'small'];
  }

  const { availableBig, availableSmall } = getAvailability(startDate, endDate);

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

export const findNearestAvailableDate = (houseType: HouseType): string | null => {
  const today = toUtcDate(formatDate(new Date()));

  for (let dayOffset = 0; dayOffset <= SEARCH_DAYS_LIMIT; dayOffset += 1) {
    const start = addDays(today, dayOffset);
    const end = addDays(start, 1);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    const hasAvailableHouse = houses
      .filter((house) => house.type === houseType)
      .some((house) => isHouseAvailable(house, startDate, endDate));

    if (hasAvailableHouse) {
      return startDate;
    }
  }

  return null;
};

// =============================================
// НОВЫЕ ФУНКЦИИ ДЛЯ КОМПОНЕНТА
// =============================================

/**
 * Получить все забронированные даты для календаря
 */
export const getBookedDatesForMonth = (
  houseType: HouseType,
  year: number,
  month: number
): string[] => {
  const typeHouses = houses.filter(h => h.type === houseType);
  const bookedDates: string[] = [];
  
  typeHouses.forEach(house => {
    house.bookedRanges.forEach(range => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        // Проверяем, относится ли дата к текущему месяцу
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
          bookedDates.push(dateStr);
        }
      }
    });
  });
  
  return [...new Set(bookedDates)]; // убираем дубликаты
};

/**
 * Проверить доступность для конкретного типа дома
 */
export const checkTypeAvailability = (
  houseType: HouseType,
  checkIn: string,
  checkOut: string
): {
  available: boolean;
  availableCount: number;
  totalCount: number;
  message: string;
} => {
  const { availableBig, availableSmall } = getAvailability(checkIn, checkOut);
  
  const availableCount = houseType === 'big' ? availableBig : availableSmall;
  const totalCount = houseType === 'big' 
    ? houses.filter(h => h.type === 'big').length 
    : houses.filter(h => h.type === 'small').length;
  
  const available = availableCount > 0;

  let message = '';
  if (available) {
    message = `✅ Доступно ${availableCount} из ${totalCount} ${houseType === 'big' ? 'больших' : 'малых'} домов`;
  } else {
    message = `❌ На эти даты все дома заняты`;
    
    const nextDate = findNearestAvailableDate(houseType);
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

/**
 * Получить цену дома по типу
 */
export const getPriceByType = (houseType: HouseType): number => {
  const house = houses.find(h => h.type === houseType);
  return house?.pricePerNight || (houseType === 'big' ? 14000 : 10000);
};

export const getHouseCountByType = (houseType: HouseType): number => {
  return houses.filter(h => h.type === houseType).length;
};

/**
 * Получить первый доступный дом заданного типа на выбранные даты
 */
export const getFirstAvailableHouse = (
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