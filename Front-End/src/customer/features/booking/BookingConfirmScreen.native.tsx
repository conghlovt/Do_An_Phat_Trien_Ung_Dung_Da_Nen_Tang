import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Landmark,
  Mail,
  MessageCircle,
  QrCode,
  RefreshCw,
  Tag,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { bookingsApi, type BookingPaymentQr, type CheckoutVoucher, type CreateQrBookingResponse, type ValidateVoucherResponse } from '@/src/customer/services/booking/bookings.api';
import { useAuth } from '@/src/customer/hooks/useAuth';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { getParamText } from '@/src/customer/navigation/routeParams';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { getBookingDurationLabel } from '@/src/customer/utils/rooms/roomDisplay';
import { getStayHubPaymentView } from '@/src/customer/utils/booking/sepay';

const PRIMARY = '#85c2a4';
const PRIMARY_FILL = 'rgba(133,194,164,0.35)';
const TEXT_DARK = '#25252d';
const TEXT_MUTED = '#85858d';
const BORDER = '#ededf1';
const SURFACE = '#ffffff';
const PAGE_BG = '#f7f7f8';
const SUCCESS = PRIMARY;
const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
const SUPPORT_EMAIL = 'support@stayhub.com';
const SUPPORT_CHATBOX = 'Chatbox realtime';
const QR_PAYMENT_DURATION_MS = 15 * 60 * 1000;
const QR_GRACE_DURATION_MS = 5 * 60 * 1000;
const PAYMENT_RULES = [
  'Vui lòng thanh toán trong vòng 15 phút.',
  'Chuyển khoản đúng số tiền và đúng nội dung hiển thị trên màn hình.',
  'Sau khi hết 15 phút, hệ thống tiếp tục kiểm tra giao dịch trong tối đa 5 phút.',
  'Sau thời gian này, nếu quý khách vẫn thực hiện chuyển khoản, hệ thống có thể không tự động ghi nhận thanh toán.',
  'Nếu đã chuyển tiền nhưng chưa được xác nhận, vui lòng gửi khiếu nại hoặc liên hệ trung tâm hỗ trợ qua email/chatbox.',
];

type PaymentMethodId = 'vietqr' | 'hotel';

