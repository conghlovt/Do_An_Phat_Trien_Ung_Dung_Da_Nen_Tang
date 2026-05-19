import React from 'react';
import { Platform, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { MapPin, Clock, BedDouble, CalendarDays } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/shared/theme/ThemeContext';
import { BOOKING_TAB_TO_TYPE, BOOKING_TYPE_TITLES } from '@/src/customer/features/booking/utils/booking';

interface Props {
  onNearMeClick?: () => void;
  onBookingTypeClick?: (type: string, title: string) => void;
}

const CELLS = [
  {
    type: 'near-me',
    label: 'Gần tôi',
    sub: 'Một bước lên mây',
    iconBg: '#2dd4bf',
    bg: 'rgba(240,253,250,0.7)',
    border: 'rgba(153,246,228,0.5)',
    Icon: MapPin,
    iconColor: '#fff',
  },
  {
    type: 'hourly',
    label: 'Theo giờ',
    sub: 'Xin từng phút giây',
    iconBg: '#f9a8b8',
    bg: 'rgba(255,241,242,0.7)',
    border: 'rgba(254,205,211,0.5)',
    Icon: Clock,
    iconColor: '#fff1f2',
  },
  {
    type: 'overnight',
    label: 'Qua đêm',
    sub: 'Ngon giấc như ở nhà',
    iconBg: '#a5b4fc',
    bg: 'rgba(238,242,255,0.7)',
    border: 'rgba(199,210,254,0.5)',
    Icon: BedDouble,
    iconColor: '#4f46e5',
  },
  {
    type: 'daily',
    label: 'Theo ngày',
    sub: 'Mỗi ngày 1 niềm vui',
    iconBg: '#93c5fd',
    bg: 'rgba(239,246,255,0.7)',
    border: 'rgba(191,219,254,0.5)',
    Icon: CalendarDays,
    iconColor: '#1d4ed8',
  },
] as const;

export default function BookingGrid({ onNearMeClick, onBookingTypeClick }: Props) {
  const { currentTheme } = useThemeContext();
  const { width } = useWindowDimensions();
  const isWebLayout = Platform.OS === 'web' && width >= 768;

  const handlePress = (type: typeof CELLS[number]['type']) => {
    if (type === 'near-me') { onNearMeClick?.(); return; }
    const bookingType = BOOKING_TAB_TO_TYPE[type];
    onBookingTypeClick?.(bookingType, BOOKING_TYPE_TITLES[bookingType]);
  };

  return (
    <View style={[styles.grid, isWebLayout && styles.webGrid]}>
      {CELLS.map((cell) => (
        <Pressable
          key={cell.type}
          style={[styles.cell, isWebLayout && styles.webCell, { backgroundColor: cell.bg, borderColor: cell.border }]}
          onPress={() => handlePress(cell.type)}
        >
          <View style={[styles.iconBox, isWebLayout && styles.webIconBox, { backgroundColor: cell.iconBg }]}>
            <cell.Icon size={isWebLayout ? 30 : 22} color={cell.iconColor} fill="rgba(255,255,255,0.15)" />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.cellLabel, isWebLayout && styles.webCellLabel, { color: currentTheme.text }]}>
              {cell.label}
            </Text>
            <Text style={[styles.cellSub, isWebLayout && styles.webCellSub, { color: currentTheme.textSecondary }]}>
              {cell.sub}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  webGrid: {
    flexWrap: 'nowrap',
    gap: 16,
  },
  cell: {
    width: '47.5%', flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 12, borderWidth: 1,
  },
  webCell: {
    flex: 1,
    width: undefined,
    minHeight: 104,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2,
  },
  webIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  cellLabel: { fontSize: 15, fontWeight: '700' },
  cellSub: { fontSize: 10, marginTop: 2 },
  webCellLabel: {
    fontSize: 20,
  },
  webCellSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
