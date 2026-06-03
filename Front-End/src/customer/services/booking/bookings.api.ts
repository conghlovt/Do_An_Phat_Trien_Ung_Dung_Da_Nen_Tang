import apiInstance from '@/src/customer/core/api/api.instance';
import type { ApiResponse } from '@/src/customer/core/types/api.types';
import type { CustomerBooking } from '@/src/customer/utils/booking/customerBookings';

const BASE = '/api/customer/bookings';

export type CreateBookingPayload = {
  hotelId: string;
  roomId: string;
  paymentMethod?: 'VIETQR' | 'PAY_AT_HOTEL';
  bookingType: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  amount: number;
  durationValue?: number;
  customerName?: string;
  customerPhone?: string;
  voucherCode?: string;
};

export type CheckoutVoucher = {
  id: string;
  hotelId?: string | null;
  code: string;
  name: string;
  discount: number;
  finalTotal: number;
  discountType?: string;
  discountValue?: number;
};

export type ValidateVoucherResponse = {
  voucher: CheckoutVoucher;
  discount: number;
  finalTotal: number;
};

export type BookingPaymentQr = {
  id: string;
  method: 'VIETQR' | 'PAY_AT_HOTEL';
  paymentCode: string | null;
  amount: number;
  content: string | null;
  bankCode: string | null;
  bankName?: string | null;
  accountNumber: string | null;
  accountName: string | null;
  vietQrUrl: string | null;
  status: PaymentStatus;
  attemptNo: number | null;
  expiresAt: string | null;
  graceExpiresAt: string | null;
  expiredAt: string | null;
  paidAt: string | null;
  failureReason: PaymentFailureReason | null;
  failureMessage: string | null;
  phase: PaymentPhase;
};

export type CreateBookingResponse = {
  booking: CustomerBooking;
  payment: BookingPaymentQr | null;
  support?: PaymentSupport;
};

export type CreateQrBookingResponse = CreateBookingResponse & {
  payment: BookingPaymentQr;
};

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXPIRED_FINAL'
  | 'PAYMENT_NOT_RECORDED';

export type PaymentFailureReason =
  | 'NO_VALID_WEBHOOK'
  | 'INVALID_AMOUNT'
  | 'INVALID_CONTENT'
  | 'LATE_PAYMENT'
  | 'INVALID_ACCOUNT'
  | 'PAYMENT_EXPIRED_OR_CANCELLED'
  | 'PAYMENT_NOT_FOUND'
  | string;

export type PaymentPhase =
  | 'NONE'
  | 'ACTIVE'
  | 'GRACE'
  | 'EXPIRED_FINAL'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED'
  | 'PAYMENT_NOT_RECORDED';

export type PaymentSupport = {
  email: string;
  chatbox: string;
};

export type BookingPaymentStatus = {
  bookingId: string;
  bookingCode: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: PaymentStatus;
  paymentPhase: PaymentPhase;
  amount: number;
  failureReason: PaymentFailureReason | null;
  failureMessage: string | null;
  expiresAt: string | null;
  graceExpiresAt: string | null;
  serverNow: string;
  paidAt: string | null;
  canCreateNewQr: boolean;
  isPaid: boolean;
  support?: PaymentSupport;
};

export const bookingsApi = {
  create: async (payload: CreateBookingPayload): Promise<CreateBookingResponse> => {
    const res = await apiInstance.post<ApiResponse<CreateBookingResponse>>(BASE, payload);
    return res.data.data;
  },

  getCheckoutVouchers: async (
    hotelId: string,
    params?: { roomTypeId?: string; subtotal?: number },
  ): Promise<CheckoutVoucher[]> => {
    const res = await apiInstance.get<ApiResponse<{ vouchers: CheckoutVoucher[] }>>(
      `/api/customer/hotels/${hotelId}/vouchers`,
      { params },
    );
    return res.data.data.vouchers || [];
  },

  validateVoucher: async (
    hotelId: string,
    payload: { code: string; roomTypeId?: string; subtotal: number },
  ): Promise<ValidateVoucherResponse> => {
    const res = await apiInstance.post<ApiResponse<ValidateVoucherResponse>>(
      `/api/customer/hotels/${hotelId}/vouchers/validate`,
      payload,
    );
    return res.data.data;
  },

  getMine: async (): Promise<CustomerBooking[]> => {
    const res = await apiInstance.get<ApiResponse<CustomerBooking[]>>(BASE);
    return res.data.data;
  },

  getById: async (id: string): Promise<CustomerBooking> => {
    const res = await apiInstance.get<ApiResponse<CustomerBooking>>(`${BASE}/${id}`);
    return res.data.data;
  },

  getPaymentStatus: async (id: string): Promise<BookingPaymentStatus> => {
    const res = await apiInstance.get<ApiResponse<BookingPaymentStatus>>(`${BASE}/${id}/payment-status`);
    return res.data.data;
  },

  createNewQr: async (id: string): Promise<CreateQrBookingResponse> => {
    const res = await apiInstance.post<ApiResponse<CreateQrBookingResponse>>(`${BASE}/${id}/payment/new-qr`);
    return res.data.data;
  },

  cancel: async (id: string): Promise<CustomerBooking> => {
    const res = await apiInstance.patch<ApiResponse<CustomerBooking>>(`${BASE}/${id}/cancel`);
    return res.data.data;
  },
};