const PAYMENT_METHODS: {
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

type BookingPoint = {
  time: string;
  dateText: string;
  date: Date | null;
};

function formatMoney(value?: string) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function parseBookingPoint(value?: string): BookingPoint {
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

function formatCancellationDeadline(checkIn: BookingPoint) {
  if (!checkIn.date) return 'trước giờ nhận phòng';

  const [hours, minutes] = checkIn.time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return `trước ${checkIn.dateText}`;
  }

  const deadline = new Date(checkIn.date);
  deadline.setHours(hours - 1, minutes, 0, 0);

  return `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}, ${String(deadline.getDate()).padStart(2, '0')}/${String(deadline.getMonth() + 1).padStart(2, '0')}/${deadline.getFullYear()}`;
}

function toBookingIso(point: BookingPoint) {
  const date = point.date ? new Date(point.date) : new Date();
  const [hours, minutes] = point.time.split(':').map(Number);

  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }

  return date.toISOString();
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.message || 'Không thể tạo thanh toán.';
  }

  return error instanceof Error ? error.message : 'Không thể tạo thanh toán.';
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getTimeMs(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function withLocalQrCountdown(session: CreateQrBookingResponse, nowMs = Date.now()): CreateQrBookingResponse {
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

function getLocalPaymentPhase(payment: BookingPaymentQr, nowMs: number) {
  if (payment.status === 'PAID') return 'PAID';
  if (payment.status === 'EXPIRED_FINAL' || payment.status === 'PAYMENT_NOT_RECORDED') return 'EXPIRED_FINAL';
  if (payment.status !== 'PENDING') return payment.status;

  const expiresAt = getTimeMs(payment.expiresAt);
  const graceExpiresAt = getTimeMs(payment.graceExpiresAt);

  if (graceExpiresAt && nowMs >= graceExpiresAt) return 'EXPIRED_FINAL';
  if (expiresAt && nowMs >= expiresAt) return 'GRACE';
  return 'ACTIVE';
}

function getPaymentFailureText(payment: BookingPaymentQr) {
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

export default function BookingConfirmScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/bookings');
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    hotelId?: string;
    hotelName?: string;
    hotelAddress?: string;
    hotelImage?: string;
    roomId?: string;
    roomName?: string;
    roomImage?: string;
    price?: string;
    bookingType?: string;
    checkIn?: string;
    checkOut?: string;
    hours?: string;
  }>();

  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [paymentSession, setPaymentSession] = useState<CreateQrBookingResponse | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [creatingNewQr, setCreatingNewQr] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [expiredNoticePaymentId, setExpiredNoticePaymentId] = useState<string | null>(null);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<PaymentMethodId | null>('vietqr');
  const [voucherCode, setVoucherCode] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<CheckoutVoucher[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<ValidateVoucherResponse | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const isWebLayout = false;

  const hotelName = getParamText(params.hotelName) || 'Khách sạn';
  const hotelId = getParamText(params.hotelId) || '';
  const roomId = getParamText(params.roomId) || '';
  const roomName = getParamText(params.roomName) || 'STANDARD ROOM';
  const hotelAddress = getParamText(params.hotelAddress) || 'Địa chỉ khách sạn đang cập nhật';
  const roomImage = getParamText(params.roomImage) || DEFAULT_ROOM_IMAGE;
  const amount = Math.round(Number(getParamText(params.price)) || 0);
  const price = formatMoney(String(amount));
  const payableAmount = appliedVoucher
    ? Math.max(0, Math.round(Number(appliedVoucher.finalTotal || amount)))
    : amount;
  const payablePrice = formatMoney(String(payableAmount));
  const discountAmount = appliedVoucher
    ? Math.max(0, Math.round(Number(appliedVoucher.discount || 0)))
    : 0;
  const discountPrice = formatMoney(String(discountAmount));
  const bookingType = getParamText(params.bookingType) || 'Theo giờ';
  const durationLabel = getBookingDurationLabel(bookingType, getParamText(params.hours));
  const checkIn = useMemo(() => parseBookingPoint(getParamText(params.checkIn)), [params.checkIn]);
  const checkOut = useMemo(() => parseBookingPoint(getParamText(params.checkOut)), [params.checkOut]);
  const cancellationDeadline = useMemo(() => formatCancellationDeadline(checkIn), [checkIn]);
  const customerName = user?.username || 'Joyer.673';
  const customerPhone = 'Chưa cập nhật';
  const selectedPaymentMethod = PAYMENT_METHODS.find(method => method.id === selectedPaymentMethodId);
  const paymentActionLabel = !selectedPaymentMethodId
    ? 'Chọn thanh toán'
    : selectedPaymentMethodId === 'hotel'
      ? 'Đặt phòng'
      : 'Thanh toán';
  const savingActionLabel = selectedPaymentMethodId === 'hotel'
    ? 'Đang đặt phòng...'
    : 'Đang tạo QR...';
  const activePaymentId = paymentSession?.payment.id;
  const activePaymentExpiresAt = paymentSession?.payment.expiresAt;
  const activePaymentGraceExpiresAt = paymentSession?.payment.graceExpiresAt;

  useEffect(() => {
    if (!hotelId || !amount) return;

    let active = true;
    bookingsApi
      .getCheckoutVouchers(hotelId, { roomTypeId: roomId || undefined, subtotal: amount })
      .then((vouchers) => {
        if (active) setAvailableVouchers(vouchers);
      })
      .catch(() => {
        if (active) setAvailableVouchers([]);
      });

    return () => {
      active = false;
    };
  }, [amount, hotelId, roomId]);

  useEffect(() => {
    if (!activePaymentId || confirmed) return;

    const updateCountdown = () => {
      setNow(Date.now());
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [
    activePaymentId,
    activePaymentExpiresAt,
    activePaymentGraceExpiresAt,
    confirmed,
  ]);

  const checkPaymentStatus = async (showLoading = false) => {
    if (!paymentSession || confirmed) return;

    if (showLoading) setCheckingPayment(true);
    try {
      const status = await bookingsApi.getPaymentStatus(paymentSession.booking.id);
      if (status.isPaid) {
        setConfirmedBookingId(paymentSession.booking.id);
        setConfirmedBookingCode(paymentSession.booking.code);
        setConfirmed(true);
        return;
      }

      setPaymentSession(current => current
        ? {
          ...current,
          support: status.support || current.support,
          payment: {
            ...current.payment,
            status: status.paymentStatus,
            phase: status.paymentPhase,
            expiresAt: status.expiresAt || current.payment.expiresAt,
            graceExpiresAt: status.graceExpiresAt || current.payment.graceExpiresAt,
            paidAt: status.paidAt,
            failureReason: status.failureReason,
            failureMessage: status.failureMessage,
          },
        }
        : current);

      if (status.canCreateNewQr) {
        setPaymentError(status.failureMessage || 'Không ghi nhận được thanh toán trong thời gian tự động. Quý khách có thể tạo QR mới hoặc gửi khiếu nại để được hỗ trợ.');
      }
    } catch (error) {
      if (showLoading) setPaymentError(getErrorMessage(error));
    } finally {
      if (showLoading) setCheckingPayment(false);
    }
  };

  useEffect(() => {
    if (!paymentSession || confirmed) return;

    let active = true;
    const poll = async () => {
      try {
        const status = await bookingsApi.getPaymentStatus(paymentSession.booking.id);
        if (active && status.isPaid) {
          setConfirmedBookingId(paymentSession.booking.id);
          setConfirmedBookingCode(paymentSession.booking.code);
          setConfirmed(true);
          return;
        }

        if (active) {
          setPaymentSession(current => current
            ? {
              ...current,
              support: status.support || current.support,
              payment: {
                ...current.payment,
                status: status.paymentStatus,
                phase: status.paymentPhase,
                expiresAt: status.expiresAt || current.payment.expiresAt,
                graceExpiresAt: status.graceExpiresAt || current.payment.graceExpiresAt,
                paidAt: status.paidAt,
                failureReason: status.failureReason,
                failureMessage: status.failureMessage,
              },
            }
            : current);

          if (status.canCreateNewQr) {
            setPaymentError(status.failureMessage || 'Không ghi nhận được thanh toán trong thời gian tự động. Quý khách có thể tạo QR mới hoặc gửi khiếu nại để được hỗ trợ.');
          }
        }
      } catch { }
    };

    void poll();
    const timer = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [paymentSession, confirmed]);

  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = String(codeOverride || voucherCode).trim();
    if (!hotelId || !roomId) {
      setVoucherError('Không đủ thông tin phòng để áp dụng ưu đãi.');
      return;
    }
    if (!code) {
      setVoucherError('Vui lòng nhập mã ưu đãi.');
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const result = await bookingsApi.validateVoucher(hotelId, {
        code,
        roomTypeId: roomId,
        subtotal: amount,
      });
      setAppliedVoucher(result);
      setVoucherCode(result.voucher.code);
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherError(getErrorMessage(error));
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const handleConfirmBooking = async () => {
    if (saving) return;
    if (!selectedPaymentMethodId) {
      setShowPaymentMethodSheet(true);
      return;
    }

    const selectedMethodId = selectedPaymentMethodId;
    const apiPaymentMethod = selectedMethodId === 'hotel' ? 'PAY_AT_HOTEL' : 'VIETQR';

    setSaving(true);
    setPaymentError(null);
    try {
      console.log('[handleConfirmBooking] Creating booking with:', {
        hotelId,
        roomId,
        paymentMethod: apiPaymentMethod,
        amount,
        voucherCode: appliedVoucher?.voucher.code,
      });

      const result = await bookingsApi.create({
        hotelId,
        roomId,
        paymentMethod: apiPaymentMethod,
        bookingType,
        checkIn: toBookingIso(checkIn),
        checkOut: toBookingIso(checkOut),
        guests: 1,
        amount,
        durationValue: Number(getParamText(params.hours)) || undefined,
        customerName,
        voucherCode: appliedVoucher?.voucher.code,
        customerPhone: customerPhone === 'Chưa cập nhật' ? undefined : customerPhone,
      });

      console.log('[handleConfirmBooking] API Response:', {
        bookingId: result.booking?.id,
        bookingCode: result.booking?.code,
        paymentMethod: result.payment?.method,
        paymentId: result.payment?.id,
        vietQrUrl: result.payment?.vietQrUrl ? 'present' : 'missing',
        paymentStatus: result.payment?.status,
      });

      if (!result.booking?.id) {
        throw new Error('Không thể tạo đặt phòng.');
      }

      setConfirmedBookingId(result.booking.id);
      setConfirmedBookingCode(result.booking.code);
      setConfirmedPaymentMethod(selectedMethodId);

      if (selectedMethodId === 'hotel') {
        setConfirmed(true);
        return;
      }

      if (!result.payment) {
        const debugMsg = `No payment object returned. Full response: ${JSON.stringify(result)}`;
        console.error('[handleConfirmBooking] Missing payment object:', debugMsg);
        throw new Error('Không thể tạo thông tin thanh toán. Vui lòng thử lại.');
      }

      if (result.payment.method !== 'VIETQR') {
        console.error('[handleConfirmBooking] Wrong payment method:', result.payment.method);
        throw new Error('Không thể tạo mã QR thanh toán. Vui lòng thử lại.');
      }

      console.log('[handleConfirmBooking] QR created successfully, showing payment screen');

      const createdAt = Date.now();
      const qrSession: CreateQrBookingResponse = {
        ...result,
        payment: result.payment,
      };

      setPaymentSession(withLocalQrCountdown(qrSession, createdAt));
      setNow(createdAt);
    } catch (error) {
      const message = getErrorMessage(error);
      setPaymentError(message);
      Alert.alert('Không thể tạo thanh toán', message);
      console.error('[handleConfirmBooking] Error details:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPaymentMethod = (methodId: PaymentMethodId) => {
    const method = PAYMENT_METHODS.find(item => item.id === methodId);
    if (!method?.available) return;

    setSelectedPaymentMethodId(methodId);
    setShowPaymentMethodSheet(false);
  };

  const handlePaymentButtonPress = () => {
    if (!selectedPaymentMethodId) {
      setShowPaymentMethodSheet(true);
      return;
    }

    handleConfirmBooking();
  };

  const handleCreateNewQr = useCallback(async () => {
    if (!paymentSession || creatingNewQr) return;

    setCreatingNewQr(true);
    setPaymentError(null);
    try {
      const result = await bookingsApi.createNewQr(paymentSession.booking.id);
      const createdAt = Date.now();
      setPaymentSession(withLocalQrCountdown(result, createdAt));
      setConfirmedBookingId(result.booking.id);
      setConfirmedBookingCode(result.booking.code);
      setExpiredNoticePaymentId(null);
      setNow(createdAt);
    } catch (error) {
      const message = getErrorMessage(error);
      setPaymentError(message);
      Alert.alert('Không thể tạo QR mới', message);
    } finally {
      setCreatingNewQr(false);
    }
  }, [creatingNewQr, paymentSession]);

  useEffect(() => {
    if (!paymentSession || confirmed) return;

    const paymentId = paymentSession.payment.id;
    const paymentPhase = getLocalPaymentPhase(paymentSession.payment, now);
    if (paymentPhase !== 'EXPIRED_FINAL' || expiredNoticePaymentId === paymentId) return;

    setExpiredNoticePaymentId(paymentId);
    setPaymentError('Mã QR đã hết hạn. Vui lòng nhận mã QR mới để tiếp tục thanh toán.');
    Alert.alert(
      'Mã QR đã hết hạn',
      'Thời gian thanh toán đã kết thúc. Vui lòng nhận mã QR mới để tiếp tục thanh toán.',
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Nhận mã QR mới', onPress: handleCreateNewQr },
      ],
    );
  }, [paymentSession, now, confirmed, expiredNoticePaymentId, handleCreateNewQr]);

  const openSupportEmail = (subject: string) => {
    const email = paymentSession?.support?.email || SUPPORT_EMAIL;
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`).catch(() => { });
  };

  const openSupportChat = () => {
    router.push('/customer/support/contact' as any);
  };

  const openComplaint = () => {
    router.push('/customer/support/contact' as any);
  };

  if (confirmed) {
    const isPayAtHotel = confirmedPaymentMethod === 'hotel';
    const successTitle = isPayAtHotel ? 'Đặt phòng thành công!' : 'Thanh toán thành công!';
    const successText = isPayAtHotel
      ? `Booking ${confirmedBookingCode || paymentSession?.booking.code || ''} tại ${hotelName} đã được giữ phòng. Quý khách thanh toán tại khách sạn khi nhận phòng.`
      : `Booking ${confirmedBookingCode || paymentSession?.booking.code || ''} tại ${hotelName} đã được xác nhận.`;

    return (
      <View
        style={[
          styles.successContainer,
          isWebLayout && styles.webSuccessContainer,
          { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background },
        ]}
      >
        <CheckCircle size={66} color={SUCCESS} />
        <Text style={[styles.successTitle, { color: currentTheme.text }]}>{successTitle}</Text>
        <Text style={[styles.successText, { color: currentTheme.textSecondary }]}>
          {successText}
        </Text>
        {confirmedBookingId && (
          <Pressable
            style={styles.successPrimaryBtn}
            onPress={() => router.replace({ pathname: '/customer/booking/detail' as any, params: { bookingId: confirmedBookingId } })}
          >
            <Text style={styles.successPrimaryText}>Xem chi tiết đặt phòng</Text>
          </Pressable>
        )}
        <Pressable style={styles.successSecondaryBtn} onPress={() => router.replace('/customer/bookings' as any)}>
          <Text style={styles.successPrimaryText}>Xem phòng đã đặt</Text>
        </Pressable>
        <Pressable style={[styles.successGhostBtn, { borderColor: currentTheme.border }]} onPress={() => router.replace('/customer/dashboard' as any)}>
          <Text style={[styles.successGhostText, { color: currentTheme.text }]}>Về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  if (paymentSession) {
    const { booking, payment } = paymentSession;
    const stayHubPayment = getStayHubPaymentView(payment);
    const paymentPhase = getLocalPaymentPhase(payment, now);
    const isGracePeriod = paymentPhase === 'GRACE';
    const isPaymentFinal = paymentPhase === 'EXPIRED_FINAL';
    const supportEmail = paymentSession.support?.email || SUPPORT_EMAIL;
    const supportChatbox = paymentSession.support?.chatbox || SUPPORT_CHATBOX;
    const expiresAtMs = getTimeMs(payment.expiresAt);
    const graceExpiresAtMs = getTimeMs(payment.graceExpiresAt);
    const countdownLabel = isGracePeriod
      ? formatCountdown(graceExpiresAtMs - now)
      : formatCountdown(expiresAtMs - now);
    const countdownTitle = isGracePeriod
      ? 'Đang chờ webhook chậm'
      : 'Thời gian thanh toán còn lại';
    const countdownDescription = isGracePeriod
      ? 'QR đã hết 15 phút. Hệ thống vẫn kiểm tra giao dịch thêm tối đa 5 phút.'
      : 'Vui lòng hoàn tất chuyển khoản trước khi bộ đếm kết thúc.';
    const failureText = getPaymentFailureText(payment);

    return (
      <View
        style={[
          styles.container,
          isWebLayout && styles.webContainer,
          { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: isWebLayout ? PAGE_BG : SURFACE },
        ]}
      >
        <View style={[styles.header, isWebLayout && styles.webHeader]}>
          <Pressable onPress={() => setPaymentSession(null)} style={styles.headerIconBtn}>
            <ChevronLeft size={24} color="#050506" strokeWidth={2.6} />
          </Pressable>
          <Text style={styles.headerTitle}>Thanh toán QR</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={isWebLayout}
          contentContainerStyle={[
            styles.qrScrollContent,
            isWebLayout && styles.webQrScrollContent,
            { paddingBottom: insets.bottom + 36 },
          ]}
        >
          <View style={[styles.qrPanel, isWebLayout && styles.webQrPanel]}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            <Text style={styles.qrSubtitle}>Mã đặt phòng {booking.code}</Text>

            <View style={[styles.countdownBox, isGracePeriod && styles.countdownBoxGrace, isPaymentFinal && styles.countdownBoxExpired]}>
              {isPaymentFinal ? (
                <AlertTriangle size={22} color="#dc2626" />
              ) : (
                <Clock size={22} color={isGracePeriod ? '#b45309' : PRIMARY} />
              )}
              <View style={styles.countdownTextBlock}>
                <Text style={[styles.countdownTitle, isPaymentFinal && styles.countdownTitleExpired]}>
                  {isPaymentFinal ? 'Không ghi nhận được thanh toán' : countdownTitle}
                </Text>
                <Text style={[styles.countdownValue, isGracePeriod && styles.countdownValueGrace, isPaymentFinal && styles.countdownValueExpired]}>
                  {isPaymentFinal ? 'Đã quá thời gian tự động ghi nhận' : countdownLabel}
                </Text>
                <Text style={styles.countdownDescription}>
                  {isPaymentFinal
                    ? failureText
                    : countdownDescription}
                </Text>
              </View>
            </View>

            <View style={styles.qrImageWrap}>
              <Image
                source={{ uri: stayHubPayment.vietQrUrl }}
                style={[styles.qrImage, isPaymentFinal && styles.qrImageExpired]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.transferBox}>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Số tiền</Text>
                <Text style={styles.transferValue}>{stayHubPayment.amount.toLocaleString('vi-VN')}đ</Text>
              </View>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Nội dung</Text>
                <Text style={styles.transferValue}>{stayHubPayment.content}</Text>
              </View>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Mã thanh toán</Text>
                <Text style={styles.transferValue}>{stayHubPayment.paymentCode}</Text>
              </View>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Tài khoản</Text>
                <Text style={styles.transferValue}>{stayHubPayment.accountNumber}</Text>
              </View>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Ngân hàng</Text>
                <Text style={styles.transferValue}>{stayHubPayment.bankName || stayHubPayment.bankCode}</Text>
              </View>
              <View style={styles.transferLine}>
                <Text style={styles.transferLabel}>Chủ tài khoản</Text>
                <Text style={styles.transferValue}>{stayHubPayment.accountName}</Text>
              </View>
            </View>

            <View style={styles.paymentRulesBox}>
              <Text style={styles.paymentRulesTitle}>Quy tắc thanh toán</Text>
              {PAYMENT_RULES.map((rule, index) => (
                <View key={rule} style={styles.paymentRuleLine}>
                  <View style={styles.paymentRuleIndex}>
                    <Text style={styles.paymentRuleIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.paymentRuleText}>{rule}</Text>
                </View>
              ))}
            </View>

            <View style={styles.supportBox}>
              <Text style={styles.supportTitle}>Hỗ trợ thanh toán</Text>
              <View style={styles.supportInfoRow}>
                <Mail size={18} color={PRIMARY} />
                <Text style={styles.supportInfoText}>{supportEmail}</Text>
              </View>
              <View style={styles.supportInfoRow}>
                <MessageCircle size={18} color={PRIMARY} />
                <Text style={styles.supportInfoText}>{supportChatbox}</Text>
              </View>
              <View style={styles.supportActionsRow}>
                <Pressable style={styles.supportActionBtn} onPress={() => openSupportEmail(`Khiếu nại thanh toán ${booking.code}`)}>
                  <Text style={styles.supportActionText}>Email</Text>
                </Pressable>
                <Pressable style={styles.supportActionBtn} onPress={openSupportChat}>
                  <Text style={styles.supportActionText}>Chatbox</Text>
                </Pressable>
              </View>
            </View>

            {!isPaymentFinal && (
              <View style={styles.waitingBox}>
                <ActivityIndicator color={PRIMARY} size="small" />
                <Text style={styles.waitingText}>
                  {isGracePeriod ? 'Đang kiểm tra webhook đến chậm...' : 'Đang chờ SePay xác nhận giao dịch...'}
                </Text>
              </View>
            )}

            {!!paymentError && <Text style={styles.paymentErrorText}>{paymentError}</Text>}

            {isPaymentFinal ? (
              <>
                <Pressable
                  style={[styles.successPrimaryBtn, creatingNewQr && styles.bookButtonDisabled]}
                  onPress={handleCreateNewQr}
                  disabled={creatingNewQr}
                >
                  <RefreshCw size={18} color={SURFACE} />
                  <Text style={styles.successPrimaryText}>
                    {creatingNewQr ? 'Đang tạo QR mới...' : 'Tạo QR mới'}
                  </Text>
                </Pressable>
                <Pressable style={styles.complaintBtn} onPress={openComplaint}>
                  <AlertTriangle size={18} color={PRIMARY} />
                  <Text style={styles.complaintBtnText}>Gửi khiếu nại</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.successPrimaryBtn, checkingPayment && styles.bookButtonDisabled]}
                onPress={() => checkPaymentStatus(true)}
                disabled={checkingPayment}
              >
                <Text style={styles.successPrimaryText}>
                  {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.successGhostBtn, { borderColor: currentTheme.border }]}
              onPress={() => router.replace('/customer/bookings' as any)}
            >
              <Text style={[styles.successGhostText, { color: currentTheme.text }]}>Xem phòng đã đặt</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isWebLayout && styles.webContainer,
        { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: isWebLayout ? PAGE_BG : SURFACE },
      ]}
    >
      <View style={[styles.header, isWebLayout && styles.webHeader]}>
        <Pressable onPress={goBack} style={styles.headerIconBtn}>
          <ChevronLeft size={24} color="#050506" strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác nhận và thanh toán</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={isWebLayout}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 176 },
          isWebLayout && styles.webScrollContent,
        ]}
      >
        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Lựa chọn của bạn</Text>
          <View style={[styles.choiceRow, isWebLayout && styles.webChoiceRow]}>
            <ImageWithFallback uri={roomImage} alt={roomName} style={[styles.roomImage, isWebLayout && styles.webRoomImage]} />
            <View style={styles.choiceInfo}>
              <Text style={styles.hotelName}>{hotelName}</Text>
              <Text style={styles.roomName}>{roomName}</Text>
              <Text style={styles.addressText}>{hotelAddress}</Text>
            </View>
          </View>

          <View style={styles.thinDivider} />

          <View style={[styles.timeRow, isWebLayout && styles.webTimeRow]}>
            <View style={[styles.durationCard, isWebLayout && styles.webDurationCard]}>
              <View style={styles.clockCircle}>
                <Clock size={26} color={PRIMARY} fill={SURFACE} />
              </View>
              <Text style={styles.durationText}>{durationLabel}</Text>
            </View>
            <View style={[styles.timeCard, isWebLayout && styles.webTimeCard]}>
              <Text style={styles.timeLabel}>Nhận phòng</Text>
              <Text style={styles.timeValue}>{checkIn.time}  •  {checkIn.dateText}</Text>
              <Text style={[styles.timeLabel, styles.checkoutLabel]}>Trả phòng</Text>
              <Text style={styles.timeValue}>{checkOut.time}  •  {checkOut.dateText}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Người đặt phòng</Text>
            <Pressable hitSlop={8}>
              <Text style={styles.editText}>Sửa</Text>
            </Pressable>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{customerPhone}</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Họ tên</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <View style={styles.voucherHeader}>
            <View style={styles.rowLabelWrap}>
              <Tag size={20} color={PRIMARY} fill={PRIMARY_FILL} />
              <Text style={styles.actionTitle}>Ưu đãi</Text>
            </View>
            {appliedVoucher && (
              <Pressable onPress={handleRemoveVoucher} hitSlop={8}>
                <Text style={styles.removeVoucherText}>Bỏ mã</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.voucherInputRow}>
            <TextInput
              value={voucherCode}
              onChangeText={(value) => {
                setVoucherCode(value.toUpperCase());
                setVoucherError(null);
              }}
              placeholder="Nhập mã ưu đãi"
              placeholderTextColor={TEXT_MUTED}
              autoCapitalize="characters"
              style={styles.voucherInput}
              editable={!voucherLoading}
            />
            <Pressable
              style={[styles.applyVoucherBtn, voucherLoading && styles.applyVoucherBtnDisabled]}
              onPress={() => handleApplyVoucher()}
              disabled={voucherLoading}
            >
              {voucherLoading ? (
                <ActivityIndicator color={SURFACE} size="small" />
              ) : (
                <Text style={styles.applyVoucherText}>Áp dụng</Text>
              )}
            </Pressable>
          </View>
          {!!availableVouchers.length && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voucherChipRow}>
              {availableVouchers.slice(0, 6).map((voucher) => (
                <Pressable
                  key={voucher.id}
                  style={[
                    styles.voucherChip,
                    appliedVoucher?.voucher.code === voucher.code && styles.voucherChipActive,
                  ]}
                  onPress={() => handleApplyVoucher(voucher.code)}
                  disabled={voucherLoading}
                >
                  <Text style={styles.voucherChipCode}>{voucher.code}</Text>
                  <Text style={styles.voucherChipMeta}>Giảm {formatMoney(String(voucher.discount || 0))}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {!!appliedVoucher && (
            <Text style={styles.voucherSuccessText}>
              Đã áp dụng {appliedVoucher.voucher.code}, giảm {discountPrice}.
            </Text>
          )}
          {!!voucherError && <Text style={styles.voucherErrorText}>{voucherError}</Text>}
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={[styles.paymentLine, styles.paymentLineTop]}>
            <Text style={styles.paymentLabel}>Tiền phòng</Text>
            <Text style={styles.paymentValue}>{price}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.paymentLine}>
              <Text style={styles.paymentLabel}>Ưu đãi</Text>
              <Text style={styles.discountValue}>-{discountPrice}</Text>
            </View>
          )}
          <View style={styles.paymentLine}>
            <Text style={styles.totalTitle}>Tổng thanh toán</Text>
            <Text style={styles.totalTitle}>{payablePrice}</Text>
          </View>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
          <Text style={styles.sectionTitle}>Chính sách hủy phòng</Text>
          <Text style={styles.policyText}>
            Hủy miễn phí trước <Text style={styles.policyStrong}>{cancellationDeadline}</Text> đối với tất cả các phương thức thanh toán.
          </Text>
          <Text style={styles.policyText}>
            💡 Gợi ý nhỏ: Hãy lựa chọn phương thức thanh toán để xem chi tiết chính sách nhé.
          </Text>
          <Text style={styles.policyText}>
            Tôi đồng ý với{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => router.push('/customer/support/terms' as any)}
            >
              Điều khoản và Chính sách
            </Text>{' '}
            đặt phòng.
          </Text>
          <Text style={styles.policyText}>
            Dịch vụ hỗ trợ khách hàng -{' '}
            <Text
              style={styles.inlineLink}
              onPress={() => router.push('/customer/support/contact' as any)}
            >
              Liên hệ ngay
            </Text>
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          isWebLayout && styles.webBottomBar,
          { paddingBottom: insets.bottom + 10 },
        ]}
      >
        <Pressable style={styles.paymentMethodRow} onPress={() => setShowPaymentMethodSheet(true)}>
          <View style={styles.rowLabelWrap}>
            <CreditCard size={20} color={PRIMARY} />
            <View style={styles.paymentMethodTextBlock}>
              <Text style={styles.paymentMethodText}>
                {selectedPaymentMethod?.title || 'Chọn phương thức thanh toán'}
              </Text>
              {!!selectedPaymentMethod && (
                <Text style={styles.paymentMethodSubText}>Bấm để đổi phương thức</Text>
              )}
            </View>
          </View>
          <ChevronRight size={24} color={PRIMARY} strokeWidth={2.6} />
        </Pressable>
        <View style={styles.bottomDivider} />
        <View style={styles.bottomSummaryRow}>
          <View>
            <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
            <Text style={styles.bottomPrice}>{payablePrice}</Text>
          </View>
          <Pressable style={[styles.bookButton, saving && styles.bookButtonDisabled]} onPress={handlePaymentButtonPress} disabled={saving}>
              <Text style={styles.bookButtonText}>
                {saving ? savingActionLabel : paymentActionLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showPaymentMethodSheet}
        onRequestClose={() => setShowPaymentMethodSheet(false)}
      >
        <Pressable style={styles.methodOverlay} onPress={() => setShowPaymentMethodSheet(false)}>
          <Pressable style={[styles.methodSheet, isWebLayout && styles.webMethodSheet]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.methodSheetHeader}>
              <View>
                <Text style={styles.methodSheetTitle}>Phương thức thanh toán</Text>
                <Text style={styles.methodSheetSubtitle}>Chọn một phương thức để tiếp tục</Text>
              </View>
              <Pressable style={styles.methodCloseBtn} onPress={() => setShowPaymentMethodSheet(false)}>
                <Text style={styles.methodCloseText}>Đóng</Text>
              </Pressable>
            </View>

            <View style={styles.methodList}>
              {PAYMENT_METHODS.map(({ Icon, available, description, id, title }) => {
                const selected = selectedPaymentMethodId === id;
                return (
                  <Pressable
                    key={id}
                    style={[
                      styles.methodOption,
                      selected && styles.methodOptionSelected,
                      !available && styles.methodOptionDisabled,
                    ]}
                    onPress={() => handleSelectPaymentMethod(id)}
                    disabled={!available}
                  >
                    <View style={[styles.methodIconWrap, selected && styles.methodIconWrapSelected]}>
                      <Icon size={22} color={selected ? SURFACE : PRIMARY} />
                    </View>
                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={[styles.methodTitle, !available && styles.methodTextDisabled]}>{title}</Text>
                        {!available && <Text style={styles.methodBadge}>Sắp có</Text>}
                      </View>
                      <Text style={[styles.methodDescription, !available && styles.methodTextDisabled]}>{description}</Text>
                    </View>
                    {selected && <CheckCircle size={22} color={PRIMARY} />}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.methodContinueBtn, !selectedPaymentMethodId && styles.methodContinueBtnDisabled]}
              onPress={() => {
                if (!selectedPaymentMethodId) return;
                setShowPaymentMethodSheet(false);
              }}
              disabled={!selectedPaymentMethodId}
            >
              <Text style={styles.methodContinueText}>Tiếp tục</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    overflow: 'visible',
  },
  header: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
    paddingHorizontal: 22,
  },
  webHeader: {
    height: 82,
    marginTop: 24,
    marginHorizontal: 32,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 24,
  },
  headerIconBtn: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 46,
  },
  scrollContent: {
    backgroundColor: SURFACE,
  },
  webScrollContent: {
    minHeight: 760,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 220,
  },
  section: {
    backgroundColor: SURFACE,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  webSection: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    marginBottom: 18,
    paddingHorizontal: 28,
    paddingVertical: 26,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  editText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '800',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 14,
  },
  webChoiceRow: {
    gap: 18,
  },
  roomImage: {
    width: 142,
    height: 126,
    borderRadius: 12,
  },
  webRoomImage: {
    width: 190,
    height: 136,
    borderRadius: 16,
  },
  choiceInfo: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  hotelName: {
    color: TEXT_DARK,
    fontSize: 15,
    lineHeight: 21,
  },
  roomName: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  addressText: {
    color: TEXT_DARK,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  thinDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 24,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  webTimeRow: {
    gap: 18,
  },
  durationCard: {
    width: 142,
    minHeight: 150,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  webDurationCard: {
    width: 180,
    minHeight: 156,
    borderRadius: 18,
  },
  clockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
    marginBottom: 24,
  },
  durationText: {
    color: SURFACE,
    fontSize: 18,
    fontWeight: '900',
  },
  timeCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: 14,
    backgroundColor: '#f7f7f8',
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  webTimeCard: {
    minHeight: 156,
    borderRadius: 18,
    paddingHorizontal: 24,
  },
  timeLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 6,
  },
  checkoutLabel: {
    marginTop: 18,
  },
  timeValue: {
    color: TEXT_DARK,
    fontSize: 17,
    fontWeight: '900',
  },
  band: {
    height: 14,
    backgroundColor: PAGE_BG,
  },
  webBand: {
    display: 'none',
  },
  infoLine: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  infoLabel: {
    color: TEXT_DARK,
    fontSize: 16,
  },
  infoValue: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  voucherHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  removeVoucherText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '900',
  },
  voucherInputRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginTop: 12,
  },
  voucherInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: '#fbfbfc',
  },
  applyVoucherBtn: {
    minWidth: 96,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
  },
  applyVoucherBtnDisabled: {
    opacity: 0.7,
  },
  applyVoucherText: {
    color: SURFACE,
    fontSize: 14,
    fontWeight: '900',
  },
  voucherChipRow: {
    gap: 10,
    paddingTop: 12,
  },
  voucherChip: {
    minWidth: 118,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fbfbfc',
  },
  voucherChipActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_FILL,
  },
  voucherChipCode: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: '900',
  },
  voucherChipMeta: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  voucherSuccessText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  voucherErrorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  actionRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  actionTitle: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '900',
  },
  paymentLine: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 18,
  },
  paymentLineTop: {
    marginTop: 8,
  },
  paymentLabel: {
    color: TEXT_DARK,
    fontSize: 16,
  },
  paymentValue: {
    color: TEXT_DARK,
    fontSize: 16,
  },
  discountValue: {
    color: '#15803d',
    fontSize: 16,
    fontWeight: '900',
  },
  totalTitle: {
    color: TEXT_DARK,
    fontSize: 18,
    fontWeight: '900',
  },
  policyText: {
    color: TEXT_DARK,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 12,
  },
  policyStrong: {
    fontWeight: '900',
  },
  inlineLink: {
    color: PRIMARY,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f3',
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  webBottomBar: {
    left: 32,
    right: 32,
    bottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  paymentMethodRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodTextBlock: {
    flexShrink: 1,
  },
  paymentMethodText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '700',
  },
  paymentMethodSubText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 12,
    marginBottom: 12,
  },
  bottomSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  bottomLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 4,
  },
  bottomPrice: {
    color: TEXT_DARK,
    fontSize: 24,
    fontWeight: '900',
  },
  bookButton: {
    width: 184,
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: SURFACE,
    fontSize: 16,
    fontWeight: '800',
  },
  methodOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.38)',
  },
  methodSheet: {
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: SURFACE,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 26,
  },
  webMethodSheet: {
    width: 520,
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 42,
    borderWidth: 1,
    borderColor: BORDER,
  },
  methodSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 18,
  },
  methodSheetTitle: {
    color: TEXT_DARK,
    fontSize: 20,
    fontWeight: '900',
  },
  methodSheetSubtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  methodCloseBtn: {
    minHeight: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#f3f4f6',
  },
  methodCloseText: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: '800',
  },
  methodList: {
    gap: 12,
    marginBottom: 18,
  },
  methodOption: {
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: SURFACE,
  },
  methodOptionSelected: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(133,194,164,0.08)',
  },
  methodOptionDisabled: {
    opacity: 0.58,
  },
  methodIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133,194,164,0.12)',
  },
  methodIconWrapSelected: {
    backgroundColor: PRIMARY,
  },
  methodInfo: {
    flex: 1,
    minWidth: 0,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodTitle: {
    flexShrink: 1,
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '900',
  },
  methodDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  methodTextDisabled: {
    color: '#737373',
  },
  methodBadge: {
    color: '#737373',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: '#eeeeee',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  methodContinueBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  methodContinueBtnDisabled: {
    opacity: 0.45,
  },
  methodContinueText: {
    color: SURFACE,
    fontSize: 16,
    fontWeight: '900',
  },
  qrScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: SURFACE,
  },
  webQrScrollContent: {
    alignItems: 'center',
    backgroundColor: PAGE_BG,
    paddingTop: 28,
  },
  qrPanel: {
    width: '100%',
    alignItems: 'center',
  },
  webQrPanel: {
    maxWidth: 520,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    padding: 28,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },
  qrTitle: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  countdownBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    backgroundColor: 'rgba(133,194,164,0.1)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginBottom: 18,
  },
  countdownBoxGrace: {
    borderColor: 'rgba(245,158,11,0.35)',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  countdownBoxExpired: {
    borderColor: 'rgba(220,38,38,0.24)',
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  countdownTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  countdownTitle: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  countdownTitleExpired: {
    color: '#991b1b',
  },
  countdownValue: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 5,
  },
  countdownValueGrace: {
    color: '#b45309',
  },
  countdownValueExpired: {
    color: '#dc2626',
    fontSize: 17,
  },
  countdownDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  qrImageWrap: {
    width: 292,
    maxWidth: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
    marginBottom: 22,
    overflow: 'hidden',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrImageExpired: {
    opacity: 0.35,
  },
  transferBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  transferLine: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  transferLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '700',
  },
  transferValue: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  paymentRulesBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.35)',
    backgroundColor: 'rgba(133,194,164,0.09)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  paymentRulesTitle: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  paymentRuleLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  paymentRuleIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginTop: 1,
  },
  paymentRuleIndexText: {
    color: SURFACE,
    fontSize: 12,
    fontWeight: '900',
  },
  paymentRuleText: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  supportBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  supportTitle: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  supportInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  supportInfoText: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: '700',
  },
  supportActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  supportActionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133,194,164,0.08)',
  },
  supportActionText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '900',
  },
  waitingBox: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  waitingText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '700',
  },
  paymentErrorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: SURFACE,
  },
  webSuccessContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  successTitle: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 22,
    marginBottom: 10,
  },
  successText: {
    color: TEXT_MUTED,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  successPrimaryBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginBottom: 12,
  },
  complaintBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SURFACE,
    marginBottom: 12,
  },
  complaintBtnText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '900',
  },
  successSecondaryBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginBottom: 12,
    opacity: 0.82,
  },
  successPrimaryText: {
    color: SURFACE,
    fontSize: 16,
    fontWeight: '800',
  },
  successGhostBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  successGhostText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
