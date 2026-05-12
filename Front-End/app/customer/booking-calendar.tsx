import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator,
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/utils/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { hotelsApi, TimeSlot, BookingType } from '@/src/customer/api/hotels.api';

const PRIMARY = '#85c2a4';
const PRIMARY_LIGHT = '#e8f6ed';
const GREEN = '#22c55e';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';

// Giờ checkout tối đa cho "Theo giờ"
const HOTEL_CLOSE_CHECKOUT = 22;

const BOOKING_TABS: BookingType[] = ['Theo giờ', 'Qua đêm', 'Theo ngày'];

const DAYS_LABEL = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_LABEL = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function displayDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Làm tròn giờ hiện tại lên mốc 30 phút tiếp theo:
 *   phút < 30  → HH:30
 *   phút >= 30 → (HH+1):00
 */
function getInitialStartTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (m < 30) {
    return `${String(h).padStart(2, '0')}:30`;
  }
  const nextH = h + 1;
  if (nextH > HOTEL_CLOSE_CHECKOUT) return '08:30'; // wrap
  return `${String(nextH).padStart(2, '0')}:00`;
}

/**
 * Tính số giờ tối đa có thể thuê từ mốc checkin cho trước.
 * Checkout không vượt HOTEL_CLOSE_CHECKOUT:00 và không qua 00:00.
 */
