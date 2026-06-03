import React from 'react';
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Linking } from 'react-native';
import { ChevronLeft, Clock, AlertTriangle, Mail, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { styles, PRIMARY, SURFACE, PAGE_BG } from '@/src/customer/styles/booking/bookingConfirm.styles';
import {
  formatCountdown,
  getLocalPaymentPhase,
  getPaymentFailureText,
  getTimeMs,
  SUPPORT_EMAIL,
  PAYMENT_RULES,
} from '@/src/customer/utils/booking/bookingConfirm.utils';
import { getStayHubPaymentView } from '@/src/customer/utils/booking/sepay';
import type { CreateQrBookingResponse } from '@/src/customer/services/booking/bookings.api';

interface BookingQrPaymentViewProps {
  paymentSession: CreateQrBookingResponse;
  setPaymentSession: (session: CreateQrBookingResponse | null) => void;
  now: number;
  isWebLayout: boolean;
  insets: { top: number; bottom: number };
  paymentError: string | null;
  creatingNewQr: boolean;
  handleCreateNewQr: () => void;
}

export default function BookingQrPaymentView({
  paymentSession,
  setPaymentSession,
  now,
  isWebLayout,
  insets,
  paymentError,
  creatingNewQr,
  handleCreateNewQr,
}: BookingQrPaymentViewProps) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();

  const { booking, payment } = paymentSession;
  const stayHubPayment = getStayHubPaymentView(payment);
  const paymentPhase = getLocalPaymentPhase(payment, now);
  const isGracePeriod = paymentPhase === 'GRACE';
  const isPaymentFinal = paymentPhase === 'EXPIRED_FINAL';
  const supportEmail = paymentSession.support?.email || SUPPORT_EMAIL;
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

  const openSupportEmail = (subject: string) => {
    const email = supportEmail;
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`).catch(() => {});
  };

  const openComplaint = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
  };

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
                {isPaymentFinal ? failureText : countdownDescription}
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
            <View style={styles.supportActionsRow}>
              <Pressable style={styles.supportActionBtn} onPress={() => openSupportEmail(`Khiếu nại thanh toán ${booking.code}`)}>
                <Text style={styles.supportActionText}>Email</Text>
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

          {isPaymentFinal && (
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
