import axios from 'axios';
import type { Booking } from '../types/booking.type';

const BASE = '/api/partner/bookings';

export const bookingApi = {
  getBookings: async (status?: string) => {
    const res = await axios.get<{ data: { bookings: Booking[] } }>(BASE, {
      params: status ? { status } : undefined,
    });
    return res.data.data.bookings;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const res = await axios.patch<{ data: { booking: Booking } }>(`${BASE}/${id}/status`, { status });
    return res.data.data.booking;
  },
};
