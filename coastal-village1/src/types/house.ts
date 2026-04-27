export type HouseType = 'big' | 'small';

export interface BookingRange {
  startDate: string;
  endDate: string;
}

export interface House {
  id: string;
  type: HouseType;
  title: string;
  capacity: number;
  pricePerNight: number;
  bookedRanges: BookingRange[];
  // Добавить новые поля (сделать их необязательными)
  area?: number;
  bedrooms?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export type HouseAvailabilityResult = {
  availableBig: number;
  availableSmall: number;
};