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
import { customerBookingsStorage } from '@/src/customer/utils/customerBookings';
import { getBookingDurationLabel } from '@/src/customer/utils/roomDisplay';

const PRIMARY = '#85c2a4';
const PRIMARY_FILL = 'rgba(133,194,164,0.35)';
const TEXT_DARK = '#25252d';
const TEXT_MUTED = '#85858d';
const BORDER = '#ededf1';
const SURFACE = '#ffffff';
const PAGE_BG = '#f7f7f8';
const SUCCESS = PRIMARY;
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

  const handleConfirmBooking = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const booking = await customerBookingsStorage.add({
        hotelId: getParamText(params.hotelId) || '',
        hotelName,
        hotelAddress,
        hotelImage: getParamText(params.hotelImage),
        roomId: getParamText(params.roomId),
        roomName,
        roomImage,
        price,
        bookingType,
        checkIn: getParamText(params.checkIn) || `${checkIn.time}, ${checkIn.dateText}`,
        checkOut: getParamText(params.checkOut) || `${checkOut.time}, ${checkOut.dateText}`,
        hours: getParamText(params.hours),
        customerName,
        customerPhone,
      });
      setConfirmedBookingId(booking.id);
      setConfirmed(true);
    } finally {
      setSaving(false);
    }
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
        <CheckCircle size={66} color={SUCCESS} />
        <Text style={[styles.successTitle, { color: currentTheme.text }]}>Đặt phòng thành công!</Text>
        <Text style={[styles.successText, { color: currentTheme.textSecondary }]}>
          Thông tin đặt phòng tại {hotelName} đã được ghi nhận.
        </Text>
        {confirmedBookingId && (
          <Pressable
            style={styles.successPrimaryBtn}
            onPress={() => router.replace({ pathname: '/customer/booking-detail' as any, params: { bookingId: confirmedBookingId } })}
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
          <Pressable style={styles.actionRow}>
            <View style={styles.rowLabelWrap}>
              <Tag size={20} color={PRIMARY} fill={PRIMARY_FILL} />
              <Text style={styles.actionTitle}>Ưu đãi</Text>
            </View>
            <ChevronRight size={24} color={PRIMARY} strokeWidth={2.6} />
          </Pressable>
        </View>

        <View style={[styles.band, isWebLayout && styles.webBand]} />

        <View style={[styles.section, isWebLayout && styles.webSection]}>
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
            <CreditCard size={20} color={PRIMARY} />
            <Text style={styles.paymentMethodText}>Chọn phương thức thanh toán</Text>
          </View>
          <ChevronRight size={24} color={PRIMARY} strokeWidth={2.6} />
        </Pressable>
        <View style={styles.bottomDivider} />
        <View style={styles.bottomSummaryRow}>
          <View>
            <Text style={styles.bottomLabel}>Tổng thanh toán</Text>
            <Text style={styles.bottomPrice}>{price}</Text>
          </View>
          <Pressable style={[styles.bookButton, saving && styles.bookButtonDisabled]} onPress={handleConfirmBooking} disabled={saving}>
            <Text style={styles.bookButtonText}>{saving ? 'Đang lưu...' : 'Đặt phòng'}</Text>
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
  paymentMethodText: {
    color: TEXT_DARK,
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginBottom: 12,
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
