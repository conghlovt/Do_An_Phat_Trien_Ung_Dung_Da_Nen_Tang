import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  ActivityIndicator, Platform, useWindowDimensions,
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { useCustomerBack } from '@/src/customer/navigation/useCustomerBack';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { hotelsApi, TimeSlot, BookingType } from '@/src/customer/api/hotels.api';
import {
  HOUR_OPTIONS,
  MONTH_LABELS,
  WEEKDAYS,
} from '@/src/customer/components/date-picker/bookingDate.constants';
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
} from '@/src/customer/components/date-picker/bookingDate.utils';
import { BOOKING_TYPES, formatShortDate } from '@/src/customer/utils/booking';
import {
  bookingCalendarScreenStyles as styles,
  PRIMARY,
  PRIMARY_DARK,
} from '@/src/customer/components/date-picker/bookingCalendarScreen.styles';
import { getParamText } from '@/src/customer/navigation/routeParams';

function parseBookingPoint(value?: string, fallbackYear = new Date().getFullYear()) {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}:\d{2}),\s*(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;

  const [, time, dayText, monthText] = match;
  const day = Number(dayText);
  const month = Number(monthText);

  if (!Number.isFinite(day) || !Number.isFinite(month)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return {
    time,
    date: new Date(fallbackYear, month - 1, day),
  };
}

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
    hotelAddress?: string;
    hotelImage?: string;
    bookingType: string;
    checkIn?: string;
    checkOut?: string;
    hours?: string;
    returnTo: string;
  }>();

  const hotelId = getParamText(params.hotelId) || '1';

  // ── State ──────────────────────────────────────────────────────────────────
  const today = new Date();
  const initialBookingType = (params.bookingType as BookingType) || 'Theo giờ';
  const initialCheckIn = parseBookingPoint(params.checkIn, today.getFullYear());
  const initialCheckOut = parseBookingPoint(params.checkOut, today.getFullYear());
  const initialDate = initialCheckIn?.date || today;
  const initialHours = Math.max(1, Number(params.hours) || 2);

  const [activeTab, setActiveTab]           = useState<BookingType>(initialBookingType);
  const [calYear, setCalYear]               = useState(initialDate.getFullYear());
  const [calMonth, setCalMonth]             = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate]     = useState<Date>(initialDate);
  const [selectedDailyCheckoutDate, setSelectedDailyCheckoutDate] = useState<Date>(initialCheckOut?.date || addDays(initialDate, 1));
  const [selectedStartTime, setSelectedStartTime] = useState(initialCheckIn?.time || getDefaultCheckInTime(initialBookingType, initialDate));
  const [selectedHours, setSelectedHours]   = useState(initialHours);
  const selectedStartTimeRef = useRef(selectedStartTime);

  const [timeSlots, setTimeSlots]           = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  // maxHours của slot đang được chọn (từ API)
  const [slotApiMaxHours, setSlotApiMaxHours] = useState<number | undefined>(undefined);
  const selectedSlot = timeSlots.find(slot => slot.time === selectedStartTime);
  const dailyDurationDays = activeTab === 'Theo ngày' ? getDayDiff(selectedDate, selectedDailyCheckoutDate) : 0;
  const canApply = !loadingSlots && !!selectedSlot?.available && (
    activeTab !== 'Theo ngày' || dailyDurationDays >= 1
  );

  useEffect(() => {
    selectedStartTimeRef.current = selectedStartTime;
  }, [selectedStartTime]);

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

      const firstAvail = slots.find(s => s.available);
      const currentAvail = slots.find(s => s.time === selectedStartTimeRef.current && s.available);
      const nextSlot = currentAvail || firstAvail;

      if (nextSlot) {
        setSelectedStartTime(nextSlot.time);
        setSlotApiMaxHours(nextSlot.maxHours ?? undefined);
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
      const currentAvail = fallbackSlots.find(s => s.time === selectedStartTimeRef.current && s.available);
      const nextSlot = currentAvail || firstAvail;

      if (nextSlot) {
        setSelectedStartTime(nextSlot.time);
        setSlotApiMaxHours(nextSlot.maxHours);
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
      ? {
          hotelId: String(hotelId),
          hotelName: params.hotelName || 'Khách sạn',
          ...(params.hotelAddress ? { hotelAddress: params.hotelAddress } : {}),
          ...(params.hotelImage ? { hotelImage: params.hotelImage } : {}),
        }
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
