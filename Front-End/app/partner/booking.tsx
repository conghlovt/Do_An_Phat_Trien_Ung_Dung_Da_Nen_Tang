import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { bookingApi } from '../../src/partner/api/booking.api';
import type { Booking, BookingStatus } from '../../src/partner/types/booking.type';

const FILTERS: { key: BookingStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING: '#f97316',
  CONFIRMED: '#0D9488',
  COMPLETED: '#22c55e',
  CANCELLED: '#EF4444',
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';

const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <View style={[styles.badge, { backgroundColor: STATUS_COLOR[status] }]}> 
    <Text style={styles.badgeText}>{status}</Text>
  </View>
);

const BookingCard = ({ booking, onAction }: { booking: Booking; onAction: (id: string, status: BookingStatus) => void }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.cardTitle}>{booking.user.username}</Text>
        <Text style={styles.cardMeta}>{booking.user.phone || 'Chưa có SĐT'}</Text>
      </View>
      <StatusBadge status={booking.status} />
    </View>

    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Phòng</Text>
      <Text style={styles.cardValue}>{booking.room.name}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Nhận</Text>
      <Text style={styles.cardValue}>{formatDate(booking.checkIn)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Trả</Text>
      <Text style={styles.cardValue}>{formatDate(booking.checkOut)}</Text>
    </View>
    <View style={styles.cardRow}> 
      <Text style={styles.cardLabel}>Tổng tiền</Text>
      <Text style={[styles.cardValue, styles.totalPrice]}>{formatPrice(booking.totalPrice)}</Text>
    </View>

    <View style={styles.actionRow}>
      {booking.status === 'PENDING' ? (
        <>
          <ActionButton label="Xác nhận" color="#0D9488" onPress={() => onAction(booking.id, 'CONFIRMED')} />
          <ActionButton label="Từ chối" color="#EF4444" onPress={() => onAction(booking.id, 'CANCELLED')} />
        </>
      ) : booking.status === 'CONFIRMED' ? (
        <ActionButton label="Hoàn thành" color="#0D9488" onPress={() => onAction(booking.id, 'COMPLETED')} />
      ) : null}
    </View>
  </View>
);

const ActionButton = ({ label, color, onPress }: { label: string; color: string; onPress: () => void }) => (
  <TouchableOpacity style={[styles.actionBtn, { borderColor: color }]} onPress={onPress}>
    <Text style={[styles.actionText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getBookings(filter === 'ALL' ? undefined : filter);
      setBookings(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải đơn đặt phòng');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleAction = async (id: string, status: BookingStatus) => {
    try {
      await bookingApi.updateBookingStatus(id, status);
      await loadBookings();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý đơn đặt phòng</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      >
        {FILTERS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterItem, filter === item.key && styles.filterItemActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <ActivityIndicator color="#0D9488" size="large" style={styles.loader} />
      ) : (
        <FlatList<Booking>
          data={bookings}
          keyExtractor={(item: Booking) => item.id}
          renderItem={({ item }: { item: Booking }) => <BookingCard booking={item} onAction={handleAction} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
          ListEmptyComponent={<Text style={styles.empty}>Không có đơn đặt phòng</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  filterList: {
    paddingBottom: 12,
  },
  filterItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
  },
  filterItemActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterText: {
    color: '#334155',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardMeta: {
    color: '#475569',
    marginTop: 4,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardLabel: {
    color: '#64748B',
  },
  cardValue: {
    color: '#0F172A',
    fontWeight: '600',
  },
  totalPrice: {
    color: '#0D9488',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  actionText: {
    fontWeight: '700',
  },
  loader: {
    marginTop: 32,
  },
  empty: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 28,
  },
});
