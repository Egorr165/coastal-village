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

export interface UpdateBookingData {
  check_in_date?: string;
  check_out_date?: string;
  extra_bed_count?: number;
  special_requests?: string;
}

const bookingService = {
  getUpcomingBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>('/api/bookings/upcoming/');
    return response.data;
  },

  getMyBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>('/api/bookings/my_bookings/');
    return response.data;
  },

  createBooking: async (data: CreateBookingData): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>('/api/bookings/', data);
    return response.data;
  },

  updateBooking: async (id: number, data: any): Promise<BookingResponse> => {

    try {
      const response = await api.patch<BookingResponse>(`/api/bookings/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error; 
    }
  },



  cancelBooking: async (id: number): Promise<BookingResponse> => {
    const response = await api.post(`/api/bookings/${id}/cancel/`);
    return response.data.booking || response.data; 
  },

  getNextBookingId: async (): Promise<number> => {
    const response = await api.get('/api/bookings/next-id/');
    return response.data.next_id;
  }
};

export default bookingService;
