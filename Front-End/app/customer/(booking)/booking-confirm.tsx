import React, { useMemo, useState } from 'react';
import {
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Tag,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/ImageWithFallback';
import { useAuth } from '@/src/customer/hooks/useAuth';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { getParamText } from '@/src/customer/navigation/routeParams';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { getBookingDurationLabel } from '@/src/customer/utils/roomDisplay';

const ORANGE = '#ff6817';
const TEXT_DARK = '#25252d';
const TEXT_MUTED = '#85858d';
const BORDER = '#ededf1';
const SURFACE = '#ffffff';
const PAGE_BG = '#f7f7f8';
const SUCCESS = '#22c55e';
const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

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

export default function BookingConfirmScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/bookings');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    hotelId?: string;
    hotelName?: string;
    hotelAddress?: string;
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
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const hotelName = getParamText(params.hotelName) || 'Khách sạn';
  const roomName = getParamText(params.roomName) || 'STANDARD ROOM';
  const hotelAddress = getParamText(params.hotelAddress) || 'Địa chỉ khách sạn đang cập nhật';
  const roomImage = getParamText(params.roomImage) || DEFAULT_ROOM_IMAGE;
  const price = formatMoney(getParamText(params.price));
  const bookingType = getParamText(params.bookingType) || 'Theo giờ';
  const durationLabel = getBookingDurationLabel(bookingType, getParamText(params.hours));
  const checkIn = useMemo(() => parseBookingPoint(getParamText(params.checkIn)), [params.checkIn]);
  const checkOut = useMemo(() => parseBookingPoint(getParamText(params.checkOut)), [params.checkOut]);
  const cancellationDeadline = useMemo(() => formatCancellationDeadline(checkIn), [checkIn]);
  const customerName = user?.username || 'Joyer.673';
  const customerPhone = 'Chưa cập nhật';

  if (confirmed) {
    return (
      <View
        style={[
          styles.successContainer,
          isWebLayout && styles.webSuccessContainer,
          { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background },
        ]}
      >
        <CheckCircle size={66} color={SUCCESS} />
        <Text style={[styles.successTitle, { color: currentTheme.text }]}>Đặt phòng thành công!</Text>
        <Text style={[styles.successText, { color: currentTheme.textSecondary }]}>
          Thông tin đặt phòng tại {hotelName} đã được ghi nhận.
        </Text>
        <Pressable style={styles.successPrimaryBtn} onPress={() => router.replace('/customer/bookings' as any)}>
          <Text style={styles.successPrimaryText}>Xem phòng đã đặt</Text>
        </Pressable>
        <Pressable style={[styles.successGhostBtn, { borderColor: currentTheme.border }]} onPress={() => router.replace('/customer/dashboard' as any)}>
          <Text style={[styles.successGhostText, { color: currentTheme.text }]}>Về trang chủ</Text>
        </Pressable>
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
          <ChevronLeft size={32} color="#050506" strokeWidth={3} />
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lựa chọn của bạn</Text>
          <View style={styles.choiceRow}>
            <ImageWithFallback uri={roomImage} alt={roomName} style={styles.roomImage} />
            <View style={styles.choiceInfo}>
              <Text style={styles.hotelName}>{hotelName}</Text>
              <Text style={styles.roomName}>{roomName}</Text>
              <Text style={styles.addressText}>{hotelAddress}</Text>
            </View>
          </View>

          <View style={styles.thinDivider} />

          <View style={styles.timeRow}>
            <View style={styles.durationCard}>
              <View style={styles.clockCircle}>
                <Clock size={26} color={ORANGE} fill={SURFACE} />
              </View>
              <Text style={styles.durationText}>{durationLabel}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Nhận phòng</Text>
              <Text style={styles.timeValue}>{checkIn.time}  •  {checkIn.dateText}</Text>
              <Text style={[styles.timeLabel, styles.checkoutLabel]}>Trả phòng</Text>
              <Text style={styles.timeValue}>{checkOut.time}  •  {checkOut.dateText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.band} />

        <View style={styles.section}>
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

        <View style={styles.band} />

        <View style={styles.section}>
          <Pressable style={styles.actionRow}>
            <View style={styles.rowLabelWrap}>
              <Tag size={24} color={ORANGE} fill="#ff9b63" />
              <Text style={styles.actionTitle}>Ưu đãi</Text>
            </View>
            <ChevronRight size={34} color={ORANGE} strokeWidth={2.8} />
          </Pressable>
        </View>

        <View style={styles.band} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={[styles.paymentLine, styles.paymentLineTop]}>
            <Text style={styles.paymentLabel}>Tiền phòng</Text>
            <Text style={styles.paymentValue}>{price}</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text style={styles.totalTitle}>Tổng thanh toán</Text>
            <Text style={styles.totalTitle}>{price}</Text>
          </View>
        </View>

        <View style={styles.band} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách hủy phòng</Text>
          <Text style={styles.policyText}>
            Hủy miễn phí trước <Text style={styles.policyStrong}>{cancellationDeadline}</Text> đối với tất cả các phương thức thanh toán.
          </Text>
          <Text style={styles.policyText}>
            💡 Gợi ý nhỏ: Hãy lựa chọn phương thức thanh toán để xem chi tiết chính sách nhé.
          </Text>
          <Text style={styles.policyText}>
            Tôi đồng ý với <Text style={styles.inlineLink}>Điều khoản và Chính sách</Text> đặt phòng.
          </Text>
          <Text style={styles.policyText}>
            Dịch vụ hỗ trợ khách hàng - <Text style={styles.inlineLink}>Liên hệ ngay</Text>
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
        <Pressable style={styles.paymentMethodRow}>
          <View style={styles.rowLabelWrap}>
            <CreditCard size={24} color={ORANGE} />
            <Text style={styles.paymentMethodText}>Chọn phương thức thanh toán</Text>
          </View>
          <ChevronRight size={34} color={ORANGE} strokeWidth={2.8} />
        </Pressable>
        <View style={styles.bottomDivider} />
        <View style={styles.bottomSummaryRow}>
          <View>
            <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
            <Text style={styles.bottomPrice}>{price}</Text>
          </View>
          <Pressable style={styles.bookButton} onPress={() => setConfirmed(true)}>
            <Text style={styles.bookButtonText}>Đặt phòng</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER,
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
    height: 86,
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
    fontSize: 25,
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
  },
  section: {
    backgroundColor: SURFACE,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  editText: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: '800',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 14,
  },
  roomImage: {
    width: 142,
    height: 126,
    borderRadius: 12,
  },
  choiceInfo: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  hotelName: {
    color: TEXT_DARK,
    fontSize: 20,
    lineHeight: 26,
  },
  roomName: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 30,
    textTransform: 'uppercase',
  },
  addressText: {
    color: TEXT_DARK,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 10,
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
  durationCard: {
    width: 142,
    minHeight: 150,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff8444',
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
    fontSize: 22,
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
  timeLabel: {
    color: TEXT_MUTED,
    fontSize: 18,
    marginBottom: 6,
  },
  checkoutLabel: {
    marginTop: 18,
  },
  timeValue: {
    color: TEXT_DARK,
    fontSize: 21,
    fontWeight: '900',
  },
  band: {
    height: 14,
    backgroundColor: PAGE_BG,
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
    fontSize: 21,
  },
  infoValue: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'right',
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
    fontSize: 24,
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
    fontSize: 22,
  },
  paymentValue: {
    color: TEXT_DARK,
    fontSize: 22,
  },
  totalTitle: {
    color: TEXT_DARK,
    fontSize: 24,
    fontWeight: '900',
  },
  policyText: {
    color: TEXT_DARK,
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 16,
  },
  policyStrong: {
    fontWeight: '900',
  },
  inlineLink: {
    color: ORANGE,
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
    maxWidth: 560,
  },
  paymentMethodRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodText: {
    color: TEXT_DARK,
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 18,
    marginBottom: 4,
  },
  bottomPrice: {
    color: TEXT_DARK,
    fontSize: 32,
    fontWeight: '900',
  },
  bookButton: {
    width: 184,
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  bookButtonText: {
    color: SURFACE,
    fontSize: 19,
    fontWeight: '800',
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
    fontSize: 25,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
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
  },
  successGhostText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
