// src/data/houses.ts

import type { House } from '../types/house';

// =============================================
// ВСЕ ДОМА КОМПЛЕКСА
// =============================================

export const houses: House[] = [
  // ===== БОЛЬШИЕ ДОМА (6 мест, 5 штук) =====
  {
    id: 'house-big-1',
    type: 'big',
    title: 'Большой дом у сосновой аллеи',
    capacity: 6,
    pricePerNight: 14000,
    bookedRanges: [
      { startDate: '2026-06-10', endDate: '2026-06-14' },
      { startDate: '2026-07-01', endDate: '2026-07-05' },
    ],
  },
  {
    id: 'house-big-2',
    type: 'big',
    title: 'Большой дом с террасой',
    capacity: 6,
    pricePerNight: 14000,
    bookedRanges: [
      { startDate: '2026-06-18', endDate: '2026-06-22' },
      { startDate: '2026-07-12', endDate: '2026-07-16' },
    ],
  },
  {
    id: 'house-big-3',
    type: 'big',
    title: 'Большой дом с видом на море',
    capacity: 6,
    pricePerNight: 14000,
    bookedRanges: [
      { startDate: '2026-06-25', endDate: '2026-06-29' },
      { startDate: '2026-08-03', endDate: '2026-08-07' },
    ],
  },
  {
    id: 'house-big-4',
    type: 'big',
    title: 'Большой семейный дом',
    capacity: 6,
    pricePerNight: 14000,
    bookedRanges: [
      { startDate: '2026-07-08', endDate: '2026-07-11' },
      { startDate: '2026-08-15', endDate: '2026-08-19' },
    ],
  },
  {
    id: 'house-big-5',
    type: 'big',
    title: 'Большой дом у пляжа',
    capacity: 6,
    pricePerNight: 14000,
    bookedRanges: [
      { startDate: '2026-06-05', endDate: '2026-06-09' },
      { startDate: '2026-07-20', endDate: '2026-07-24' },
    ],
  },

  // ===== МАЛЫЙ ДОМ (4 места, 1 штука) =====
  {
    id: 'house-small-1',
    type: 'small',
    title: 'Малый дом с уютным двориком',
    capacity: 4,
    pricePerNight: 10000,
    bookedRanges: [
      { startDate: '2026-06-12', endDate: '2026-06-15' },
      { startDate: '2026-07-28', endDate: '2026-08-01' },
    ],
  },
];

// =============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ
// (опционально, можно использовать в компонентах)
// =============================================

/**
 * Получить все дома определенного типа
 */
export const getHousesByType = (type: 'big' | 'small'): House[] => {
  return houses.filter(house => house.type === type);
};

/**
 * Получить дом по ID
 */
export const getHouseById = (id: string): House | undefined => {
  return houses.find(house => house.id === id);
};

/**
 * Получить цену для типа дома
 */
export const getPriceForType = (type: 'big' | 'small'): number => {
  const house = houses.find(h => h.type === type);
  return house?.pricePerNight || (type === 'big' ? 14000 : 10000);
};

/**
 * Получить количество домов по типу
 */
export const getCountByType = (type: 'big' | 'small'): number => {
  return houses.filter(h => h.type === type).length;
};

/**
 * Получить максимальную вместимость для типа
 */
export const getCapacityByType = (type: 'big' | 'small'): number => {
  const house = houses.find(h => h.type === type);
  return house?.capacity || (type === 'big' ? 6 : 4);
};
