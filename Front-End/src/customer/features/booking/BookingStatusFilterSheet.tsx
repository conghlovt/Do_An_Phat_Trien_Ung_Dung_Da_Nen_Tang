import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { BOOKING_STATUS_FILTERS, type BookingStatusFilter } from '@/src/customer/constants/booking/bookingStatusFilters';

interface BookingStatusFilterSheetProps {
  visible: boolean;
  selectedStatusFilter: BookingStatusFilter;
  onSelectStatusFilter: (value: BookingStatusFilter) => void;
  onClose: () => void;
}

export default function BookingStatusFilterSheet({
  visible,
  selectedStatusFilter,
  onSelectStatusFilter,
  onClose,
}: BookingStatusFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeContext();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal visible={visible} transparent animationType={isWeb ? 'fade' : 'slide'} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            isWeb && styles.webSheet,
            { paddingBottom: Math.max(insets.bottom, 16), backgroundColor: currentTheme.card },
          ]}
        >
          {!isWeb && <View style={[styles.handle, { backgroundColor: currentTheme.border }]} />}
          <Text style={[styles.title, { color: currentTheme.text }]}>Lọc trạng thái</Text>
          {BOOKING_STATUS_FILTERS.map((item) => {
            const active = selectedStatusFilter === item.id;

            return (
              <Pressable
                key={item.id}
                style={[styles.row, { borderBottomColor: currentTheme.border }]}
                onPress={() => {
                  onSelectStatusFilter(item.id);
                  onClose();
                }}
              >
                <Text style={[styles.label, { color: currentTheme.text }, active && styles.activeLabel]}>
                  {item.label}
                </Text>
                {active && <Check size={18} color="#85c2a4" strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.32)',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  webSheet: {
    width: 360,
    alignSelf: 'flex-end',
    marginRight: 36,
    marginBottom: 36,
    borderRadius: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    paddingBottom: 8,
  },
  row: {
    minHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#85c2a4',
    fontWeight: '800',
  },
});
