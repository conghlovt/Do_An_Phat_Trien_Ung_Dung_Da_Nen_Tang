import apiInstance from '../../login/shared/api/api.instance';

export type AdminQuery = Record<string, string | number | boolean | undefined | null>;

const cleanParams = (query?: AdminQuery) =>
  Object.fromEntries(
    Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

const params = (query?: AdminQuery | string, page?: number, limit?: number, role?: string) => {
  if (typeof query === 'object' && query !== null) {
    return { params: cleanParams(query) };
  }

  return {
    params: cleanParams({
      ...(query ? { search: query } : {}),
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(role ? { role } : {}),
    }),
  };
};

const getDownloadFilename = (headers: any, fallback: string) => {
  const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition'];
  const match = String(disposition || '').match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const adminService = {
  getStats: async (query?: AdminQuery) => {
    const response = await apiInstance.get('/admin/stats', params(query));
    return response.data.data;
  },

  getNotifications: async () => {
    const response = await apiInstance.get('/admin/notifications');
    return response.data.data;
  },

  getUsers: async (query?: AdminQuery | string, page?: number, limit?: number, role?: string) => {
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

  blockUser: async (id: string) => {
    const response = await apiInstance.put(`/admin/users/${id}/block`);
    return response.data.data;
  },

  unblockUser: async (id: string) => {
    const response = await apiInstance.put(`/admin/users/${id}/unblock`);
    return response.data.data;
  },

  getRolePermissions: async () => {
    const response = await apiInstance.get('/admin/roles/permissions');
    return response.data.data;
  },

  getRolePermission: async (role: string) => {
    const response = await apiInstance.get(`/admin/roles/${role}/permissions`);
    return response.data.data;
  },

  getPermissions: async () => {
    const response = await apiInstance.get('/admin/roles/permissions');
    return response.data.data;
  },

  updateRolePermissions: async (role: string, permissions: any) => {
    const response = await apiInstance.put(`/admin/roles/${role}/permissions`, { permissions });
    return response.data.data;
  },

  updatePermissions: async (role: string, permissions: any) => {
    const response = await apiInstance.put(`/admin/roles/${role}/permissions`, { permissions });
    return response.data.data;
  },

  getVouchers: async (query?: AdminQuery | string, page?: number, limit?: number) => {
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

  getProperties: async (query?: AdminQuery | string) => {
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

  getBookings: async (query?: AdminQuery | string) => {
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

  getReviews: async (query?: AdminQuery | string) => {
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

  getContent: async (query?: AdminQuery | string) => {
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

  getFinance: async (query?: AdminQuery) => {
    const response = await apiInstance.get('/admin/finance', params(query));
    return response.data.data;
  },

  exportResource: async (resource: string, query?: AdminQuery) => {
    return apiInstance.get(`/admin/export/${resource}`, {
      params: cleanParams(query),
      responseType: 'blob',
    });
  },

  downloadExport: async (resource: string, query?: AdminQuery, fallbackPrefix = resource) => {
    const response = await adminService.exportResource(resource, query);
    const fallback = `${fallbackPrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const filename = getDownloadFilename(response.headers, fallback);
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
    return { filename };
  },
};
