import api from '../../../services/api';

export const adminService = {
  // Stats
  getStats: async () => {
    const response = await api.get('/api/admin/stats/');
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard-stats/');
    return response.data;
  },

  // Bookings
  getBookings: async () => {
    const response = await api.get('/api/admin/bookings/');
    return response.data;
  },
  markBookingsViewed: async (status?: string): Promise<void> => {
    const url = status && status !== 'all' ? `/api/admin/bookings/mark-viewed/?status=${status}` : '/api/admin/bookings/mark-viewed/';
    await api.post(url);
  },
  createBooking: async (data: any) => {
    const response = await api.post('/api/admin/bookings/', data);
    return response.data;
  },
  updateBooking: async (id: number, data: any) => {
    const response = await api.patch(`/api/admin/bookings/${id}/`, data);
    return response.data;
  },
  bulkConfirmBookings: async (ids: number[]) => {
    const response = await api.post('/api/admin/bookings/bulk-confirm/', { ids });
    return response.data;
  },
  bulkCancelBookings: async (ids: number[]) => {
    const response = await api.post('/api/admin/bookings/bulk-cancel/', { ids });
    return response.data;
  },
  bulkCompleteBookings: async (ids: number[]) => {
    const response = await api.post('/api/admin/bookings/bulk-complete/', { ids });
    return response.data;
  },

  // Отзывы
  getReviews: async () => {
    const response = await api.get('/api/admin/reviews/');
    return response.data;
  },
  markReviewsViewed: async () => {
    const response = await api.post('/api/admin/reviews/mark-viewed/');
    return response.data;
  },
  approveReview: async (id: number) => {
    const response = await api.post(`/api/admin/reviews/${id}/approve/`);
    return response.data;
  },
  bulkApproveReviews: async (ids: number[]) => {
    const response = await api.post('/api/admin/reviews/bulk-approve/', { ids });
    return response.data;
  },
  bulkRejectReviews: async (ids: number[]) => {
    const response = await api.post('/api/admin/reviews/bulk-reject/', { ids });
    return response.data;
  },

  // Домики
  getCottages: async () => {
    const response = await api.get('/api/admin/cottages/');
    return response.data;
  },
  createCottage: async (data: any) => {
    const response = await api.post('/api/admin/cottages/', data);
    return response.data;
  },
  updateCottage: async (id: number, data: any) => {
    const response = await api.patch(`/api/admin/cottages/${id}/`, data);
    return response.data;
  },
  deleteCottage: async (id: number) => {
    const response = await api.delete(`/api/admin/cottages/${id}/`);
    return response.data;
  },
  bulkDeleteCottages: async (ids: number[]) => {
    const response = await api.post('/api/admin/cottages/bulk-delete/', { ids });
    return response.data;
  },
  bulkUploadCottageImages: async (house_type: string, files: FileList | File[]) => {
    const formData = new FormData();
    formData.append('house_type', house_type);
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }
    const response = await api.post('/api/admin/cottage-images/bulk-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getCottageImages: async (house_type: string) => {
    const response = await api.get(`/api/admin/cottage-images/?house_type=${house_type}`);
    return response.data;
  },
  deleteCottageImage: async (id: number) => {
    const response = await api.delete(`/api/admin/cottage-images/${id}/`);
    return response.data;
  },
  setMainCottageImage: async (id: number) => {
    const response = await api.post(`/api/admin/cottage-images/${id}/set-main/`);
    return response.data;
  },
  reorderCottageImages: async (orderPayload: {id: number, display_order: number}[]) => {
    const response = await api.post('/api/admin/cottage-images/reorder/', { order: orderPayload });
    return response.data;
  },
  bulkDeleteCottageImages: async (ids: number[]) => {
    const response = await api.post('/api/admin/cottage-images/bulk-delete/', { ids });
    return response.data;
  },

  // Пользователи и Заявки
  getUsers: async () => {
    const response = await api.get('/api/admin/users/');
    return response.data;
  },
  markUsersViewed: async () => {
    const response = await api.post('/api/admin/users/mark-viewed/');
    return response.data;
  },
  getUser: async (id: number) => {
    const response = await api.get(`/api/admin/users/${id}/`);
    return response.data;
  },
  updateUser: async (id: number, data: any) => {
    const response = await api.patch(`/api/admin/users/${id}/`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/api/admin/users/${id}/`);
    return response.data;
  },
  getContacts: async () => {
    const response = await api.get('/api/admin/contacts/');
    return response.data;
  },
  markContactsViewed: async () => {
    const response = await api.post('/api/admin/contacts/mark-viewed/');
    return response.data;
  },
  bulkUpdateContactStatus: async (ids: number[], status: string) => {
    const response = await api.post('/api/admin/contacts/bulk-status/', { ids, status });
    return response.data;
  },
};
