import { styles } from './Header.styles';
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, Search } from 'lucide-react-native';
import { useLocationContext } from '@/src/customer/context/LocationContext';
import { useThemeContext } from '@/src/customer/theme/ThemeContext';
import LocationPickerModal from '@/src/customer/components/layout/LocationPickerModal';

const STAYHUB_COLOR = '#85c2a4';
const PRIMARY = '#85c2a4';

interface HeaderProps {
    onOpenSearch?: () => void;
    isScrolled?: boolean;
}

export default function Header({ onOpenSearch, isScrolled = false }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const { selectedProvince, isLoading } = useLocationContext();
    const { currentTheme } = useThemeContext();
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    // removed unused isAuthenticated from useAuth

    const locationLabel = selectedProvince.selectedWard
        ? `${selectedProvince.selectedWard}, ${selectedProvince.selectedDistrict}`
        : selectedProvince.selectedDistrict
            ? `${selectedProvince.selectedDistrict}, ${selectedProvince.name}`
            : selectedProvince.name;

    return (
        <>
            <View style={[
                styles.container,
                { paddingTop: insets.top + 8 },
                isScrolled
                    ? [styles.scrolled, { backgroundColor: currentTheme.card }]
                    : [styles.notScrolled, { backgroundColor: currentTheme.background }],
            ]}>
                {!isScrolled && (
                    <View style={styles.topRow}>
                        <View style={styles.brandBlock}>
                            <Text style={[styles.brand, { color: STAYHUB_COLOR }]}>StayHub</Text>
                            <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Khám phá khách sạn và ưu đãi tại</Text>

                            <Pressable
                                style={styles.locationRow}
                                onPress={() => setLocationModalVisible(true)}
                                hitSlop={8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size={14} color={STAYHUB_COLOR} />
                                ) : (
                                    <MapPin size={20} color={STAYHUB_COLOR} strokeWidth={2.5} />
                                )}
                                <Text style={[styles.location, { color: STAYHUB_COLOR }]} numberOfLines={1}>
                                    {locationLabel}
                                </Text>
                                <ChevronDown size={16} color={STAYHUB_COLOR} />
                            </Pressable>
                        </View>

                    </View>
                )}

                <View style={styles.searchRow}>
                    <Pressable
                        style={[styles.searchBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
                        onPress={onOpenSearch}
                    >
                        <Search size={18} color={PRIMARY} />
                        <Text style={[styles.searchPlaceholder, { color: currentTheme.textSecondary }]}>Tên khách sạn, hoặc quận...</Text>
                    </Pressable>
                    {isScrolled && (
                        <View style={styles.actions}>
                        </View>
                    )}
                </View>
            </View>

            <LocationPickerModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
            />
        </>
    );
}
