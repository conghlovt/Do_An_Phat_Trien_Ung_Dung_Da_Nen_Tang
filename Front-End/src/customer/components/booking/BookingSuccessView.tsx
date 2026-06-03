import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { styles, SUCCESS } from '@/src/customer/styles/booking/bookingConfirm.styles';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useRouter } from 'expo-router';

interface BookingSuccessViewProps {
  isPayAtHotel: boolean;
  confirmedBookingCode: string;
  hotelName: string;
  confirmedBookingId: string | null;
  isWebLayout: boolean;
  insets: { top: number; bottom: number };
}

export default function BookingSuccessView({
  isPayAtHotel,
  confirmedBookingCode,
  hotelName,
  confirmedBookingId,
  isWebLayout,
  insets,
}: BookingSuccessViewProps) {
  const router = useRouter();
  const { currentTheme } = useThemeContext();

  const successTitle = isPayAtHotel ? 'Đặt phòng thành công!' : 'Thanh toán thành công!';
  const successText = isPayAtHotel
    ? `Booking ${confirmedBookingCode} tại ${hotelName} đã được giữ phòng. Quý khách thanh toán tại khách sạn khi nhận phòng.`
    : `Booking ${confirmedBookingCode} tại ${hotelName} đã được xác nhận.`;

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
