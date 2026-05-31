import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MapPin, Clock, BedDouble, CalendarDays } from 'lucide-react-native';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import { BOOKING_TAB_TO_TYPE, BOOKING_TYPE_TITLES } from '@/src/customer/utils/booking/booking';

interface Props {
    onNearMeClick?: () => void;
    onBookingTypeClick?: (type: string, title: string) => void;
}

const CELLS = [
    {
        type: 'near-me',
        label: 'Gần tôi',
        sub: 'Một bước lên mây',
        accent: '#10b981',
        iconBg: '#10b981',
        bg: '#ecfdf5',
        border: '#bbf7d0',
        darkBg: '#052e22',
        darkBorder: '#34d399',
        darkIconBg: '#34d399',
        darkIconColor: '#042f2e',
        darkSub: '#a7f3d0',
        Icon: MapPin,
        iconColor: '#fff',
    },
    {
        type: 'hourly',
        label: 'Theo giờ',
        sub: 'Xin từng phút giây',
        accent: '#0ea5e9',
        iconBg: '#0ea5e9',
        bg: '#f0f9ff',
        border: '#bae6fd',
        darkBg: '#082f49',
        darkBorder: '#38bdf8',
        darkIconBg: '#38bdf8',
        darkIconColor: '#082f49',
        darkSub: '#bae6fd',
        Icon: Clock,
        iconColor: '#fff',
    },
    {
        type: 'overnight',
        label: 'Qua đêm',
        sub: 'Ngon giấc như ở nhà',
        accent: '#8b5cf6',
        iconBg: '#8b5cf6',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        darkBg: '#2e1065',
        darkBorder: '#a78bfa',
        darkIconBg: '#a78bfa',
        darkIconColor: '#2e1065',
        darkSub: '#ddd6fe',
        Icon: BedDouble,
        iconColor: '#fff',
    },
    {
        type: 'daily',
        label: 'Theo ngày',
        sub: 'Mỗi ngày 1 niềm vui',
        accent: '#f97316',
        iconBg: '#f97316',
        bg: '#fff7ed',
        border: '#fed7aa',
        darkBg: '#431407',
        darkBorder: '#fb923c',
        darkIconBg: '#fb923c',
        darkIconColor: '#431407',
        darkSub: '#fed7aa',
        Icon: CalendarDays,
        iconColor: '#fff',
    },
] as const;

export default function BookingGrid({ onNearMeClick, onBookingTypeClick }: Props) {
    const { isDarkMode } = useThemeContext();

    const handlePress = (type: typeof CELLS[number]['type']) => {
        if (type === 'near-me') { onNearMeClick?.(); return; }
        const bookingType = BOOKING_TAB_TO_TYPE[type];
        onBookingTypeClick?.(bookingType, BOOKING_TYPE_TITLES[bookingType]);
    };

    return (
        <View style={styles.grid}>
            {CELLS.map((cell) => {
                const cardBg = isDarkMode ? cell.darkBg : cell.bg;
                const borderColor = isDarkMode ? cell.darkBorder : cell.border;
                const iconBg = isDarkMode ? cell.darkIconBg : cell.iconBg;
                const iconColor = isDarkMode ? cell.darkIconColor : cell.iconColor;
                const labelColor = isDarkMode ? '#f8fafc' : '#111827';
                const subColor = isDarkMode ? cell.darkSub : '#475569';

                return (
                    <Pressable
                        key={cell.type}
                        style={[
                            styles.cell,
                            {
                                backgroundColor: cardBg,
                                borderColor,
                                shadowColor: isDarkMode ? cell.accent : '#000',
                            },
                        ]}
                        onPress={() => handlePress(cell.type)}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: iconBg,
                                    borderColor: isDarkMode ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.78)',
                                    shadowColor: cell.accent,
                                },
                            ]}
                        >
                            <cell.Icon
                                size={24}
                                color={iconColor}
                                fill={isDarkMode ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.18)'}
                                strokeWidth={2.35}
                            />
                        </View>
                        <View style={styles.textWrap}>
                            <Text style={[styles.cellLabel, { color: labelColor }]}>
                                {cell.label}
                            </Text>
                            <Text style={[styles.cellSub, { color: subColor }]}>
                                {cell.sub}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    cell: {
        width: '47.5%', flexDirection: 'row', alignItems: 'center', gap: 12,
        borderRadius: 16, padding: 12, borderWidth: 1.25,
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
        shadowRadius: 8, elevation: 4,
    },
    textWrap: {
        flex: 1,
        minWidth: 0,
    },
    cellLabel: { fontSize: 15, fontWeight: '700' },
    cellSub: { fontSize: 10, marginTop: 2 },
});
