import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import {
  ChevronLeft, Clock, MapPin, CreditCard, CheckCircle, Shield,
} from 'lucide-react-native';

const PRIMARY = '#85c2a4';
const PRIMARY_LIGHT = '#e8f6ed';
const GREEN = '#22c55e';

export default function BookingConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const params = useLocalSearchParams<{
    hotelId: string;
    hotelName: string;
    roomId: string;
    roomName: string;
    price: string;
    bookingType: string;
    checkIn: string;
    checkOut: string;
  }>();

  const [confirmed, setConfirmed] = useState(false);

  const priceNum = Number(params.price) || 0;

  if (confirmed) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <CheckCircle size={64} color={GREEN} />
        </View>
        <Text style={styles.successTitle}>Đặt phòng thành công!</Text>
        <Text style={styles.successSub}>
          Cảm ơn bạn đã đặt phòng tại {params.hotelName}.
          {'\n'}Thông tin sẽ được gửi qua tin nhắn.
        </Text>
        <Pressable
          style={styles.homeBtn}
          onPress={() => router.replace('/customer/(tabs)' as any)}
        >
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </Pressable>
        <Pressable
          style={styles.bookingsBtn}
          onPress={() => router.replace('/customer/(tabs)/bookings' as any)}
        >
          <Text style={styles.bookingsBtnText}>Xem phòng đã đặt</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1f2937" />
        </Pressable>
        <Text style={styles.title}>Xác nhận đặt phòng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hotel Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin khách sạn</Text>
          <View style={styles.infoRow}>
            <MapPin size={15} color={PRIMARY} />
            <Text style={styles.hotelName}>{params.hotelName || 'Khách sạn'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Loại phòng:</Text>
            <Text style={styles.value}>{params.roomName || 'Phòng tiêu chuẩn'}</Text>
          </View>
        </View>

        {/* Booking Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thời gian đặt</Text>
          <View style={styles.infoRow}>
            <Clock size={15} color={PRIMARY} />
            <Text style={styles.value}>{params.bookingType || 'Theo giờ'}</Text>
          </View>
          <View style={styles.timeGrid}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Nhận phòng</Text>
              <Text style={styles.timeValue}>{params.checkIn || '—'}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={[styles.timeBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.timeLabel}>Trả phòng</Text>
              <Text style={styles.timeValue}>{params.checkOut || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <Text style={styles.priceValue}>{priceNum.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.infoRow}>
            <CreditCard size={15} color="#374151" />
            <Text style={styles.value}>Thanh toán trực tiếp tại khách sạn</Text>
          </View>
        </View>

        {/* Policy */}
        <View style={styles.policyCard}>
          <Shield size={16} color={GREEN} />
          <Text style={styles.policyText}>
            Đặt phòng được bảo vệ bởi chính sách StayHub. Bạn có thể hủy trước giờ nhận phòng.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Confirm Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{priceNum.toLocaleString('vi-VN')}đ</Text>
        </View>
        <Pressable style={styles.confirmBtn} onPress={() => setConfirmed(true)}>
          <Text style={styles.confirmBtnText}>Xác nhận đặt phòng</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },

  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hotelName: { fontSize: 15, fontWeight: '600', color: '#374151', flex: 1 },
  label: { fontSize: 14, color: '#9ca3af', width: 90 },
  value: { fontSize: 14, color: '#374151', flex: 1 },

  timeGrid: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PRIMARY_LIGHT, borderRadius: 12, padding: 14,
  },
  timeBox: { flex: 1 },
  timeDivider: { width: 1, height: 40, backgroundColor: '#fde8d8', marginHorizontal: 12 },
  timeLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  timeValue: { fontSize: 14, fontWeight: '700', color: '#111827' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: '#374151' },
  priceValue: { fontSize: 20, fontWeight: '800', color: '#111827' },

  policyCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#f0fdf4',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#bbf7d0',
  },
  policyText: { flex: 1, fontSize: 13, color: '#15803d', lineHeight: 20 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6',
    paddingHorizontal: 16, paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  confirmBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Success state
  successContainer: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  successSub: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  homeBtn: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
    width: '100%', marginBottom: 12,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bookingsBtn: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', width: '100%',
  },
  bookingsBtnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});
