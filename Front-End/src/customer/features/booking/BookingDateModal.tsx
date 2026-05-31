import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BookingType } from '@/src/customer/types/hotels';
import BookingCalendarView from './BookingCalendarView';
import BookingDateOptions from './BookingDateOptions';
import { styles } from '@/src/customer/styles/booking/bookingDate.styles';
import { useBookingDateSelection } from '@/src/customer/hooks/booking/useBookingDateSelection';

export interface BookingDateModalProps {
  visible: boolean;
  initialBookingType?: BookingType;
  onClose: () => void;
  onApply?: (bookingType: BookingType, selectedDate: Date) => void;
}

export default function BookingDateModal({
  visible,
  initialBookingType = 'Theo ngày',
  onClose,
  onApply,
}: BookingDateModalProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;
  const picker = useBookingDateSelection(visible, initialBookingType);
  const bookingTypeTabs: BookingType[] = [initialBookingType];

  const handleApply = () => {
    onApply?.(picker.activeTab, picker.selectedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View
          style={[
            styles.panel,
            isWebLayout ? styles.panelWeb : [styles.panelMobile, { paddingBottom: insets.bottom + 16 }],
          ]}
        >
          <View style={styles.tabs}>
            {bookingTypeTabs.map((tab) => (
              <Pressable key={tab} style={styles.tab} onPress={() => picker.selectTab(tab)}>
                <Text style={[styles.tabText, picker.activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {picker.activeTab === tab && <View style={styles.tabIndicator} />}
              </Pressable>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, isWebLayout && styles.contentWeb]}
          >
            <BookingCalendarView
              calendarCells={picker.calendarCells}
              isWebLayout={isWebLayout}
              onMoveMonth={picker.moveMonth}
              onSelectDate={picker.setSelectedDate}
              selectedDate={picker.selectedDate}
              today={picker.today}
              visibleMonth={picker.visibleMonth}
            />

            <BookingDateOptions
              activeTab={picker.activeTab}
              checkoutLabel={picker.checkoutLabel}
              isWebLayout={isWebLayout}
              onSelectHours={picker.setSelectedHours}
              onSelectTime={picker.setSelectedTime}
              selectedHours={picker.selectedHours}
              selectedTime={picker.selectedTime}
              timeOptions={picker.timeOptions}
              maxHoursForSelected={picker.maxHoursForSelected}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.resetButton} onPress={picker.resetSelection}>
              <Text style={styles.resetButtonText}>Ngày giờ bất kỳ</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
