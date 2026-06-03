import { QrCode, Landmark } from 'lucide-react-native';
import { BookingPaymentQr, CreateQrBookingResponse } from '@/src/customer/services/booking/bookings.api';

export const QR_PAYMENT_DURATION_MS = 15 * 60 * 1000;
export const QR_GRACE_DURATION_MS = 5 * 60 * 1000;
export const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
export const SUPPORT_EMAIL = 'support@stayhub.com';
export const PAYMENT_RULES = [
  'Vui lòng thanh toán trong vòng 15 phút.',
  'Chuyển khoản đúng số tiền và đúng nội dung hiển thị trên màn hình.',
  'Sau khi hết 15 phút, hệ thống tiếp tục kiểm tra giao dịch trong tối đa 5 phút.',
  'Sau thời gian này, nếu quý khách vẫn thực hiện chuyển khoản, hệ thống có thể không tự động ghi nhận thanh toán.',
  'Nếu đã chuyển tiền nhưng chưa được xác nhận, vui lòng gửi khiếu nại hoặc liên hệ trung tâm hỗ trợ qua email/chatbox.',
];

export type PaymentMethodId = 'vietqr' | 'hotel';

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  title: string;
  description: string;
  available: boolean;
  Icon: typeof QrCode;
}[] = [
    {
      id: 'vietqr',
      title: 'QR chuyển khoản VietQR',
      description: 'Tự động xác nhận qua SePay khi chuyển đúng số tiền và nội dung.',
      available: true,
      Icon: QrCode,
    },
    {
      id: 'hotel',
      title: 'Thanh toán tại khách sạn',
      description: 'Giữ phòng ngay và thanh toán trực tiếp khi nhận phòng.',
      available: true,
      Icon: Landmark,
    },
  ];

export type BookingPoint = {
  time: string;
  dateText: string;
  date: Date | null;
};

export function formatMoney(value?: string) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function parseBookingPoint(value?: string): BookingPoint {
  const fallbackYear = new Date().getFullYear();
  const match = value?.match(/(\d{1,2}:\d{2}).*?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);

  if (!match) {
    return { time: '--:--', dateText: '--/--/----', date: null };
  }

  const [, time, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText || fallbackYear);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return { time, dateText: `${dayText}/${monthText}/${yearText || fallbackYear}`, date: null };
  }

  const date = new Date(year, month - 1, day);
  return {
    time,
    dateText: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
    date,
  };
}

export function formatCancellationDeadline(checkIn: BookingPoint) {
  if (!checkIn.date) return 'trước giờ nhận phòng';

  const [hours, minutes] = checkIn.time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return `trước ${checkIn.dateText}`;
  }

  const deadline = new Date(checkIn.date);
  deadline.setHours(hours - 1, minutes, 0, 0);

  return `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}, ${String(deadline.getDate()).padStart(2, '0')}/${String(deadline.getMonth() + 1).padStart(2, '0')}/${deadline.getFullYear()}`;
}

export function toBookingIso(point: BookingPoint) {
  const date = point.date ? new Date(point.date) : new Date();
  const [hours, minutes] = point.time.split(':').map(Number);

  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }

  return date.toISOString();
}

export function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.message || 'Không thể tạo thanh toán.';
  }

  return error instanceof Error ? error.message : 'Không thể tạo thanh toán.';
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTimeMs(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function withLocalQrCountdown(session: CreateQrBookingResponse, nowMs = Date.now()): CreateQrBookingResponse {
  const expiresAtMs = getTimeMs(session.payment.expiresAt) || nowMs + QR_PAYMENT_DURATION_MS;
  const graceExpiresAtMs = getTimeMs(session.payment.graceExpiresAt) || expiresAtMs + QR_GRACE_DURATION_MS;

  return {
    ...session,
    payment: {
      ...session.payment,
      expiresAt: new Date(expiresAtMs).toISOString(),
      graceExpiresAt: new Date(graceExpiresAtMs).toISOString(),
    },
  };
}

export function getLocalPaymentPhase(payment: BookingPaymentQr, nowMs: number) {
  if (payment.status === 'PAID') return 'PAID';
  if (payment.status === 'EXPIRED_FINAL' || payment.status === 'PAYMENT_NOT_RECORDED') return 'EXPIRED_FINAL';
  if (payment.status !== 'PENDING') return payment.status;

  const expiresAt = getTimeMs(payment.expiresAt);
  const graceExpiresAt = getTimeMs(payment.graceExpiresAt);

  if (graceExpiresAt && nowMs >= graceExpiresAt) return 'EXPIRED_FINAL';
  if (expiresAt && nowMs >= expiresAt) return 'GRACE';
  return 'ACTIVE';
}

export function getPaymentFailureText(payment: BookingPaymentQr) {
  if (payment.failureMessage) return payment.failureMessage;

  switch (payment.failureReason) {
    case 'NO_VALID_WEBHOOK':
      return 'Không có webhook hợp lệ gửi về backend trong thời gian tự động ghi nhận.';
    case 'INVALID_AMOUNT':
      return 'Giao dịch chuyển thiếu tiền so với số tiền cần thanh toán.';
    case 'INVALID_CONTENT':
      return 'Nội dung chuyển khoản không khớp bookingCode/paymentCode.';
    case 'LATE_PAYMENT':
      return 'Giao dịch đến sau thời gian cho phép và cần được hỗ trợ kiểm tra thủ công.';
    case 'INVALID_ACCOUNT':
      return 'Giao dịch gửi tới sai tài khoản nhận tiền.';
    case 'PAYMENT_EXPIRED_OR_CANCELLED':
      return 'Payment đã hết hạn hoặc đã bị hủy.';
    case 'PAYMENT_NOT_FOUND':
      return 'Hệ thống không tìm được booking/payment tương ứng.';
    default:
      return 'Không ghi nhận được thanh toán tự động.';
  }
}

