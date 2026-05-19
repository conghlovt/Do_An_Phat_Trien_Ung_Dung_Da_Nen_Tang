import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator, Platform, useWindowDimensions,
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/shared/navigation/useCustomerBack';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { hotelsApi, TimeSlot, BookingType } from '@/src/customer/features/hotels/api/hotels.api';
import {
  HOUR_OPTIONS,
  MONTH_LABELS,
  WEEKDAYS,
} from '@/src/customer/features/booking/components/date-picker/bookingDate.constants';
import {
  addDays,
  clampDailyCheckoutDate,
  formatDateForApi,
  getDayDiff,
  getCheckInTimeOptions,
  getCheckoutDate,
  getDefaultCheckInTime,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMaxDailyCheckoutDate,
  getMaxHourlyDuration,
  startOfDay,
} from '@/src/customer/features/booking/components/date-picker/bookingDate.utils';
import { BOOKING_TYPES, formatShortDate } from '@/src/customer/features/booking/utils/booking';

const PRIMARY = '#85c2a4';
const PRIMARY_DARK = '#599373';
const PRIMARY_LIGHT = '#e8f6ed';
const PRIMARY_SOFT = 'rgba(133,194,164,0.16)';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';

// ── Component ─────────────────────────────────────────────────────────────────

