import type { HouseType } from '../types/house';

export const checkTypeAvailability = (houseType: HouseType, _checkIn: string, _checkOut: string) => {
  return { 
    available: true, 
    availableCount: houseType === 'big' ? 6 : 1, 
    totalCount: houseType === 'big' ? 6 : 1, 
    message: '' 
  };
};

export const getBookedDatesForMonth = (_houseType: HouseType, _year: number, _month: number): string[] => {
  return [];
};

export const getPriceByType = (type: HouseType) => {
  return type === 'big' ? 13000 : 10000;
};

export const getHouseCountByType = (type: HouseType) => {
  return type === 'big' ? 6 : 1;
};
