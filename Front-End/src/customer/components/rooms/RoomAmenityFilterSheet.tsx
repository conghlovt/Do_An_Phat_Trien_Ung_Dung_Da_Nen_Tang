import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '@/src/customer/theme/theme';

const PRIMARY = '#85c2a4';

interface RoomAmenityFilterSheetProps {
  currentTheme: ThemeColors;
  insets: { bottom: number };
  options: string[];
  selectedAmenities: string[];
  visible: boolean;
  onApply: () => void;
  onClose: () => void;
  onReset: () => void;
  onToggleAmenity: (amenity: string) => void;
}

export default function RoomAmenityFilterSheet({
  currentTheme,
  insets,
  options,
  selectedAmenities,
  visible,
  onApply,
  onClose,
  onReset,
  onToggleAmenity,
}: RoomAmenityFilterSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: currentTheme.card, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: currentTheme.border }]} />
        <Text style={[styles.sheetTitle, { color: currentTheme.text }]}>Tiện ích phòng</Text>
        <ScrollView style={styles.amenityList}>
          {options.map((amenity) => {
            const active = selectedAmenities.includes(amenity);
            return (
              <Pressable
                key={amenity}
                style={[styles.amenityRow, { borderBottomColor: currentTheme.border }]}
                onPress={() => onToggleAmenity(amenity)}
              >
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={[styles.amenityText, { color: currentTheme.text }]}>{amenity}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable style={[styles.resetBtn, { borderColor: currentTheme.border }]} onPress={onReset}>
            <Text style={[styles.resetBtnText, { color: currentTheme.text }]}>Đặt lại</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyBtnText}>Áp dụng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: '72%',
  },
  sheetHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  amenityList: { maxHeight: 360 },
  amenityRow: {
    minHeight: 46,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(133,194,164,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkboxMark: { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  amenityText: { flex: 1, fontSize: 14, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
