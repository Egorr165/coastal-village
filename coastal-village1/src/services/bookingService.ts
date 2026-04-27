import api from './api';

export interface BookingResponse {
  id: number;
  user: number;
  user_name: string;
  cottage: number;
  cottage_name: string;
  check_in_date: string;
  check_out_date: string;
  nights_count: number;
  guests_count: number;
  extra_bed_count: number;
  total_price: number;
  status: string;
  special_requests: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  cottage: number;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  extra_bed_count: number;
  special_requests: string;
}

const bookingService = {
  /**
   * Получить предстоящие активные бронирования пользователя
   */
  getUpcomingBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>('/api/bookings/upcoming/');
    return response.data;
  },

  /**
   * Получить все бронирования пользователя (история)
   */
  getMyBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>('/api/bookings/my_bookings/');
    return response.data;
  },

  /**
   * Создать новое бронирование
   */
  createBooking: async (data: CreateBookingData): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>('/api/bookings/', data);
    return response.data;
  },

  /**
   * Отменить существующее бронирование
   */
  cancelBooking: async (id: number): Promise<BookingResponse> => {
    const response = await api.post(`/api/bookings/${id}/cancel/`);
    return response.data.booking;
  },

  /**
   * Получить следующий предсказываемый номер брони
   */
  getNextBookingId: async (): Promise<number> => {
    const response = await api.get('/api/bookings/next-id/');
    return response.data.next_id;
  }
};

export default bookingService;
