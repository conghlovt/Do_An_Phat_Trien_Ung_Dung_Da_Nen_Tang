import apiInstance from '../../core/api/api.instance';

export const adminService = {
  getStats: async () => {
    const response = await apiInstance.get('/admin/stats');
    return response.data.data;
  },

  getUsers: async () => {
    const response = await apiInstance.get('/admin/users');
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

  getVouchers: async () => {
    const response = await apiInstance.get('/admin/vouchers');
    return response.data.data;
  },

  createVoucher: async (voucherData: any) => {
    const response = await apiInstance.post('/admin/vouchers', voucherData);
    return response.data.data;
  },

  deleteVoucher: async (id: string) => {
    const response = await apiInstance.delete(`/admin/vouchers/${id}`);
    return response.data.data;
  },

  getProperties: async () => {
    const response = await apiInstance.get('/admin/properties');
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

  getBookings: async () => {
    const response = await apiInstance.get('/admin/bookings');
    return response.data.data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const response = await apiInstance.put(`/admin/bookings/${id}/status`, { status });
    return response.data.data;
  },

  getFinance: async () => {
    const response = await apiInstance.get('/admin/finance');
    return response.data.data;
  }
};
