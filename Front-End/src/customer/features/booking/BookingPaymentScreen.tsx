import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  Mail,
  MessageCircle,
  RefreshCw,
} from 'lucide-react-native';
import {
  bookingsApi,
  type BookingPaymentQr,
  type CreateQrBookingResponse,
} from '@/src/customer/services/booking/bookings.api';
import { getParamText } from '@/src/customer/navigation/routeParams';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { getStayHubPaymentView } from '@/src/customer/utils/booking/sepay';

const PRIMARY = '#85c2a4';
const TEXT_DARK = '#25252d';
const TEXT_MUTED = '#85858d';
const BORDER = '#ededf1';
const SURFACE = '#ffffff';
const PAGE_BG = '#f7f7f8';
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

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.message || 'Không thể xử lý thanh toán.';
  }

  return error instanceof Error ? error.message : 'Không thể xử lý thanh toán.';
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

function parseQrSession(value: unknown): CreateQrBookingResponse | null {
  const raw = getParamText(value);
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as CreateQrBookingResponse;

    if (!parsed?.booking?.id || !parsed?.payment) {
      return null;
    }

    return parsed;
  } catch {
    try {
      const parsed = JSON.parse(raw) as CreateQrBookingResponse;
      return parsed?.booking?.id && parsed?.payment ? parsed : null;
    } catch {
      return null;
    }
  }
}

export default function BookingPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    hotelName?: string;
    session?: string;
  }>();
  const initialSession = useMemo(() => {
    const session = parseQrSession(params.session);
    return session ? withLocalQrCountdown(session) : null;
  }, [params.session]);
  const [paymentSession, setPaymentSession] = useState<CreateQrBookingResponse | null>(initialSession);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(initialSession?.booking.id || null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [creatingNewQr, setCreatingNewQr] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [expiredNoticePaymentId, setExpiredNoticePaymentId] = useState<string | null>(null);
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const hotelName = getParamText(params.hotelName) || paymentSession?.booking.hotelName || 'khách sạn';
  const activePaymentId = paymentSession?.payment.id;
  const activePaymentExpiresAt = paymentSession?.payment.expiresAt;
  const activePaymentGraceExpiresAt = paymentSession?.payment.graceExpiresAt;

  useEffect(() => {
    if (initialSession) {
      setPaymentSession(initialSession);
      setConfirmedBookingId(initialSession.booking.id);
      setNow(Date.now());
    }
  }, [initialSession]);

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

  const handleCreateNewQr = useCallback(async () => {
    if (!paymentSession || creatingNewQr) return;

    setCreatingNewQr(true);
    setPaymentError(null);
    try {
      const result = await bookingsApi.createNewQr(paymentSession.booking.id);
      const createdAt = Date.now();
      setPaymentSession(withLocalQrCountdown(result, createdAt));
      setConfirmedBookingId(result.booking.id);
      setExpiredNoticePaymentId(null);
      setNow(createdAt);

      // Scroll to top to show new QR
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
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
    return (
      <View
        style={[
          styles.successContainer,
          isWebLayout && styles.webSuccessContainer,
          { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background },
        ]}
      >
        <CheckCircle size={66} color={PRIMARY} />
        <Text style={[styles.successTitle, { color: currentTheme.text }]}>Thanh toán thành công!</Text>
        <Text style={[styles.successText, { color: currentTheme.textSecondary }]}>
          Booking {paymentSession?.booking.code || ''} tại {hotelName} đã được xác nhận.
        </Text>
        {confirmedBookingId && (
          <Pressable
            style={styles.successPrimaryBtn}
            onPress={() => router.replace({ pathname: '/customer/booking/detail' as any, params: { bookingId: confirmedBookingId } })}
          >
            <Text style={styles.successPrimaryText}>Xem chi tiết đặt phòng</Text>
          </Pressable>
        )}
        <Pressable style={styles.successGhostBtn} onPress={() => router.replace('/customer/bookings' as any)}>
          <Text style={styles.successGhostText}>Xem phòng đã đặt</Text>
        </Pressable>
      </View>
    );
  }

  if (!paymentSession) {
    return (
      <View
        style={[
          styles.successContainer,
          isWebLayout && styles.webSuccessContainer,
          { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background },
        ]}
      >
        <AlertTriangle size={58} color="#dc2626" />
        <Text style={[styles.successTitle, { color: currentTheme.text }]}>Không tìm thấy QR</Text>
        <Text style={[styles.successText, { color: currentTheme.textSecondary }]}>
          Không tìm thấy thông tin thanh toán. Vui lòng quay lại danh sách đặt phòng.
        </Text>
        <Pressable style={styles.successPrimaryBtn} onPress={() => router.replace('/customer/bookings' as any)}>
          <Text style={styles.successPrimaryText}>Xem phòng đã đặt</Text>
        </Pressable>
      </View>
    );
  }

  const { booking, payment } = paymentSession;
  const stayHubPayment = getStayHubPaymentView(payment);
  const paymentPhase = getLocalPaymentPhase(payment, now);
  const isGracePeriod = paymentPhase === 'GRACE';
  const isPaymentFinal = paymentPhase === 'EXPIRED_FINAL';
  const supportEmail = paymentSession.support?.email || SUPPORT_EMAIL;
  const supportChatbox = paymentSession.support?.chatbox || SUPPORT_CHATBOX;
  const qrImageUri = stayHubPayment.vietQrUrl;
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
        <Pressable onPress={() => router.replace('/customer/bookings' as any)} style={styles.headerIconBtn}>
          <ChevronLeft size={24} color="#050506" strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.headerTitle}>Thanh toán QR</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
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
                {isPaymentFinal ? failureText : countdownDescription}
              </Text>
            </View>
          </View>

          <View style={styles.qrImageWrap}>
            <Image
              source={{ uri: qrImageUri }}
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
                style={[styles.successPrimaryBtn, creatingNewQr && styles.buttonDisabled]}
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
              style={[styles.successPrimaryBtn, checkingPayment && styles.buttonDisabled]}
              onPress={() => checkPaymentStatus(true)}
              disabled={checkingPayment}
            >
              <Text style={styles.successPrimaryText}>
                {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.successGhostBtn} onPress={() => router.replace('/customer/bookings' as any)}>
            <Text style={styles.successGhostText}>Xem phòng đã đặt</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    borderColor: BORDER,
  },
  successGhostText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '700',
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
  buttonDisabled: {
    opacity: 0.6,
  },
});
