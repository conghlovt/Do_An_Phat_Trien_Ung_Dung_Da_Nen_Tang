import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {
  ClipboardList, Clock, CheckCircle, LogIn, Trophy, XCircle,
  User, Phone, BedDouble, Calendar, Banknote,
} from 'lucide-react-native';
import { partnerService } from '../../services/partner.service';
import type { Booking, BookingStatus } from '../../services/partner.service';
import { LoadingSpinner, EmptyState } from '../shared/LoadingSpinner';

const isMobile = Platform.OS !== 'web';

// ============================================================
// CONSTANTS
// ============================================================

const FILTERS: { key: BookingStatus | 'ALL'; label: string; Icon: React.ElementType }[] = [
  { key: 'ALL', label: 'Tất cả', Icon: ClipboardList },
  { key: 'PENDING', label: 'Chờ duyệt', Icon: Clock },
  { key: 'CONFIRMED', label: 'Đã xác nhận', Icon: CheckCircle },
  { key: 'CHECKED_IN', label: 'Đã nhận phòng', Icon: LogIn },
  { key: 'COMPLETED', label: 'Hoàn thành', Icon: Trophy },
  { key: 'CANCELLED', label: 'Đã hủy', Icon: XCircle },
];

const STATUS_CONFIG: Record<BookingStatus, { color: string; bg: string; label: string; Icon: React.ElementType }> = {
  PENDING:    { color: '#F59E0B', bg: '#FFFBEB', label: 'Chờ duyệt',      Icon: Clock },
  CONFIRMED:  { color: '#0D9488', bg: '#F0FDFA', label: 'Đã xác nhận',    Icon: CheckCircle },
  CHECKED_IN: { color: '#6366F1', bg: '#EEF2FF', label: 'Đã nhận phòng',  Icon: LogIn },
  COMPLETED:  { color: '#22C55E', bg: '#F0FDF4', label: 'Hoàn thành',     Icon: Trophy },
  CANCELLED:  { color: '#EF4444', bg: '#FEF2F2', label: 'Đã hủy',        Icon: XCircle },
};

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';

// ============================================================
// SUB-COMPONENTS
// ============================================================