export default function BookingCalendarScreen() {
  const router   = useRouter();
  const goBack   = useCustomerBack('/customer/dashboard');
  const insets   = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeContext();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const params   = useLocalSearchParams<{
    hotelId: string;
    hotelName?: string;
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
  const [selectedDailyCheckoutDate, setSelectedDailyCheckoutDate] = useState<Date>(addDays(today, 1));
  const [selectedStartTime, setSelectedStartTime] = useState(getDefaultCheckInTime((params.bookingType as BookingType) || 'Theo giờ', today));
  const [selectedHours, setSelectedHours]   = useState(2);

  const [timeSlots, setTimeSlots]           = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // maxHours của slot đang được chọn (từ API)
  const [slotApiMaxHours, setSlotApiMaxHours] = useState<number | undefined>(undefined);
  const selectedSlot = timeSlots.find(slot => slot.time === selectedStartTime);
  const dailyDurationDays = activeTab === 'Theo ngày' ? getDayDiff(selectedDate, selectedDailyCheckoutDate) : 0;
  const canApply = !loadingSlots && !!selectedSlot?.available && (
    activeTab !== 'Theo ngày' || dailyDurationDays >= 1
  );

  // ── Fetch time slots ───────────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const { data } = await hotelsApi.getAvailability(hotelId, {
        bookingType: activeTab,
        date: formatDateForApi(selectedDate),
      });
      const slots = activeTab === 'Theo giờ'
        ? getCheckInTimeOptions(activeTab, selectedDate).map((time) => {
            const apiSlot = data.find(slot => slot.time === time);
            const maxHours = getMaxHourlyDuration(time, apiSlot?.maxHours);
            return {
              time,
              available: (apiSlot?.available ?? true) && maxHours >= 1,
              maxHours,
            };
          })
        : data;

      setTimeSlots(slots);

      // Auto-select mốc đầu hợp lệ
      const firstAvail = slots.find(s => s.available);
      if (firstAvail) {
        setSelectedStartTime(firstAvail.time);
        setSlotApiMaxHours(firstAvail.maxHours ?? undefined);
      } else {
        setSelectedStartTime('');
        setSlotApiMaxHours(undefined);
      }
    } catch {
      const fallbackSlots = activeTab === 'Theo giờ'
        ? getCheckInTimeOptions(activeTab, selectedDate).map((time) => {
            const maxHours = getMaxHourlyDuration(time);
            return { time, available: maxHours >= 1, maxHours };
          })
        : [];
      setTimeSlots(fallbackSlots);

      const firstAvail = fallbackSlots.find(s => s.available);
      if (firstAvail) {
        setSelectedStartTime(firstAvail.time);
        setSlotApiMaxHours(firstAvail.maxHours);
      } else {
        setSelectedStartTime('');
        setSlotApiMaxHours(undefined);
      }
    } finally {
      setLoadingSlots(false);
    }
  }, [hotelId, activeTab, selectedDate]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  useEffect(() => {
    if (activeTab !== 'Theo ngày') return;
    setSelectedDailyCheckoutDate(current => clampDailyCheckoutDate(selectedDate, current));
  }, [activeTab, selectedDate]);

  // ── Auto-correct selectedHours khi checkin thay đổi ───────────────────────
  useEffect(() => {
    if (activeTab !== 'Theo giờ') return;
    const maxH = getMaxHourlyDuration(selectedStartTime, slotApiMaxHours);
    if (selectedHours > maxH) {
      // Chọn giờ hợp lệ lớn nhất
      const bestH = [...HOUR_OPTIONS].reverse().find(h => h <= maxH) ?? 1;
      setSelectedHours(bestH);
    }
  }, [selectedHours, selectedStartTime, slotApiMaxHours, activeTab]);

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
  const isDailyCheckout = (day: number) => (
    activeTab === 'Theo ngày' &&
    selectedDailyCheckoutDate.getFullYear() === calYear &&
    selectedDailyCheckoutDate.getMonth()    === calMonth &&
    selectedDailyCheckoutDate.getDate()     === day
  );
  const isDailyInRange = (day: number) => {
    if (activeTab !== 'Theo ngày') return false;
    const date = startOfDay(new Date(calYear, calMonth, day));
    return date > startOfDay(selectedDate) && date < startOfDay(selectedDailyCheckoutDate);
  };
  const isToday = (day: number) => (
    today.getFullYear() === calYear &&
    today.getMonth()    === calMonth &&
    today.getDate()     === day
  );

  const handleSelectDay = (day: number) => {
    const pickedDate = startOfDay(new Date(calYear, calMonth, day));

    if (activeTab !== 'Theo ngày') {
      setSelectedDate(pickedDate);
      return;
    }

    const currentStart = startOfDay(selectedDate);
    const maxCheckoutDate = startOfDay(getMaxDailyCheckoutDate(currentStart));

    if (pickedDate > currentStart && pickedDate <= maxCheckoutDate) {
      setSelectedDailyCheckoutDate(pickedDate);
      return;
    }

    setSelectedDate(pickedDate);
    setSelectedDailyCheckoutDate(addDays(pickedDate, 1));
  };

  // ── Compute checkout time ──────────────────────────────────────────────────
  const computeCheckOut = (): string => {
    if (activeTab === 'Theo giờ') {
      const [h, m]    = selectedStartTime.split(':').map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return '--:--';
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
    if (!canApply) return;

    const checkoutDate = getCheckoutDate(activeTab, selectedDate, selectedStartTime, selectedHours, selectedDailyCheckoutDate);
    const checkIn  = `${selectedStartTime}, ${formatShortDate(selectedDate)}`;
    const checkOut = `${computeCheckOut()}, ${formatShortDate(checkoutDate)}`;
    const durationValue = activeTab === 'Theo ngày' ? dailyDurationDays : selectedHours;
    
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
    
    const returnTo = params.returnTo === 'room-list' ? 'room-list' : 'hotel-detail';
    const returnPath = returnTo === 'room-list' ? '/customer/room-list' : '/customer/hotel-detail';
    const returnParams = returnTo === 'room-list'
      ? { hotelId: String(hotelId), hotelName: params.hotelName || 'Khách sạn' }
      : {
          id: String(hotelId),
          ...(params.hotelName ? { name: params.hotelName } : {}),
        };

    router.replace({
      pathname: returnPath as any,
      params: {
        ...returnParams,
        bookingType: activeTab,
        checkIn,
        checkOut,
        hours: String(durationValue),
        refreshed: Date.now().toString(),
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const maxHoursForSelected = getMaxHourlyDuration(selectedStartTime, slotApiMaxHours);
  const checkoutDate = getCheckoutDate(activeTab, selectedDate, selectedStartTime, selectedHours, selectedDailyCheckoutDate);
  const selectedStartTimeLabel = selectedStartTime || 'Chưa có giờ';

  return (
    <View style={[
      styles.container,
      isWebLayout && styles.webShell,
      { paddingTop: isWebLayout ? 24 : insets.top, backgroundColor: isWebLayout ? 'rgba(133,194,164,0.14)' : currentTheme.background },
    ]}>
      {/* Header */}
      <View style={[styles.header, isWebLayout && styles.webHeader, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Chọn thời gian</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Booking Type Tabs */}
      <View style={[styles.tabBar, isWebLayout && styles.webTabBar, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
        {BOOKING_TYPES.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabItem, isWebLayout && styles.webTabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => {
              setActiveTab(tab);
              setSelectedStartTime(getDefaultCheckInTime(tab, selectedDate));
              setSelectedHours(2);
              setSlotApiMaxHours(undefined);
            }}
          >
            <Text style={[styles.tabText, { color: currentTheme.textSecondary }, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={isWebLayout && styles.webScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWebLayout && styles.webScrollContent}
      >
        <View style={isWebLayout && styles.webPickerGrid}>
        {/* Calendar */}
        <View style={[styles.calendarCard, isWebLayout && styles.webCalendarCard]}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} style={styles.navBtn}>
              <ChevronLeft size={22} color={currentTheme.text} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: currentTheme.text }]}>{MONTH_LABELS[calMonth]}, {calYear}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn}>
              <ChevronRight size={22} color={currentTheme.text} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map(d => (
              <Text key={d} style={[styles.dayLabel, { color: currentTheme.textSecondary }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1;
              const valid  = dayNum >= 1 && dayNum <= daysInMonth;
              const past   = valid && isPast(dayNum);
              const sel    = valid && isSelected(dayNum);
              const checkoutSel = valid && isDailyCheckout(dayNum);
              const inDailyRange = valid && isDailyInRange(dayNum);
              const tod    = valid && isToday(dayNum);
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.dayCell,
                    inDailyRange && styles.dayCellInRange,
                    sel && styles.dayCellSelected,
                    checkoutSel && styles.dayCellSelected,
                    tod && !sel && !checkoutSel && styles.dayCellToday,
                    (past || !valid) && styles.dayCellDisabled,
                  ]}
                  onPress={() => { if (valid && !past) handleSelectDay(dayNum); }}
                  disabled={!valid || past}
                >
                  {valid ? (
                    <Text style={[
                      styles.dayText,
                      { color: currentTheme.text },
                      (sel || checkoutSel) && styles.dayTextSelected,
                      inDailyRange && styles.dayTextInRange,
                      tod && !sel && !checkoutSel && styles.dayTextToday,
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

        <View style={isWebLayout && styles.webOptionsColumn}>
        {/* Time Slots */}
        <View style={[styles.section, isWebLayout && styles.webSection, { borderTopColor: currentTheme.border }]}>
          <View style={styles.optionTitleRow}>
            <View style={styles.optionIconBadge}>
              <CalendarDays size={18} color={PRIMARY_DARK} />
            </View>
            <Text style={[styles.sectionTitle, isWebLayout && styles.webSectionTitle, { color: currentTheme.text }]}>Giờ nhận phòng</Text>
          </View>
          {loadingSlots ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={PRIMARY} size="small" />
              <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>Đang tải giờ trống...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={isWebLayout}
              style={styles.slotsScroller}
              contentContainerStyle={styles.slotsRow}
            >
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
                    { color: currentTheme.text },
                    selectedStartTime === slot.time && styles.slotTextSelected,
                    !slot.available && styles.slotTextDisabled,
                  ]}>
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
              {timeSlots.length === 0 && (
                <Text style={[styles.noSlotsText, { color: currentTheme.textSecondary }]}>Không có giờ trống</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Hours selector — chỉ cho "Theo giờ" */}
        {activeTab === 'Theo giờ' && (
          <View style={[styles.section, isWebLayout && styles.webSection, { borderTopColor: currentTheme.border }]}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.optionTitleRow}>
                <View style={styles.optionIconBadge}>
                  <Clock size={18} color={PRIMARY_DARK} />
                </View>
                <Text style={[styles.sectionTitle, isWebLayout && styles.webSectionTitle, { color: currentTheme.text }]}>Số giờ sử dụng</Text>
              </View>
              {maxHoursForSelected > 0 && (
                <Text style={styles.maxHoursHint}>Tối đa {maxHoursForSelected} giờ</Text>
              )}
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={isWebLayout}
              style={styles.slotsScroller}
              contentContainerStyle={styles.slotsRow}
            >
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
                      { color: currentTheme.text },
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
            <Text style={[styles.checkoutPreviewText, { color: currentTheme.text }]}>
              Checkout:{' '}
              <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                    {computeCheckOut()}, {formatShortDate(checkoutDate)}
              </Text>
              {' '}(tối đa 00:00, tối đa 10 giờ)
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
            <Text style={styles.infoText}>
              Phòng theo ngày: chọn ngày nhận và ngày trả phòng, tối đa 1 tháng ({dailyDurationDays} ngày)
            </Text>
          </View>
        )}

        <View style={[styles.checkoutCard, { borderTopColor: currentTheme.border }]}>
          <View style={styles.optionTitleRow}>
            <View style={styles.optionIconBadge}>
              <CalendarDays size={18} color={PRIMARY_DARK} />
            </View>
            <Text style={[styles.sectionTitle, isWebLayout && styles.webSectionTitle, { color: currentTheme.text }]}>Trả phòng</Text>
          </View>
          <Text style={[styles.checkoutCardText, { color: currentTheme.text }]}>
              {computeCheckOut()}, {formatShortDate(checkoutDate)}
            </Text>
            {activeTab === 'Theo ngày' && (
              <Text style={[styles.checkoutMetaText, { color: currentTheme.textSecondary }]}>
                Thời gian lưu trú: {dailyDurationDays} ngày
              </Text>
            )}
        </View>
        </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Apply Bar */}
      <View style={[
        styles.bottomBar,
        {
          paddingBottom: insets.bottom + 8,
          backgroundColor: currentTheme.card,
          borderTopColor: currentTheme.border,
        },
        isWebLayout && styles.webBottomBar,
      ]}>
        <View style={styles.bottomSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Nhận phòng</Text>
            <Text style={styles.summaryValue}>{selectedStartTimeLabel}, {formatShortDate(selectedDate)}</Text>
          </View>
          <Text style={styles.summaryDash}>—</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Trả phòng</Text>
            <Text style={styles.summaryValue}>
              {computeCheckOut()}, {formatShortDate(checkoutDate)}
            </Text>
            {activeTab === 'Theo ngày' && (
              <Text style={styles.summarySubValue}>{dailyDurationDays} ngày</Text>
            )}
          </View>
        </View>
        <Pressable
          style={[styles.applyBtn, !canApply && styles.applyBtnDisabled]}
          onPress={handleApply}
          disabled={!canApply}
        >
          <Text style={styles.applyBtnText}>{loadingSlots ? 'Đang tải...' : 'Áp dụng'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webShell: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  webHeader: {
    width: 950,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  webTabBar: {
    width: 950,
    justifyContent: 'center',
    gap: 34,
  },
  tabItem: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  webTabItem: {
    flex: 0,
    minWidth: 100,
  },
  tabItemActive: { borderBottomColor: PRIMARY },
  tabText: { fontSize: 14, color: GRAY, fontWeight: '600' },
  tabTextActive: { color: PRIMARY_DARK, fontWeight: '700' },

  webScroll: {
    width: 950,
    maxHeight: 560,
    backgroundColor: '#fff',
  },
  webScrollContent: {
    paddingHorizontal: 34,
    paddingVertical: 22,
  },
  webPickerGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  // Calendar
  calendarCard: { padding: 16, marginVertical: 8 },
  webCalendarCard: {
    width: 490,
    marginVertical: 0,
    padding: 0,
    paddingRight: 34,
    borderRightWidth: 1,
    borderRightColor: '#eeeeee',
  },
  webOptionsColumn: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 34,
  },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: PRIMARY_LIGHT },
  monthLabel: { fontSize: 22, fontWeight: '800', color: '#111827' },
  weekRow: { flexDirection: 'row', marginBottom: 12 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 14, color: GRAY, fontWeight: '800', paddingVertical: 10 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`, height: 58, alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
  },
  dayCellInRange: { backgroundColor: 'rgba(133,194,164,0.1)' },
  dayCellSelected: { backgroundColor: PRIMARY_SOFT, borderWidth: 1, borderColor: 'rgba(133,194,164,0.42)' },
  dayCellToday: { borderWidth: 2, borderColor: PRIMARY },
  dayCellDisabled: { opacity: 0.42 },
  dayText: { fontSize: 18, color: '#111827', fontWeight: '600' },
  dayTextInRange: { color: PRIMARY_DARK, fontWeight: '700' },
  dayTextSelected: { color: PRIMARY_DARK, fontWeight: '800' },
  dayTextToday: { color: PRIMARY_DARK, fontWeight: '800' },
  dayTextDisabled: { color: GRAY },

  // Sections
  section: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  webSection: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 28,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    marginBottom: 28,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  optionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133,194,164,0.12)',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  webSectionTitle: { fontSize: 26, fontWeight: '800' },
  maxHoursHint: { fontSize: 12, color: PRIMARY_DARK, fontWeight: '700', backgroundColor: PRIMARY_LIGHT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  slotsRow: { gap: 10, paddingRight: 40, minWidth: '100%' },
  slotsScroller: { width: '100%', maxWidth: '100%', minWidth: 0 },

  slotChip: {
    minWidth: 124,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18,
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY, borderWidth: 2, borderColor: LIGHT_GRAY,
  },
  slotChipSelected: { backgroundColor: PRIMARY_SOFT, borderColor: PRIMARY },
  slotChipDisabled: { opacity: 0.4, backgroundColor: LIGHT_GRAY },
  slotText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  slotTextSelected: { color: PRIMARY_DARK, fontWeight: '800' },
  slotTextDisabled: { color: GRAY },
  noSlotsText: { fontSize: 13, color: GRAY, paddingVertical: 10 },

  checkoutPreview: {
    marginTop: 14, backgroundColor: PRIMARY_LIGHT, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(133,194,164,0.45)',
  },
  checkoutPreviewText: { fontSize: 14, color: '#1f2937', fontWeight: '500' },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 13, color: GRAY, fontWeight: '500' },

  infoBox: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: PRIMARY_LIGHT,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(133,194,164,0.45)',
  },
  infoText: { fontSize: 14, color: '#0d5e3d', lineHeight: 20, fontWeight: '500' },
  checkoutCard: {
    paddingTop: 0,
    paddingBottom: 28,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  checkoutCardText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    paddingLeft: 58,
  },
  checkoutMetaText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    paddingLeft: 58,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingHorizontal: 16, paddingTop: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12,
  },
  webBottomBar: {
    width: 950,
    position: 'relative',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingTop: 18,
    paddingBottom: 22,
  },
  bottomSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 14, marginBottom: 12,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: GRAY, marginBottom: 3, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  summarySubValue: { fontSize: 11, fontWeight: '600', color: GRAY, marginTop: 2 },
  summaryDash: { fontSize: 18, color: GRAY, marginBottom: 2 },
  applyBtn: {
    backgroundColor: PRIMARY, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
