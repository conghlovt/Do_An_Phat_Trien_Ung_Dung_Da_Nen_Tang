import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform, View, Text, StyleSheet, Pressable, Image, ScrollView, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hotel, MoreVertical, SlidersHorizontal, X } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { customerBookingsStorage, type CustomerBooking } from '@/src/customer/utils/booking/customerBookings';
import BookingStatusFilterSheet from '@/src/customer/components/booking/BookingStatusFilterSheet';
import type { BookingStatusFilter } from '@/src/customer/constants/booking/bookingStatusFilters';

const PRIMARY = '#85c2a4';
const MUTED_STATUS = '#6b7280';

function parseBookingPoint(value: string) {
  const match = value.match(/(\d{1,2}:\d{2}).*?(\d{1,2})\/(\d{1,2})(?:\/\d{4})?/);
  if (!match) return { date: '--/--', time: '--:--' };

  const [, time, day, month] = match;
  return {
    time,
    date: `${String(Number(day)).padStart(2, '0')}/${String(Number(month)).padStart(2, '0')}`,
  };
}

function formatBookingRange(booking: CustomerBooking) {
  const checkIn = parseBookingPoint(booking.checkIn);
  const checkOut = parseBookingPoint(booking.checkOut);

  if (checkIn.date === checkOut.date) {
    return `${checkIn.time} - ${checkOut.time}, ${checkIn.date}`;
  }

  return `${checkIn.time}, ${checkIn.date} - ${checkOut.time}, ${checkOut.date}`;
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const [showNotification, setShowNotification] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<BookingStatusFilter>('all');
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const filteredBookings = useMemo(
    () => selectedStatusFilter === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === selectedStatusFilter),
    [bookings, selectedStatusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      customerBookingsStorage.getAll()
        .then((items) => {
          if (isActive) setBookings(items);
        })
        .catch(() => {
          if (isActive) setBookings([]);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={[styles.container, { paddingTop: isWebLayout ? 0 : insets.top, backgroundColor: currentTheme.background }]}>
      {/* Header */}
      {!isWebLayout && (
        <View style={[styles.header, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Phòng đã đặt</Text>
          <Pressable style={styles.headerBtn} onPress={() => setShowFilterModal(true)}>
            <SlidersHorizontal size={22} color={currentTheme.textSecondary} />
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.scrollContent, isWebLayout && styles.webScrollContent]}>
        <View style={isWebLayout && styles.webContent}>
          {isWebLayout && (
            <View style={styles.webTitleRow}>
              <View>
                <Text style={[styles.webTitle, { color: currentTheme.text }]}>Phòng đã đặt</Text>
                <Text style={[styles.webSubtitle, { color: currentTheme.textSecondary }]}>
                  Theo dõi lịch nhận phòng, trạng thái và chi tiết thanh toán
                </Text>
              </View>
              <Pressable
                style={[
                  styles.webFilterBtn,
                  { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
                  selectedStatusFilter !== 'all' && styles.webFilterBtnActive,
                ]}
                onPress={() => setShowFilterModal(true)}
              >
                <SlidersHorizontal size={20} color={selectedStatusFilter !== 'all' ? PRIMARY : currentTheme.textSecondary} />
              </Pressable>
            </View>
          )}

          {/* Notification Banner */}
          {showNotification && (
            <View style={[styles.notification, isWebLayout && styles.webNotification, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
              <Image source={require('@/assets/images/image-19.png')} style={styles.notifImg} />
              <View style={styles.notifContent}>
                <Text style={[styles.notifText, { color: currentTheme.textSecondary }]}>
                  Theo dõi đặt phòng dễ dàng hơn. Đừng bỏ lỡ bất kỳ thông tin nào
                </Text>
                <Pressable style={styles.notifBtn}>
                  <Text style={styles.notifBtnText}>Bật thông báo thôi</Text>
                </Pressable>
              </View>
              <Pressable style={styles.notifClose} onPress={() => setShowNotification(false)}>
                <X size={18} color={currentTheme.textSecondary} />
              </Pressable>
            </View>
          )}

          {filteredBookings.length > 0 ? (
            <View style={[styles.bookingsList, isWebLayout && styles.webBookingsList]}>
              {filteredBookings.map((booking) => (
                <Pressable
                  key={booking.id}
                  style={[styles.bookingCard, isWebLayout && styles.webBookingCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                  onPress={() => router.push({ pathname: '/customer/booking/detail' as any, params: { bookingId: booking.id } })}
                >
                  <View style={styles.bookingTopRow}>
                    <Text style={[styles.bookingCode, { color: currentTheme.textSecondary }]}>
                      Mã đặt phòng: {booking.code}
                    </Text>
                    <View style={styles.bookingStatusWrap}>
                      <Text style={[styles.bookingStatus, booking.status === 'Đã huỷ' && styles.bookingStatusMuted]}>
                        {booking.status}
                      </Text>
                      <Pressable hitSlop={10}>
                        <MoreVertical size={22} color={currentTheme.textSecondary} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={[styles.bookingDivider, { backgroundColor: currentTheme.border }]} />

                  <View style={styles.bookingInfoRow}>
                    <ImageWithFallback uri={booking.roomImage} alt={booking.roomName} style={[styles.roomImage, isWebLayout && styles.webRoomImage]} />
                    <View style={styles.bookingInfo}>
                      <Text style={[styles.hotelName, isWebLayout && styles.webHotelName, { color: currentTheme.text }]} numberOfLines={1}>
                        {booking.hotelName}
                      </Text>
                      <Text style={[styles.roomName, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                        {booking.roomName}
                      </Text>
                      <Text style={[styles.bookingTime, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                        {formatBookingRange(booking)}
                      </Text>
                      <View style={styles.priceRow}>
                        <Hotel size={18} color={PRIMARY} />
                        <Text style={[styles.priceText, { color: currentTheme.text }]}>{booking.price}</Text>
                      </View>
                      {booking.status === 'Đã huỷ' && (
                        <Pressable style={styles.rebookBtn}>
                          <Text style={styles.rebookText}>Đặt lại</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            !isLoading && (
              <View style={[styles.emptyState, { backgroundColor: currentTheme.background }]}>
                <Image source={require('@/assets/images/image-14.png')} style={styles.emptyImg} />
                <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>Không có phòng nào!</Text>
                <Text style={[styles.emptySubtitle, { color: currentTheme.textSecondary }]}>Bắt đầu khám phá ngay.</Text>
                <Pressable
                  style={styles.exploreBtn}
                  onPress={() => router.replace('/customer/dashboard' as any)}
                >
                  <Text style={styles.exploreBtnText}>Khám phá phòng ngay</Text>
                </Pressable>
              </View>
            )
          )}
        </View>
      </ScrollView>
      <BookingStatusFilterSheet
        visible={showFilterModal}
        selectedStatusFilter={selectedStatusFilter}
        onSelectStatusFilter={setSelectedStatusFilter}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 2, elevation: 2,
  },
  headerSpacer: { width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerBtn: { padding: 4 },
  scrollContent: { paddingBottom: 32 },
  webScrollContent: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 52 },
  webContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  webTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  webTitle: {
    fontSize: 30,
    fontWeight: '900',
  },
  webSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  webFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFilterBtnActive: {
    borderColor: PRIMARY,
  },
  notification: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 16, borderRadius: 12, borderWidth: 1,
    gap: 12,
  },
  webNotification: {
    marginHorizontal: 0,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  notifImg: { width: 56, height: 56, resizeMode: 'contain' },
  notifContent: { flex: 1, paddingRight: 22 },
  notifText: { fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 12 },
  notifBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  notifBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notifClose: {
    position: 'absolute',
    top: 2,
    right: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bookingsList: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  webBookingsList: {
    paddingHorizontal: 0,
    gap: 16,
  },
  bookingCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  webBookingCard: {
    minHeight: 174,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  bookingTopRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookingCode: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  bookingStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingStatus: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '800',
  },
  bookingStatusMuted: {
    color: MUTED_STATUS,
  },
  bookingDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 14,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    gap: 14,
  },
  roomImage: {
    width: 112,
    height: 92,
    borderRadius: 10,
  },
  webRoomImage: {
    width: 190,
    height: 126,
    borderRadius: 14,
  },
  bookingInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  webHotelName: {
    fontSize: 20,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  bookingTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
  },
  rebookBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  rebookText: {
    color: '#3f3f46',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: { alignItems: 'center', paddingTop: 48, padding: 24, marginTop: 8 },
  emptyImg: { width: 220, height: 220, resizeMode: 'contain', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 24 },
  exploreBtn: {
    backgroundColor: '#85c2a4', paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
