import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, Banknote, Star, DoorOpen, ClipboardList, Hotel as HotelIcon, Plus, User, Calendar } from 'lucide-react-native';
import { partnerService } from '../../services/partner.service';
import type { Booking, Hotel } from '../../services/partner.service';

const isMobile = Platform.OS !== 'web';

// ── Helpers ──────────────────────────────────────────────────────
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isWithinDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
}

function formatFullPrice(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Build last-7-day revenue chart from bookings */
function buildChartData(bookings: Booking[]) {
  const now = new Date();
  const result: { day: string; value: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const label = DAY_LABELS[d.getDay()];

    const revenue = bookings
      .filter((b) => {
        if (b.status === 'CANCELLED') return false;
        const bd = new Date(b.checkIn);
        return `${bd.getFullYear()}-${bd.getMonth()}-${bd.getDate()}` === dayKey;
      })
      .reduce((sum, b) => sum + b.totalPrice, 0);

    result.push({ day: label, value: revenue });
  }

  return result;
}

// ── Status config for recent bookings ───────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:    { color: '#F59E0B', bg: '#FFFBEB', label: 'Chờ duyệt' },
  CONFIRMED:  { color: '#0D9488', bg: '#F0FDFA', label: 'Đã xác nhận' },
  CHECKED_IN: { color: '#6366F1', bg: '#EEF2FF', label: 'Đã nhận phòng' },
  COMPLETED:  { color: '#22C55E', bg: '#F0FDF4', label: 'Hoàn thành' },
  CANCELLED:  { color: '#EF4444', bg: '#FEF2F2', label: 'Đã hủy' },
};

// =================================================================
// MAIN COMPONENT
// =================================================================