const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
  const cfg = STATUS_CONFIG[status];
  const IconComp = cfg.Icon;
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <IconComp size={13} color={cfg.color} />
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const InfoRow = ({
  Icon,
  label,
  value,
  valueStyle,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={s.infoRow}>
    <View style={s.infoLeft}>
      <Icon size={15} color="#94A3B8" />
      <Text style={s.infoLabel}>{label}</Text>
    </View>
    <Text style={[s.infoValue, valueStyle]}>{value}</Text>
  </View>
);

const ActionButton = ({
  label,
  color,
  bgColor,
  Icon,
  onPress,
}: {
  label: string;
  color: string;
  bgColor: string;
  Icon: React.ElementType;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[s.actionBtn, { backgroundColor: bgColor, borderColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon size={15} color={color} />
    <Text style={[s.actionText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const BookingCard = ({
  booking,
  onAction,
}: {
  booking: Booking;
  onAction: (id: string, status: BookingStatus) => void;
}) => {
  const cfg = STATUS_CONFIG[booking.status];

  return (
    <View style={[s.card, { borderLeftColor: cfg.color, borderLeftWidth: 4 }]}>
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={s.cardHeaderLeft}>
          <View style={s.avatarCircle}>
            <User size={18} color="#fff" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.cardTitle} numberOfLines={1}>{booking.user.username}</Text>
            <View style={s.phoneRow}>
              <Phone size={12} color="#64748B" />
              <Text style={s.cardPhone}>{booking.user.phone || 'Chưa có SĐT'}</Text>
            </View>
          </View>
        </View>
        <BookingStatusBadge status={booking.status} />
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Info Rows */}
      <InfoRow Icon={BedDouble} label="Phòng" value={booking.room.name} />
      <InfoRow Icon={Calendar} label="Nhận phòng" value={formatDate(booking.checkIn)} />
      <InfoRow Icon={Calendar} label="Trả phòng" value={formatDate(booking.checkOut)} />
      <InfoRow
        Icon={Banknote}
        label="Tổng tiền"
        value={formatPrice(booking.totalPrice)}
        valueStyle={s.priceValue}
      />

      {/* Actions */}
      {renderActions(booking, onAction)}
    </View>
  );
};

/** Luồng: PENDING → (Xác nhận / Từ chối) → CONFIRMED → (Nhận phòng) → CHECKED_IN → (Hoàn thành) → COMPLETED */
function renderActions(
  booking: Booking,
  onAction: (id: string, status: BookingStatus) => void,
) {
  const { id, status } = booking;

  if (status === 'PENDING') {
    return (
      <View style={s.actionRow}>
        <ActionButton
          label="Xác nhận"
          color="#0D9488"
          bgColor="#F0FDFA"
          Icon={CheckCircle}
          onPress={() => onAction(id, 'CONFIRMED')}
        />
        <ActionButton
          label="Từ chối"
          color="#EF4444"
          bgColor="#FEF2F2"
          Icon={XCircle}
          onPress={() => onAction(id, 'CANCELLED')}
        />
      </View>
    );
  }

  if (status === 'CONFIRMED') {
    return (
      <View style={s.actionRow}>
        <ActionButton
          label="Nhận phòng"
          color="#6366F1"
          bgColor="#EEF2FF"
          Icon={LogIn}
          onPress={() => onAction(id, 'CHECKED_IN')}
        />
      </View>
    );
  }

  if (status === 'CHECKED_IN') {
    return (
      <View style={s.actionRow}>
        <ActionButton
          label="Hoàn thành"
          color="#22C55E"
          bgColor="#F0FDF4"
          Icon={Trophy}
          onPress={() => onAction(id, 'COMPLETED')}
        />
      </View>
    );
  }

  return null; // COMPLETED, CANCELLED — no actions
}

// ============================================================
// MAIN SCREEN
// ============================================================

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 600;

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await partnerService.getBookings(filter === 'ALL' ? undefined : filter);
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
      await partnerService.updateBookingStatus(id, status);
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

  if (loading && bookings.length === 0 && !refreshing) {
    return <LoadingSpinner message="Đang tải đơn đặt phòng..." />;
  }

  return (
    <View style={s.container}>
      {/* ====== Page Header — matching rooms.tsx pattern ====== */}
      {(isMobile || isNarrow) ? (
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Đơn đặt phòng</Text>
          <View style={s.mobilePageHeaderRow}>
            <Text style={s.mobilePageSub}>
              {bookings.length} đơn{filter !== 'ALL' ? ` · ${STATUS_CONFIG[filter].label}` : ''}
            </Text>
          </View>
        </View>
      ) : (
        <View style={s.pageHeader}>
          <View>
            <View style={s.pageTitleRow}>
              <ClipboardList size={20} color="#0F172A" />
              <Text style={s.pageTitle}>Đơn đặt phòng</Text>
            </View>
            <Text style={s.pageSub}>
              {bookings.length} đơn{filter !== 'ALL' ? ` · ${STATUS_CONFIG[filter].label}` : ''}
            </Text>
          </View>
        </View>
      )}

      {/* ====== Filter Tabs Bar — matching rooms.tsx tabsBar ====== */}
      <View style={s.tabsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
        >
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            const FilterIcon = item.Icon;
            return (
              <TouchableOpacity
                key={item.key}
                style={[s.tabItem, isActive && s.tabItemActive]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.7}
              >
                <FilterIcon size={14} color={isActive ? '#FFF' : '#64748B'} />
                <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ====== Content ====== */}
      <FlatList<Booking>
        data={bookings}
        keyExtractor={(item: Booking) => item.id}
        renderItem={({ item }: { item: Booking }) => (
          <BookingCard booking={item} onAction={handleAction} />
        )}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008080']}
            tintColor="#008080"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Chưa có đơn đặt phòng"
            subtitle="Các đơn đặt phòng mới sẽ hiển thị tại đây"
          />
        }
      />
    </View>
  );
}

// ============================================================
// STYLES — Matching rooms.tsx (Go2Joy-inspired)
// ============================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMobile ? '#FFF' : '#F8FAFC',
  },

  // ── Mobile Page Header ──────────────────────────────────────
  mobilePageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobilePageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  mobilePageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobilePageSub: {
    fontSize: 13,
    color: '#64748B',
  },

  // ── Page Header (Web) ──────────────────────────────────────
  pageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: isMobile ? 14 : 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 28,
  },

  // ── Tabs Bar ────────────────────────────────────────────────
  tabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isMobile ? 8 : 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsContent: {
    paddingHorizontal: isMobile ? 12 : 20,
    gap: isMobile ? 6 : 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: '#008080',
  },
  tabLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFF',
  },

  // ── Content List ────────────────────────────────────────────
  list: {
    padding: isMobile ? 12 : 20,
    paddingBottom: 40,
  },

  // ── Card ────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  cardPhone: {
    fontSize: 13,
    color: '#64748B',
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  // ── Info Rows ───────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  infoValue: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  priceValue: {
    color: '#0D9488',
    fontWeight: '800',
    fontSize: 15,
  },

  // ── Badge ───────────────────────────────────────────────────
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Actions ─────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
