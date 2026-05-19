import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarDays, Clock } from 'lucide-react-native';
import type { BookingType } from '@/src/customer/features/hotels/types/hotels.types';
import { BOOKING_DATE_COLORS, HOUR_OPTIONS } from './bookingDate.constants';
import { styles } from './bookingDate.styles';
import { getMaxHourlyDuration } from './bookingDate.utils';

interface SectionTitleProps {
  icon: 'calendar' | 'clock';
  title: string;
}

interface BookingDateOptionsProps {
  activeTab: BookingType;
  checkoutLabel: string;
  isWebLayout: boolean;
  onSelectHours: (hours: number) => void;
  onSelectTime: (time: string) => void;
  selectedHours: number;
  selectedTime: string;
  timeOptions: string[];
  maxHoursForSelected?: number;
}

function SectionTitle({ icon, title }: SectionTitleProps) {
  const Icon = icon === 'clock' ? Clock : CalendarDays;

  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.iconBadge}>
        <Icon size={18} color={BOOKING_DATE_COLORS.accentDark} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function BookingDateOptions({
  activeTab,
  checkoutLabel,
  isWebLayout,
  onSelectHours,
  onSelectTime,
  selectedHours,
  selectedTime,
  timeOptions,
  maxHoursForSelected,
}: BookingDateOptionsProps) {
  return (
    <View style={[styles.optionsColumn, isWebLayout && styles.optionsColumnWeb]}>
      <View style={styles.optionSection}>
        <SectionTitle icon="calendar" title="Giờ nhận phòng" />
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={isWebLayout}
          style={styles.chipsScroller}
          contentContainerStyle={styles.chipsRow}
        >
          {timeOptions.map((time) => (
            (() => {
              const disabled = activeTab === 'Theo giờ' && getMaxHourlyDuration(time) < 1;
              return (
            <Pressable
              key={time}
              style={[styles.chip, selectedTime === time && styles.chipSelected, disabled && styles.chipDisabled]}
              onPress={() => { if (!disabled) onSelectTime(time); }}
              disabled={disabled}
            >
              <Text style={[styles.chipText, selectedTime === time && styles.chipTextSelected, disabled && styles.chipTextDisabled]}>{time}</Text>
            </Pressable>
              );
            })()
          ))}
        </ScrollView>
      </View>

      {activeTab === 'Theo giờ' && (
        <View style={styles.optionSection}>
          <SectionTitle icon="clock" title="Số giờ sử dụng" />
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={isWebLayout}
            style={styles.chipsScroller}
            contentContainerStyle={styles.chipsRow}
          >
            {HOUR_OPTIONS.map((hour) => (
              (() => {
                const disabled = maxHoursForSelected !== undefined && hour > maxHoursForSelected;
                return (
              <Pressable
                key={hour}
                style={[styles.chip, selectedHours === hour && !disabled && styles.chipSelected, disabled && styles.chipDisabled]}
                onPress={() => { if (!disabled) onSelectHours(hour); }}
                disabled={disabled}
              >
                <Text style={[styles.chipText, selectedHours === hour && !disabled && styles.chipTextSelected, disabled && styles.chipTextDisabled]}>{hour} giờ</Text>
              </Pressable>
                );
              })()
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.checkoutRow, isWebLayout && styles.checkoutRowWeb]}>
        <SectionTitle icon="calendar" title="Trả phòng" />
        <Text style={styles.checkoutText}>{checkoutLabel}</Text>
      </View>
    </View>
  );
}
