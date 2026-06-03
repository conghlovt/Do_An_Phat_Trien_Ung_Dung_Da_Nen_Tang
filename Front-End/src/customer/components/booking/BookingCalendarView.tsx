import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BOOKING_DATE_COLORS, WEEKDAYS } from '@/src/customer/constants/booking/bookingDate.constants';
import { styles } from '@/src/customer/styles/booking/bookingDate.styles';
import type { CalendarCell } from '@/src/customer/utils/booking/bookingDate.utils';
import { formatMonth, isSameDay } from '@/src/customer/utils/booking/bookingDate.utils';

interface BookingCalendarViewProps {
  calendarCells: CalendarCell[];
  isWebLayout: boolean;
  onMoveMonth: (amount: number) => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  today: Date;
  visibleMonth: Date;
}

export default function BookingCalendarView({
  calendarCells,
  isWebLayout,
  onMoveMonth,
  onSelectDate,
  selectedDate,
  today,
  visibleMonth,
}: BookingCalendarViewProps) {
  return (
    <View style={[styles.calendarColumn, isWebLayout && styles.calendarColumnWeb]}>
      <View style={styles.monthRow}>
        <Text style={styles.monthTitle}>{formatMonth(visibleMonth)}</Text>
        <View style={styles.monthActions}>
          <Pressable style={styles.navButton} onPress={() => onMoveMonth(-1)} hitSlop={8}>
            <ChevronLeft size={22} color="#c7cbd1" />
          </Pressable>
          <Pressable style={styles.navButton} onPress={() => onMoveMonth(1)} hitSlop={8}>
            <ChevronRight size={22} color={BOOKING_DATE_COLORS.accentDark} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} style={styles.weekday}>
            {weekday}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarCells.map(({ date, inCurrentMonth }) => {
          const selected = isSameDay(date, selectedDate);
          const current = isSameDay(date, today);
          const disabled = date < today || !inCurrentMonth;

          return (
            <Pressable
              key={date.toISOString()}
              style={[styles.dayCell, selected && styles.dayCellSelected]}
              disabled={disabled}
              onPress={() => onSelectDate(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  !inCurrentMonth && styles.dayTextOutside,
                  date < today && styles.dayTextPast,
                  current && !selected && styles.dayTextToday,
                  selected && styles.dayTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
