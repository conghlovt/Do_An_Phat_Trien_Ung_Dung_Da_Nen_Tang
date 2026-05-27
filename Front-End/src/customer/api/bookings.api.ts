import apiInstance from '@/src/customer/core/api/api.instance';

export type CustomerBookingStatus = 'Cho nhan phong' | 'Da xac nhan' | 'Hoan thanh' | 'Da huy';

export interface CustomerReview {
  id: string;
  rating: number;
  comment?: string | null;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  createdAt: string;
}

export interface CustomerBooking {
  id: string;
  code: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelImage?: string;
  roomId?: string;
  roomName: string;
  roomImage: string;
  price: string;
  totalPrice: number;
  voucherCode?: string | null;
  bookingType: string;
  checkIn: string;
  checkOut: string;
  hours?: string;
  guests?: number;
  customerName?: string;
  customerPhone?: string | null;
  status: CustomerBookingStatus;
  rawStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  canReview?: boolean;
  review?: CustomerReview | null;
}

export interface CreateBookingPayload {
  hotelId: string;
  roomTypeId: string;
  bookingType: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  voucherCode?: string;
}

export interface CheckoutVoucher {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: string;
  applicableRoomTypeIds: string[];
  discount: number;
  finalTotal?: number;
}

export const bookingsApi = {
  create: async (payload: CreateBookingPayload): Promise<CustomerBooking> => {
    const res = await apiInstance.post<{ data: { booking: CustomerBooking } }>('/api/customer/bookings', payload);
    return res.data.data.booking;
  },

  getAll: async (): Promise<CustomerBooking[]> => {
    const res = await apiInstance.get<{ data: { bookings: CustomerBooking[] } }>('/api/customer/bookings');
    return res.data.data.bookings;
  },

  getById: async (id: string): Promise<CustomerBooking> => {
    const res = await apiInstance.get<{ data: { booking: CustomerBooking } }>(`/api/customer/bookings/${id}`);
    return res.data.data.booking;
  },

  cancel: async (id: string): Promise<CustomerBooking> => {
    const res = await apiInstance.patch<{ data: { booking: CustomerBooking } }>(`/api/customer/bookings/${id}/cancel`);
    return res.data.data.booking;
  },

  createReview: async (
    bookingId: string,
    payload: { rating: number; comment?: string },
  ): Promise<CustomerReview> => {
    const res = await apiInstance.post<{ data: { review: CustomerReview } }>(
      `/api/customer/bookings/${bookingId}/reviews`,
      payload,
    );
    return res.data.data.review;
  },
};

export const checkoutVouchersApi = {
  list: async (
    hotelId: string,
    params: { roomTypeId?: string; subtotal: number },
  ): Promise<CheckoutVoucher[]> => {
    const res = await apiInstance.get<{ data: { vouchers: CheckoutVoucher[] } }>(
      `/api/customer/hotels/${hotelId}/vouchers`,
      { params },
    );
    return res.data.data.vouchers;
  },

  validate: async (
    hotelId: string,
    payload: { code: string; roomTypeId?: string; subtotal: number },
  ): Promise<{ voucher: CheckoutVoucher; discount: number; finalTotal: number }> => {
    const res = await apiInstance.post<{
      data: { voucher: CheckoutVoucher; discount: number; finalTotal: number };
    }>(`/api/customer/hotels/${hotelId}/vouchers/validate`, payload);
    return res.data.data;
  },
};
