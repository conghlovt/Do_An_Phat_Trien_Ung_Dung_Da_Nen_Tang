import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, RefreshControl, Dimensions, useWindowDimensions,
} from 'react-native';
import type { ScreenName, ScreenParams } from '../PartnerDashboard';
import { partnerService } from '../../services/partner.service';
import type { RoomType } from '../../services/partner.service';
import { StatusBadge } from '../shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '../shared/LoadingSpinner';
import {
  BedDouble, Plus, ChevronLeft, ChevronRight, Lock,
  Eye, Calendar, Clock, Moon, Sun,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const isMobile = Platform.OS !== 'web';

type BookingTab = 'hourly' | 'overnight' | 'daily';

const TAB_CONFIG: { key: BookingTab; label: string; icon: React.ElementType }[] = [
  { key: 'hourly', label: 'Theo giờ', icon: Clock },
  { key: 'overnight', label: 'Qua đêm', icon: Moon },
  { key: 'daily', label: 'Theo ngày', icon: Sun },
];

function formatDate(d: Date): string { return d.toISOString().split('T')[0]!; }
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function formatShortDate(dateStr: string): { day: string; weekday: string; isToday: boolean } {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return { day: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'), weekday: weekdays[d.getDay()]!, isToday };
}
function formatPrice(price: number): string {
  if (price >= 1000000) return (price / 1000000).toFixed(1) + 'tr';
  if (price >= 1000) return Math.round(price / 1000) + 'k';
  return price.toLocaleString('vi-VN') + 'đ';
}

interface Props {
  onNavigate?: (screen: ScreenName, params?: ScreenParams) => void;
}

export function RoomManagement({ onNavigate }: Props) {
  const [hotelId, setHotelId] = useState('');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 600;

  // Calendar state
  const [activeTab, setActiveTab] = useState<BookingTab>('daily');
  const [startDate, setStartDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const DAYS_COUNT = 14;

  const dateRange = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < DAYS_COUNT; i++) dates.push(formatDate(addDays(startDate, i)));
    return dates;
  }, [startDate]);

  const endDateStr = formatDate(addDays(startDate, DAYS_COUNT - 1));

  // Load hotel ID
  useEffect(() => {
    partnerService.getHotels().then(({ items }) => {
      if (items.length > 0) setHotelId(items[0].id);
    });
  }, []);

  // Load room types
  useEffect(() => {
    if (!hotelId) return;
    setRoomsLoading(true);
    partnerService.getRoomTypes(hotelId)
      .then(setRoomTypes)
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
  }, [hotelId]);

  // Load calendar data
  useEffect(() => {
    if (!hotelId) return;
    const loadCalendar = async () => {
      try {
        setCalendarLoading(true);
        const data = await partnerService.getInventoryCalendar(hotelId, formatDate(startDate), endDateStr);
        setCalendarData(data);
      } catch (err) {
        console.warn('Calendar load error:', err);
      } finally {
        setCalendarLoading(false);
      }
    };
    loadCalendar();
  }, [hotelId, startDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const types = await partnerService.getRoomTypes(hotelId);
      setRoomTypes(types);
      const data = await partnerService.getInventoryCalendar(hotelId, formatDate(startDate), endDateStr);
      setCalendarData(data);
    } catch {}
    setRefreshing(false);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  if (roomsLoading && roomTypes.length === 0) return <LoadingSpinner />;

  const displayData = calendarData.length > 0
    ? calendarData
    : roomTypes.map(rt => ({ id: rt.id, name: rt.name, totalUnits: rt.totalUnits, status: rt.status, inventory: {} as any, pricing: {} as any }));

  return (
    <View style={s.container}>
      {/* Page Header */}
      {(isMobile || isNarrow) ? (
        <View style={s.mobilePageHeader}>
          <Text style={s.mobilePageTitle}>Quản lý loại phòng</Text>
          <View style={s.mobilePageHeaderRow}>
            <Text style={s.mobilePageSub}>{roomTypes.length} loại phòng</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => onNavigate?.('room-form', { hotelId })}>
              <Plus size={14} color="#FFF" />
              <Text style={s.addBtnText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.pageHeader}>
          <View>
            <View style={s.pageTitleRow}><BedDouble size={20} color="#0F172A" /><Text style={s.pageTitle}>Quản lý loại phòng</Text></View>
            <Text style={s.pageSub}>{roomTypes.length} loại phòng</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => onNavigate?.('room-form', { hotelId })}>
            <Plus size={16} color="#FFF" /><Text style={s.addBtnText}>Thêm loại phòng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Type Tabs */}
      <View style={s.tabsBar}>
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={[s.tabItem, isActive && s.tabItemActive]} onPress={() => setActiveTab(tab.key)}>
              <Icon size={14} color={isActive ? '#FFF' : '#64748B'} />
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={s.dateNav}>
          <TouchableOpacity style={s.dateNavBtn} onPress={() => navigateWeek('prev')}><ChevronLeft size={18} color="#64748B" /></TouchableOpacity>
          <View style={s.dateNavCenter}>
            <Calendar size={14} color="#1E293B" />
            <Text style={s.dateNavText}>{formatShortDate(dateRange[0]!).day} — {formatShortDate(dateRange[dateRange.length - 1]!).day}</Text>
          </View>
          <TouchableOpacity style={s.dateNavBtn} onPress={() => navigateWeek('next')}><ChevronRight size={18} color="#64748B" /></TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008080']} />}>
        {roomTypes.length === 0 ? (
          <EmptyState icon="🛏️" title="Chưa có loại phòng nào" subtitle="Thêm loại phòng để khách hàng có thể đặt" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
            <View>
              {/* Date Header Row */}
              <View style={s.calendarHeaderRow}>
                <View style={s.roomNameCol}><Text style={s.roomNameHeader}>Loại phòng</Text></View>
                {dateRange.map((dateStr) => {
                  const { day, weekday, isToday } = formatShortDate(dateStr);
                  return (
                    <View key={dateStr} style={[s.dateCol, isToday && s.dateColToday]}>
                      <Text style={[s.dateWeekday, isToday && s.dateWeekdayToday]}>{weekday}</Text>
                      <Text style={[s.dateDay, isToday && s.dateDayToday]}>{day}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Room Type Rows */}
              {displayData.map((rt) => (
                <View key={rt.id} style={s.calendarRow}>
                  <TouchableOpacity
                    style={s.roomNameCol}
                    onPress={() => onNavigate?.('room-detail', { hotelId, roomTypeId: rt.id })}
                  >
                    <Text style={s.roomTypeName} numberOfLines={2}>{rt.name}</Text>
                    <View style={s.roomMeta}>
                      <StatusBadge status={rt.status} size="sm" />
                      <Text style={s.totalUnits}>{rt.totalUnits} phòng</Text>
                    </View>
                    <View style={s.viewLink}><Eye size={12} color="#1677ff" /><Text style={s.viewLinkText}>Chi tiết</Text></View>
                  </TouchableOpacity>

                  {dateRange.map((dateStr) => {
                    const inv = rt.inventory?.[dateStr];
                    const price = rt.pricing?.[activeTab] || 0;
                    const { isToday } = formatShortDate(dateStr);

                    if (inv?.isClosed) {
                      return (
                        <View key={dateStr} style={[s.dateCell, s.dateCellClosed, isToday && s.dateCellToday]}>
                          <Lock size={14} color="#EF4444" />
                          <Text style={s.closedText}>Đóng</Text>
                        </View>
                      );
                    }

                    const available = inv ? inv.availableRooms : rt.totalUnits;
                    const booked = inv ? inv.bookedRooms : 0;
                    const isFull = available <= 0;

                    return (
                      <View key={dateStr} style={[s.dateCell, isFull ? s.dateCellFull : available <= 2 ? s.dateCellWarning : s.dateCellAvailable, isToday && s.dateCellToday]}>
                        <Text style={[s.cellStatus, isFull ? s.cellStatusFull : s.cellStatusAvailable]}>{isFull ? 'Hết' : `Còn ${available}`}</Text>
                        {booked > 0 && <Text style={s.cellBooked}>{booked} đặt</Text>}
                        {price > 0 && <Text style={s.cellPrice}>{formatPrice(price)}</Text>}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const COL_WIDTH = isMobile ? 72 : 90;
const NAME_COL_WIDTH = isMobile ? 120 : 160;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? '#FFF' : '#F8FAFC' },
  scroll: { flex: 1 },
  mobilePageHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mobilePageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  mobilePageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobilePageSub: { fontSize: 13, color: '#64748B' },
  pageHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: isMobile ? 16 : 24, paddingVertical: isMobile ? 14 : 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 10 },
  pageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageTitle: { fontSize: isMobile ? 18 : 20, fontWeight: '800', color: '#0F172A' },
  pageSub: { fontSize: 13, color: '#64748B', marginTop: 2, marginLeft: 28 },
  addBtn: { backgroundColor: '#0D9488', paddingHorizontal: isMobile ? 12 : 16, paddingVertical: isMobile ? 8 : 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  tabsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: isMobile ? 12 : 20, paddingVertical: isMobile ? 8 : 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: isMobile ? 6 : 8, flexWrap: 'wrap' },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabItemActive: { backgroundColor: '#008080' },
  tabLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabLabelActive: { color: '#FFF' },
  dateNav: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 4 },
  dateNavBtn: { padding: 6, borderRadius: 6, backgroundColor: '#F1F5F9' },
  dateNavCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  dateNavText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  calendarHeaderRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  roomNameCol: { width: NAME_COL_WIDTH, padding: 12, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  roomNameHeader: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateCol: { width: COL_WIDTH, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  dateColToday: { backgroundColor: '#EFF6FF' },
  dateWeekday: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  dateWeekdayToday: { color: '#1677ff' },
  dateDay: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 2 },
  dateDayToday: { color: '#1677ff' },
  calendarRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
  roomTypeName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  roomMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  totalUnits: { fontSize: 11, color: '#64748B' },
  viewLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewLinkText: { fontSize: 11, color: '#1677ff', fontWeight: '600' },
  dateCell: { width: COL_WIDTH, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9', gap: 3 },
  dateCellToday: { backgroundColor: '#EFF6FF' },
  dateCellAvailable: {},
  dateCellWarning: { backgroundColor: '#FFFBEB' },
  dateCellFull: { backgroundColor: '#FEF2F2' },
  dateCellClosed: { backgroundColor: '#FEF2F2' },
  cellStatus: { fontSize: 12, fontWeight: '700' },
  cellStatusAvailable: { color: '#22C55E' },
  cellStatusFull: { color: '#EF4444' },
  cellBooked: { fontSize: 10, color: '#F59E0B', fontWeight: '600' },
  cellPrice: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  closedText: { fontSize: 11, color: '#EF4444', fontWeight: '600', marginTop: 2 },
});
