import { bookingsApi, type CustomerBooking } from '@/src/customer/api/bookings.api';

export type { CustomerBooking } from '@/src/customer/api/bookings.api';

export type CustomerBookingStatus = CustomerBooking['status'];

export type NewCustomerBooking = {
  hotelId: string;
  roomId?: string;
  bookingType: string;
  checkIn: string;
  checkOut: string;
  voucherCode?: string;
};

export const customerBookingsStorage = {
  getAll: async (): Promise<CustomerBooking[]> => bookingsApi.getAll(),

  add: async (booking: NewCustomerBooking): Promise<CustomerBooking> =>
    bookingsApi.create({
      hotelId: booking.hotelId,
      roomTypeId: booking.roomId || '',
      bookingType: booking.bookingType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      voucherCode: booking.voucherCode,
    }),

  getById: async (id: string): Promise<CustomerBooking | null> => {
    try {
      return await bookingsApi.getById(id);
    } catch {
      return null;
    }
  },

  updateStatus: async (id: string, status: CustomerBookingStatus): Promise<CustomerBooking | null> => {
    if (status === 'Da huy') {
      return bookingsApi.cancel(id);
    }
    return customerBookingsStorage.getById(id);
  },
};
