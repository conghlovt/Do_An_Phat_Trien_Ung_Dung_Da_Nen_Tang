import apiInstance from '../../core/api/api.instance';

const params = (q?: string, page?: number, limit?: number, role?: string) => ({
  params: {
    ...(q ? { q } : {}),
    ...(page ? { page } : {}),
    ...(limit ? { limit } : {}),
    ...(role ? { role } : {}),
  }
});

export const adminService = {
  getStats: async () => {
    const response = await apiInstance.get('/admin/stats');
    return response.data.data;
  },

  getNotifications: async () => {
    const response = await apiInstance.get('/admin/notifications');
    return response.data.data;
  },

  getUsers: async (query?: string, page?: number, limit?: number, role?: string) => {
    const response = await apiInstance.get('/admin/users', params(query, page, limit, role));
    return response.data.data;
  },

  createUser: async (userData: any) => {
    const response = await apiInstance.post('/admin/users', userData);
    return response.data.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiInstance.put(`/admin/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiInstance.delete(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await apiInstance.put(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  getPermissions: async () => {
    const response = await apiInstance.get('/admin/permissions');
    return response.data.data;
  },

  updatePermissions: async (role: string, permissions: any) => {
    const response = await apiInstance.put(`/admin/permissions/${role}`, { permissions });
    return response.data.data;
  },

  getVouchers: async (query?: string, page?: number, limit?: number) => {
    const response = await apiInstance.get('/admin/vouchers', params(query, page, limit));
    return response.data.data;
  },

  createVoucher: async (voucherData: any) => {
    const response = await apiInstance.post('/admin/vouchers', voucherData);
    return response.data.data;
  },

  updateVoucher: async (id: string, voucherData: any) => {
    const response = await apiInstance.put(`/admin/vouchers/${id}`, voucherData);
    return response.data.data;
  },

  deleteVoucher: async (id: string) => {
    const response = await apiInstance.delete(`/admin/vouchers/${id}`);
    return response.data.data;
  },

  getProperties: async (query?: string) => {
    const response = await apiInstance.get('/admin/properties', params(query));
    return response.data.data;
  },

  updateProperty: async (id: string, data: any) => {
    const response = await apiInstance.put(`/admin/properties/${id}`, data);
    return response.data.data;
  },

  updatePropertyStatus: async (id: string, status: string) => {
    const response = await apiInstance.put(`/admin/properties/${id}/status`, { status });
    return response.data.data;
  },

  deleteProperty: async (id: string) => {
    const response = await apiInstance.delete(`/admin/properties/${id}`);
    return response.data.data;
  },

  getBookings: async (query?: string) => {
    const response = await apiInstance.get('/admin/bookings', params(query));
    return response.data.data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const response = await apiInstance.put(`/admin/bookings/${id}/status`, { status });
    return response.data.data;
  },

  deleteBooking: async (id: string) => {
    const response = await apiInstance.delete(`/admin/bookings/${id}`);
    return response.data.data;
  },

  getReviews: async (query?: string) => {
    const response = await apiInstance.get('/admin/reviews', params(query));
    return response.data.data;
  },

  updateReview: async (id: string, data: any) => {
    const response = await apiInstance.put(`/admin/reviews/${id}`, data);
    return response.data.data;
  },

  deleteReview: async (id: string) => {
    const response = await apiInstance.delete(`/admin/reviews/${id}`);
    return response.data.data;
  },

  getContent: async (query?: string) => {
    const response = await apiInstance.get('/admin/content', params(query));
    return response.data.data;
  },

  createContent: async (data: any) => {
    const response = await apiInstance.post('/admin/content', data);
    return response.data.data;
  },

  updateContent: async (id: string, data: any) => {
    const response = await apiInstance.put(`/admin/content/${id}`, data);
    return response.data.data;
  },

  deleteContent: async (id: string) => {
    const response = await apiInstance.delete(`/admin/content/${id}`);
    return response.data.data;
  },

  getFinance: async () => {
    const response = await apiInstance.get('/admin/finance');
    return response.data.data;
  }
};