function computeMaxHours(checkinTime: string, slotMaxHours?: number): number {
  const [h, m] = checkinTime.split(':').map(Number);
  const checkinMins   = h * 60 + m;
  const closeMins     = HOTEL_CLOSE_CHECKOUT * 60;
  const midnightMins  = 24 * 60;
  const maxByClose    = Math.floor((closeMins    - checkinMins) / 60);
  const maxByMidnight = Math.floor((midnightMins - checkinMins) / 60);
  const computed      = Math.max(0, Math.min(maxByClose, maxByMidnight));
  // Nếu API trả về maxHours cho slot này, lấy giá trị nhỏ hơn
  if (slotMaxHours !== undefined && slotMaxHours !== null) {
    return Math.min(computed, slotMaxHours);
  }
  return computed;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BookingCalendarScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { currentTheme, isDarkMode } = useThemeContext();
  const params   = useLocalSearchParams<{
    hotelId: string;
    bookingType: string;
    returnTo: string;
  }>();

  const hotelId = Number(params.hotelId) || 1;

  // ── State ──────────────────────────────────────────────────────────────────
  const today = new Date();
  const [activeTab, setActiveTab]           = useState<BookingType>((params.bookingType as BookingType) || 'Theo giờ');
  const [calYear, setCalYear]               = useState(today.getFullYear());
  const [calMonth, setCalMonth]             = useState(today.getMonth());
  const [selectedDate, setSelectedDate]     = useState<Date>(today);
  const [selectedStartTime, setSelectedStartTime] = useState(getInitialStartTime());
  const [selectedHours, setSelectedHours]   = useState(2);

  const [timeSlots, setTimeSlots]           = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // maxHours của slot đang được chọn (từ API)
  const [slotApiMaxHours, setSlotApiMaxHours] = useState<number | undefined>(undefined);

  // ── Fetch time slots ───────────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const { data } = await hotelsApi.getAvailability(hotelId, {
        bookingType: activeTab,
        date: formatDate(selectedDate),
      });
      setTimeSlots(data);

      // Auto-select mốc đầu hợp lệ
      const firstAvail = data.find(s => s.available);
      if (firstAvail) {
        setSelectedStartTime(firstAvail.time);
        setSlotApiMaxHours(firstAvail.maxHours);
      }
    } catch {
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [hotelId, activeTab, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  // ── Auto-correct selectedHours khi checkin thay đổi ───────────────────────
  useEffect(() => {
    if (activeTab !== 'Theo giờ') return;
    const maxH = computeMaxHours(selectedStartTime, slotApiMaxHours);
    if (selectedHours > maxH) {
      // Chọn giờ hợp lệ lớn nhất
      const bestH = [...HOUR_OPTIONS].reverse().find(h => h <= maxH) ?? 1;
      setSelectedHours(bestH);
    }
  }, [selectedStartTime, slotApiMaxHours, activeTab]);

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDay     = getFirstDayOfMonth(calYear, calMonth);
  const totalCells   = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isSelected = (day: number) => (
    selectedDate.getFullYear() === calYear &&
    selectedDate.getMonth()    === calMonth &&
    selectedDate.getDate()     === day
  );
  const isToday = (day: number) => (
    today.getFullYear() === calYear &&
    today.getMonth()    === calMonth &&
    today.getDate()     === day
  );

  // ── Compute checkout time ──────────────────────────────────────────────────
  const computeCheckOut = (): string => {
    if (activeTab === 'Theo giờ') {
      const [h, m]    = selectedStartTime.split(':').map(Number);
      const totalMins = h * 60 + m + selectedHours * 60;
      const outH      = Math.floor(totalMins / 60) % 24;
      const outM      = totalMins % 60;
      return `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;
    }
    if (activeTab === 'Qua đêm') return '10:00';
    return '12:00';
  };

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    const checkIn  = `${selectedStartTime}, ${displayDate(selectedDate)}`;
    const checkOut = `${computeCheckOut()}, ${displayDate(
      activeTab === 'Qua đêm'
        ? new Date(selectedDate.getTime() + 86400000)
        : selectedDate
    )}`;
    
    // Lưu thời gian đã chọn vào AsyncStorage
    // try {
    //   const bookingData = {
    //     hotelId: String(hotelId),
    //     bookingType: activeTab,
    //     checkIn,
    //     checkOut,
    //     hours: String(selectedHours),
    //     timestamp: Date.now(),
    //   };
    //   await AsyncStorage.setItem('lastBooking', JSON.stringify(bookingData));
    // } catch (error) {
    //   console.log('Error saving booking:', error);
    // }
    
    const returnTo = params.returnTo || 'hotel-detail';
    router.replace({
      pathname: `/${returnTo}` as any,
      params: {
        hotelId: String(hotelId),
        bookingType: activeTab,
        checkIn,
        checkOut,
        hours: String(selectedHours),
        refreshed: Date.now().toString(),
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const maxHoursForSelected = computeMaxHours(selectedStartTime, slotApiMaxHours);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1f2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Chọn thời gian</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Booking Type Tabs */}
      <View style={styles.tabBar}>
        {BOOKING_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} style={styles.navBtn}>
              <ChevronLeft size={22} color="#374151" />
            </Pressable>
            <Text style={styles.monthLabel}>{MONTHS_LABEL[calMonth]}, {calYear}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn}>
              <ChevronRight size={22} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {DAYS_LABEL.map(d => (
              <Text key={d} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1;
              const valid  = dayNum >= 1 && dayNum <= daysInMonth;
              const past   = valid && isPast(dayNum);
              const sel    = valid && isSelected(dayNum);
              const tod    = valid && isToday(dayNum);
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.dayCell,
                    sel && styles.dayCellSelected,
                    tod && !sel && styles.dayCellToday,
                    (past || !valid) && styles.dayCellDisabled,
                  ]}
                  onPress={() => { if (valid && !past) setSelectedDate(new Date(calYear, calMonth, dayNum)); }}
                  disabled={!valid || past}
                >
                  {valid ? (
                    <Text style={[
                      styles.dayText,
                      sel  && styles.dayTextSelected,
                      tod && !sel && styles.dayTextToday,
                      past && styles.dayTextDisabled,
                    ]}>
                      {dayNum}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giờ nhận phòng</Text>
          {loadingSlots ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={PRIMARY} size="small" />
              <Text style={styles.loadingText}>Đang tải giờ trống...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
              {timeSlots.map(slot => (
                <Pressable
                  key={slot.time}
                  style={[
                    styles.slotChip,
                    selectedStartTime === slot.time && styles.slotChipSelected,
                    !slot.available && styles.slotChipDisabled,
                  ]}
                  onPress={() => {
                    if (slot.available) {
                      setSelectedStartTime(slot.time);
                      setSlotApiMaxHours(slot.maxHours);
                    }
                  }}
                  disabled={!slot.available}
                >
                  <Text style={[
                    styles.slotText,
                    selectedStartTime === slot.time && styles.slotTextSelected,
                    !slot.available && styles.slotTextDisabled,
                  ]}>
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
              {timeSlots.length === 0 && (
                <Text style={styles.noSlotsText}>Không có giờ trống</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Hours selector — chỉ cho "Theo giờ" */}
        {activeTab === 'Theo giờ' && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Số giờ sử dụng</Text>
              {maxHoursForSelected > 0 && (
                <Text style={styles.maxHoursHint}>Tối đa {maxHoursForSelected} giờ</Text>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
              {HOUR_OPTIONS.map(h => {
                const disabled = h > maxHoursForSelected;
                return (
                  <Pressable
                    key={h}
                    style={[
                      styles.slotChip,
                      selectedHours === h && !disabled && styles.slotChipSelected,
                      disabled && styles.slotChipDisabled,
                    ]}
                    onPress={() => { if (!disabled) setSelectedHours(h); }}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.slotText,
                      selectedHours === h && !disabled && styles.slotTextSelected,
                      disabled && styles.slotTextDisabled,
                    ]}>
                      {h} giờ
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {/* Thông tin checkout */}
            {maxHoursForSelected > 0 && (
              <View style={styles.checkoutPreview}>
                <Text style={styles.checkoutPreviewText}>
                  Checkout:{' '}
                  <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                    {computeCheckOut()}, {displayDate(selectedDate)}
                  </Text>
                  {' '}(tối đa {HOTEL_CLOSE_CHECKOUT}:00)
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Overnight info */}
        {activeTab === 'Qua đêm' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Phòng qua đêm: Nhận từ 22:00, trả trước 10:00 hôm sau</Text>
          </View>
        )}
        {activeTab === 'Theo ngày' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Phòng theo ngày: Nhận từ 14:00, trả trước 12:00 hôm sau</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Apply Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Nhận phòng</Text>
            <Text style={styles.summaryValue}>{selectedStartTime}, {displayDate(selectedDate)}</Text>
          </View>
          <Text style={styles.summaryDash}>—</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Trả phòng</Text>
            <Text style={styles.summaryValue}>
              {computeCheckOut()}, {displayDate(
                activeTab === 'Qua đêm'
                  ? new Date(selectedDate.getTime() + 86400000)
                  : selectedDate
              )}
            </Text>
          </View>
        </View>
        <Pressable style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Áp dụng</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tabItem: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: PRIMARY },
  tabText: { fontSize: 14, color: GRAY, fontWeight: '600' },
  tabTextActive: { color: PRIMARY, fontWeight: '700' },

  // Calendar
  calendarCard: { padding: 16, marginVertical: 8 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: PRIMARY_LIGHT },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  weekRow: { flexDirection: 'row', marginBottom: 12 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: GRAY, fontWeight: '600', paddingVertical: 10 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, margin: 2,
  },
  dayCellSelected: { backgroundColor: PRIMARY },
  dayCellToday: { borderWidth: 2, borderColor: PRIMARY },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: PRIMARY, fontWeight: '700' },
  dayTextDisabled: { color: GRAY },

  // Sections
  section: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  maxHoursHint: { fontSize: 12, color: PRIMARY, fontWeight: '600', backgroundColor: PRIMARY_LIGHT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  slotsRow: { gap: 10, paddingRight: 16 },

  slotChip: {
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16,
    backgroundColor: LIGHT_GRAY, borderWidth: 2, borderColor: LIGHT_GRAY,
  },
  slotChipSelected: { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY },
  slotChipDisabled: { opacity: 0.4, backgroundColor: LIGHT_GRAY },
  slotText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  slotTextSelected: { color: PRIMARY, fontWeight: '700' },
  slotTextDisabled: { color: GRAY },
  noSlotsText: { fontSize: 13, color: GRAY, paddingVertical: 10 },

  checkoutPreview: {
    marginTop: 14, backgroundColor: PRIMARY_LIGHT, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, borderWidth: 2, borderColor: PRIMARY,
  },
  checkoutPreviewText: { fontSize: 14, color: '#1f2937', fontWeight: '500' },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 13, color: GRAY, fontWeight: '500' },

  infoBox: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: PRIMARY_LIGHT,
    borderRadius: 12, padding: 14, borderWidth: 2, borderColor: PRIMARY,
  },
  infoText: { fontSize: 14, color: '#0d5e3d', lineHeight: 20, fontWeight: '500' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingHorizontal: 16, paddingTop: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  bottomSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 14, marginBottom: 12,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: GRAY, marginBottom: 3, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  summaryDash: { fontSize: 18, color: GRAY, marginBottom: 2 },
  applyBtn: {
    backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
