import apiInstance from '../../../shared/api/api.instance';
import type { CustomerMessage, CustomerNotification } from '../types/messages.types';

type DataResponse<T> = {
  data: T;
};

const BASE = '/api/customer';

export const messagesApi = {
  getMessages: async (): Promise<CustomerMessage[]> => {
    const res = await apiInstance.get<DataResponse<CustomerMessage[]>>(`${BASE}/messages`);
    return res.data.data;
  },

  markMessageAsRead: async (id: string): Promise<CustomerMessage> => {
    const res = await apiInstance.patch<DataResponse<CustomerMessage>>(`${BASE}/messages/${id}/read`);
    return res.data.data;
  },

  getNotifications: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.get<DataResponse<CustomerNotification[]>>(`${BASE}/notifications`);
    return res.data.data;
  },

  markAllNotificationsAsRead: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.patch<DataResponse<CustomerNotification[]>>(`${BASE}/notifications/read-all`);
    return res.data.data;
  },

  deleteAllNotifications: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.delete<DataResponse<CustomerNotification[]>>(`${BASE}/notifications`);
    return res.data.data;
  },

  deleteNotification: async (id: string): Promise<CustomerNotification[]> => {
    const res = await apiInstance.delete<DataResponse<CustomerNotification[]>>(`${BASE}/notifications/${id}`);
    return res.data.data;
  },
};
