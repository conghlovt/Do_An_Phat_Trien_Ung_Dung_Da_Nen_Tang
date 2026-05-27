import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  Headphones,
  Hotel,
  MoreVertical,
  Star,
  X,
} from 'lucide-react-native';
import ImageWithFallback from '@/src/customer/components/ImageWithFallback';
import { getParamText } from '@/src/customer/navigation/routeParams';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import {
  customerBookingsStorage,
  type CustomerBooking,
} from '@/src/customer/utils/customerBookings';
import { bookingsApi } from '@/src/customer/api/bookings.api';
import { getBookingDurationLabel } from '@/src/customer/utils/roomDisplay';

const PRIMARY = '#85c2a4';
const PRIMARY_SOFT = 'rgba(133,194,164,0.16)';
const PAGE_BG = '#f6f7f8';
const TEXT_MUTED = '#70737a';

type ParsedBookingPoint = {
  date: Date | null;
  dateText: string;
  displayDate: string;
  time: string;
};

function parseBookingPoint(value?: string): ParsedBookingPoint {
  if (value) {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      const dateText = `${String(parsedDate.getDate()).padStart(2, '0')}/${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
      return {
        date: parsedDate,
        dateText,
        displayDate: `${dateText}/${parsedDate.getFullYear()}`,
        time: `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}`,
      };
    }
  }

  const fallbackYear = new Date().getFullYear();
  const match = value?.match(/(\d{1,2}:\d{2}).*?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);

  if (!match) {
    return { date: null, dateText: '--/--', displayDate: '--/--/----', time: '--:--' };
  }

  const [, time, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText || fallbackYear);
  const dateText = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  const displayDate = `${dateText}/${year}`;

  return {
    date: Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)
      ? new Date(year, month - 1, day)
      : null,
    dateText,
    displayDate,
    time,
  };
}

function getCancellationDeadline(checkIn: ParsedBookingPoint) {
  if (!checkIn.date) return `trước ${checkIn.displayDate}`;

  const [hours, minutes] = checkIn.time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return `trước ${checkIn.displayDate}`;

  const deadline = new Date(checkIn.date);
  deadline.setHours(hours - 1, minutes, 0, 0);

  return `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}, ${String(deadline.getDate()).padStart(2, '0')}/${String(deadline.getMonth() + 1).padStart(2, '0')}/${deadline.getFullYear()}`;
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const goBack = useCustomerBack('/customer/bookings');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = getParamText(params.bookingId);
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!bookingId) {
        setBooking(null);
        return () => {
          isActive = false;
        };
      }

      customerBookingsStorage.getById(bookingId).then((item) => {
        if (isActive) setBooking(item);
      });

      return () => {
        isActive = false;
      };
    }, [bookingId]),
  );

  const checkIn = useMemo(() => parseBookingPoint(booking?.checkIn), [booking?.checkIn]);
  const checkOut = useMemo(() => parseBookingPoint(booking?.checkOut), [booking?.checkOut]);
  const durationLabel = useMemo(
    () => getBookingDurationLabel(booking?.bookingType, booking?.hours),
    [booking?.bookingType, booking?.hours],
  );
  const cancellationDeadline = useMemo(() => getCancellationDeadline(checkIn), [checkIn]);
  const isCancelled = booking?.rawStatus === 'CANCELLED' || String(booking?.status) === 'Đã huỷ' || booking?.status === 'Da huy';

  const cancelBooking = async () => {
    if (!booking || isCancelling || isCancelled) return;

    setIsCancelling(true);
    try {
      const updatedBooking = await customerBookingsStorage.updateStatus(booking.id, 'Da huy');
      if (updatedBooking) setBooking(updatedBooking);
    } finally {
      setIsCancelling(false);
    }
  };

  const submitReview = async () => {
    if (!booking || isSubmittingReview) return;

    setIsSubmittingReview(true);
    try {
      await bookingsApi.createReview(booking.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      const updatedBooking = await customerBookingsStorage.getById(booking.id);
      if (updatedBooking) setBooking(updatedBooking);
      setReviewComment('');
      Alert.alert('Thanh cong', 'Danh gia da duoc gui va dang cho duyet.');
    } catch (error: any) {
      Alert.alert('Loi', error?.response?.data?.message || 'Khong the gui danh gia.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!booking) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, backgroundColor: currentTheme.background }]}>
        <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>Không tìm thấy đặt phòng</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.replace('/customer/bookings' as any)}>
          <Text style={styles.primaryBtnText}>Về phòng đã đặt</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.headerIconBtn}>
          <X size={26} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Thông tin đặt phòng</Text>
        <Pressable style={styles.headerIconBtn}>
          <MoreVertical size={24} color={currentTheme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={isWebLayout}
        contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent, { paddingBottom: insets.bottom + 28 }]}
      >
        <View style={isWebLayout && styles.webContent}>
          <View style={[styles.statusBanner, isWebLayout && styles.webStatusBanner, isCancelled && styles.statusBannerCancelled]}>
            <View style={styles.statusTextBlock}>
              <Text style={[styles.statusTitle, isCancelled && styles.statusTitleCancelled]}>
                {booking.status}
              </Text>
              <Text style={styles.statusSubtitle}>
                {isCancelled
                  ? 'Đặt phòng đã được hủy. Bạn có thể đặt lại khi cần.'
                  : 'Hoàn tất đặt phòng. Đừng quên đến nhận phòng đúng giờ nhé.'}
              </Text>
            </View>
            <View style={[styles.statusIcon, isCancelled && styles.statusIconCancelled]}>
              <Hotel size={34} color="#ffffff" />
              <Clock size={18} color="#ffffff" style={styles.statusClockIcon} />
            </View>
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webSummarySection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <View style={styles.codeRow}>
              <Text style={[styles.labelLarge, { color: currentTheme.textSecondary }]}>Mã đặt phòng</Text>
              <View style={styles.codeValueWrap}>
                <Text style={styles.codeValue}>{booking.code}</Text>
                <Copy size={18} color={PRIMARY} />
              </View>
            </View>

            <Pressable style={[styles.hotelRow, isWebLayout && styles.webHotelRow]}>
              <ImageWithFallback uri={booking.roomImage} alt={booking.roomName} style={[styles.roomImage, isWebLayout && styles.webRoomImage]} />
              <View style={styles.hotelInfo}>
                <Text style={[styles.hotelName, { color: currentTheme.text }]} numberOfLines={1}>
                  {booking.hotelName}
                </Text>
                <Text style={[styles.roomName, { color: currentTheme.text }]} numberOfLines={1}>
                  {booking.roomName}
                </Text>
                <Text style={[styles.addressText, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                  {booking.hotelAddress || 'Địa chỉ khách sạn đang cập nhật'}
                </Text>
              </View>
              <ChevronRight size={22} color={PRIMARY} />
            </Pressable>

            <View style={[styles.bookingTimeRow, isWebLayout && styles.webBookingTimeRow]}>
              <View style={[styles.durationCard, isWebLayout && styles.webDurationCard]}>
                <Clock size={30} color="#ffffff" />
                <Text style={styles.durationText}>{durationLabel}</Text>
              </View>
              <View style={[styles.timeCard, isWebLayout && styles.webTimeCard, { backgroundColor: currentTheme.background }]}>
                <Text style={[styles.timeLabel, { color: currentTheme.textSecondary }]}>Nhận phòng</Text>
                <Text style={[styles.timeValue, { color: currentTheme.text }]}>{checkIn.time} • {checkIn.displayDate}</Text>
                <Text style={[styles.timeLabel, styles.checkoutLabel, { color: currentTheme.textSecondary }]}>Trả phòng</Text>
                <Text style={[styles.timeValue, { color: currentTheme.text }]}>{checkOut.time} • {checkOut.displayDate}</Text>
              </View>
            </View>

            <View style={[styles.reminderRow, isWebLayout && styles.webReminderRow, { backgroundColor: currentTheme.background }]}>
              <Bell size={22} color={PRIMARY} />
              <Text style={[styles.reminderText, { color: currentTheme.text }]}>Bật nhắc nhở cho đặt phòng này</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#e5e7eb', true: PRIMARY_SOFT }}
                thumbColor={reminderEnabled ? PRIMARY : '#ffffff'}
              />
            </View>
          </View>

          <View style={isWebLayout && styles.webSectionsGrid}>
          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webGridSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Thông tin nhận phòng</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>Số điện thoại</Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>{booking.customerPhone || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>Họ tên</Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>{booking.customerName || 'Khách hàng'}</Text>
            </View>
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webGridSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Chi tiết thanh toán</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>Trạng thái</Text>
              <View style={styles.paymentStatus}>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>Trả tại khách sạn</Text>
                <Hotel size={20} color={PRIMARY} />
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>Tiền phòng</Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>{booking.price}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.totalLabel, { color: currentTheme.text }]}>Tổng thanh toán</Text>
              <Text style={[styles.totalValue, { color: currentTheme.text }]}>{booking.price}</Text>
            </View>
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webGridSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Tận hưởng ưu đãi</Text>
            <View style={styles.benefitRow}>
              <Gift size={20} color={PRIMARY} />
              <Text style={[styles.benefitText, { color: currentTheme.textSecondary }]}>
                Nhận Joy Xu khi nhận phòng và hoàn tất đánh giá
              </Text>
            </View>
            <Pressable style={styles.offerCard}>
              <Gift size={30} color={PRIMARY} />
              <Text style={[styles.offerText, { color: currentTheme.text }]}>Rinh ngay mã giảm giá cho lần đặt kế tiếp</Text>
              <ChevronRight size={20} color={PRIMARY} />
            </Pressable>
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webGridSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Bạn cần hỗ trợ?</Text>
            <Pressable style={styles.supportRow} onPress={() => router.push('/customer/contact-support' as any)}>
              <Headphones size={24} color={PRIMARY} />
              <Text style={[styles.supportText, { color: currentTheme.text }]}>Liên hệ với StayHub</Text>
              <ChevronRight size={22} color={currentTheme.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.section, isWebLayout && styles.webSection, isWebLayout && styles.webFullGridSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Chính sách huỷ phòng</Text>
            <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>
              Hủy miễn phí trước <Text style={[styles.policyStrong, { color: currentTheme.text }]}>{cancellationDeadline}</Text>
            </Text>
            <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>
              Xem thêm <Text style={styles.policyLink}>Điều khoản và Chính sách</Text> đặt phòng.
            </Text>
            {(booking.rawStatus === 'COMPLETED' || booking.review) && (
              <View style={styles.reviewBox}>
                <Text style={[styles.reviewBoxTitle, { color: currentTheme.text }]}>Danh gia luu tru</Text>
                {booking.review ? (
                  <View>
                    <View style={styles.reviewStarsRow}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={20} color={index < booking.review!.rating ? PRIMARY : '#CBD5E1'} fill={index < booking.review!.rating ? PRIMARY : 'transparent'} />
                      ))}
                    </View>
                    <Text style={[styles.reviewStatusText, { color: currentTheme.textSecondary }]}>Trang thai: {booking.review.status}</Text>
                    {!!booking.review.comment && <Text style={[styles.policyText, { color: currentTheme.textSecondary }]}>{booking.review.comment}</Text>}
                  </View>
                ) : (
                  <View>
                    <View style={styles.reviewStarsRow}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Pressable key={index} onPress={() => setReviewRating(index + 1)}>
                          <Star size={24} color={index < reviewRating ? PRIMARY : '#CBD5E1'} fill={index < reviewRating ? PRIMARY : 'transparent'} />
                        </Pressable>
                      ))}
                    </View>
                    <TextInput
                      style={[styles.reviewInput, { color: currentTheme.text, borderColor: currentTheme.border }]}
                      value={reviewComment}
                      onChangeText={setReviewComment}
                      placeholder="Chia se trai nghiem cua ban"
                      placeholderTextColor={currentTheme.textSecondary}
                      multiline
                    />
                    <Pressable style={[styles.submitReviewBtn, isSubmittingReview && styles.cancelBtnDisabled]} onPress={submitReview} disabled={isSubmittingReview}>
                      <Text style={styles.submitReviewText}>{isSubmittingReview ? 'Dang gui...' : 'Gui danh gia'}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            <Pressable
              style={[styles.cancelBtn, (isCancelled || isCancelling) && styles.cancelBtnDisabled]}
              onPress={cancelBooking}
              disabled={isCancelled || isCancelling}
            >
              <Text style={[styles.cancelBtnText, isCancelled && styles.cancelBtnTextDisabled]}>
                {isCancelled ? 'Đã hủy đặt phòng' : isCancelling ? 'Đang hủy...' : 'Hủy đặt phòng'}
              </Text>
            </Pressable>
          </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 18,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 14,
  },
  webHeader: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '900',
  },
  scrollContent: {
    backgroundColor: PAGE_BG,
  },
  webScrollContent: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 52,
  },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  statusBanner: {
    minHeight: 136,
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 24,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  statusBannerCancelled: {
    backgroundColor: '#eef0f2',
  },
  webStatusBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.24)',
    marginBottom: 18,
    paddingHorizontal: 28,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusTitle: {
    color: PRIMARY,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  statusTitleCancelled: {
    color: TEXT_MUTED,
  },
  statusSubtitle: {
    color: TEXT_MUTED,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  statusIcon: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconCancelled: {
    backgroundColor: '#9ca3af',
  },
  statusClockIcon: {
    position: 'absolute',
    right: -4,
    bottom: 8,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  webSection: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  webSummarySection: {
    marginBottom: 18,
    padding: 28,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  labelLarge: {
    fontSize: 19,
    fontWeight: '700',
  },
  codeValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeValue: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '900',
  },
  hotelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  webHotelRow: {
    marginBottom: 24,
  },
  roomImage: {
    width: 118,
    height: 94,
    borderRadius: 12,
  },
  webRoomImage: {
    width: 190,
    height: 128,
    borderRadius: 16,
  },
  hotelInfo: {
    flex: 1,
    minWidth: 0,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 7,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bookingTimeRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  webBookingTimeRow: {
    gap: 18,
  },
  durationCard: {
    width: 132,
    minHeight: 142,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  webDurationCard: {
    width: 180,
    minHeight: 150,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
  },
  timeCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  webTimeCard: {
    minHeight: 150,
    paddingHorizontal: 24,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  checkoutLabel: {
    marginTop: 16,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  reminderRow: {
    minHeight: 60,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  webReminderRow: {
    marginTop: 4,
  },
  reminderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  webSectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  webGridSection: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 320,
    minHeight: 190,
  },
  webFullGridSection: {
    flexBasis: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
  },
  infoRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '800',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 19,
    fontWeight: '900',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  offerCard: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: 'rgba(133,194,164,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(133,194,164,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  offerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
  },
  supportRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  supportText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  policyText: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    marginBottom: 12,
  },
  policyStrong: {
    fontWeight: '900',
  },
  policyLink: {
    color: PRIMARY,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  reviewBox: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  reviewBoxTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reviewStatusText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  reviewInput: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitReviewBtn: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  cancelBtn: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelBtnDisabled: {
    backgroundColor: '#f3f4f6',
  },
  cancelBtnText: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: '900',
  },
  cancelBtnTextDisabled: {
    color: '#6b7280',
  },
});
