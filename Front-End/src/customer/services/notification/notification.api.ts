import apiInstance from "@/src/customer/core/api/api.instance";
import type { CustomerNotification } from "@/src/customer/types/notification";

type DataResponse<T> = {
  data: T;
};

const BASE = "/api/customer";

export const notificationsApi = {
  getNotifications: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.get<DataResponse<CustomerNotification[]>>(
      `${BASE}/notifications`,
    );
    return res.data.data;
  },

  markAllNotificationsAsRead: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.patch<DataResponse<CustomerNotification[]>>(
      `${BASE}/notifications/read-all`,
    );
    return res.data.data;
  },

  deleteAllNotifications: async (): Promise<CustomerNotification[]> => {
    const res = await apiInstance.delete<DataResponse<CustomerNotification[]>>(
      `${BASE}/notifications`,
    );
    return res.data.data;
  },

  deleteNotification: async (id: string): Promise<CustomerNotification[]> => {
    const res = await apiInstance.delete<DataResponse<CustomerNotification[]>>(
      `${BASE}/notifications/${id}`,
    );
    return res.data.data;
  },
};
