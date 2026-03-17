export type HouseType = 'small' | 'big';

export interface BookedRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
}

export interface House {
  id: string;
  type: HouseType;
  title: string;
  capacity: number;
  pricePerNight: number;
  bookedRanges: BookedRange[];
  // Дополнительно, если у дома есть другие поля (например amenities, image), их можно будет добавить сюда
}

export interface HouseAvailabilityResult {
  availableBig: number;
  availableSmall: number;
}