export function StatsView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [noHotel, setNoHotel] = useState(false);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await partnerService.getHotels();
        if (!mounted) return;
        if (items.length === 0) {
          setNoHotel(true);
          return;
        }
        // Fetch hotel details + all bookings in parallel
        const hotelId = items[0].id;
        const [hotelData, bookingData] = await Promise.all([
          partnerService.getHotel(hotelId),
          partnerService.getBookings(),
        ]);
        if (!mounted) return;
        setHotel(hotelData);
        setBookings(bookingData);
      } catch {
        // Fail gracefully — show empty stats
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Computed stats ──────────────────────────────────────────
  const todayBookings = useMemo(
    () => bookings.filter((b) => isToday(b.checkIn) && b.status !== 'CANCELLED').length,
    [bookings],
  );

  const weeklyRevenue = useMemo(
    () => bookings.filter((b) => isWithinDays(b.checkIn, 7) && b.status !== 'CANCELLED').reduce((s, b) => s + b.totalPrice, 0),
    [bookings],
  );

  const avgRating = hotel ? Number(hotel.avgRating || 0) : 0;
  const totalRooms = hotel ? hotel.totalRooms : 0;

  const chartData = useMemo(() => buildChartData(bookings), [bookings]);
  const maxChartValue = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()).slice(0, 5),
    [bookings],
  );

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  // ── No hotel ────────────────────────────────────────────────
  if (noHotel) {
    return (
      <View style={s.container}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thống kê</Text>
        </View>
        <View style={s.noHotelWrapper}>
          <View style={s.noHotelIconBox}>
            <HotelIcon size={40} color="#0D9488" />
          </View>
          <Text style={s.noHotelTitle}>Bạn chưa có khách sạn nào</Text>
          <Text style={s.noHotelSubtitle}>Hãy tạo khách sạn để bắt đầu kinh doanh và theo dõi doanh thu thực tế.</Text>
          <TouchableOpacity style={s.noHotelBtn} onPress={() => router.push('/partner/hotel/new-hotel' as any)}>
            <Plus size={18} color="#FFF" />
            <Text style={s.noHotelBtnText}>Tạo khách sạn ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main content ────────────────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Thống kê</Text>
          {isMobile && <Text style={s.mobilePageSub}>Tổng quan hiệu suất khách sạn</Text>}
        </View>

        {/* Stat Cards */}
        <View style={s.grid}>
          <View style={[s.statCard, { backgroundColor: '#0F766E' }]}>
            <View style={s.iconWrapper}><BarChart3 size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{todayBookings}</Text>
            <Text style={s.statLabel}>Đặt phòng hôm nay</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#0284C7' }]}>
            <View style={s.iconWrapper}><Banknote size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{weeklyRevenue > 0 ? formatPrice(weeklyRevenue) : '0đ'}</Text>
            <Text style={s.statLabel}>Doanh thu tuần</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#8B5CF6' }]}>
            <View style={s.iconWrapper}><Star size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{avgRating.toFixed(1)}</Text>
            <Text style={s.statLabel}>Đánh giá TB</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#10B981' }]}>
            <View style={s.iconWrapper}><DoorOpen size={24} color="rgba(255,255,255,0.9)" /></View>
            <Text style={s.statNumber}>{totalRooms}</Text>
            <Text style={s.statLabel}>Tổng phòng</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={s.chartCard}>
          <View style={s.sectionTitleRow}>
            <BarChart3 size={18} color="#0F766E" />
            <Text style={s.sectionTitle}>Doanh thu 7 ngày qua</Text>
          </View>
          {weeklyRevenue === 0 ? (
            <View style={s.chartEmptyBox}>
              <Banknote size={28} color="#CBD5E1" />
              <Text style={s.chartEmptyText}>Chưa có doanh thu trong tuần</Text>
            </View>
          ) : (
            <View style={s.chartContainer}>
              {chartData.map((d, i) => (
                <View key={i} style={s.barColumn}>
                  <Text style={s.barValue}>{d.value > 0 ? formatPrice(d.value) : '-'}</Text>
                  <View style={s.barWrapper}>
                    <View style={[s.barFill, { height: `${Math.max((d.value / maxChartValue) * 100, d.value > 0 ? 5 : 0)}%` }]} />
                  </View>
                  <Text style={s.barLabel}>{d.day}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Bookings Section */}
        <View style={s.chartCard}>
          <View style={s.sectionTitleRow}>
            <ClipboardList size={18} color="#0F766E" />
            <Text style={s.sectionTitle}>Đặt phòng gần đây</Text>
          </View>
          {recentBookings.length === 0 ? (
            <View style={s.emptyCard}>
              <ClipboardList size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <Text style={s.emptyText}>Chưa có đặt phòng nào</Text>
              <Text style={s.emptySubText}>Các đơn đặt phòng mới sẽ xuất hiện tại đây.</Text>
            </View>
          ) : (
            recentBookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
              return (
                <View key={b.id} style={s.bookingRow}>
                  <View style={s.bookingLeft}>
                    <View style={s.bookingAvatar}>
                      <User size={14} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bookingName} numberOfLines={1}>{b.user.username}</Text>
                      <View style={s.bookingDateRow}>
                        <Calendar size={11} color="#94A3B8" />
                        <Text style={s.bookingDate}>{formatDate(b.checkIn)} – {formatDate(b.checkOut)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={s.bookingRight}>
                    <Text style={s.bookingPrice}>{formatFullPrice(b.totalPrice)}</Text>
                    <View style={[s.bookingBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.bookingBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// =================================================================
// STYLES
// =================================================================

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
  mobilePageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobilePageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  mobilePageSub: { fontSize: 13, color: '#64748B' },
  pageHeader: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: isMobile ? 16 : 20, paddingTop: 20, gap: isMobile ? 10 : 14 },
  statCard: {
    borderRadius: 16,
    padding: isMobile ? 16 : 20,
    ...Platform.select({
      web: { width: 'calc(50% - 7px)' as any, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' as any },
      default: { width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
    }),
  },
  iconWrapper: { marginBottom: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  statNumber: { fontSize: isMobile ? 24 : 28, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '500' },
  
  chartCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginHorizontal: isMobile ? 16 : 20, marginTop: 24, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' as any }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 } }) },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, paddingTop: 20, paddingHorizontal: 4 },
  barColumn: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 10, color: '#94A3B8', marginBottom: 6, fontWeight: '600' },
  barWrapper: { height: 120, width: isMobile ? 20 : 28, backgroundColor: '#F1F5F9', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#0D9488', borderRadius: 6 },
  barLabel: { fontSize: 12, color: '#64748B', marginTop: 10, fontWeight: '600' },
  chartEmptyBox: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  chartEmptyText: { color: '#94A3B8', fontSize: 14 },
  
  emptyCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyText: { color: '#64748B', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptySubText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },

  // Recent booking rows
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  bookingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  bookingAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
  bookingName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  bookingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  bookingDate: { fontSize: 12, color: '#94A3B8' },
  bookingRight: { alignItems: 'flex-end', gap: 4 },
  bookingPrice: { fontSize: 14, fontWeight: '800', color: '#0F766E' },
  bookingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  bookingBadgeText: { fontSize: 11, fontWeight: '700' },

  // No hotel empty state
  noHotelWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    ...(Platform.OS === 'web' ? { minHeight: '70vh' as any } : {}),
  },
  noHotelIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FDFA', borderWidth: 2, borderColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  noHotelTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  noHotelSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, maxWidth: 340, marginBottom: 24 },
  noHotelBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0D9488', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(13,148,136,0.3)' as any }, default: { shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 } }) },
  noHotelBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
