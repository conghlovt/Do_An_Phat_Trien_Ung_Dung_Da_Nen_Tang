import apiInstance from '../core/api/api.instance';
import type { ApiResponse } from '../core/types/api.types';
import type { Booking } from '../types/booking.type';

const BASE = '/partner/bookings';

export const bookingApi = {
  getBookings: async (status?: string) => {
    const res = await apiInstance.get<ApiResponse<{ bookings: Booking[] }>>(BASE, {
      params: status ? { status } : undefined,
    });
    return res.data.data.bookings;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const res = await apiInstance.patch<ApiResponse<{ booking: Booking }>>(`${BASE}/${id}/status`, { status });
    return res.data.data.booking;
  },
};
